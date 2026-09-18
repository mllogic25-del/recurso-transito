import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const templates = await prisma.legalTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao listar modelos jurídicos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const { title, category, ctbArticle, description, defaultPreliminaries, defaultMerit, defaultRequests } = body;

    const template = await prisma.legalTemplate.upsert({
      where: { category },
      update: {
        title,
        ctbArticle,
        description,
        defaultPreliminaries,
        defaultMerit,
        defaultRequests,
      },
      create: {
        title,
        category,
        ctbArticle,
        description,
        defaultPreliminaries,
        defaultMerit,
        defaultRequests,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao salvar modelo jurídico." },
      { status: 500 }
    );
  }
}
