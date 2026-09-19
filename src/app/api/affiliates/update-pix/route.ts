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
    const { pixKeyType, pixKey } = body;

    if (!pixKey || !pixKey.trim()) {
      return NextResponse.json({ error: "A chave Pix não pode estar vazia." }, { status: 400 });
    }

    const updated = await prisma.affiliate.update({
      where: { userId: user.id },
      data: {
        pixKeyType: pixKeyType || "CPF",
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
