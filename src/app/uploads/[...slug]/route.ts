import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// MIME types suportados
const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".ogg": "audio/ogg",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".webp": "image/webp",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slugParts = params.slug || [];
    if (slugParts.length === 0) {
      return new NextResponse("Arquivo não especificado.", { status: 400 });
    }

    // Previne Directory Traversal
    const safeParts = slugParts.map((p) => path.basename(p));
    const relativePath = path.join(...safeParts);
    const fullPath = path.join(process.cwd(), "public", "uploads", relativePath);

    try {
      const fileBuffer = await fs.readFile(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      const contentType = MIME_MAP[ext] || "application/octet-stream";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": "inline",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch {
      // Se não encontrou no caminho normal, tenta na subpasta whatsapp
      const whatsappPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "whatsapp",
        safeParts[safeParts.length - 1]
      );

      try {
        const fileBuffer = await fs.readFile(whatsappPath);
        const ext = path.extname(whatsappPath).toLowerCase();
        const contentType = MIME_MAP[ext] || "application/octet-stream";

        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=86400",
          },
        });
      } catch {
        // Retorna página amigável caso seja um arquivo antigo que não está mais no disco
        return new NextResponse(
          `<!DOCTYPE html>
          <html lang="pt-BR">
            <head>
              <meta charset="utf-8" />
              <title>Documento Não Encontrado - AutoRecurso</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
                .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 36px 30px; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.4); }
                h2 { color: #f59e0b; margin-top: 0; font-size: 20px; }
                p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
                .btn { display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 13px; margin-top: 20px; transition: background 0.2s; }
                .btn:hover { background: #1d4ed8; }
              </style>
            </head>
            <body>
              <div class="card">
                <h2>Documento de Teste Anterior</h2>
                <p>Este arquivo de demonstração foi registrado em um deploy anterior e não está disponível no armazenamento temporário.</p>
                <p>Novos documentos e fotos enviados pelos clientes no WhatsApp são salvos e abrem automaticamente aqui.</p>
                <a href="/admin/dashboard" class="btn">Voltar ao Painel do Administrador</a>
              </div>
            </body>
          </html>`,
          {
            status: 404,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }
        );
      }
    }
  } catch (error) {
    console.error("[Uploads Route] Erro ao servir arquivo:", error);
    return new NextResponse("Erro ao carregar documento.", { status: 500 });
  }
}
