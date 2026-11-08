"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  FileText,
  Save,
  ArrowLeft,
  FileDown,
  Printer,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Car,
  User,
  Clock,
  Send,
  CreditCard,
  Mail,
  MessageCircle,
  Sparkles,
  BookmarkPlus,
  Trash2,
  RotateCcw,
  Calendar,
  FileCheck,
} from "lucide-react";

interface AppealDetail {
  id: string;
  protocol: string;
  type: string;
  authority: string;
  aitNumber: string;
  plate: string;
  renavam?: string;
  vehicleModel?: string;
  ctbArticle: string;
  infractionDate: string;
  infractionTime?: string;
  infractionLocation: string;
  speedLimit?: string;
  speedMeasured?: string;
  speedConsidered?: string;
  radarModel?: string;
  lastVerification?: string;
  notificationDate?: string;
  defenseArguments: string;
  legalCategory: string;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  sentToEmail: boolean;
  emailSentAt?: string;
  generatedDocument: string;
  adminNotes?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
    rg?: string;
    cnh?: string;
    address?: string;
  };
  documents: {
    id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
}

interface WhatsAppTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  isDefault: boolean;
}

export default function AdminEditarRecursoPage() {
  const params = useParams();
  const router = useRouter();
  const [appeal, setAppeal] = useState<AppealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Campos editáveis
  const [documentContent, setDocumentContent] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [adminNotes, setAdminNotes] = useState("");

  // Rotinas de Mensagens do WhatsApp
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customZapMessage, setCustomZapMessage] = useState("");
  const [sendingZap, setSendingZap] = useState(false);
  const [newRoutineTitle, setNewRoutineTitle] = useState("");
  const [showSaveRoutineModal, setShowSaveRoutineModal] = useState(false);
  const [savingRoutine, setSavingRoutine] = useState(false);

  // Ações de Zerar Histórico
  const [actionLoading, setActionLoading] = useState(false);

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

  const loadAppeal = () => {
    if (!params.id) return;
    fetch(`/api/appeals/${params.id}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar dados do recurso.");
        return res.json();
      })
      .then((data) => {
        setAppeal(data.appeal);
        setDocumentContent(data.appeal.generatedDocument || "");
        setStatus(data.appeal.status);
        setPaymentStatus(data.appeal.paymentStatus || "PENDING");
        setAdminNotes(data.appeal.adminNotes || "");
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppeal();
    loadTemplates();
  }, [params.id]);

  // Aplica placeholders dinâmicos
  const applyPlaceholders = (templateContent: string, appealData: AppealDetail) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const downloadLink = `${origin}/acompanhar?protocolo=${appealData.protocol}`;

    return templateContent
      .replace(/{NOME}/g, appealData.user.name || "Cliente")
      .replace(/{PLACA}/g, appealData.plate || "")
      .replace(/{PROTOCOLO}/g, appealData.protocol || "")
      .replace(/{AIT}/g, appealData.aitNumber || "Não informado")
      .replace(/{ORGAO}/g, appealData.authority || "DETRAN/Órgão Autuador")
      .replace(/{LINK_DOWNLOAD}/g, downloadLink);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!appeal) return;
    const found = templates.find((t) => t.id === templateId);
    if (found) {
      setCustomZapMessage(applyPlaceholders(found.content, appeal));
    }
  };

  const handleSendAutomaticZap = async () => {
    if (!appeal?.user.phone) {
      setErrorMsg("O cliente não possui telefone cadastrado para envio.");
      return;
    }
    if (!customZapMessage.trim()) {
      setErrorMsg("A mensagem não pode estar vazia.");
      return;
    }

    setSendingZap(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const selectedTpl = templates.find((t) => t.id === selectedTemplateId);
      const res = await fetch("/api/admin/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: appeal.user.phone,
          message: customZapMessage.trim(),
          appealId: appeal.id,
          title: selectedTpl?.title || "Mensagem de Rotina",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao enviar mensagem.");
      }

      setSuccessMsg("Mensagem enviada com sucesso para a fila do WhatsApp do cliente!");
      loadAppeal();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao enviar mensagem pelo bot.");
    } finally {
      setSendingZap(false);
    }
  };

  const handleSaveAsNewRoutine = async () => {
    if (!newRoutineTitle.trim() || !customZapMessage.trim()) {
      alert("Por favor, preencha o título da nova rotina.");
      return;
    }

    setSavingRoutine(true);
    try {
      const res = await fetch("/api/admin/templates/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newRoutineTitle.trim(),
          content: customZapMessage.trim(),
          category: "ORIENTACOES",
        }),
      });

      if (res.ok) {
        setShowSaveRoutineModal(false);
        setNewRoutineTitle("");
        setSuccessMsg("Rotina salva com sucesso!");
        loadTemplates();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao salvar rotina.");
      }
    } catch (err: any) {
      alert("Erro ao salvar rotina: " + err.message);
    } finally {
      setSavingRoutine(false);
    }
  };

  const handleClearBotMemory = async () => {
    if (!appeal?.user.phone) {
      alert("Telefone do cliente não encontrado.");
      return;
    }

    if (!confirm(`Deseja zerar a conversa do bot para ${appeal.user.phone}? O robô começará um novo atendimento.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/clear-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "BOT_MEMORY", phone: appeal.user.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Memória do robô limpa com sucesso!");
      } else {
        setErrorMsg(data.error || "Erro ao zerar memória.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao zerar memória.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAppealArguments = async () => {
    if (!confirm("Deseja limpar os argumentos deste recurso?")) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/clear-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "APPEAL_HISTORY", appealId: appeal?.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Histórico de argumentos zerado com sucesso!");
        loadAppeal();
      } else {
        setErrorMsg(data.error || "Erro ao zerar argumentos.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao zerar argumentos.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTestAppeal = async () => {
    if (!confirm(`Deseja excluir definitivamente o recurso ${appeal?.protocol}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/clear-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "DELETE_APPEAL", appealId: appeal?.id }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Recurso excluído com sucesso!");
        router.push("/admin/dashboard");
      } else {
        setErrorMsg(data.error || "Erro ao excluir recurso.");
        setActionLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao excluir recurso.");
      setActionLoading(false);
    }
  };

  const saveAppeal = async (targetStatus: string, targetPaymentStatus?: string) => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/appeals/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          paymentStatus: targetPaymentStatus || paymentStatus,
          generatedDocument: documentContent,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao salvar alterações.");
        return;
      }

      setStatus(targetStatus);
      if (targetPaymentStatus) setPaymentStatus(targetPaymentStatus);
      if (appeal) {
        setAppeal({
          ...appeal,
          status: targetStatus,
          paymentStatus: targetPaymentStatus || paymentStatus,
          generatedDocument: documentContent,
          adminNotes,
          sentToEmail: targetStatus === "READY" ? true : appeal.sentToEmail,
        });
      }

      if (targetStatus === "READY") {
        setSuccessMsg("Defesa aprovada e liberada com sucesso!");
      } else {
        setSuccessMsg("Alterações salvas com sucesso!");
      }
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch {
      setErrorMsg("Erro de comunicação ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const confirmPayment = async () => {
    try {
      const res = await fetch(`/api/appeals/${params.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADMIN_CONFIRM" }),
      });
      if (res.ok) {
        setPaymentStatus("PAID");
        setSuccessMsg("Pagamento Pix confirmado!");
        loadAppeal();
      }
    } catch {
      setErrorMsg("Erro ao confirmar pagamento.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Clock className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      </div>
    );
  }

  if (!appeal) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-rose-400 font-medium">Recurso não encontrado.</p>
        </div>
      </div>
    );
  }

  const isReleased = status === "READY";
  const isPaid = paymentStatus === "PAID";
  const clientPhoneDigits = (appeal.user.phone || "").replace(/\D/g, "");
  const formattedZapPhone = clientPhoneDigits.startsWith("55")
    ? clientPhoneDigits
    : `55${clientPhoneDigits}`;

  const directZapUrl =
    clientPhoneDigits.length >= 8
      ? `https://wa.me/${formattedZapPhone}?text=${encodeURIComponent(
          customZapMessage ||
            `Olá ${appeal.user.name}! Tudo bem?\n\nA sua defesa técnica da AutoRecurso para o veículo placa *${appeal.plate}* (Protocolo: *${appeal.protocol}*) está concluída. Acesse: ${typeof window !== "undefined" ? window.location.origin : ""}/acompanhar?protocolo=${appeal.protocol}`
        )}`
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      {/* BARRA SUPERIOR ESCURA COM BOTÕES GRADIENTES */}
      <div className="bg-slate-900/95 border-b border-slate-800 py-3.5 px-4 sm:px-8 sticky top-20 z-40 no-print backdrop-blur-md shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="Voltar ao Painel"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-lg border border-indigo-500/40">
                  {appeal.protocol}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isPaid
                      ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-950/60 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {isPaid ? "✓ Pago" : "⏳ Aguardando Pix"}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isReleased
                      ? "bg-blue-950/60 text-blue-300 border border-blue-500/40"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  {isReleased ? "✓ Defesa Liberada" : "Pendente"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cliente: <strong className="text-white">{appeal.user.name}</strong> • Placa:{" "}
                <strong className="text-white">{appeal.plate}</strong> • AIT:{" "}
                <strong className="text-white">{appeal.aitNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => saveAppeal("PROCESSING")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Rascunho
            </button>

            <button
              onClick={() => saveAppeal("READY")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {saving ? "Salvando..." : isReleased ? "Atualizar & Manter Liberado" : "Aprovar & Liberar Defesa"}
            </button>

            <a
              href={`/api/appeals/${appeal.id}/docx`}
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-400" />
              Word (DOCX)
            </a>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* FEEDBACK */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* ========================================================= */}
        {/* CENTRAL DE ROTINAS & ENVIO DE MENSAGENS NO WHATSAPP       */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <MessageCircle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-black text-white">
                  Central de Rotinas & Notificações WhatsApp
                </h2>
                <p className="text-xs text-slate-400">
                  Selecione uma rotina pronta com tags preenchidas e envie ao cliente pelo robô ou no WhatsApp Web.
                </p>
              </div>
            </div>
            <span className="text-xs text-emerald-300 font-bold bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-500/40">
              Zap Cliente: {appeal.user.phone || "Não informado"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Seletor de Rotinas */}
            <div className="lg:col-span-1 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Escolha uma Rotina Salva:
              </label>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`w-full text-left p-3 rounded-2xl text-xs font-semibold transition border ${
                      selectedTemplateId === tpl.id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
                        : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800"
                    }`}
                  >
                    <p className="font-bold truncate">{tpl.title}</p>
                    <p className={`text-[10px] mt-0.5 ${selectedTemplateId === tpl.id ? "text-indigo-200" : "text-slate-500"}`}>
                      {tpl.category} {tpl.isDefault ? "• Padrão" : ""}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Mensagem e Envio */}
            <div className="lg:col-span-2 space-y-3 flex flex-col justify-between">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                  Mensagem Pronta para Envio (Você pode editar antes de enviar):
                </label>
                <textarea
                  rows={7}
                  value={customZapMessage}
                  onChange={(e) => setCustomZapMessage(e.target.value)}
                  placeholder="Selecione uma rotina ao lado ou digite a mensagem de orientações que deseja enviar..."
                  className="w-full p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed font-sans"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSaveRoutineModal(true)}
                  disabled={!customZapMessage.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition disabled:opacity-50"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                  + Salvar como Nova Rotina
                </button>

                <div className="flex items-center gap-2">
                  {directZapUrl && (
                    <a
                      href={directZapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir no Web
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleSendAutomaticZap}
                    disabled={sendingZap || !customZapMessage.trim() || !appeal.user.phone}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {sendingZap ? "Enviando..." : "🚀 Enviar pelo Samuca Bot (Automático)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Salvar Nova Rotina */}
        {showSaveRoutineModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-indigo-400" />
                Salvar Mensagem como Nova Rotina
              </h3>
              <p className="text-xs text-slate-400">
                Dê um título para reutilizar esta mensagem de orientações nos próximos clientes.
              </p>
              <input
                type="text"
                value={newRoutineTitle}
                onChange={(e) => setNewRoutineTitle(e.target.value)}
                placeholder="Ex: Instruções de Protocolo na JARI"
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveRoutineModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAsNewRoutine}
                  disabled={savingRoutine || !newRoutineTitle.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  {savingRoutine ? "Salvando..." : "Salvar Rotina"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GRID DE INFORMAÇÕES & EDITOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUNA ESQUERDA: DADOS DO CLIENTE, VEÍCULO E AÇÕES */}
          <div className="lg:col-span-1 space-y-5">
            {/* Card Pagamento */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  Pagamento Pix
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isPaid
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {isPaid ? "✓ PAGO" : "PENDENTE"}
                </span>
              </div>
              <p className="text-sm font-black text-white">
                Valor do Serviço: R$ {appeal.paymentAmount.toFixed(2)}
              </p>
              {!isPaid && (
                <button
                  onClick={confirmPayment}
                  className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/50"
                >
                  Confirmar Pagamento Pix Manualmente
                </button>
              )}
            </div>

            {/* Card Documentos Anexados */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  Documentos Anexados ({appeal.documents.length})
                </span>
              </div>
              {appeal.documents.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhum documento anexado.</p>
              ) : (
                <div className="space-y-2">
                  {appeal.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 text-xs text-slate-200 transition group"
                    >
                      <span className="truncate group-hover:text-indigo-300 font-semibold">{doc.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1 group-hover:text-indigo-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Card Veículo & Infração */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-2 text-xs text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Car className="w-4 h-4 text-purple-400" />
                Dados do Veículo & Infração
              </span>
              <p><strong>Placa:</strong> <span className="font-mono text-white font-bold">{appeal.plate}</span></p>
              <p><strong>AIT:</strong> {appeal.aitNumber}</p>
              <p><strong>Órgão:</strong> {appeal.authority}</p>
              <p><strong>Artigo CTB:</strong> {appeal.ctbArticle}</p>
              <p><strong>Data/Hora:</strong> {appeal.infractionDate} {appeal.infractionTime ? `às ${appeal.infractionTime}` : ""}</p>
              <p><strong>Local:</strong> {appeal.infractionLocation}</p>
            </div>

            {/* Card Cliente */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-2 text-xs text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <User className="w-4 h-4 text-indigo-400" />
                Dados do Cliente
              </span>
              <p><strong>Nome:</strong> {appeal.user.name}</p>
              <p><strong>E-mail:</strong> {appeal.user.email}</p>
              <p><strong>Telefone:</strong> {appeal.user.phone || "Não informado"}</p>
              <p><strong>CPF:</strong> {appeal.user.cpf || "Não informado"}</p>
            </div>

            {/* Card Gestão de Histórico */}
            <div className="rounded-3xl bg-rose-950/20 border border-rose-500/30 p-5 shadow-xl space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 border-b border-rose-500/20 pb-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                Zerar & Excluir Testes
              </span>
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleClearBotMemory}
                  disabled={actionLoading || !appeal.user.phone}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition text-left"
                >
                  🧹 Zerar Memória do Bot Samuca
                </button>
                <button
                  type="button"
                  onClick={handleClearAppealArguments}
                  disabled={actionLoading}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition text-left"
                >
                  🔄 Zerar Argumentos deste Recurso
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTestAppeal}
                  disabled={actionLoading}
                  className="w-full py-2 px-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black rounded-xl transition text-left shadow-lg shadow-rose-950/40"
                >
                  🗑️ Excluir este Recurso de Teste
                </button>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: EDITOR COMPLETO DA PEÇA RECURSAL */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">
                    Petição Jurídica de Defesa
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Editável antes de liberar ao cliente
                </span>
              </div>
              <textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                rows={24}
                className="w-full p-4 font-mono text-xs text-slate-200 bg-slate-950 rounded-2xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed resize-y"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
