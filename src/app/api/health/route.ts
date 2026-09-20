import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Ping no banco de dados para checar conectividade
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "HEALTHY",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: "AutoRecurso Web & Samuca WhatsApp Bot",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "DEGRADED",
        error: error?.message || "Erro de conexão",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
