import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { isAffiliateProgramActive } from "@/lib/settings";

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
    // Verifica se o programa de afiliados está suspenso
    const programActive = await isAffiliateProgramActive();
    if (!programActive) {
      return NextResponse.json(
        { error: "O programa de afiliados está temporariamente suspenso para novas adesões." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, phone, cpf, pixKeyType, pixKey } = body;

    if (!name || !email || !password || !pixKey || !cpf) {
      return NextResponse.json(
        { error: "Nome, CPF, e-mail, senha e Chave Pix são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanCpfDigits = cpf.replace(/\D/g, "");
    if (cleanCpfDigits.length !== 11) {
      return NextResponse.json(
        { error: "Por favor, informe um CPF válido com 11 dígitos." },
        { status: 400 }
      );
    }

    const formattedCpf = `${cleanCpfDigits.slice(0, 3)}.${cleanCpfDigits.slice(3, 6)}.${cleanCpfDigits.slice(6, 9)}-${cleanCpfDigits.slice(9, 11)}`;

    // Validação de Titularidade: se a chave Pix for do tipo CPF, deve ser exatamente o mesmo CPF cadastrado
    const normalizedPixType = pixKeyType || "CPF";
    if (normalizedPixType === "CPF") {
      const cleanPixDigits = pixKey.replace(/\D/g, "");
      if (cleanPixDigits !== cleanCpfDigits) {
        return NextResponse.json(
          { error: "A Chave Pix do tipo CPF deve ser idêntica ao CPF cadastrado. Chave de outro titular não é permitida." },
          { status: 400 }
        );
      }
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
        // Atualiza CPF do usuário se ainda não estiver salvo
        if (!existingUser.cpf) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { cpf: formattedCpf },
          });
          existingUser.cpf = formattedCpf;
        }

        let code = generateReferralCode(existingUser.name);
        while (await prisma.affiliate.findUnique({ where: { referralCode: code } })) {
          code = generateReferralCode(existingUser.name);
        }

        const affiliate = await prisma.affiliate.create({
          data: {
            userId: existingUser.id,
            referralCode: code,
            pixKeyType: normalizedPixType,
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
        cpf: formattedCpf,
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
        pixKeyType: normalizedPixType,
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
