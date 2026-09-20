import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Mantém referência do processo do bot na memória global do Node
declare global {
  var samucaBotProcess: any;
}

function startBotProcess() {
  if (global.samucaBotProcess && !global.samucaBotProcess.killed) {
    console.log("[Samuca Bot Manager] Bot já está em execução.");
    return;
  }

  const isWindows = process.platform === "win32";
  const cmd = isWindows ? "npx.cmd" : "npx";

  console.log("[Samuca Bot Manager] Disparando inicialização do bot WhatsApp...");

  try {
    global.samucaBotProcess = spawn(cmd, ["tsx", "src/bot/whatsapp.ts"], {
      cwd: process.cwd(),
      env: { ...process.env },
      stdio: "inherit",
      detached: !isWindows,
    });

    global.samucaBotProcess.on("exit", (code: any) => {
      console.log(`[Samuca Bot Manager] Processo finalizou com código ${code}`);
      global.samucaBotProcess = null;
    });
  } catch (err) {
    console.error("[Samuca Bot Manager] Erro ao iniciar processo:", err);
  }
}

export async function GET() {
  try {
    // 1. Tenta buscar primeiro do Banco de Dados (mais confiável na nuvem/Render)
    try {
      const dbStatus = await prisma.whatsappSession.findUnique({
        where: { id: "samuca_STATUS" },
      });
      if (dbStatus && dbStatus.value) {
        const data = JSON.parse(dbStatus.value);
        return NextResponse.json(data);
      }
    } catch (_) {}

    // 2. Fallback: arquivo local whatsapp-status.json
    const statusFile = path.resolve(process.cwd(), "public", "whatsapp-status.json");

    if (fs.existsSync(statusFile)) {
      const content = fs.readFileSync(statusFile, "utf-8");
      const data = JSON.parse(content);
      return NextResponse.json(data);
    }

    // Se o arquivo ainda não existe, tenta disparar o bot automaticamente
    startBotProcess();

    return NextResponse.json({
      status: "STARTING",
      qr: null,
      message: "Iniciando processo do WhatsApp...",
    });
  } catch (error: any) {
    return NextResponse.json({ status: "ERROR", error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    startBotProcess();
    return NextResponse.json({
      success: true,
      message: "Bot do Samuca iniciado com sucesso. O QR Code será gerado em instantes.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
