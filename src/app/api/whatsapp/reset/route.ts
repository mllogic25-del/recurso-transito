import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

// DELETE — apaga toda a sessão do WhatsApp do banco e envia comando de logout ao robô
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // 1. Sinaliza para o processo ativo do robô fazer logout do WhatsApp
    await prisma.whatsappSession.upsert({
      where: { id: "samuca_ACTION" },
      create: { id: "samuca_ACTION", value: "LOGOUT" },
      update: { value: "LOGOUT" },
    });

    // 2. Apaga todas as credenciais e chaves do banco de dados (exceto o sinal de ação)
    await prisma.whatsappSession.deleteMany({
      where: {
        AND: [
          { id: { startsWith: "samuca_" } },
          { id: { not: "samuca_ACTION" } },
        ],
      },
    });

    // 3. Atualiza o status para desconectado
    const statusPayload = {
      status: "DISCONNECTED",
      qr: null,
      updatedAt: new Date().toISOString(),
    };
    await prisma.whatsappSession.upsert({
      where: { id: "samuca_STATUS" },
      create: { id: "samuca_STATUS", value: JSON.stringify(statusPayload) },
      update: { value: JSON.stringify(statusPayload) },
    });

    // 4. Limpa arquivos locais se existirem
    try {
      const publicDir = path.resolve(process.cwd(), "public");
      fs.writeFileSync(
        path.join(publicDir, "whatsapp-status.json"),
        JSON.stringify(statusPayload)
      );

      const localAuth = path.resolve(process.cwd(), "auth_whatsapp_samuca");
      if (fs.existsSync(localAuth)) {
        fs.rmSync(localAuth, { recursive: true, force: true });
      }
    } catch (_) {}

    console.log("[Admin] Comando de Desconexão/Logout WhatsApp disparado por:", user.email);

    return NextResponse.json({
      success: true,
      message: "Comando de desconexão enviado com sucesso. Novo QR Code será gerado.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
