"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileDown,
  Edit,
  ShieldCheck,
  Car,
  CreditCard,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Bot,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  BookmarkPlus,
  Plus,
  RefreshCw,
} from "lucide-react";
import { calculateDeadlineInfo } from "@/lib/deadlineUtils";

interface Appeal {
  id: string;
  protocol: string;
  type: string;
  authority: string;
  aitNumber: string;
  plate: string;
  vehicleModel?: string;
  ctbArticle: string;
  infractionDate: string;
  defenseDeadline?: string;
  isExpiredSubmission?: boolean;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  sentToEmail: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
  };
  documents: { id: string; title: string; fileName: string; fileUrl: string }[];
}

interface WhatsAppTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  isDefault: boolean;
}

export default function AdminDashboard() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const router = useRouter();

  // Modais de Gestão
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [targetPhone, setTargetPhone] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user || data.user.role !== "ADMIN") {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));

    loadAppeals();
    loadTemplates();
  }, [router]);

  const loadAppeals = () => {
    setLoading(true);
    fetch("/api/appeals", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.appeals && Array.isArray(data.appeals)) {
          setAppeals(data.appeals);
        }
      })
      .catch((err) => console.error("Erro ao carregar recursos:", err))
      .finally(() => setLoading(false));
  };

  const loadTemplates = async () => {
    try {
      const res = await fetch("/api/admin/templates/whatsapp", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error("Erro ao carregar templates:", err);
    }
  };

  const handleClearHistory = async (scope: "ALL" | "PHONE") => {
    setClearing(true);
    setFeedbackMsg("");
    try {
      const res = await fetch("/api/admin/clear-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BOT_MEMORY",
          phone: scope === "PHONE" ? targetPhone : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg("✅ " + (data.message || "Histórico zerado com sucesso!"));
        setTimeout(() => setFeedbackMsg(""), 5000);
      } else {
        alert(data.error || "Erro ao zerar histórico.");
      }
    } catch (err: any) {
      alert("Erro ao conectar à API: " + err.message);
    } finally {
      setClearing(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert("Preencha título e conteúdo da rotina.");
      return;
    }

    setSavingTemplate(true);
    try {
      const res = await fetch("/api/admin/templates/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          category: "ORIENTACOES",
        }),
      });

      if (res.ok) {
        setNewTitle("");
        setNewContent("");
        loadTemplates();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao salvar rotina.");
      }
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Deseja excluir esta rotina salva?")) return;
    try {
      const res = await fetch(`/api/admin/templates/whatsapp/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtros à prova de falhas (null-safe)
  const filteredAppeals = appeals.filter((a) => {
    if (!a) return false;
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchesPayment =
      paymentFilter === "ALL" ||
      (paymentFilter === "PAID" && a.paymentStatus === "PAID") ||
      (paymentFilter === "PENDING" && a.paymentStatus !== "PAID");

    const term = (searchTerm || "").toLowerCase().trim();
    if (!term) return matchesStatus && matchesPayment;

    const protocol = (a.protocol || "").toLowerCase();
    const plate = (a.plate || "").toLowerCase();
    const aitNumber = (a.aitNumber || "").toLowerCase();
    const userName = (a.user?.name || "").toLowerCase();
    const authority = (a.authority || "").toLowerCase();

    return (
      matchesStatus &&
      matchesPayment &&
      (protocol.includes(term) ||
        plate.includes(term) ||
        aitNumber.includes(term) ||
        userName.includes(term) ||
        authority.includes(term))
    );
  });

  const total = appeals.length;
  const ready = appeals.filter((a) => a.status === "READY").length;
  const pending = appeals.filter((a) => a.status !== "READY").length;
  const urgentCount = appeals.filter((a) => {
    if (a.status === "READY" || !a.defenseDeadline) return false;
    const info = calculateDeadlineInfo(a.defenseDeadline);
    return info.urgencyLevel === "CRITICAL" || info.urgencyLevel === "WARNING";
  }).length;
  const totalPaidRevenue = appeals
    .filter((a) => a.paymentStatus === "PAID")
    .reduce((acc, a) => acc + (a.paymentAmount || 30.0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/80">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Topo do Painel Executivo */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Painel Executivo de Recursos
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Gestão integrada de pedidos, automação de WhatsApp e acompanhamento por prazo do CTB.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Botão Zerar Histórico */}
            <button
              type="button"
              onClick={() => setShowClearHistoryModal(true)}
              className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition"
              title="Zerar memória do bot ou dados de teste"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              Zerar Histórico
            </button>

            {/* Botão Rotinas WhatsApp */}
            <button
              type="button"
              onClick={() => setShowTemplatesModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition"
              title="Gerenciar rotinas de mensagens salvas"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Rotinas WhatsApp ({templates.length})
            </button>

            <Link
              href="/admin/whatsapp"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              <Bot className="w-4 h-4 text-white" />
              Bot Samuca
            </Link>

            <Link
              href="/admin/modelos"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Modelos CTB
            </Link>

            <button
              onClick={loadAppeals}
              className="p-2.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              title="Recarregar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback de Operação */}
        {feedbackMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {feedbackMsg}
          </div>
        )}

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Prazos Urgentes (Destaque Principal) */}
          <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white p-5 rounded-3xl shadow-lg shadow-red-600/15">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-red-100">
                Prazos Curtos (Urgência)
              </p>
              <Flame className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black">{urgentCount}</span>
              <span className="text-xs text-red-100 font-medium">precisam de atenção</span>
            </div>
          </div>

          {/* Card 2: Faturamento Pix */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pagamentos Confirmados
              </p>
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-700 mt-2">
              R$ {totalPaidRevenue.toFixed(2)}
            </p>
          </div>

          {/* Card 3: Defesas Liberadas */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Defesas Liberadas
              </p>
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold text-blue-700 mt-2">{ready}</p>
          </div>

          {/* Card 4: Fila de Elaboração */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fila de Elaboração
              </p>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{pending}</p>
          </div>
        </div>

        {/* Tabela de Pedidos com Ordenação por Prazo Curto */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por placa, protocolo, cliente, AIT..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Defesa:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none bg-white"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="PENDING">Pendentes de Elaboração</option>
                  <option value="PROCESSING">Em Elaboração</option>
                  <option value="READY">Liberados</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Pagamento:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none bg-white"
                >
                  <option value="ALL">Todos</option>
                  <option value="PAID">Pago via Pix</option>
                  <option value="PENDING">Aguardando Pagamento</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
              <p className="text-sm font-medium">Carregando pedidos prioritários...</p>
            </div>
          ) : filteredAppeals.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <p className="text-sm">Nenhum recurso encontrado para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Prazo / Urgência</th>
                    <th className="px-6 py-4">Protocolo</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Veículo / Placa</th>
                    <th className="px-6 py-4">Infração / AIT</th>
                    <th className="px-6 py-4">Pagamento</th>
                    <th className="px-6 py-4">Defesa</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppeals.map((item) => {
                    const deadline = calculateDeadlineInfo(item.defenseDeadline);
                    const isPaid = item.paymentStatus === "PAID";
                    const isReady = item.status === "READY";

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 transition ${
                          !isReady && deadline.urgencyLevel === "CRITICAL"
                            ? "bg-red-50/30"
                            : ""
                        }`}
                      >
                        {/* Prazo com Destaque / Urgência */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isReady ? (
                            <span className="text-xs text-slate-400 font-medium">
                              Concluído
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${deadline.badgeClass}`}
                            >
                              {deadline.badgeText}
                            </span>
                          )}
                          {item.isExpiredSubmission && !isReady && (
                            <span className="block text-[10px] text-amber-700 font-bold mt-1">
                              ⚠️ Enviado fora do prazo (vício formal)
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            {item.protocol}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-xs">{item.user.name}</p>
                          {item.user.phone ? (
                            <a
                              href={`https://wa.me/${item.user.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline mt-0.5"
                              title="Conversar com o cliente no WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{item.user.phone}</span>
                            </a>
                          ) : (
                            <p className="text-[11px] text-slate-400">{item.user.email}</p>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900">
                            {item.plate}
                          </span>
                          {item.vehicleModel && (
                            <p className="text-[11px] text-slate-400">{item.vehicleModel}</p>
                          )}
                        </td>

                        <td className="px-6 py-4 max-w-xs">
                          <p className="font-medium text-slate-900 text-xs line-clamp-1">
                            {item.ctbArticle}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            AIT: <strong>{item.aitNumber}</strong> • {item.authority}
                          </p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Pago
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3" /> Pendente
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {isReady ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              Liberada
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                              Aguardando
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/admin/recursos/${item.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition shadow-xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Analisar / Liberar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: ZERAR HISTÓRICO */}
        {showClearHistoryModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Central de Limpeza e Reinício de Histórico
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Utilize estas ferramentas para reiniciar a memória do Samuca Bot após testes de novos prompts ou quando desejar iniciar atendimentos do zero.
              </p>

              <div className="space-y-4">
                {/* Opção 1: Limpar por Telefone Específico */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-900 mb-1">
                    1. Zerar Memória de um Telefone Específico:
                  </p>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Reinicia a conversa do bot apenas para o seu número de teste.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                      placeholder="DDD + Telefone (ex: 79998340176)"
                      className="flex-1 p-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleClearHistory("PHONE")}
                      disabled={clearing || !targetPhone.trim()}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                      {clearing ? "Limpando..." : "Limpar Número"}
                    </button>
                  </div>
                </div>

                {/* Opção 2: Limpar Memória Geral */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
                  <p className="text-xs font-bold text-rose-950 mb-1">
                    2. Zerar Toda a Memória Ativa do Samuca Bot:
                  </p>
                  <p className="text-[11px] text-rose-700 mb-3">
                    Limpa todo o histórico de conversas em andamento na RAM do servidor para que todos os clientes comecem do zero.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleClearHistory("ALL")}
                    disabled={clearing}
                    className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition shadow-xs"
                  >
                    {clearing ? "Processando..." : "Zerar Toda a Memória Global do Bot"}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowClearHistoryModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: GERENCIAR ROTINAS DO WHATSAPP */}
        {showTemplatesModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    Rotinas de Mensagens e Orientações Salvas ({templates.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowTemplatesModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕ Fechar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Form para Adicionar Nova Rotina */}
                <form
                  onSubmit={handleCreateTemplate}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                >
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" /> Cadastrar Nova Rotina de Mensagem:
                  </p>
                  <div>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Título da rotina (ex: Orientações de Envio pelo Poupatempo)"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={4}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Mensagem completa... Você pode usar tags: {NOME}, {PLACA}, {PROTOCOLO}, {AIT}, {ORGAO}, {LINK_DOWNLOAD}"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingTemplate || !newTitle.trim() || !newContent.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                      {savingTemplate ? "Salvando..." : "Salvar Rotina"}
                    </button>
                  </div>
                </form>

                {/* Lista de Rotinas Existentes */}
                <div className="space-y-3">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-xs">{tpl.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {tpl.category}
                          </span>
                          {!tpl.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleDeleteTemplate(tpl.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                              title="Excluir rotina"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 whitespace-pre-line line-clamp-3 bg-slate-50 p-2.5 rounded-xl font-mono">
                        {tpl.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
