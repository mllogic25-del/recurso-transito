import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queueWhatsAppMessage } from "@/lib/whatsapp-queue";
import { processReferralCommission } from "@/lib/commissionUtils";

export const dynamic = "force-dynamic";

// Webhook oficial para receber notificações de pagamento aprovado da Hotmart
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    console.log("[Hotmart Webhook] Payload recebido:", JSON.stringify(body, null, 2));

    // A Hotmart envia o status no campo event (ex: "PURCHASE_APPROVED", "PURCHASE_COMPLETE")
    const event = (body.event || body.status || "").toString().toUpperCase();
    const purchaseStatus = (body.data?.purchase?.status || "").toString().toUpperCase();

    const isApproved =
      event.includes("APPROVED") ||
      event.includes("COMPLETE") ||
      purchaseStatus.includes("APPROVED") ||
      purchaseStatus.includes("COMPLETE");

    if (!isApproved) {
      console.log(`[Hotmart Webhook] Evento ignorado (não aprovado): event="${event}", status="${purchaseStatus}"`);
      return NextResponse.json({ received: true, ignored: true, reason: "Status não é aprovado" });
    }

    // 1. Extração dos dados do comprador e da compra
    const buyer = body.data?.buyer || body.buyer || {};
    const purchase = body.data?.purchase || body.purchase || {};

    const buyerEmail = (buyer.email || body.buyer_email || "").toLowerCase().trim();
    const rawPhone = (buyer.checkout_phone || buyer.phone || body.buyer_phone || "").replace(/\D/g, "");
    const buyerName = (buyer.name || body.buyer_name || "Cliente").trim();

    // Rastreamento por SCK / Protocolo embutido no link de checkout
    const sckRaw = (
      purchase.tracking?.source ||
      purchase.sck ||
      purchase.order_ref ||
      body.sck ||
      body.order_ref ||
      body.custom_field ||
      ""
    ).toString().trim();

    console.log(
      `[Hotmart Webhook] Pagamento APROVADO! Comprador: "${buyerName}", E-mail: "${buyerEmail}", Telefone: "${rawPhone}", SCK/Ref: "${sckRaw}"`
    );

    let appeal: any = null;

    // ─── ESTRATÉGIA 1: Busca direta pelo Protocolo contido no SCK ─────────
    if (sckRaw) {
      const protocolMatch = sckRaw.match(/REC-\d{4}-\d+/i);
      const targetProtocol = protocolMatch ? protocolMatch[0].toUpperCase() : sckRaw.toUpperCase();

      appeal = await prisma.appealRequest.findFirst({
        where: {
          protocol: { contains: targetProtocol },
        },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });

      if (appeal) {
        console.log(`[Hotmart Webhook] Localizado por protocolo SCK: ${appeal.protocol}`);
      }
    }

    // ─── ESTRATÉGIA 2: Busca por E-mail do Comprador ───────────────────────
    if (!appeal && buyerEmail) {
      appeal = await prisma.appealRequest.findFirst({
        where: {
          user: {
            email: { equals: buyerEmail },
          },
        },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });

      if (appeal) {
        console.log(`[Hotmart Webhook] Localizado por e-mail (${buyerEmail}): ${appeal.protocol}`);
      }
    }

    // ─── ESTRATÉGIA 3: Busca por Telefone (com variações de DDI e DDD) ────
    if (!appeal && rawPhone) {
      const phoneVariants = new Set<string>();
      phoneVariants.add(rawPhone);

      if (rawPhone.startsWith("55") && rawPhone.length > 4) {
        phoneVariants.add(rawPhone.slice(2));
      } else {
        phoneVariants.add(`55${rawPhone}`);
      }

      // Adiciona variação caso o 9º dígito esteja presente ou ausente
      phoneVariants.forEach((p) => {
        if (p.length === 11 && p.startsWith("55")) {
          // ex: 5519999998888 -> tenta sem 55
          phoneVariants.add(p.slice(2));
        }
      });

      appeal = await prisma.appealRequest.findFirst({
        where: {
          user: {
            phone: { in: Array.from(phoneVariants) },
          },
        },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });

      if (appeal) {
        console.log(`[Hotmart Webhook] Localizado por telefone (${rawPhone}): ${appeal.protocol}`);
      }
    }

    // ─── ESTRATÉGIA 4: Fallback inteligente para o pedido pendente mais recente ──
    if (!appeal) {
      const recentPending = await prisma.appealRequest.findFirst({
        where: {
          paymentStatus: "PENDING",
        },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });

      // Se foi criado nas últimas 48 horas, vincula
      if (recentPending && (Date.now() - new Date(recentPending.createdAt).getTime() < 48 * 3600 * 1000)) {
        appeal = recentPending;
        console.log(`[Hotmart Webhook] Vinculado ao pedido pendente recente mais provável: ${appeal.protocol}`);
      }
    }

    if (!appeal) {
      console.warn(
        `[Hotmart Webhook] ⚠️ Nenhum pedido localizado para e-mail "${buyerEmail}" ou telefone "${rawPhone}".`
      );
      return NextResponse.json({
        received: true,
        warning: "Pedido não localizado para vincular pagamento",
      });
    }

    // 2. Atualiza o status do pedido no banco de dados
    const updatedAppeal = await prisma.appealRequest.update({
      where: { id: appeal.id },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "HOTMART",
        paymentConfirmedAt: new Date(),
        status: appeal.status === "PENDING" ? "PROCESSING" : appeal.status,
      },
      include: { user: true },
    });

    console.log(
      `[Hotmart Webhook] ✅ Pedido ${updatedAppeal.protocol} atualizado para PAGO e EM PROCESSAMENTO!`
    );

    // 3. Atualiza dados do usuário se eram fictícios
    if (buyerEmail && updatedAppeal.user.email.includes("@whatsapp.autorecurso.com.br")) {
      await prisma.user.update({
        where: { id: updatedAppeal.userId },
        data: {
          email: buyerEmail,
          name: buyerName !== "Cliente" ? buyerName : updatedAppeal.user.name,
        },
      }).catch(() => {});
    }

    // 4. Dispara comissão de afiliado se houver
    try {
      await processReferralCommission(updatedAppeal.userId, updatedAppeal.id);
    } catch (commErr) {
      console.error("[Hotmart Webhook] Erro ao calcular comissão:", commErr);
    }

    // 5. DISPARA MENSAGEM AUTOMÁTICA DE CONFIRMAÇÃO NO WHATSAPP DO CLIENTE (72 HORAS)
    const clientPhone = updatedAppeal.user.phone || rawPhone;
    const clientDisplayName = updatedAppeal.user.name || buyerName || "Cliente";

    const whatsappConfirmationText =
