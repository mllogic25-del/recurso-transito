import { prisma } from "./prisma";

export const SETTING_KEYS = {
  AFFILIATE_PROGRAM_ACTIVE: "affiliate_program_active",
} as const;

/**
 * Verifica se o Programa de Afiliados / Indique & Ganhe está ativo no sistema.
 * Retorna true por padrão caso ainda não tenha sido configurado.
 */
export async function isAffiliateProgramActive(): Promise<boolean> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEYS.AFFILIATE_PROGRAM_ACTIVE },
    });
    if (!setting) return true;
    return setting.value !== "false";
  } catch (error) {
    console.error("[Settings] Erro ao ler status do programa de afiliados:", error);
    return true; // fallback seguro: ativo
  }
}

/**
 * Ativa ou suspende o Programa de Afiliados no banco de dados.
 */
export async function setAffiliateProgramActive(active: boolean): Promise<boolean> {
  try {
    const value = active ? "true" : "false";
    await prisma.systemSetting.upsert({
      where: { key: SETTING_KEYS.AFFILIATE_PROGRAM_ACTIVE },
      create: {
        key: SETTING_KEYS.AFFILIATE_PROGRAM_ACTIVE,
        value,
      },
      update: {
        value,
      },
    });
    return true;
  } catch (error) {
    console.error("[Settings] Erro ao salvar status do programa de afiliados:", error);
    return false;
  }
}
