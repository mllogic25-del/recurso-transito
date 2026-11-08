import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearChatHistory } from "@/bot/ai-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, phone, appealId } = body;

    if (type === "BOT_MEMORY") {
      const result = clearChatHistory(phone);
      return NextResponse.json({
        success: true,
        message: phone
          ? `Histórico de memória do Samuca limpo para o telefone informado.`
          : `Toda a memória temporária do Samuca foi reiniciada com sucesso (${result.cleared} conversas limpas).`,
      });
    }

    if (type === "APPEAL_HISTORY") {
      if (!appealId) {
        return NextResponse.json({ error: "appealId é obrigatório" }, { status: 400 });
      }

      await prisma.appealRequest.update({
        where: { id: appealId },
        data: {
          defenseArguments: "",
          adminNotes: "Histórico de argumentos zerado pelo painel administrativo.",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Histórico de argumentos do recurso zerado com sucesso.",
      });
    }

    if (type === "DELETE_APPEAL") {
      if (!appealId) {
        return NextResponse.json({ error: "appealId é obrigatório" }, { status: 400 });
      }

      // Remove documentos vinculados e depois o recurso
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

    return NextResponse.json({ error: "Tipo de operação inválido." }, { status: 400 });
  } catch (error: any) {
    console.error("[Clear History API Error]:", error);
    return NextResponse.json(
      { error: "Erro ao processar limpeza: " + (error?.message || error) },
      { status: 500 }
    );
  }
}
