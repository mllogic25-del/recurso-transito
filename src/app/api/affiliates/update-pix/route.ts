import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { pixKeyType, pixKey, cpf } = body;

    if (!pixKey || !pixKey.trim()) {
      return NextResponse.json({ error: "A chave Pix não pode estar vazia." }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, cpf: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    let userCpf = dbUser.cpf;

    // Se o usuário ainda não tem CPF cadastrado e enviou um agora, atualiza o CPF
    if (!userCpf && cpf) {
      const cleanCpfDigits = cpf.replace(/\D/g, "");
      if (cleanCpfDigits.length === 11) {
        userCpf = `${cleanCpfDigits.slice(0, 3)}.${cleanCpfDigits.slice(3, 6)}.${cleanCpfDigits.slice(6, 9)}-${cleanCpfDigits.slice(9, 11)}`;
        await prisma.user.update({
          where: { id: user.id },
          data: { cpf: userCpf },
        });
      }
    }

    const normalizedPixType = pixKeyType || "CPF";
    if (normalizedPixType === "CPF" && userCpf) {
      const cleanPixDigits = pixKey.replace(/\D/g, "");
      const cleanCpfDigits = userCpf.replace(/\D/g, "");
      if (cleanPixDigits !== cleanCpfDigits) {
        return NextResponse.json(
          { error: "A Chave Pix do tipo CPF deve ser idêntica ao seu CPF cadastrado. Chaves de outro titular não são permitidas." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.affiliate.update({
      where: { userId: user.id },
      data: {
        pixKeyType: normalizedPixType,
        pixKey: pixKey.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Chave Pix atualizada com sucesso!",
      affiliate: updated,
    });
  } catch (error: any) {
    console.error("Update Pix error:", error);
    return NextResponse.json({ error: "Erro ao atualizar chave Pix." }, { status: 500 });
  }
}