`🎉 *PAGAMENTO CONFIRMADO COM SUCESSO!*

Olá, *${clientDisplayName}*! Confirmamos o recebimento do seu pagamento de R$ 30,00 referente à elaboração da sua defesa técnica de trânsito.

🚗 *Veículo:* Placa *${updatedAppeal.plate || "Em conferência"}*
📋 *Protocolo:* *${updatedAppeal.protocol}*
⏱️ *Prazo de Confecção:* Até 72 horas úteis nossa equipe de especialistas concluirá e revisará a sua peça personalizada.

📲 *Como você receberá o documento:*
Assim que a petição for concluída e aprovada, enviaremos o arquivo diretamente aqui no seu WhatsApp e também para o seu e-mail (${updatedAppeal.user.email || buyerEmail})!

Você também pode consultar o status em tempo real e baixar sua defesa a qualquer momento pelo portal:
👉 https://recurso-transito.onrender.com/acompanhar?protocolo=${updatedAppeal.protocol}

Qualquer dúvida, estamos à sua disposição aqui mesmo no WhatsApp!
🛡️ *AutoRecurso - Recursos de Trânsito*`;

    if (clientPhone) {
      await queueWhatsAppMessage(clientPhone, whatsappConfirmationText);
      console.log(`[Hotmart Webhook] 📲 Confirmação de 72h enfileirada no WhatsApp para ${clientPhone}`);
    }

    return NextResponse.json({
      success: true,
      protocol: updatedAppeal.protocol,
      message: "Pagamento confirmado com sucesso e cliente notificado no WhatsApp.",
    });
  } catch (error: any) {
    console.error("[Hotmart Webhook] Erro crítico ao processar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
