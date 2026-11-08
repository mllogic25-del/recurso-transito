import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { queueWhatsAppMessage } from "@/lib/whatsapp-queue";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const appeal = await prisma.appealRequest.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
            cnh: true,
            address: true,
          },
        },
        documents: true,
      },
    });

    if (!appeal) {
      return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
    }

    // Se não for admin e não for dono do recurso, nega acesso
    if (user.role !== "ADMIN" && appeal.userId !== user.id) {
      return NextResponse.json({ error: "Acesso não permitido." }, { status: 403 });
    }

    return NextResponse.json({ appeal });
  } catch (error: any) {
    console.error("Get appeal error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do recurso." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { status, generatedDocument, adminNotes, paymentStatus } = body;

    const appeal = await prisma.appealRequest.findUnique({
      where: { id: params.id },
    });

    if (!appeal) {
      return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
    }

    // Somente admin pode alterar status ou notas administrativas
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem atualizar este recurso." },
        { status: 403 }
      );
    }

    const isBecomingReady = status === "READY" && appeal.status !== "READY";

    const updated = await prisma.appealRequest.update({
      where: { id: params.id },
      data: {
        status: status || appeal.status,
        paymentStatus: paymentStatus || appeal.paymentStatus,
        generatedDocument: generatedDocument !== undefined ? generatedDocument : appeal.generatedDocument,
        adminNotes: adminNotes !== undefined ? adminNotes : appeal.adminNotes,
        readyAt: status === "READY" && !appeal.readyAt ? new Date() : appeal.readyAt,
        sentToEmail: isBecomingReady ? true : appeal.sentToEmail,
        emailSentAt: isBecomingReady ? new Date() : appeal.emailSentAt,
      },
      include: { user: true },
    });

    // Se o recurso foi liberado/aprovado (status READY), dispara notificação com link de download no WhatsApp do cliente
    if (status === "READY" && updated.user?.phone) {
      const clientName = updated.user.name || "Cliente";
      const readyZapText =
`🎉 *SUA DEFESA TÉCNICA ESTÁ PRONTA!*

Olá, *${clientName}*! A sua defesa técnica personalizada da AutoRecurso para o veículo placa *${updated.plate}* (Auto de Infração: *${updated.aitNumber}*, Protocolo: *${updated.protocol}*) foi concluída e revisada com sucesso pela nossa equipe de especialistas!

📄 *Como baixar a sua petição:*
Você já pode baixar o arquivo Word (.docx) formatado para imprimir e protocolar pelo link oficial:
👉 https://recurso-transito.onrender.com/acompanhar?protocolo=${updated.protocol}

Basta assinar a petição e protocolar no órgão de trânsito. Qualquer dúvida, estamos à sua disposição aqui mesmo no WhatsApp!
🛡️ *AutoRecurso - Recursos de Trânsito*`;

      await queueWhatsAppMessage(updated.user.phone, readyZapText);
      console.log(`[Appeal Ready] Mensagem de recurso pronto enfileirada no WhatsApp para ${updated.user.phone}`);
    }

    return NextResponse.json({ success: true, appeal: updated });
  } catch (error: any) {
    console.error("Update appeal error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar recurso." },
      { status: 500 }
    );
  }
}
