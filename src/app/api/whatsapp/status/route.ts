import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const statusFile = path.resolve(process.cwd(), "public", "whatsapp-status.json");

    if (fs.existsSync(statusFile)) {
      const content = fs.readFileSync(statusFile, "utf-8");
      const data = JSON.parse(content);
      return NextResponse.json(data);
    }

    return NextResponse.json({
      status: "DISCONNECTED",
      qr: null,
      message: "Aguardando inicialização do serviço do WhatsApp...",
    });
  } catch (error: any) {
    return NextResponse.json({ status: "ERROR", error: error.message }, { status: 500 });
  }
}
