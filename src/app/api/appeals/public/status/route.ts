import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (
      searchParams.get("protocolo") ||
      searchParams.get("p") ||
      searchParams.get("sck") ||
      searchParams.get("q") ||
      ""
    ).trim();

    if (!query) {
      return NextResponse.json({ error: "Informe o número do protocolo, placa ou telefone." }, { status: 400 });
    }

    const cleanQuery = query.toUpperCase();
    const rawDigits = query.replace(/\D/g, "");

    // 1. Tenta por protocolo
    let appeal = await prisma.appealRequest.findFirst({
      where: {
        protocol: { contains: cleanQuery },
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Se não achou, tenta por placa
    if (!appeal && cleanQuery.length >= 7) {
      const cleanPlate = cleanQuery.replace(/[^A-Z0-9]/g, "");
      appeal = await prisma.appealRequest.findFirst({
        where: { plate: cleanPlate },
        include: {
          user: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // 3. Se não achou, tenta por telefone ou e-mail
    if (!appeal && rawDigits.length >= 8) {
      appeal = await prisma.appealRequest.findFirst({
        where: {
          user: {
            OR: [
              { phone: { contains: rawDigits } },
              { phone: { contains: rawDigits.length > 2 && rawDigits.startsWith("55") ? rawDigits.slice(2) : rawDigits } },
            ],
          },
        },
        include: {
          user: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!appeal) {
      return NextResponse.json({
        found: false,
        message: "Nenhum recurso localizado com esses dados.",
      });
    }

    // Retorna payload seguro para a página pública de acompanhamento
    return NextResponse.json({
      found: true,
      appeal: {
        id: appeal.id,
        protocol: appeal.protocol,
        plate: appeal.plate,
        aitNumber: appeal.aitNumber,
        type: appeal.type,
        authority: appeal.authority,
        status: appeal.status,
        paymentStatus: appeal.paymentStatus,
        paymentAmount: appeal.paymentAmount,
        infractionDate: appeal.infractionDate,
        createdAt: appeal.createdAt,
        readyAt: appeal.readyAt,
        isReady: appeal.status === "READY",
        hasDocument: Boolean(appeal.generatedDocument && appeal.generatedDocument.trim().length > 50),
        clientName: appeal.user?.name || "Cliente",
        clientEmail: appeal.user?.email || "",
      },
    });
  } catch (err: any) {
    console.error("[Public Appeal Status] Erro:", err);
    return NextResponse.json({ error: "Erro ao consultar recurso." }, { status: 500 });
  }
}
