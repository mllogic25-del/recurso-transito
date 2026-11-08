import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const protocol = (searchParams.get("protocolo") || searchParams.get("p") || "").trim().toUpperCase();

    if (!protocol) {
      return NextResponse.json({ error: "Protocolo não informado." }, { status: 400 });
    }

    const appeal = await prisma.appealRequest.findFirst({
      where: { protocol },
      include: { user: true },
    });

    if (!appeal) {
      return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
    }

    if (appeal.status !== "READY" || !appeal.generatedDocument) {
      return NextResponse.json(
        { error: "A peça jurídica ainda está em fase de elaboração/revisão técnica (prazo de até 72h úteis)." },
        { status: 400 }
      );
    }

    const rawText = appeal.generatedDocument;
    const lines = rawText.split("\n");

    const paragraphs: Paragraph[] = lines.map((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("===") || trimmed.startsWith("---")) {
        return new Paragraph({
          text: "",
          spacing: { after: 120 },
        });
      }

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
        spacing: { line: 360, after: 120 },
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1700,
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
        "Content-Disposition": `attachment; filename="Defesa_Transito_${appeal.protocol}_${appeal.plate}.docx"`,
      },
    });
  } catch (err: any) {
    console.error("[Public DOCX Download] Erro:", err);
    return NextResponse.json({ error: "Erro ao gerar arquivo para download." }, { status: 500 });
  }
}
