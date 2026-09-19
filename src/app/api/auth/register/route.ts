import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, cpf, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Verifica se usuário já existe
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado no sistema. Usuários com cadastro prévio não são elegíveis para novas indicações." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Permite definir ADMIN apenas se não houver usuários ainda no sistema
    const totalUsers = await prisma.user.count();
    const userRole = totalUsers === 0 ? "ADMIN" : "CLIENT";

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone || null,
        cpf: cpf || null,
        role: userRole,
      },
    });

    // Processa indicação caso código esteja presente no body ou cookie
    const rawRefCode =
      body.referralCode ||
      request.headers.get("cookie")?.match(/referral_code=([^;]+)/)?.[1];

    if (rawRefCode) {
      try {
        const cleanRef = decodeURIComponent(rawRefCode).toUpperCase().trim();
        const affiliate = await prisma.affiliate.findUnique({
          where: { referralCode: cleanRef },
        });

        if (affiliate && affiliate.userId !== user.id) {
          // Garante que o usuário indicado só receba um único indicador
          await prisma.referral.create({
            data: {
              affiliateId: affiliate.id,
              referredUserId: user.id,
              status: "REGISTERED",
            },
          });
        }
      } catch (refErr) {
        console.error("Erro ao vincular indicação:", refErr);
      }
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "ADMIN" | "CLIENT",
      cpf: user.cpf,
      phone: user.phone,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar usuário." },
      { status: 500 }
    );
  }
}
