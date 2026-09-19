import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { processReferralCommission } from "@/lib/commissionUtils";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { action, paymentProofUrl, paymentAmount } = body;

    const appeal = await prisma.appealRequest.findUnique({
      where: { id: params.id },
    });

    if (!appeal) {
      return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
    }

    // Se ação for do Administrador para confirmar manualmente
    if (action === "ADMIN_CONFIRM") {
      if (user.role !== "ADMIN") {
        return NextResponse.json({ error: "Apenas administradores podem confirmar." }, { status: 403 });
      }

      const updated = await prisma.appealRequest.update({
        where: { id: params.id },
        data: {
          paymentStatus: "PAID",
          paymentConfirmedAt: new Date(),
        },
      });

      // Dispara a comissão de R$ 10,00 se o usuário tiver sido indicado
      await processReferralCommission(appeal.userId, appeal.id);

      return NextResponse.json({ success: true, appeal: updated });
    }

    // Cliente avisa que pagou, mas apenas o Admin pode confirmar
    if (action === "CLIENT_PAID") {
      return NextResponse.json({
        success: true,
        message: "Após o pagamento, o administrador confirmará e liberará seu recurso.",
        appeal: appeal,
      });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento." },
      { status: 500 }
    );
  }
}
