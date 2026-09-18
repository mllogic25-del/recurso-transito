import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const appeal = await prisma.appealRequest.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!appeal) {
      return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
    }

    if (user.role !== "ADMIN" && appeal.userId !== user.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const rawText = appeal.generatedDocument || "Recurso em elaboração.";
    const lines = rawText.split("\n");

    const paragraphs: Paragraph[] = lines.map((line) => {
      const trimmed = line.trim();
      
      // Se for linha separadora
      if (trimmed.startsWith("===") || trimmed.startsWith("---")) {
        return new Paragraph({
          text: "",
          spacing: { after: 120 },
        });
      }

      // Se for título de seção (I -, II -, III -, IV -)
      if (/^[I|V|X]+\s*-\s*/.test(trimmed)) {
        return new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 24, // 12pt
              font: "Arial",
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        });
      }

      // Se for linha de assinatura
      if (trimmed.startsWith("___")) {
        return new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "____________________________________________________________",
              bold: true,
              size: 22,
              font: "Arial",
            }),
          ],
          spacing: { before: 360, after: 80 },
        });
      }

      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: line,
            size: 22, // 11pt
            font: "Arial",
          }),
        ],
        spacing: { line: 360, after: 120 }, // Espaçamento 1.5 linhas
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 2.5cm
                right: 1440,
                bottom: 1440,
                left: 1700, // 3cm
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Recurso_${appeal.protocol}_${appeal.plate}.docx"`,
      },
    });
  } catch (error: any) {
    console.error("Docx generation error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar arquivo Word (.docx)." },
      { status: 500 }
    );
  }
}
