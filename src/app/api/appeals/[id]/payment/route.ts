import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

      return NextResponse.json({ success: true, appeal: updated });
    }

    // Ação do Cliente informando pagamento / enviando comprovante
    const updated = await prisma.appealRequest.update({
      where: { id: params.id },
      data: {
        paymentStatus: "PAID", // Marca como pago após cliente confirmar/enviar comprovante
        paymentProofUrl: paymentProofUrl || appeal.paymentProofUrl,
        paymentConfirmedAt: new Date(),
        paymentAmount: paymentAmount ? Number(paymentAmount) : appeal.paymentAmount,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pagamento registrado com sucesso! Sua defesa entrará em elaboração.",
      appeal: updated,
    });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento." },
      { status: 500 }
    );
  }
}
