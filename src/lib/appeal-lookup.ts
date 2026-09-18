import { prisma } from "./prisma";

export interface AppealLookupResult {
  protocol: string;
  plate: string;
  aitNumber: string;
  authority: string;
  status: string; // PENDING, PROCESSING, READY, REJECTED
  paymentStatus: string; // PENDING, PAID
  clientName: string;
  createdAt: Date;
  readyAt?: Date | null;
}

export async function lookupAppealStatus(
  query: string,
  userPhone?: string
): Promise<AppealLookupResult | null> {
  try {
    const rawQuery = query.trim();
    const cleanAlphanumeric = rawQuery.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // 1. Busca por Protocolo (ex: REC-2026-00001)
    let appeal = await prisma.appealRequest.findFirst({
      where: {
        OR: [
          { protocol: { equals: rawQuery } },
          { protocol: { contains: cleanAlphanumeric } },
        ],
      },
      include: { user: true },
    });

    // 2. Busca por Placa do Veículo (ex: ABC1D23, ABC-1234)
    if (!appeal && cleanAlphanumeric.length >= 6) {
      appeal = await prisma.appealRequest.findFirst({
        where: {
          OR: [
            { plate: { equals: cleanAlphanumeric } },
            { plate: { contains: cleanAlphanumeric } },
          ],
        },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    }

    // 3. Busca por CPF (apenas números, 11 dígitos)
    const onlyDigits = rawQuery.replace(/\D/g, "");
    if (!appeal && onlyDigits.length >= 10) {
      appeal = await prisma.appealRequest.findFirst({
        where: {
          user: {
            cpf: { contains: onlyDigits },
          },
        },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    }

    // 4. Busca pelo número de telefone do WhatsApp caso informado
    if (!appeal && userPhone) {
      const cleanPhone = userPhone.replace(/\D/g, "");
      if (cleanPhone.length >= 8) {
        appeal = await prisma.appealRequest.findFirst({
          where: {
            user: {
              phone: { contains: cleanPhone.slice(-8) },
            },
          },
          include: { user: true },
          orderBy: { createdAt: "desc" },
        });
      }
    }

    if (!appeal) return null;

    return {
      protocol: appeal.protocol,
      plate: appeal.plate,
      aitNumber: appeal.aitNumber,
      authority: appeal.authority,
      status: appeal.status,
      paymentStatus: appeal.paymentStatus,
      clientName: appeal.user?.name || "Cliente",
      createdAt: appeal.createdAt,
      readyAt: appeal.readyAt,
    };
  } catch (error) {
    console.error("[Appeal Lookup Error]:", error);
    return null;
  }
}

/**
 * Traduz o status do recurso para linguagem humana amigável
 */
export function formatAppealHumanStatus(result: AppealLookupResult): string {
  let statusText = "Em análise na fila de elaboração";
  if (result.status === "READY") {
    statusText = "✅ Concluído e pronto para envio/protocolo";
  } else if (result.status === "PROCESSING") {
    statusText = "✍️ Em elaboração pelos nossos especialistas";
  } else if (result.status === "PENDING") {
    statusText = "⏳ Aguardando início dos trabalhos na fila regular";
  }

  const paymentText =
    result.paymentStatus === "PAID"
      ? "Confirmado ✅"
      : "Aguardando confirmação";

  return `*Protocolo:* ${result.protocol}\n*Placa do Veículo:* ${result.plate}\n*Auto de Infração:* ${result.aitNumber}\n*Status da Defesa:* ${statusText}\n*Pagamento:* ${paymentText}`;
}
