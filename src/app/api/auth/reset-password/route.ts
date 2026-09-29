import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, documentOrPhone, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "E-mail e nova senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Nenhuma conta foi encontrada com este e-mail." },
        { status: 404 }
      );
    }

    // Validação de titularidade:
    // Se a conta tem CPF ou telefone registrado, o usuário precisa fornecer ao menos um dos dois para confirmar que é o dono da conta.
    const cleanInputDigits = (documentOrPhone || "").replace(/\D/g, "");
    const userCpfDigits = (user.cpf || "").replace(/\D/g, "");
    const userPhoneDigits = (user.phone || "").replace(/\D/g, "");

    const hasValidationData = userCpfDigits.length > 0 || userPhoneDigits.length > 0;

    if (hasValidationData) {
      if (!cleanInputDigits) {
        return NextResponse.json(
          { error: "Por favor, informe seu CPF ou Telefone cadastrado para confirmar sua identidade." },
          { status: 400 }
        );
      }

      const matchesCpf =
        userCpfDigits.length > 0 &&
        (userCpfDigits === cleanInputDigits || cleanInputDigits.endsWith(userCpfDigits));

      const matchesPhone =
        userPhoneDigits.length > 0 &&
        (userPhoneDigits === cleanInputDigits ||
          userPhoneDigits.endsWith(cleanInputDigits) ||
          cleanInputDigits.endsWith(userPhoneDigits));

      if (!matchesCpf && !matchesPhone) {
        return NextResponse.json(
          {
            error:
              "O CPF ou Telefone informado não corresponde aos dados cadastrados desta conta. Caso tenha esquecido, entre em contato pelo WhatsApp.",
          },
          { status: 400 }
        );
      }
    }

    // Atualiza a senha com hash seguro
    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    console.log(`[Auth] Senha redefinida com sucesso para o usuário: ${user.email} (${user.name})`);

    return NextResponse.json({
      success: true,
      message: "Sua senha foi redefinida com sucesso! Você já pode entrar com a nova senha.",
    });
  } catch (error: any) {
    console.error("[Auth] Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Erro interno ao redefinir a senha. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
