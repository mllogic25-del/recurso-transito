export interface DeadlineInfo {
  isExpired: boolean;
  daysRemaining: number;
  urgencyLevel: "CRITICAL" | "WARNING" | "NORMAL" | "EXPIRED" | "NONE";
  badgeText: string;
  badgeClass: string;
  formattedDeadline: string;
}

export function calculateDeadlineInfo(deadlineDate?: string | Date | null): DeadlineInfo {
  if (!deadlineDate) {
    return {
      isExpired: false,
      daysRemaining: 999,
      urgencyLevel: "NONE",
      badgeText: "Sem prazo informado",
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      formattedDeadline: "Não informado",
    };
  }

  const deadline = new Date(deadlineDate);
  if (isNaN(deadline.getTime())) {
    return {
      isExpired: false,
      daysRemaining: 999,
      urgencyLevel: "NONE",
      badgeText: String(deadlineDate),
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      formattedDeadline: String(deadlineDate),
    };
  }

  const now = new Date();
  // Zera as horas para comparar apenas os dias
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedDeadline = target.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (diffDays < 0) {
    return {
      isExpired: true,
      daysRemaining: diffDays,
      urgencyLevel: "EXPIRED",
      badgeText: `Prazo Expirado (${formattedDeadline})`,
      badgeClass: "urgency-expired",
      formattedDeadline,
    };
  }

  if (diffDays <= 3) {
    return {
      isExpired: false,
      daysRemaining: diffDays,
      urgencyLevel: "CRITICAL",
      badgeText: diffDays === 0 ? "🚨 VENCE HOJE!" : `🔥 URGENTE: Vence em ${diffDays} dia${diffDays > 1 ? "s" : ""}`,
      badgeClass: "urgency-critical font-bold animate-pulse",
      formattedDeadline,
    };
  }

  if (diffDays <= 10) {
    return {
      isExpired: false,
      daysRemaining: diffDays,
      urgencyLevel: "WARNING",
      badgeText: `⚠️ Vence em ${diffDays} dias`,
      badgeClass: "urgency-warning font-semibold",
      formattedDeadline,
    };
  }

  return {
    isExpired: false,
    daysRemaining: diffDays,
    urgencyLevel: "NORMAL",
    badgeText: `✓ No Prazo (${diffDays} dias)`,
    badgeClass: "urgency-normal",
    formattedDeadline,
  };
}
