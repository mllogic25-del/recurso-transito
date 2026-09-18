import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const formData = await request.formData();
    const multipleFiles = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const defaultTitle = (formData.get("title") as string) || "Documento Anexo";

    const filesToProcess: File[] = [];
    if (multipleFiles && multipleFiles.length > 0) {
      for (const f of multipleFiles) {
        if (f && f.size > 0) filesToProcess.push(f);
      }
    } else if (singleFile && singleFile.size > 0) {
      filesToProcess.push(singleFile);
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const uploadedResults = [];

    for (const file of filesToProcess) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      await fs.writeFile(filePath, buffer);

      // Detecta título inteligente com base no nome do arquivo se não informado
      let autoTitle = defaultTitle;
      const lowerName = file.name.toLowerCase();
      if (lowerName.includes("cnh")) autoTitle = "CNH do Condutor";
      else if (lowerName.includes("crlv") || lowerName.includes("doc")) autoTitle = "CRLV do Veículo";
      else if (lowerName.includes("ait") || lowerName.includes("multa") || lowerName.includes("notific")) autoTitle = "Auto de Infração / Notificação";
      else if (lowerName.includes("foto") || lowerName.includes("local") || lowerName.includes("prova")) autoTitle = "Foto / Prova do Local";

      uploadedResults.push({
        title: autoTitle,
        originalName: sanitizedName,
        fileName: uniqueFileName,
        fileUrl: `/uploads/${uniqueFileName}`,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedResults,
      file: uploadedResults[0], // Compatibilidade
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erro ao processar upload dos documentos." },
      { status: 500 }
    );
  }
}
