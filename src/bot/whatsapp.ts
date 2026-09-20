import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import pino from "pino";
import path from "path";
import * as dotenv from "dotenv";
import { generateSamucaResponse } from "./ai-service";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

async function startBot() {
  if (!GEMINI_API_KEY) {
    console.warn("\n=======================================================");
    console.warn("⚠️  ATENÇÃO: Chave GEMINI_API_KEY não foi encontrada no .env!");
    console.warn("Cadastre no seu arquivo .env:");
    console.warn("GEMINI_API_KEY=sua_chave_aqui");
    console.warn("=======================================================\n");
  }

  const authFolder = path.resolve(process.cwd(), "auth_whatsapp_samuca");
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`[Samuca WhatsApp] Iniciando com versão Baileys v${version.join(".")} (Última: ${isLatest})`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }), // Silencia logs internos para manter o terminal limpo
    printQRInTerminal: false,
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n=======================================================");
      console.log("📲 ESCANEIE O QR CODE ABAIXO COM O WHATSAPP DO SAMUCA:");
      console.log("1. Abra o WhatsApp no seu celular");
      console.log("2. Toque em ⋮ (Menu) ou Configurações > Aparelhos Conectados");
      console.log("3. Toque em 'Conectar um aparelho' e aponte para a tela:");
      console.log("=======================================================\n");
      qrcode.generate(qr, { small: true });

      try {
        const fs = await import("fs");
        const QRCode = (await import("qrcode")).default;
        const dataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
        const publicDir = path.resolve(process.cwd(), "public");
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        fs.writeFileSync(
          path.join(publicDir, "whatsapp-status.json"),
          JSON.stringify({ status: "QR_READY", qr: dataUrl, updatedAt: new Date().toISOString() })
        );
      } catch (qrErr) {
        console.error("Erro ao salvar status QR:", qrErr);
      }
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[Samuca WhatsApp] Conexão encerrada. Motivo: ${statusCode}.`);

      try {
        const fs = await import("fs");
        const publicDir = path.resolve(process.cwd(), "public");
        fs.writeFileSync(
          path.join(publicDir, "whatsapp-status.json"),
          JSON.stringify({ status: "DISCONNECTED", qr: null, updatedAt: new Date().toISOString() })
        );
      } catch (_) {}

      if (shouldReconnect) {
        console.log("[Samuca WhatsApp] Reconectando em 3 segundos...");
        setTimeout(startBot, 3000);
      } else {
        console.log("[Samuca WhatsApp] Sessão desconectada ou expirada. Gerando novo QR Code...");
        const fs = await import("fs");
        if (fs.existsSync(authFolder)) {
          fs.rmSync(authFolder, { recursive: true, force: true });
        }
        setTimeout(startBot, 2000);
      }
    } else if (connection === "open") {
      console.log("\n=======================================================");
      console.log("✅ SAMUCA ESTÁ ONLINE E PRONTO PARA ATENDER NO WHATSAPP!");
      console.log("Envie uma mensagem do seu celular pessoal para testar!");
      console.log("=======================================================\n");

      try {
        const fs = await import("fs");
        const publicDir = path.resolve(process.cwd(), "public");
        fs.writeFileSync(
          path.join(publicDir, "whatsapp-status.json"),
          JSON.stringify({ status: "CONNECTED", qr: null, updatedAt: new Date().toISOString() })
        );
      } catch (_) {}
    }
  });

  // Buffer inteligente de loteamento para mensagens e mídias (permite envio de 1 por 1 ou vários de uma vez)
  interface UserBatchQueue {
    texts: string[];
    mediaFiles: Array<{ buffer: Buffer; mimeType: string }>;
    lastMsg: any;
    timer: NodeJS.Timeout;
  }

  const userBatchQueues = new Map<string, UserBatchQueue>();

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      // Ignora mensagens enviadas pelo próprio robô
      if (msg.key.fromMe) continue;

      const remoteJid = msg.key.remoteJid;
      if (!remoteJid) continue;

      // Ignora status do WhatsApp e mensagens de grupos
      if (remoteJid === "status@broadcast" || remoteJid.endsWith("@g.us")) continue;

      let messageText = "";
      let mediaBuffer: Buffer | null = null;
      let mimeType: string | null = null;

      // 1. Identifica se é Imagem
      if (msg.message?.imageMessage) {
        messageText = msg.message.imageMessage.caption || "";
        mimeType = msg.message.imageMessage.mimetype || "image/jpeg";
        try {
          mediaBuffer = (await downloadMediaMessage(msg, "buffer", {})) as Buffer;
          console.log(`📷 Foto recebida de [${remoteJid.replace("@s.whatsapp.net", "")}] (${mimeType})`);
        } catch (downloadErr) {
          console.error("Erro ao baixar imagem:", downloadErr);
        }
      }
      // 2. Identifica se é Documento / PDF
      else if (msg.message?.documentMessage) {
        messageText = msg.message.documentMessage.caption || "";
        mimeType = msg.message.documentMessage.mimetype || "application/pdf";
        try {
          mediaBuffer = (await downloadMediaMessage(msg, "buffer", {})) as Buffer;
          console.log(`📄 Documento recebido de [${remoteJid.replace("@s.whatsapp.net", "")}] (${mimeType})`);
        } catch (downloadErr) {
          console.error("Erro ao baixar documento:", downloadErr);
        }
      }
      // 2.1. Documento com legenda (documentWithCaptionMessage)
      else if (msg.message?.documentWithCaptionMessage?.message?.documentMessage) {
        const doc = msg.message.documentWithCaptionMessage.message.documentMessage;
        messageText = doc.caption || "";
        mimeType = doc.mimetype || "application/pdf";
        try {
          mediaBuffer = (await downloadMediaMessage(msg, "buffer", {})) as Buffer;
          console.log(`📄 Documento recebido de [${remoteJid.replace("@s.whatsapp.net", "")}] (${mimeType})`);
        } catch (downloadErr) {
          console.error("Erro ao baixar documento:", downloadErr);
        }
      }
      // 3. Identifica se é Áudio / Mensagem de voz
      else if (msg.message?.audioMessage) {
        mimeType = msg.message.audioMessage.mimetype || "audio/ogg";
        try {
          mediaBuffer = (await downloadMediaMessage(msg, "buffer", {})) as Buffer;
          console.log(`🎤 Áudio recebido de [${remoteJid.replace("@s.whatsapp.net", "")}] (${mimeType})`);
        } catch (downloadErr) {
          console.error("Erro ao baixar áudio:", downloadErr);
        }
      }
      // 4. Mensagem de Texto Comum
      else {
        messageText =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          "";
      }

      // Se não tem nem texto nem arquivo baixado, ignora
      if (!messageText.trim() && !mediaBuffer) continue;

      try {
        // Marca como lida imediatamente
        await sock.readMessages([msg.key]);
      } catch (_) {}

      // Gerencia loteamento inteligente (espera até 3.5 segundos por novas fotos do mesmo cliente)
      let existingBatch = userBatchQueues.get(remoteJid);
      if (existingBatch) {
        clearTimeout(existingBatch.timer);
        if (messageText.trim()) existingBatch.texts.push(messageText.trim());
        if (mediaBuffer && mimeType) existingBatch.mediaFiles.push({ buffer: mediaBuffer, mimeType });
        existingBatch.lastMsg = msg;
      } else {
        existingBatch = {
          texts: messageText.trim() ? [messageText.trim()] : [],
          mediaFiles: mediaBuffer && mimeType ? [{ buffer: mediaBuffer, mimeType }] : [],
          lastMsg: msg,
          timer: setTimeout(() => {}, 0),
        };
        userBatchQueues.set(remoteJid, existingBatch);
      }

      // Reinicia o temporizador do lote
      existingBatch.timer = setTimeout(async () => {
        const batch = userBatchQueues.get(remoteJid);
        userBatchQueues.delete(remoteJid);
        if (!batch) return;

        const combinedText = batch.texts.join("\n").trim();
        const totalFiles = batch.mediaFiles.length;

        console.log(`\n📦 Processando lote de [${remoteJid.replace("@s.whatsapp.net", "")}]: ${totalFiles} arquivo(s), texto: "${combinedText}"`);

        try {
          // 1. Simula presença "Digitando..."
          await sock.sendPresenceUpdate("composing", remoteJid);

          // 2. Delay humanizado
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // 3. Gera a resposta única inteligente para o lote de documentos
          let reply = "Opa! Estou analisando aqui com calma, me dá só 1 minutinho!";
          if (GEMINI_API_KEY) {
            reply = await generateSamucaResponse(remoteJid, combinedText, GEMINI_API_KEY, batch.mediaFiles);
          }

          // 4. Para de digitar e envia a resposta citando a última mensagem
          await sock.sendPresenceUpdate("paused", remoteJid);
          await sock.sendMessage(remoteJid, { text: reply }, { quoted: batch.lastMsg });

          console.log(`🤖 Samuca respondeu lote: "${reply}"\n`);
        } catch (err) {
          console.error("Erro ao processar lote e responder mensagem:", err);
        }
      }, 3500);
    }
  });
}

startBot().catch((err) => {
  console.error("Erro fatal ao iniciar Samuca:", err);
});
