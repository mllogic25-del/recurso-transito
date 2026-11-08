import { prisma } from "../lib/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

interface MediaFile {
  buffer: Buffer;
  mimeType: string;
}

// Extrai possíveis placas do texto (formato antigo ABC-1234 ou Mercosul ABC1D23)
function extractPlate(text: string): string | null {
  const match = text.match(/\b([A-Z]{3}-?[0-9][A-Z0-9][0-9]{2})\b/i);
  if (match) {
    return match[1].toUpperCase().replace("-", "");
  }
  return null;
}

// Extrai possível número de Auto de Infração (AIT)
function extractAit(text: string): string | null {
  const match = text.match(/\b([A-Z0-9]{8,12})\b/i);
  if (match) {
    return match[1].toUpperCase();
  }
  return null;
}

// Extrai possível e-mail do texto
function extractEmail(text: string): string | null {
  const match = text.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Salva as fotos, PDFs e mensagens enviadas pelo cliente no WhatsApp
 * diretamente no banco de dados e cria/atualiza o pedido na fila do Painel Admin.
 */
export async function processWhatsAppIncomingCase(
  remoteJid: string,
  pushName: string | null | undefined,
  combinedText: string,
  mediaFiles: MediaFile[]
) {
  try {
    const rawDigits = remoteJid.replace("@s.whatsapp.net", "").replace(/\D/g, "");
    if (!rawDigits) return null;

    const clientPhone = rawDigits;
    const clientName = (pushName && pushName.trim()) || `Cliente Zap (${clientPhone.slice(-4)})`;
    const extractedEmail = extractEmail(combinedText);
    const clientEmail = extractedEmail || `${clientPhone}@whatsapp.autorecurso.com.br`;

    // 1. Localiza ou cria o usuário pelo telefone ou e-mail
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: clientPhone },
          { email: clientEmail },
        ],
      },
    });

    if (!user) {
      const dummyPasswordHash = crypto.randomBytes(32).toString("hex");
      user = await prisma.user.create({
        data: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          passwordHash: dummyPasswordHash,
          role: "CLIENT",
        },
      });
      console.log(`[WhatsApp Ingestion] Novo cliente criado no banco: ${user.name} (${user.phone})`);
    } else {
      const updateData: any = {};
      if (pushName && user.name.startsWith("Cliente Zap")) {
        updateData.name = pushName.trim();
      }
      // Se o cliente informou o e-mail real agora, atualiza no cadastro
      if (extractedEmail && user.email.includes("@whatsapp.autorecurso.com.br")) {
        updateData.email = extractedEmail;
        console.log(`[WhatsApp Ingestion] Atualizando e-mail real do cliente ${user.phone}: ${extractedEmail}`);
      }
      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    // 2. Localiza pedido em andamento nos últimos 15 dias ou cria um novo
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    let appeal = await prisma.appealRequest.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: fifteenDaysAgo },
        status: { in: ["PENDING", "PROCESSING"] },
      },
      orderBy: { createdAt: "desc" },
    });

    const detectedPlate = extractPlate(combinedText);
    const detectedAit = extractAit(combinedText);

    if (!appeal) {
      const protocolNumber = Math.floor(10000 + Math.random() * 90000);
      const protocol = `REC-${new Date().getFullYear()}-${protocolNumber}`;

      appeal = await prisma.appealRequest.create({
        data: {
          protocol,
          userId: user.id,
          status: "PENDING",
          type: "DEFESA_PREVIA",
          authority: "A DEFINIR (VIA WHATSAPP)",
          aitNumber: detectedAit || "EM_ANALISE_WHATSAPP",
          plate: detectedPlate || "WHATSAPP",
          ctbArticle: "A verificar nos documentos enviados",
          infractionDate: new Date().toLocaleDateString("pt-BR"),
          infractionLocation: "Atendimento WhatsApp",
          defenseArguments: combinedText || "Iniciou atendimento pelo WhatsApp.",
          paymentStatus: "PENDING",
          paymentAmount: 30.00,
          paymentMethod: "HOTMART",
        },
      });

      console.log(`[WhatsApp Ingestion] Pedido criado para o Painel Admin: ${appeal.protocol} (${user.phone})`);
    } else {
      // Atualiza dados do pedido existente com novas mensagens
      const updatedArgs = appeal.defenseArguments
        ? `${appeal.defenseArguments}\n[${new Date().toLocaleTimeString("pt-BR")}]: ${combinedText}`.trim()
        : combinedText;

      const updatePayload: any = { defenseArguments: updatedArgs };
      if (detectedPlate && appeal.plate === "WHATSAPP") {
        updatePayload.plate = detectedPlate;
      }
      if (detectedAit && appeal.aitNumber === "EM_ANALISE_WHATSAPP") {
        updatePayload.aitNumber = detectedAit;
      }

      appeal = await prisma.appealRequest.update({
        where: { id: appeal.id },
        data: updatePayload,
      });
    }

    // 3. Salva os arquivos de mídia (Fotos, PDFs, Áudios) na pasta de uploads e no banco de dados
    if (mediaFiles && mediaFiles.length > 0) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "whatsapp");
      await fs.mkdir(uploadsDir, { recursive: true });

      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        if (!file.buffer) continue;

        let ext = ".jpg";
        let docTitle = `Foto do Documento #${i + 1}`;

        if (file.mimeType.includes("pdf")) {
          ext = ".pdf";
          docTitle = "Notificação de Multa (PDF)";
        } else if (file.mimeType.includes("png")) {
          ext = ".png";
          docTitle = "Comprovante / Documento (PNG)";
        } else if (file.mimeType.startsWith("audio/")) {
          ext = ".ogg";
          docTitle = "Áudio / Relato do Cliente (WhatsApp)";
        }

        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const fileName = `zap_${clientPhone}_${uniqueSuffix}${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        await fs.writeFile(filePath, file.buffer);

        await prisma.appealDocument.create({
          data: {
            appealRequestId: appeal.id,
            title: docTitle,
            fileName: fileName,
            fileUrl: `/uploads/whatsapp/${fileName}`,
            fileType: file.mimeType,
            fileSize: file.buffer.length,
          },
        });

        console.log(`[WhatsApp Ingestion] Documento salvo no pedido ${appeal.protocol}: ${fileName}`);
      }
    }

    return appeal;
  } catch (error) {
    console.error("[WhatsApp Ingestion] Erro ao processar pedido via WhatsApp:", error);
    return null;
  }
}
