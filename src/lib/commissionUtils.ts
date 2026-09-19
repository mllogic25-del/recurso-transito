import { prisma } from "@/lib/prisma";

export async function processReferralCommission(userId: string, appealRequestId: string) {
  try {
    // 1. Verifica se o usuário que fez o recurso foi indicado por um afiliado
    const referral = await prisma.referral.findUnique({
      where: { referredUserId: userId },
    });

    if (!referral) return null;

    // 2. Verifica se JÁ existe comissão para este indicado
    // Regra estrita: "sendo que só receberia uma única vez por cada indicado"
    const existingCommission = await prisma.commission.findUnique({
      where: {
        affiliateId_referredUserId: {
          affiliateId: referral.affiliateId,
          referredUserId: userId,
        },
      },
    });

    if (existingCommission) {
      // Já recebeu a comissão de R$ 10 na 1ª compra do indicado
      return null;
    }

    // 3. Cria a comissão de R$ 10,00 com status PENDING (Aguardando repasse Pix pelo Admin)
    const commission = await prisma.commission.create({
      data: {
        affiliateId: referral.affiliateId,
        referredUserId: userId,
        appealRequestId,
        amount: 10.00,
        status: "PENDING",
      },
    });

    // 4. Marca o status da indicação como PAID_CONVERTED
    await prisma.referral.update({
      where: { id: referral.id },
      data: { status: "PAID_CONVERTED" },
    });

    // 5. Incrementa os ganhos totais do afiliado
    await prisma.affiliate.update({
      where: { id: referral.affiliateId },
      data: {
        totalEarnings: { increment: 10.00 },
      },
    });

    console.log(`[Comissão Afiliado] R$ 10,00 gerado para o afiliado ${referral.affiliateId} pelo indicado ${userId}.`);

    return commission;
  } catch (err) {
    console.error("Erro ao processar comissão de indicação:", err);
    return null;
  }
}
