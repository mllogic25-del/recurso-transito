"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Edit,
  ShieldCheck,
  Bot,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  User,
  Car,
  Calendar,
  FileCheck,
  CreditCard,
  LayoutGrid,
  List,
  ExternalLink,
  Flame,
  ArrowRight,
  Send,
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
  const [viewMode, setViewMode] = useState<"CARDS" | "TABLE">("CARDS");
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
        } else {
          setAppeals([]);
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

  // ZERA TODO O HISTÓRICO DE RECURSOS (LIMPA O BANCO)
  const handleClearAllAppeals = async () => {
    if (
      !confirm(
        "⚠️ TEM CERTEZA? Isso irá excluir DEFINITIVAMENTE todos os recursos, documentos e testes do banco de dados. O painel ficará zerado!"
      )
    ) {
      return;
    }

    setClearing(true);
    setFeedbackMsg("");
    try {
      const res = await fetch("/api/admin/clear-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "CLEAR_ALL_APPEALS" }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg("✅ " + (data.message || "Histórico completamente zerado!"));
        setAppeals([]);
        setShowClearHistoryModal(false);
        setTimeout(() => setFeedbackMsg(""), 6000);
      } else {
        alert(data.error || "Erro ao zerar histórico.");
      }
    } catch (err: any) {
      alert("Erro ao conectar à API: " + err.message);
    } finally {
      setClearing(false);
    }
  };

  // ZERA MEMÓRIA DO BOT
  const handleClearBotMemory = async (scope: "ALL" | "PHONE") => {
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
        setFeedbackMsg("✅ " + (data.message || "Memória do bot limpa com sucesso!"));
        setTimeout(() => setFeedbackMsg(""), 5000);
      } else {
        alert(data.error || "Erro ao zerar memória.");
      }
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setClearing(false);
    }
  };

  // EXCLUI UM RECURSO INDIVIDUAL
  const handleDeleteSingleAppeal = async (appealId: string, protocol: string) => {
    if (!confirm(`Deseja excluir o recurso ${protocol}?`)) return;

    try {
      const res = await fetch("/api/admin/clear-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "DELETE_APPEAL", appealId }),
      });

      if (res.ok) {
        setAppeals((prev) => prev.filter((a) => a.id !== appealId));
        setFeedbackMsg(`Recurso ${protocol} excluído com sucesso.`);
        setTimeout(() => setFeedbackMsg(""), 4000);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir recurso.");
      }
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
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

  // Filtros
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* CABEÇALHO ESCURO COM GRADIENTE E AÇÕES */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-md">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/25">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Painel Executivo de Clientes & Recursos
                </h1>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
                Controle operacional completo: visualize cada cliente em cards dinâmicos, envie rotinas de protocolo no WhatsApp e acompanhe prazos do CTB.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Botão Zerar Histórico */}
              <button
                type="button"
                onClick={() => setShowClearHistoryModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600/20 to-red-600/20 hover:from-rose-600/30 hover:to-red-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-rose-950/30 transition"
                title="Zerar banco de dados ou memória do bot"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                Zerar Histórico
              </button>

              {/* Botão Rotinas WhatsApp */}
              <button
                type="button"
                onClick={() => setShowTemplatesModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-950/30 transition"
                title="Gerenciar rotinas de mensagens salvas"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Rotinas WhatsApp ({templates.length})
              </button>

              <Link
                href="/admin/whatsapp"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition"
              >
                <Bot className="w-4 h-4 text-white" />
                Bot Samuca
              </Link>

              <Link
                href="/admin/modelos"
                className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                Modelos CTB
              </Link>

              <button
                onClick={loadAppeals}
                className="p-2.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition"
                title="Atualizar dados"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* FEEDBACK DE OPERAÇÃO */}
        {feedbackMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {feedbackMsg}
          </div>
        )}

        {/* CARDS DE MÉTRICAS COM CORES GRADIENTES BRILHANTES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Prazos Urgentes */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/50 via-slate-900 to-red-950/40 border border-rose-500/30 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                Prazos Urgentes
              </span>
              <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <Flame className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-200">{urgentCount}</span>
              <span className="text-xs text-rose-400 font-medium">prioridade alta</span>
            </div>
          </div>

          {/* Card 2: Faturamento Pix */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-teal-950/40 border border-emerald-500/30 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Faturamento Pix
              </span>
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <CreditCard className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-black text-emerald-200">
                R$ {totalPaidRevenue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Card 3: Defesas Concluídas */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/50 via-slate-900 to-indigo-950/40 border border-blue-500/30 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                Defesas Liberadas
              </span>
              <span className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-200">{ready}</span>
              <span className="text-xs text-blue-400 font-medium">concluídos</span>
            </div>
          </div>

          {/* Card 4: Fila de Elaboração */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-orange-950/40 border border-amber-500/30 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Fila de Elaboração
              </span>
              <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-200">{pending}</span>
              <span className="text-xs text-amber-400 font-medium">aguardando</span>
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS & SELEÇÃO DE VISUALIZAÇÃO (CARDS vs TABELA) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente, placa, protocolo, AIT..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-300 outline-none focus:border-indigo-500"
            >
              <option value="ALL">Status: Todos</option>
              <option value="PENDING">Pendentes</option>
              <option value="PROCESSING">Em Elaboração</option>
              <option value="READY">Liberados</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-300 outline-none focus:border-indigo-500"
            >
              <option value="ALL">Pagamento: Todos</option>
              <option value="PAID">Pago via Pix</option>
              <option value="PENDING">Aguardando Pagamento</option>
            </select>

            {/* Alternador de Modo: Cards ou Tabela */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode("CARDS")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "CARDS"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Visualização em Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("TABLE")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "TABLE"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Visualização em Tabela"
              >
                <List className="w-3.5 h-3.5" />
                Tabela
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODO 1: GRID DE CARDS PARA CADA CLIENTE (VISUAL RICO)    */}
        {/* ======================================================== */}
        {loading ? (
          <div className="p-20 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
            <p className="text-sm font-medium">Carregando recursos e clientes...</p>
          </div>
        ) : filteredAppeals.length === 0 ? (
          <div className="p-16 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <p className="text-base font-bold text-slate-300">Nenhum recurso cadastrado no momento.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {total === 0
                ? "O histórico está completamente zerado e pronto para receber novos atendimentos de clientes."
                : "Nenhum resultado corresponde aos filtros selecionados."}
            </p>
          </div>
        ) : viewMode === "CARDS" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredAppeals.map((item) => {
              const deadline = calculateDeadlineInfo(item.defenseDeadline);
              const isPaid = item.paymentStatus === "PAID";
              const isReady = item.status === "READY";
              const clientPhoneDigits = (item.user.phone || "").replace(/\D/g, "");
              const zapLink =
                clientPhoneDigits.length >= 8
                  ? `https://wa.me/${clientPhoneDigits.startsWith("55") ? clientPhoneDigits : `55${clientPhoneDigits}`}`
                  : null;

              // Iniciais do cliente
              const initials = (item.user.name || "C")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0].toUpperCase())
                .join("");

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/90 hover:border-indigo-500/50 p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-950/40"
                >
                  {/* TOPO DO CARD: CLIENTE & PROTOCOLO */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/30 shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-white truncate group-hover:text-indigo-300 transition">
                            {item.user.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 truncate">{item.user.email}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSingleAppeal(item.id, item.protocol)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                        title="Excluir recurso de teste"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* DADOS DA PLACA & INFRAÇÃO (CONTAINER ESTILIZADO) */}
                    <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        {/* Placa estilo Mercosul */}
                        <div className="inline-flex flex-col items-center border border-blue-500/60 rounded-md overflow-hidden bg-white text-slate-900 shadow-xs">
                          <div className="w-full bg-blue-600 text-white text-[8px] font-black text-center px-2 py-0.2 tracking-wider">
                            BRASIL
                          </div>
                          <span className="font-mono font-black text-xs px-2 py-0.5 tracking-widest text-slate-900">
                            {item.plate}
                          </span>
                        </div>

                        {/* Protocolo */}
                        <span className="font-mono text-[11px] font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/40 px-2 py-1 rounded-lg">
                          {item.protocol}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-300">
                        <p className="font-medium line-clamp-1">
                          <strong className="text-slate-400">Artigo:</strong> {item.ctbArticle}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>AIT: <strong className="text-slate-200">{item.aitNumber}</strong></span>
                          <span>Órgão: <strong className="text-slate-200">{item.authority}</strong></span>
                        </div>
                        {item.infractionDate && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            Data: {item.infractionDate}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* STATUS DE PAGAMENTO & DEFESA */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Pagamento */}
                      <div
                        className={`p-2.5 rounded-xl border flex flex-col justify-center ${
                          isPaid
                            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                            : "bg-amber-950/40 border-amber-500/40 text-amber-300"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                          Pagamento Pix
                        </span>
                        <span className="font-black mt-0.5">
                          {isPaid ? "✓ Pago R$ " + item.paymentAmount.toFixed(2) : "⏳ Pendente"}
                        </span>
                      </div>

                      {/* Defesa */}
                      <div
                        className={`p-2.5 rounded-xl border flex flex-col justify-center ${
                          isReady
                            ? "bg-blue-950/40 border-blue-500/40 text-blue-300"
                            : "bg-slate-800/60 border-slate-700/60 text-slate-300"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                          Status Defesa
                        </span>
                        <span className="font-black mt-0.5">
                          {isReady ? "✓ Liberada" : "Em Elaboração"}
                        </span>
                      </div>
                    </div>

                    {/* BADGES AUXILIARES: PRAZO E ANEXOS */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={`px-2.5 py-1 rounded-lg font-bold border ${deadline.badgeClass}`}>
                        {deadline.badgeText}
                      </span>

                      <span className="text-slate-400 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                        {item.documents.length} anexo(s)
                      </span>
                    </div>
                  </div>

                  {/* AÇÕES NO RODAPÉ DO CARD */}
                  <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                    {/* Botão Chamar no Zap */}
                    {zapLink && (
                      <a
                        href={zapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl transition flex items-center justify-center shadow-xs"
                        title="Conversar com o cliente no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    {/* Botão Principal: Analisar / Liberar Defesa */}
                    <Link
                      href={`/admin/recursos/${item.id}`}
                      className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-1.5"
                    >
                      <span>Analisar / Liberar Defesa</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ======================================================== */
          /* MODO 2: VISUALIZAÇÃO EM TABELA COMPACTA                  */
          /* ======================================================== */
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Prazo</th>
                    <th className="px-5 py-3.5">Protocolo</th>
                    <th className="px-5 py-3.5">Cliente</th>
                    <th className="px-5 py-3.5">Placa</th>
                    <th className="px-5 py-3.5">Infração</th>
                    <th className="px-5 py-3.5">Pagamento</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAppeals.map((item) => {
                    const deadline = calculateDeadlineInfo(item.defenseDeadline);
                    const isPaid = item.paymentStatus === "PAID";
                    const isReady = item.status === "READY";

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded font-bold border ${deadline.badgeClass}`}>
                            {deadline.badgeText}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap font-mono font-bold text-indigo-300">
                          {item.protocol}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-bold text-white">{item.user.name}</p>
                          <p className="text-[11px] text-slate-400">{item.user.phone || item.user.email}</p>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap font-mono font-bold text-slate-100">
                          {item.plate}
                        </td>
                        <td className="px-5 py-3 max-w-xs truncate">
                          {item.ctbArticle}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {isPaid ? (
                            <span className="text-emerald-400 font-bold">✓ Pago</span>
                          ) : (
                            <span className="text-amber-400">Pendente</span>
                          )}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {isReady ? (
                            <span className="text-blue-400 font-bold">Liberada</span>
                          ) : (
                            <span className="text-slate-400">Fila</span>
                          )}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-right space-x-2">
                          <Link
                            href={`/admin/recursos/${item.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-lg"
                          >
                            <Edit className="w-3 h-3" />
                            Abrir
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteSingleAppeal(item.id, item.protocol)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: ZERAR HISTÓRICO COM CORES E GRADIENTES */}
        {showClearHistoryModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                  <RotateCcw className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Zerar e Limpar Histórico do Sistema
                  </h3>
                  <p className="text-xs text-slate-400">
                    Limpe dados de testes e reinicie as conversas do robô Samuca.
                  </p>
                </div>
              </div>

              {/* OPÇÃO 1: LIMPAR TODOS OS RECURSOS DO BANCO */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/60 via-slate-900 to-red-950/40 border border-rose-500/40 space-y-2">
                <p className="text-xs font-bold text-rose-300">
                  🗑️ Limpar Todos os Pedidos de Teste (Zerar Tabela)
                </p>
                <p className="text-[11px] text-rose-200/80 leading-relaxed">
                  Apaga todos os recursos, documentos e testes registrados até agora. O painel voltará a ficar 100% zerado e pronto para clientes reais.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllAppeals}
                  disabled={clearing}
                  className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black rounded-xl transition shadow-lg shadow-rose-950/50 disabled:opacity-50"
                >
                  {clearing ? "Limpando banco..." : "Confirmar e Zerar Todos os Recursos"}
                </button>
              </div>

              {/* OPÇÃO 2: LIMPAR MEMÓRIA DO BOT SAMUCA */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-200">
                  🤖 Zerar Memória do Bot Samuca (WhatsApp)
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Limpa a memória do robô para reiniciar um diálogo do zero sem lembrar de mensagens anteriores.
                </p>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    placeholder="Número (ex: 79998340176)"
                    className="flex-1 p-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleClearBotMemory("PHONE")}
                    disabled={clearing || !targetPhone.trim()}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    Limpar Número
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleClearBotMemory("ALL")}
                  disabled={clearing}
                  className="w-full mt-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
                >
                  Zerar Memória de Todos os Telefones
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearHistoryModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: GERENCIAR ROTINAS DO WHATSAPP */}
        {showTemplatesModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-800 max-h-[85vh] flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-extrabold text-white">
                    Rotinas de Mensagens Salvas ({templates.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowTemplatesModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕ Fechar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Cadastrar Nova Rotina */}
                <form
                  onSubmit={handleCreateTemplate}
                  className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5"
                >
                  <p className="text-xs font-bold text-white">
                    + Cadastrar Nova Rotina de Mensagem
                  </p>
                  <div>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Título da rotina (ex: Orientações de Protocolo na JARI)"
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={3}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Texto da mensagem... Tags automáticas: {NOME}, {PLACA}, {PROTOCOLO}, {AIT}, {ORGAO}, {LINK_DOWNLOAD}"
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingTemplate || !newTitle.trim() || !newContent.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                      {savingTemplate ? "Salvando..." : "Salvar Rotina"}
                    </button>
                  </div>
                </form>

                {/* Lista de Rotinas */}
                <div className="space-y-2.5">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-white text-xs">{tpl.title}</p>
                        {!tpl.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Excluir rotina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 whitespace-pre-line bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 font-mono">
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
