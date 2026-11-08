import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { processReferralCommission } from "@/lib/commissionUtils";
import { queueWhatsAppMessage } from "@/lib/whatsapp-queue";

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
          status: appeal.status === "PENDING" ? "PROCESSING" : appeal.status,
          paymentConfirmedAt: new Date(),
        },
        include: { user: true },
      });

      // Dispara a comissão de R$ 10,00 se o usuário tiver sido indicado
      await processReferralCommission(appeal.userId, appeal.id);

      // Dispara confirmação automática no WhatsApp do cliente (72 horas)
      if (updated.user?.phone) {
        const clientDisplayName = updated.user.name || "Cliente";
        const whatsappText =
`🎉 *PAGAMENTO CONFIRMADO COM SUCESSO!*

Olá, *${clientDisplayName}*! Confirmamos o recebimento do seu pagamento de R$ 30,00 referente à elaboração da sua defesa técnica de trânsito.

🚗 *Veículo:* Placa *${updated.plate || "Em conferência"}*
📋 *Protocolo:* *${updated.protocol}*
⏱️ *Prazo de Confecção:* Até 72 horas úteis nossa equipe de especialistas concluirá e revisará a sua peça personalizada.

📲 *Como você receberá o documento:*
Assim que a petição for concluída e aprovada, enviaremos o arquivo diretamente aqui no seu WhatsApp e também para o seu e-mail (${updated.user.email})!

Você também pode consultar o status em tempo real e baixar sua defesa pelo portal:
👉 https://recurso-transito.onrender.com/acompanhar?protocolo=${updated.protocol}

Qualquer dúvida, estamos à sua disposição aqui mesmo no WhatsApp!
🛡️ *AutoRecurso - Recursos de Trânsito*`;

        await queueWhatsAppMessage(updated.user.phone, whatsappText);
      }

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
