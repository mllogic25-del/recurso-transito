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
        "⚠️ TEM CERTEZA? Isso irá excluir DEFINITIVAMENTE todos os recursos, documentos e testes cadastrados no sistema. O histórico voltará a ficar 100% zerado e limpo!"
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
        setFeedbackMsg("✅ " + (data.message || "Memória do robô limpa com sucesso!"));
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

  // EXCLUI UM RECURSO DIRETO DA TABELA
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
  const totalPaidRevenue = appeals
    .filter((a) => a.paymentStatus === "PAID")
    .reduce((acc, a) => acc + (a.paymentAmount || 30.0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* CABEÇALHO LIMPO E COMPACTO (SEM CARDS GIGANTES, SEM GRADIENTES) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Painel de Recursos
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestão operacional, acompanhamento de prazos e mensagens no WhatsApp
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Botão Principal: Zerar Histórico */}
            <button
              type="button"
              onClick={() => setShowClearHistoryModal(true)}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-3 py-2 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Zerar Histórico
            </button>

            {/* Rotinas WhatsApp */}
            <button
              type="button"
              onClick={() => setShowTemplatesModal(true)}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              Rotinas WhatsApp ({templates.length})
            </button>

            <Link
              href="/admin/whatsapp"
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition"
            >
              <Bot className="w-3.5 h-3.5" />
              Bot Samuca
            </Link>

            <Link
              href="/admin/modelos"
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Modelos CTB
            </Link>

            <button
              onClick={loadAppeals}
              className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              title="Recarregar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK */}
        {feedbackMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {feedbackMsg}
          </div>
        )}

        {/* RESUMO DE MÉTRICAS HORIZONTAL E DISCRETO (SEM CORES GRADIENTES) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="px-4 py-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total de Pedidos
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">{total}</p>
          </div>

          <div className="px-4 py-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pendentes / Fila
            </p>
            <p className="text-xl font-bold text-slate-700 mt-1">{pending}</p>
          </div>

          <div className="px-4 py-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Defesas Liberadas
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">{ready}</p>
          </div>

          <div className="px-4 py-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Faturamento Confirmado
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              R$ {totalPaidRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* BARRA DE BUSCA E FILTROS */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por placa, protocolo, cliente, AIT..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-slate-400 outline-none transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none bg-white text-slate-700"
              >
                <option value="ALL">Status: Todos</option>
                <option value="PENDING">Pendentes</option>
                <option value="PROCESSING">Em Elaboração</option>
                <option value="READY">Liberados</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none bg-white text-slate-700"
              >
                <option value="ALL">Pagamento: Todos</option>
                <option value="PAID">Pago</option>
                <option value="PENDING">Aguardando Pagamento</option>
              </select>
            </div>
          </div>

          {/* TABELA LIMPA */}
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
              <p className="text-xs">Carregando pedidos...</p>
            </div>
          ) : filteredAppeals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <p className="text-sm font-medium text-slate-600">Nenhum recurso encontrado.</p>
              <p className="text-xs text-slate-400">
                {total === 0
                  ? "O histórico está completamente zerado e pronto para novos atendimentos."
                  : "Nenhum resultado corresponde aos filtros aplicados."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Prazo</th>
                    <th className="px-5 py-3">Protocolo</th>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Placa</th>
                    <th className="px-5 py-3">Infração / AIT</th>
                    <th className="px-5 py-3">Pagamento</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppeals.map((item) => {
                    const deadline = calculateDeadlineInfo(item.defenseDeadline);
                    const isPaid = item.paymentStatus === "PAID";
                    const isReady = item.status === "READY";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3 whitespace-nowrap">
                          {isReady ? (
                            <span className="text-slate-400 font-medium">Concluído</span>
                          ) : (
                            <span className="font-medium text-slate-600">
                              {deadline.badgeText}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {item.protocol}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-900">{item.user.name}</p>
                          {item.user.phone ? (
                            <a
                              href={`https://wa.me/${item.user.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-slate-500 hover:text-slate-900 mt-0.5 block"
                            >
                              {item.user.phone}
                            </a>
                          ) : (
                            <p className="text-[11px] text-slate-400">{item.user.email}</p>
                          )}
                        </td>

                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="font-mono font-semibold text-slate-900">
                            {item.plate}
                          </span>
                          {item.vehicleModel && (
                            <span className="text-slate-400 text-[11px] ml-1">
                              ({item.vehicleModel})
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3 max-w-xs">
                          <p className="font-medium text-slate-800 truncate">
                            {item.ctbArticle}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            AIT: {item.aitNumber}
                          </p>
                        </td>

                        <td className="px-5 py-3 whitespace-nowrap">
                          {isPaid ? (
                            <span className="text-emerald-700 font-semibold">
                              ✓ Pago (R$ {item.paymentAmount.toFixed(2)})
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium">
                              Pendente
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3 whitespace-nowrap">
                          {isReady ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              Liberada
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
                              Em Fila
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3 whitespace-nowrap text-right space-x-1.5">
                          <Link
                            href={`/admin/recursos/${item.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition"
                          >
                            <Edit className="w-3 h-3" />
                            Editar
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteSingleAppeal(item.id, item.protocol)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                            title="Excluir este recurso"
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
          )}
        </div>

        {/* MODAL: ZERAR HISTÓRICO */}
        {showClearHistoryModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Zerar e Limpar Histórico do Sistema
                </h3>
              </div>

              {/* OPÇÃO 1: LIMPAR TODOS OS RECURSOS DO BANCO */}
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
                <p className="text-xs font-bold text-rose-900">
                  🗑️ Limpar Todos os Pedidos de Teste (Zerar Tabela de Recursos)
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Apaga todos os recursos, documentos e testes registrados até agora. A lista de recursos voltará a ficar completamente zerada e pronta para clientes reais.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllAppeals}
                  disabled={clearing}
                  className="w-full mt-2 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                >
                  {clearing ? "Limpando banco..." : "Confirmar e Zerar Todos os Recursos"}
                </button>
              </div>

              {/* OPÇÃO 2: LIMPAR MEMÓRIA DO BOT SAMUCA */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-900">
                  🤖 Zerar Memória do Bot Samuca (WhatsApp)
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Limpa a memória do robô para que ele inicie um novo diálogo sem lembrar de mensagens anteriores.
                </p>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    placeholder="Número específico (ex: 79998340176)"
                    className="flex-1 p-2 rounded-lg border border-slate-200 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleClearBotMemory("PHONE")}
                    disabled={clearing || !targetPhone.trim()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    Limpar Número
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleClearBotMemory("ALL")}
                  disabled={clearing}
                  className="w-full mt-1 py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition"
                >
                  Zerar Memória de Todos os Telefones
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearHistoryModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: GERENCIAR ROTINAS DO WHATSAPP */}
        {showTemplatesModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl border border-slate-200 max-h-[85vh] flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Rotinas de Mensagens Salvas ({templates.length})
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
                {/* Cadastrar Nova Rotina */}
                <form
                  onSubmit={handleCreateTemplate}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5"
                >
                  <p className="text-xs font-bold text-slate-900">
                    + Cadastrar Nova Rotina de Mensagem
                  </p>
                  <div>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Título da rotina (ex: Orientações de Protocolo na JARI)"
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs outline-none bg-white font-medium"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={3}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Texto da mensagem... Tags automáticas: {NOME}, {PLACA}, {PROTOCOLO}, {AIT}, {ORGAO}, {LINK_DOWNLOAD}"
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs outline-none bg-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingTemplate || !newTitle.trim() || !newContent.trim()}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
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
                      className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 text-xs">{tpl.title}</p>
                        {!tpl.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Excluir rotina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 whitespace-pre-line bg-slate-50 p-2 rounded border border-slate-100 font-mono">
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
