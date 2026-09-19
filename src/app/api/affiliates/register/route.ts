import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

// Gera um código de indicação amigável e único (ex: MARCOS7K2)
function generateReferralCode(name: string): string {
  const cleanName = name
    .trim()
    .split(" ")[0]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .slice(0, 6);
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${cleanName || "REF"}${randomChars}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, pixKeyType, pixKey } = body;

    if (!name || !email || !password || !pixKey) {
      return NextResponse.json(
        { error: "Nome, e-mail, senha e Chave Pix são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verifica se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { affiliateProfile: true },
    });

    if (existingUser) {
      // Se já tem usuário mas não tem perfil de afiliado, adiciona
      if (!existingUser.affiliateProfile) {
        let code = generateReferralCode(existingUser.name);
        while (await prisma.affiliate.findUnique({ where: { referralCode: code } })) {
          code = generateReferralCode(existingUser.name);
        }

        const affiliate = await prisma.affiliate.create({
          data: {
            userId: existingUser.id,
            referralCode: code,
            pixKeyType: pixKeyType || "CPF",
            pixKey: pixKey.trim(),
          },
        });

        const token = signToken({
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role as "ADMIN" | "CLIENT",
          cpf: existingUser.cpf,
          phone: existingUser.phone,
        });

        const response = NextResponse.json({
          success: true,
          message: "Perfil de afiliado ativado com sucesso!",
          affiliate,
        });

        response.cookies.set("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });

        return response;
      }

      return NextResponse.json(
        { error: "Este e-mail já possui cadastro. Faça login para acessar seu painel." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        role: "CLIENT",
      },
    });

    // Gera código exclusivo
    let code = generateReferralCode(user.name);
    while (await prisma.affiliate.findUnique({ where: { referralCode: code } })) {
      code = generateReferralCode(user.name);
    }

    const affiliate = await prisma.affiliate.create({
      data: {
        userId: user.id,
        referralCode: code,
        pixKeyType: pixKeyType || "CPF",
        pixKey: pixKey.trim(),
      },
    });

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
      message: "Cadastro de Afiliado realizado com sucesso!",
      affiliate,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Affiliate register error:", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar afiliado." },
      { status: 500 }
    );
  }
}
