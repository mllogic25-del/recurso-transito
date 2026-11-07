import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Webhook oficial para receber notificações de pagamento aprovado da Hotmart
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Hotmart Webhook] Payload recebido:", JSON.stringify(body, null, 2));

    // A Hotmart envia o status no campo event (ex: "PURCHASE_APPROVED") ou status (ex: "APPROVED")
    const event = body.event || body.status || "";
    const isApproved =
      event.toUpperCase().includes("APPROVED") ||
      event.toUpperCase().includes("COMPLETE") ||
      body.data?.purchase?.status?.toUpperCase() === "APPROVED";

    if (!isApproved) {
      console.log(`[Hotmart Webhook] Evento ignorado (não aprovado): ${event}`);
      return NextResponse.json({ received: true, ignored: true });
    }

    // Extrai dados do comprador
    const buyer = body.data?.buyer || body.buyer || {};
    const buyerEmail = (buyer.email || "").toLowerCase().trim();
    const rawPhone = (buyer.checkout_phone || buyer.phone || "").replace(/\D/g, "");

    console.log(`[Hotmart Webhook] Pagamento APROVADO! Comprador: ${buyer.name}, E-mail: ${buyerEmail}, Telefone: ${rawPhone}`);

    // Localiza o usuário pelo telefone ou e-mail
    const conditions: any[] = [];
    if (rawPhone) {
      conditions.push({ phone: rawPhone });
      // Caso o telefone venha com código do país (55) ou sem
      if (rawPhone.startsWith("55") && rawPhone.length > 2) {
        conditions.push({ phone: rawPhone.slice(2) });
      } else {
        conditions.push({ phone: `55${rawPhone}` });
      }
    }
    if (buyerEmail) {
      conditions.push({ email: buyerEmail });
    }

    if (conditions.length === 0) {
      return NextResponse.json({ received: true, warning: "Nenhum dado de contato encontrado no payload" });
    }

    const user = await prisma.user.findFirst({
      where: { OR: conditions },
    });

    if (user) {
      // Localiza o pedido mais recente desse cliente
      const appeal = await prisma.appealRequest.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (appeal) {
        await prisma.appealRequest.update({
          where: { id: appeal.id },
          data: {
            paymentStatus: "PAID",
            paymentMethod: "HOTMART",
            paymentConfirmedAt: new Date(),
          },
        });

        console.log(`[Hotmart Webhook] ✅ Pedido ${appeal.protocol} atualizado para PAGO / CONFIRMADO!`);
      }
    } else {
      console.log(`[Hotmart Webhook] Usuário com e-mail ${buyerEmail} ou telefone ${rawPhone} ainda não encontrado no banco.`);
    }

    return NextResponse.json({ success: true, message: "Webhook processado com sucesso" });
  } catch (error: any) {
    console.error("[Hotmart Webhook] Erro ao processar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
