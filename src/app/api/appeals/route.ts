import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateLegalAppealDocument } from "@/lib/legalGenerator";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (user.role !== "ADMIN") {
      where.userId = user.id;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }

    const appeals = await prisma.appealRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
          },
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Ascender as defesas com prazo mais curto (menor número de dias restantes no topo)
    appeals.sort((a, b) => {
      // Recursos liberados vão para o final da fila de urgência
      if (a.status === "READY" && b.status !== "READY") return 1;
      if (a.status !== "READY" && b.status === "READY") return -1;

      // Se ambos tiverem data limite, o prazo mais próximo vence
      if (a.defenseDeadline && b.defenseDeadline) {
        return new Date(a.defenseDeadline).getTime() - new Date(b.defenseDeadline).getTime();
      }
      if (a.defenseDeadline && !b.defenseDeadline) return -1;
      if (!a.defenseDeadline && b.defenseDeadline) return 1;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ appeals });
  } catch (error: any) {
    console.error("List appeals error:", error);
    return NextResponse.json(
      { error: "Erro ao listar recursos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      authority,
      aitNumber,
      plate,
      renavam,
      vehicleModel,
      ctbArticle,
      infractionDate,
      infractionTime,
      infractionLocation,
      speedLimit,
      speedMeasured,
      speedConsidered,
      radarModel,
      lastVerification,
      notificationDate,
      defenseDeadline,
      isExpiredSubmission,
      defenseArguments,
      legalCategory,
      requesterName,
      requesterCpf,
      requesterRg,
      requesterCnh,
      requesterAddress,
      documents, // array de documentos enviados
    } = body;

    if (!aitNumber || !plate || !ctbArticle || !infractionDate || !infractionLocation || !defenseArguments) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios da infração e do relato." },
        { status: 400 }
      );
    }

    // Gerar número de protocolo único sequencial
    const currentYear = new Date().getFullYear();
    const countTotal = await prisma.appealRequest.count();
    const protocol = `REC-${currentYear}-${String(countTotal + 1).padStart(5, "0")}`;

    // Gerar automaticamente a minuta jurídica
    const generatedDocument = generateLegalAppealDocument({
      protocol,
      type: type || "DEFESA_PREVIA",
      authority: authority || "DETRAN",
      requesterName: requesterName || user.name,
      requesterCpf: requesterCpf || user.cpf || "",
      requesterRg: requesterRg || "",
      requesterCnh: requesterCnh || "",
      requesterAddress: requesterAddress || "",
      plate: plate.toUpperCase().trim(),
      renavam: renavam || "",
      vehicleModel: vehicleModel || "",
      aitNumber: aitNumber.toUpperCase().trim(),
      ctbArticle,
      infractionDate,
      infractionTime: infractionTime || "",
      infractionLocation,
      speedLimit: speedLimit || "",
      speedMeasured: speedMeasured || "",
      speedConsidered: speedConsidered || "",
      radarModel: radarModel || "",
      lastVerification: lastVerification || "",
      notificationDate: notificationDate || "",
      defenseArguments,
      legalCategory: legalCategory || "OUTROS",
    });

    // Se o usuário atualizou CPF ou telefone, salva no perfil dele
    if (requesterCpf || requesterCnh) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          cpf: requesterCpf || undefined,
          cnh: requesterCnh || undefined,
          address: requesterAddress || undefined,
          rg: requesterRg || undefined,
        },
      });
    }

    // Criar o recurso no banco de dados com status "PENDING" (aguardando você, administrador, analisar e gerar/liberar)
    const appeal = await prisma.appealRequest.create({
      data: {
        protocol,
        userId: user.id,
        status: "PENDING", // O cliente envia e fica aguardando o administrador elaborar/liberar
        type: type || "DEFESA_PREVIA",
        authority: authority || "DETRAN",
        aitNumber: aitNumber.toUpperCase().trim(),
        plate: plate.toUpperCase().trim(),
        renavam: renavam || null,
        vehicleModel: vehicleModel || null,
        ctbArticle,
        infractionDate,
        infractionTime: infractionTime || null,
        infractionLocation,
        speedLimit: speedLimit || null,
        speedMeasured: speedMeasured || null,
        speedConsidered: speedConsidered || null,
        radarModel: radarModel || null,
        lastVerification: lastVerification || null,
        notificationDate: notificationDate || null,
        defenseDeadline: defenseDeadline ? new Date(defenseDeadline) : null,
        isExpiredSubmission: Boolean(isExpiredSubmission),
        defenseArguments,
        legalCategory: legalCategory || "OUTROS",
        generatedDocument, // Minuta prévia disponível para o Administrador ajustar
        readyAt: null, // Será preenchido somente quando o Administrador aprovar e liberar
        documents: {
          create: (documents || []).map((doc: any) => ({
            title: doc.title || "Documento",
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileType: doc.fileType || "application/pdf",
            fileSize: doc.fileSize || 0,
          })),
        },
      },
      include: {
        documents: true,
      },
    });

    return NextResponse.json({
      success: true,
      appeal,
      protocol,
    });
  } catch (error: any) {
    console.error("Create appeal error:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido de recurso." },
      { status: 500 }
    );
  }
}
