import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  Browsers,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import pino from "pino";
import path from "path";
import * as dotenv from "dotenv";
import { generateSamucaResponse } from "./ai-service";
import { usePrismaAuthState } from "./prisma-auth";
import { prisma } from "../lib/prisma";
import { processWhatsAppIncomingCase } from "./whatsapp-ingestion";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

let currentSock: any = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let isStarting = false;

async function startBot() {
  if (isStarting) {
    console.log("[Samuca WhatsApp] Inicialização já em andamento, ignorando chamada concorrente.");
    return;
  }
  isStarting = true;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  // Encerra socket anterior limpo para evitar múltiplas conexões concorrentes
  if (currentSock) {
    try {
      (currentSock.ev as any).removeAllListeners?.();
      currentSock.ws?.close();
    } catch (_) {}
    currentSock = null;
  }

  if (!GEMINI_API_KEY) {
    console.warn("\n=======================================================");
    console.warn("⚠️  ATENÇÃO: Chave GEMINI_API_KEY não foi encontrada no .env!");
    console.warn("Cadastre no seu arquivo .env:");
    console.warn("GEMINI_API_KEY=sua_chave_aqui");
    console.warn("=======================================================\n");
  }

  const { state, saveCreds, clearState } = await usePrismaAuthState("samuca");
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`[Samuca WhatsApp] Iniciando com versão Baileys v${version.join(".")} (Última: ${isLatest})`);

  const updateStatus = async (status: "STARTING" | "QR_READY" | "CONNECTED" | "DISCONNECTED", qrDataUrl: string | null = null) => {
    const payload = { status, qr: qrDataUrl, updatedAt: new Date().toISOString() };
    try {
      await prisma.whatsappSession.upsert({
        where: { id: "samuca_STATUS" },
        create: { id: "samuca_STATUS", value: JSON.stringify(payload) },
        update: { value: JSON.stringify(payload) },
      });
    } catch (_) {}

    try {
      const fs = await import("fs");
      const publicDir = path.resolve(process.cwd(), "public");
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      fs.writeFileSync(path.join(publicDir, "whatsapp-status.json"), JSON.stringify(payload));
    } catch (_) {}
  };

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }), // Silencia logs internos para manter o terminal limpo
    printQRInTerminal: false,
    auth: state,
    browser: Browsers.macOS("Desktop"),
    syncFullHistory: false,
    markOnlineOnConnect: false,
    keepAliveIntervalMs: 25000,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    retryRequestDelayMs: 2000,
    maxMsgRetryCount: 5,
    generateHighQualityLinkPreview: false,
    emitOwnEvents: false,
  });

  currentSock = sock;
  isStarting = false;

  // Monitor de comandos do painel admin (ex: Desconectar / Logout)
  const actionCheckTimer = setInterval(async () => {
    try {
      const action = await prisma.whatsappSession.findUnique({
        where: { id: "samuca_ACTION" },
      });
      if (action?.value === "LOGOUT") {
        console.log("[Samuca WhatsApp] 🛑 Comando de LOGOUT recebido do painel administrativo!");
        clearInterval(actionCheckTimer);
        await prisma.whatsappSession.delete({
          where: { id: "samuca_ACTION" },
        }).catch(() => {});

        if (currentSock) {
          try {
            await currentSock.logout();
          } catch (_) {
            try {
              currentSock.ws?.close();
            } catch (_) {}
          }
          currentSock = null;
        }

        await clearState();
        await updateStatus("DISCONNECTED", null);
        console.log("[Samuca WhatsApp] Sessão encerrada com sucesso. Gerando novo QR Code...");
        setTimeout(startBot, 1500);
      }
    } catch (_) {}
  }, 4000);

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
        const QRCode = (await import("qrcode")).default;
        const dataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
        await updateStatus("QR_READY", dataUrl);
      } catch (qrErr) {
        console.error("Erro ao salvar status QR:", qrErr);
      }
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;
      const shouldReconnect = !isLoggedOut;
      console.log(`[Samuca WhatsApp] Conexão encerrada. Motivo: ${statusCode}.`);

      await updateStatus("DISCONNECTED", null);

      if (currentSock === sock) {
        try {
          (sock.ev as any).removeAllListeners?.();
          sock.ws?.close();
        } catch (_) {}
        currentSock = null;
      }

      if (shouldReconnect) {
        const delay = statusCode === DisconnectReason.restartRequired ? 1500 : 3500;
        console.log(`[Samuca WhatsApp] Reconectando de forma estável em ${delay / 1000}s...`);
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(startBot, delay);
      } else {
        console.log("[Samuca WhatsApp] Sessão desconectada pelo celular (Logout real). Gerando novo QR Code...");
        await clearState();
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(startBot, 2500);
      }
    } else if (connection === "open") {
      console.log("\n=======================================================");
      console.log("✅ SAMUCA ESTÁ ONLINE E PRONTO PARA ATENDER NO WHATSAPP!");
      console.log("Envie uma mensagem do seu celular pessoal para testar!");
      console.log("=======================================================\n");

      await updateStatus("CONNECTED", null);

      // ─── HEARTBEAT ─────────────────────────────────────────────────────────
      // Atualiza o status a cada 3 minutos enquanto conectado.
      const HEARTBEAT_INTERVAL = 3 * 60 * 1000;
      const heartbeatTimer = setInterval(async () => {
        try {
          await updateStatus("CONNECTED", null);
        } catch (hbErr) {
          console.error("[Samuca Heartbeat] Erro ao atualizar status:", hbErr);
        }
      }, HEARTBEAT_INTERVAL);

      // ─── FILA DE MENSAGENS DE SAÍDA (OUTBOX) ──────────────────────────────
      // Envia confirmações de pagamento da Hotmart e mensagens disparadas pelo sistema
      const outboxTimer = setInterval(async () => {
        try {
          const pending = await prisma.whatsappSession.findMany({
            where: { id: { startsWith: "outbox_" } },
            take: 3,
            orderBy: { updatedAt: "asc" },
          });

          for (const item of pending) {
            try {
              const payload = JSON.parse(item.value);
              const cleanDigits = (payload.phone || "").replace(/\D/g, "");
              if (cleanDigits) {
                const jid = `${cleanDigits}@s.whatsapp.net`;
                await sock.sendMessage(jid, { text: payload.text });
                console.log(`[WhatsApp Outbox] ✅ Mensagem automática enviada para ${jid}`);
              }
              await prisma.whatsappSession.delete({ where: { id: item.id } }).catch(() => {});
            } catch (sendErr) {
              console.error(`[WhatsApp Outbox] Falha ao enviar ${item.id}:`, sendErr);
              await prisma.whatsappSession.delete({ where: { id: item.id } }).catch(() => {});
            }
          }
        } catch (_) {}
      }, 3000);

      sock.ev.on("connection.update", (upd) => {
        if (upd.connection === "close") {
          clearInterval(heartbeatTimer);
          clearInterval(actionCheckTimer);
          clearInterval(outboxTimer);
        }
      });
    }
  });

  // Helper para desempacotar mensagens do WhatsApp de qualquer invólucro
  // (suporta mensagens normais, temporárias/efêmeras, visualização única, legendas e respostas citadas)
  function unwrapMessage(msg: any): { unwrapped: any; text: string } {
    let m = msg.message;
    if (!m) return { unwrapped: null, text: "" };

    if (m.ephemeralMessage?.message) m = m.ephemeralMessage.message;
    if (m.viewOnceMessage?.message) m = m.viewOnceMessage.message;
    if (m.viewOnceMessageV2?.message) m = m.viewOnceMessageV2.message;
    if (m.documentWithCaptionMessage?.message) m = m.documentWithCaptionMessage.message;
    if (m.editedMessage?.message?.protocolMessage?.editedMessage) {
      m = m.editedMessage.message.protocolMessage.editedMessage;
    }

    let text = "";
    if (typeof m.conversation === "string" && m.conversation.trim()) {
      text = m.conversation.trim();
    } else if (typeof m.extendedTextMessage?.text === "string" && m.extendedTextMessage.text.trim()) {
      text = m.extendedTextMessage.text.trim();
    } else if (typeof m.imageMessage?.caption === "string" && m.imageMessage.caption.trim()) {
      text = m.imageMessage.caption.trim();
    } else if (typeof m.documentMessage?.caption === "string" && m.documentMessage.caption.trim()) {
      text = m.documentMessage.caption.trim();
    } else if (typeof m.videoMessage?.caption === "string" && m.videoMessage.caption.trim()) {
      text = m.videoMessage.caption.trim();
    }

    return { unwrapped: m, text };
  }

  // Buffer inteligente de loteamento para mensagens e mídias
  interface UserBatchQueue {
    texts: string[];
    mediaFiles: Array<{ buffer: Buffer; mimeType: string }>;
    lastMsg: any;
    timer: NodeJS.Timeout;
  }

  const userBatchQueues = new Map<string, UserBatchQueue>();

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    // Processa mensagens 'notify' e 'append' para nunca perder mensagens durante sincronização
    for (const msg of messages) {
      // Ignora mensagens enviadas pelo próprio robô
      if (msg.key.fromMe) continue;

      const remoteJid = msg.key.remoteJid;
      if (!remoteJid) continue;

      // Ignora status do WhatsApp e mensagens de grupos
      if (remoteJid === "status@broadcast" || remoteJid.endsWith("@g.us")) continue;

      const { unwrapped, text: extractedText } = unwrapMessage(msg);
      if (!unwrapped) continue;

      let messageText = extractedText;
      let mediaBuffer: Buffer | null = null;
      let mimeType: string | null = null;

      const synthMsg = { key: msg.key, message: unwrapped };

      // 1. Identifica se é Imagem
      if (unwrapped.imageMessage) {
        mimeType = unwrapped.imageMessage.mimetype || "image/jpeg";
        try {
          mediaBuffer = (await downloadMediaMessage(synthMsg, "buffer", {})) as Buffer;
          console.log(`📷 Foto recebida de [${remoteJid.replace("@s.whatsapp.net", "")}] (${mimeType})`);
        } catch (downloadErr) {
          console.error("Erro ao baixar imagem:", downloadErr);
        }
      }
      // 2. Identifica se é Documento / PDF
      else if (unwrapped.documentMessage) {
        mimeType = unwrapped.documentMessage.mimetype || "application/pdf";
        try {
          mediaBuffer = (await downloadMediaMessage(synthMsg, "buffer", {})) as Buffer;
          console.log(`📄 Documento recebido de [${remoteJid.replace("@s.whatsapp.net", "")}] (${mimeType})`);
        } catch (downloadErr) {
          console.error("Erro ao baixar documento:", downloadErr);
        }
      }
      // 3. Identifica se é Áudio / Mensagem de voz
      else if (unwrapped.audioMessage) {
        mimeType = unwrapped.audioMessage.mimetype || "audio/ogg";
        try {
          mediaBuffer = (await downloadMediaMessage(synthMsg, "buffer", {})) as Buffer;
          console.log(`🎤 Áudio recebido de [${remoteJid.replace("@s.whatsapp.net", "")}] (${mimeType})`);
        } catch (downloadErr) {
          console.error("Erro ao baixar áudio:", downloadErr);
        }
      }

      // Se não tem texto nem arquivo baixado, ignora
      if (!messageText.trim() && !mediaBuffer) continue;

      console.log(`📥 Mensagem de [${remoteJid.replace("@s.whatsapp.net", "")}]: "${messageText.trim() || `[Arquivo ${mimeType}]`}"`);

      try {
        await sock.readMessages([msg.key]);
      } catch (_) {}

      // Gerencia loteamento inteligente (espera até 3 segundos caso envie fotos ou mensagens em sequência)
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

      // Dispara o processamento do lote
      existingBatch.timer = setTimeout(async () => {
        const batch = userBatchQueues.get(remoteJid);
        userBatchQueues.delete(remoteJid);
        if (!batch) return;

        const combinedText = batch.texts.join("\n").trim();
        const totalFiles = batch.mediaFiles.length;

        console.log(`\n📦 Processando lote de [${remoteJid.replace("@s.whatsapp.net", "")}]: ${totalFiles} arquivo(s), texto: "${combinedText}"`);

        // Salva as fotos, PDFs e mensagens recebidas no banco de dados para o Painel Administrativo
        const pushName = batch.lastMsg?.pushName;
        processWhatsAppIncomingCase(remoteJid, pushName, combinedText, batch.mediaFiles).catch((ingestErr) => {
          console.error("[whatsapp.ts] Erro ao salvar documentos do WhatsApp no Painel:", ingestErr);
        });

        try {
          // 1. Simula presença "Digitando..."
          try {
            await sock.sendPresenceUpdate("composing", remoteJid);
          } catch (_) {}

          // 2. Delay humanizado
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // 3. Gera a resposta única inteligente para o lote de documentos
          let reply = "Opa! Estou analisando aqui com calma, me dá só 1 minutinho!";
          if (GEMINI_API_KEY) {
            try {
              reply = await generateSamucaResponse(remoteJid, combinedText, GEMINI_API_KEY, batch.mediaFiles);
            } catch (aiErr) {
              console.error("[whatsapp.ts] Erro ao gerar resposta na IA:", aiErr);
            }
          }

          // 4. Para de digitar
          try {
            await sock.sendPresenceUpdate("paused", remoteJid);
          } catch (_) {}

          // 5. Envia a resposta com fallback seguro (tenta citar; se falhar, envia direto)
          try {
            await sock.sendMessage(remoteJid, { text: reply }, { quoted: batch.lastMsg });
          } catch (quoteErr) {
            console.warn("[whatsapp.ts] Falha ao enviar com citação, enviando mensagem direta:", quoteErr);
            await sock.sendMessage(remoteJid, { text: reply });
          }

          console.log(`🤖 Samuca respondeu para [${remoteJid.replace("@s.whatsapp.net", "")}]: "${reply.substring(0, 80)}..."\n`);
        } catch (err) {
          console.error("Erro ao processar lote e responder mensagem:", err);
          try {
            await sock.sendMessage(remoteJid, {
              text: "Opa, recebi sua mensagem! Me dá só um minutinho que estou organizando seus dados aqui.",
            });
          } catch (_) {}
        }
      }, 3000);
    }
  });
}

startBot().catch((err) => {
  console.error("Erro fatal ao iniciar Samuca:", err);
});
