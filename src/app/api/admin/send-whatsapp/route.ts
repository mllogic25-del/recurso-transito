import { NextResponse } from "next/server";
import { queueWhatsAppMessage } from "@/lib/whatsapp-queue";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, message, appealId, title } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: "Telefone e mensagem são obrigatórios." },
        { status: 400 }
      );
    }

    const queued = await queueWhatsAppMessage(phone, message);

    if (!queued) {
      return NextResponse.json(
        { error: "Falha ao enfileirar mensagem para o WhatsApp." },
        { status: 500 }
      );
    }

    // Se tiver appealId, anota nas observações internas do recurso para registro
    if (appealId) {
      try {
        const appeal = await prisma.appealRequest.findUnique({
          where: { id: appealId },
          select: { adminNotes: true },
        });

        const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        const noteEntry = `\n[${now}] WhatsApp enviado: "${title || "Rotina de Orientação"}"`;
        const updatedNotes = (appeal?.adminNotes || "") + noteEntry;

        await prisma.appealRequest.update({
          where: { id: appealId },
          data: { adminNotes: updatedNotes },
        });
      } catch (_) {}
    }

    return NextResponse.json({
      success: true,
      message: "Mensagem enfileirada com sucesso no Samuca Bot para envio imediato ao cliente!",
    });
  } catch (error: any) {
    console.error("[Send WhatsApp API Error]:", error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagem: " + (error?.message || error) },
      { status: 500 }
    );
  }
}
