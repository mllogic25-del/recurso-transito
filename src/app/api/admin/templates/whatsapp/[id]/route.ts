import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.whatsAppTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Template excluído com sucesso." });
  } catch (error: any) {
    console.error("[Template DELETE Error]:", error);
    return NextResponse.json(
      { error: "Erro ao excluir template: " + (error?.message || error) },
      { status: 500 }
    );
  }
}
