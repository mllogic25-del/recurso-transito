import { proto } from "@whiskeysockets/baileys";
import { initAuthCreds, BufferJSON } from "@whiskeysockets/baileys";
import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

// Cache em memória para acesso ultrarrápido e sem sobrecarregar o banco
const cache = new Map<string, any>();

export async function usePrismaAuthState(sessionKey: string = "samuca") {
  const prefix = `${sessionKey}_`;

  const readData = async (key: string) => {
    if (cache.has(key)) {
      return cache.get(key);
    }
    try {
      const record = await prisma.whatsappSession.findUnique({
        where: { id: `${prefix}${key}` },
      });
      if (!record || !record.value) return null;
      const parsed = JSON.parse(record.value, BufferJSON.reviver);
      cache.set(key, parsed);
      return parsed;
    } catch (err) {
      return null;
    }
  };

  const writeData = async (key: string, data: any) => {
    cache.set(key, data);
    const value = JSON.stringify(data, BufferJSON.replacer);
    try {
      await prisma.whatsappSession.upsert({
        where: { id: `${prefix}${key}` },
        create: { id: `${prefix}${key}`, value },
        update: { value },
      });
    } catch (err) {
      console.error(`[PrismaAuth] Erro ao salvar chave ${key}:`, err);
    }
  };

  const removeData = async (key: string) => {
    cache.delete(key);
    try {
      await prisma.whatsappSession.deleteMany({
        where: { id: `${prefix}${key}` },
      });
    } catch (err) {
      console.error(`[PrismaAuth] Erro ao remover chave ${key}:`, err);
    }
  };

  // 1. Verificação / Migração Automática:
  // Se o banco ainda não possui credenciais, mas existem arquivos locais na pasta auth_whatsapp_samuca, importa tudo!
  let creds = await readData("creds");
  if (!creds) {
    const localFolder = path.resolve(process.cwd(), "auth_whatsapp_samuca");
    if (fs.existsSync(localFolder)) {
      try {
        console.log("[PrismaAuth] 🔄 Migrando credenciais da pasta local para o Banco de Dados...");
        const files = fs.readdirSync(localFolder);
        for (const file of files) {
          if (file.endsWith(".json")) {
            const raw = fs.readFileSync(path.join(localFolder, file), "utf-8");
            const key = file.replace(/\.json$/, "");
            try {
              const parsed = JSON.parse(raw, BufferJSON.reviver);
              await writeData(key, parsed);
            } catch (_) {}
          }
        }
        console.log("[PrismaAuth] ✅ Migração para o Banco de Dados concluída com sucesso!");
        creds = await readData("creds");
      } catch (mErr) {
        console.warn("[PrismaAuth] Não foi possível migrar pasta local:", mErr);
      }
    }
  }

  if (!creds) {
    creds = initAuthCreds();
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: { [key: string]: any } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data: any) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeData(key, value) : removeData(key));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: async () => {
      return writeData("creds", creds);
    },
    clearState: async () => {
      cache.clear();
      try {
        await prisma.whatsappSession.deleteMany({
          where: { id: { startsWith: prefix } },
        });
        console.log("[PrismaAuth] 🗑️ Sessão do WhatsApp excluída do banco com sucesso.");
      } catch (err) {
        console.error("[PrismaAuth] Erro ao limpar sessão do banco:", err);
      }
    },
  };
}
