import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE — apaga toda a sessão do WhatsApp do banco (força novo QR Code)
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Apaga todas as chaves da sessão do Samuca (creds + keys + status)
    await prisma.whatsappSession.deleteMany({
      where: { id: { startsWith: "samuca_" } },
    });

    console.log("[Admin] Sessão WhatsApp resetada por:", user.email);

    return NextResponse.json({
      success: true,
      message: "Sessão apagada. O bot vai gerar um novo QR Code.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
