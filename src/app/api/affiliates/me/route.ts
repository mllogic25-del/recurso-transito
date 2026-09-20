import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Busca perfil de afiliado
    let affiliate = await prisma.affiliate.findUnique({
      where: { userId: user.id },
      include: {
        referrals: {
          include: {
            referredUser: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        commissions: {
          include: {
            appealRequest: {
              select: {
                protocol: true,
                plate: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json({ affiliate: null });
    }

    // Cálculos de saldo
    const totalCommissions = affiliate.commissions.length;
    const pendingCommissions = affiliate.commissions.filter((c) => c.status === "PENDING");
    const paidCommissions = affiliate.commissions.filter((c) => c.status === "PAID");

    const pendingAmount = pendingCommissions.reduce((acc, curr) => acc + curr.amount, 0);
    const paidAmount = paidCommissions.reduce((acc, curr) => acc + curr.amount, 0);
    const totalEarned = affiliate.totalEarnings;

    // Mascara o e-mail dos indicados para privacidade (ex: car***@***)
    const formattedReferrals = affiliate.referrals.map((ref) => {
      const parts = ref.referredUser.email.split("@");
      const maskedEmail = `${parts[0].slice(0, 3)}***@${parts[1] || "***"}`;
      const nameParts = ref.referredUser.name.split(" ");
      const maskedName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : nameParts[0];

      return {
        id: ref.id,
        name: maskedName,
        email: maskedEmail,
        status: ref.status,
        createdAt: ref.createdAt,
      };
    });

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        userName: user.name,
        userCpf: user.cpf,
        referralCode: affiliate.referralCode,
        pixKeyType: affiliate.pixKeyType,
        pixKey: affiliate.pixKey,
        totalEarnings: totalEarned,
        pendingAmount,
        paidAmount,
        totalReferralsCount: affiliate.referrals.length,
        convertedCount: affiliate.referrals.filter((r) => r.status === "PAID_CONVERTED").length,
        referrals: formattedReferrals,
        commissions: affiliate.commissions.map((c) => ({
          id: c.id,
          amount: c.amount,
          status: c.status,
          paidAt: c.paidAt,
          createdAt: c.createdAt,
          protocol: c.appealRequest?.protocol || "N/A",
        })),
      },
    });
  } catch (error: any) {
    console.error("Affiliate me error:", error);
    return NextResponse.json({ error: "Erro ao buscar dados do afiliado." }, { status: 500 });
  }
}
