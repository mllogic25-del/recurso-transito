import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearChatHistory } from "@/bot/ai-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, phone, appealId } = body;

    // 1. ZERA MEMÓRIA DO BOT SAMUCA
    if (type === "BOT_MEMORY") {
      const result = clearChatHistory(phone);
      return NextResponse.json({
        success: true,
        message: phone
          ? `Histórico de conversa do bot limpo para ${phone}.`
          : `Toda a memória do Samuca foi zerada com sucesso (${result.cleared} conversas limpas).`,
      });
    }

    // 2. ZERA TODOS OS RECURSOS E HISTÓRICOS DE TESTE (LIMPEZA TOTAL DO BANCO)
    if (type === "CLEAR_ALL_APPEALS") {
      // Deleta anexos
      await prisma.appealDocument.deleteMany({});
      // Deleta comissões ligadas a recursos
      await prisma.commission.deleteMany({});
      // Deleta todos os recursos
      const deletedAppeals = await prisma.appealRequest.deleteMany({});
      // Limpa fila de mensagens outbox do WhatsApp
      await prisma.whatsappSession.deleteMany({
        where: { id: { startsWith: "outbox_" } },
      });
      // Zera memória do bot
      clearChatHistory();

      return NextResponse.json({
        success: true,
        message: `Histórico completamente zerado! ${deletedAppeals.count} recursos de teste removidos do sistema.`,
      });
    }

    // 3. EXCLUI UM RECURSO ESPECÍFICO
    if (type === "DELETE_APPEAL") {
      if (!appealId) {
        return NextResponse.json({ error: "appealId é obrigatório" }, { status: 400 });
      }

      await prisma.commission.deleteMany({
        where: { appealRequestId: appealId },
      });

      await prisma.appealDocument.deleteMany({
        where: { appealRequestId: appealId },
      });

      await prisma.appealRequest.delete({
        where: { id: appealId },
      });

      return NextResponse.json({
        success: true,
        message: "Recurso excluído com sucesso do banco de dados.",
      });
    }

    // 4. ZERA ARGUMENTOS DE UM RECURSO
    if (type === "APPEAL_HISTORY") {
      if (!appealId) {
        return NextResponse.json({ error: "appealId é obrigatório" }, { status: 400 });
      }

      await prisma.appealRequest.update({
        where: { id: appealId },
        data: {
          defenseArguments: "",
          adminNotes: "Histórico de argumentos zerado.",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Histórico de argumentos do recurso zerado com sucesso.",
      });
    }

    return NextResponse.json({ error: "Tipo de operação inválido." }, { status: 400 });
  } catch (error: any) {
    console.error("[Clear History API Error]:", error);
    return NextResponse.json(
      { error: "Erro ao processar limpeza: " + (error?.message || error) },
      { status: 500 }
    );
  }
}
