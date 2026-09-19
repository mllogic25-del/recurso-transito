import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

    const commissions = await prisma.commission.findMany({
      include: {
        affiliate: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        appealRequest: {
          select: {
            protocol: true,
            plate: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Indicados correspondentes
    const referredUserIds = commissions.map((c) => c.referredUserId);
    const referredUsers = await prisma.user.findMany({
      where: { id: { in: referredUserIds } },
      select: { id: true, name: true, email: true },
    });
    const usersMap = new Map(referredUsers.map((u) => [u.id, u]));

    const formatted = commissions.map((c) => ({
      id: c.id,
      amount: c.amount,
      status: c.status,
      paidAt: c.paidAt,
      createdAt: c.createdAt,
      affiliateName: c.affiliate.user.name,
      affiliateEmail: c.affiliate.user.email,
      affiliatePhone: c.affiliate.user.phone || "Não informado",
      pixKeyType: c.affiliate.pixKeyType,
      pixKey: c.affiliate.pixKey,
      referralCode: c.affiliate.referralCode,
      referredClientName: usersMap.get(c.referredUserId)?.name || "Cliente",
      referredClientEmail: usersMap.get(c.referredUserId)?.email || "",
      appealProtocol: c.appealRequest?.protocol || "N/A",
    }));

    return NextResponse.json({ commissions: formatted });
  } catch (error: any) {
    console.error("Admin commissions GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar comissões." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

    const body = await request.json();
    const { commissionId, action } = body;

    if (action === "MARK_AS_PAID") {
      if (!commissionId) {
        return NextResponse.json({ error: "ID da comissão é obrigatório." }, { status: 400 });
      }

      const updated = await prisma.commission.update({
        where: { id: commissionId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Comissão marcada como paga via Pix!",
        commission: updated,
      });
    }

    if (action === "MANUAL_LINK") {
      const { referralCode, clientEmailOrPhone, appealProtocol } = body;
      if (!referralCode) {
        return NextResponse.json({ error: "Código do afiliado é obrigatório." }, { status: 400 });
      }

      const affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: referralCode.toUpperCase().trim() },
      });

      if (!affiliate) {
        return NextResponse.json({ error: "Código de afiliado não encontrado." }, { status: 404 });
      }

      let targetUser = null;
      let targetAppeal = null;

      if (appealProtocol) {
        targetAppeal = await prisma.appealRequest.findUnique({
          where: { protocol: appealProtocol.trim() },
          include: { user: true },
        });
        if (targetAppeal) targetUser = targetAppeal.user;
      }

      if (!targetUser && clientEmailOrPhone) {
        targetUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: clientEmailOrPhone.toLowerCase().trim() },
              { phone: clientEmailOrPhone.trim() },
            ],
          },
        });
      }

      if (!targetUser) {
        return NextResponse.json({ error: "Cliente ou Recurso não localizado." }, { status: 404 });
      }

      // Cria vínculo de indicação se não existir
      await prisma.referral.upsert({
        where: { referredUserId: targetUser.id },
        update: {},
        create: {
          affiliateId: affiliate.id,
          referredUserId: targetUser.id,
          status: targetAppeal?.paymentStatus === "PAID" ? "PAID_CONVERTED" : "REGISTERED",
        },
      });

      // Se tiver recurso pago, gera comissão se não existir ainda
      if (targetAppeal && targetAppeal.paymentStatus === "PAID") {
        const existing = await prisma.commission.findUnique({
          where: {
            affiliateId_referredUserId: {
              affiliateId: affiliate.id,
              referredUserId: targetUser.id,
            },
          },
        });

        if (!existing) {
          await prisma.commission.create({
            data: {
              affiliateId: affiliate.id,
              referredUserId: targetUser.id,
              appealRequestId: targetAppeal.id,
              amount: 10.0,
              status: "PENDING",
            },
          });
          await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: { totalEarnings: { increment: 10.0 } },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Indicação vinculada com sucesso ao afiliado ${affiliate.referralCode}!`,
      });
    }

    return NextResponse.json({ error: "Ação não suportada." }, { status: 400 });
  } catch (error: any) {
    console.error("Admin commissions POST error:", error);
    return NextResponse.json({ error: "Erro ao atualizar comissão." }, { status: 500 });
  }
}
