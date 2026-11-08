import { prisma } from "./prisma";

/**
 * Enfileira uma mensagem de texto para ser enviada automaticamente
 * pelo robô Samuca no WhatsApp.
 */
export async function queueWhatsAppMessage(phone: string, text: string): Promise<boolean> {
  try {
    const rawDigits = (phone || "").replace(/\D/g, "");
    if (!rawDigits || rawDigits.length < 8) {
      console.warn(`[WhatsApp Queue] Número de telefone inválido para envio: "${phone}"`);
      return false;
    }

    const formattedPhone = rawDigits.startsWith("55") ? rawDigits : `55${rawDigits}`;
    const id = `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await prisma.whatsappSession.create({
      data: {
        id,
        value: JSON.stringify({
          phone: formattedPhone,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        }),
      },
    });

    console.log(`[WhatsApp Queue] ✅ Mensagem enfileirada para ${formattedPhone} (ID: ${id})`);
    return true;
  } catch (err) {
    console.error("[WhatsApp Queue] ❌ Erro ao enfileirar mensagem de WhatsApp:", err);
    return false;
  }
}
