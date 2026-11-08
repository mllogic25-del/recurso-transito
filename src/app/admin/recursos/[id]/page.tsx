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

  // Aplica placeholders dinâmicos em uma mensagem
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

      setSuccessMsg("🚀 Mensagem enviada com sucesso para a fila do Samuca Bot!");
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
        setSuccessMsg("💾 Nova rotina salva com sucesso! Você pode reutilizá-la a qualquer momento.");
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

    if (!confirm(`Deseja realmente zerar a memória do Samuca Bot para o cliente ${appeal.user.name} (${appeal.user.phone})? O robô esquecerá o histórico desta conversa para novos testes.`)) {
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
        setSuccessMsg(data.message || "Memória do robô limpa com sucesso!");
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
    if (!confirm("Deseja zerar os argumentos e relato cadastrados deste recurso?")) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/clear-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "APPEAL_HISTORY", appealId: appeal?.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Histórico de argumentos do recurso zerado com sucesso!");
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
    if (!confirm(`⚠️ ATENÇÃO: Deseja realmente EXCLUIR DEFINITIVAMENTE o recurso ${appeal?.protocol}? Esta ação é recomendada para limpar recursos de teste e não pode ser desfeita.`)) {
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
        setSuccessMsg("✅ Recurso Aprovado e Liberado! Notificação enviada para a fila do WhatsApp do cliente.");
      } else {
        setSuccessMsg("💾 Alterações salvas com sucesso!");
      }
      setTimeout(() => setSuccessMsg(""), 6000);
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
        setSuccessMsg("Pagamento confirmado com sucesso!");
        loadAppeal();
      }
    } catch {
      setErrorMsg("Erro ao confirmar pagamento.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Clock className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!appeal) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-red-600 font-medium">Recurso não encontrado.</p>
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

  // Link wa.me dinâmico baseado na mensagem customizada atual ou padrão
  const directZapUrl =
    clientPhoneDigits.length >= 8
      ? `https://wa.me/${formattedZapPhone}?text=${encodeURIComponent(
          customZapMessage ||
            `Olá ${appeal.user.name}! Tudo bem?\n\nA sua defesa técnica da AutoRecurso para a placa *${appeal.plate}* (Protocolo: *${appeal.protocol}*) está concluída e disponível no portal oficial: ${typeof window !== "undefined" ? window.location.origin : ""}/acompanhar?protocolo=${appeal.protocol}`
        )}`
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/80">
      <Navbar />

      {/* Barra superior de ações */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 sticky top-20 z-40 no-print shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              title="Voltar ao Painel"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  {appeal.protocol}
                </h1>
                {isPaid ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    💰 Pago R$ {appeal.paymentAmount.toFixed(2)}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    ⏳ Aguardando Pagamento
                  </span>
                )}
                {isReleased ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                    ✓ Liberado
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    Pendente
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Cliente: <strong>{appeal.user.name}</strong> • Placa: <strong>{appeal.plate}</strong> • AIT: <strong>{appeal.aitNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => saveAppeal("PROCESSING")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Rascunho
            </button>

            <button
              onClick={() => saveAppeal("READY")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {saving ? "Salvando..." : isReleased ? "Atualizar & Manter Liberado" : "Liberar Defesa"}
            </button>

            <a
              href={`/api/appeals/${appeal.id}/docx`}
              download
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              title="Baixar em Word"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              DOCX
            </a>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Mensagens de Feedback */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* ========================================================= */}
        {/* CENTRAL DE ROTINAS & ENVIO DE MENSAGENS NO WHATSAPP */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-800/60 pb-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <MessageCircle className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-black tracking-tight text-white">
                  Central de Rotinas & Notificações WhatsApp
                </h2>
              </div>
              <p className="text-xs text-emerald-200/80 mt-1">
                Envie orientações de protocolo, checklist de documentos ou mensagens personalizadas com tags dinâmicas.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-emerald-300">
                Cliente: <strong>{appeal.user.phone || "Sem telefone"}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Seletor de Rotinas Salvas */}
            <div className="lg:col-span-1 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Escolher Rotina Salva:
              </label>

              <div className="space-y-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`w-full text-left p-3 rounded-2xl text-xs font-semibold transition border ${
                      selectedTemplateId === tpl.id
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-900/40"
                        : "bg-slate-800/70 hover:bg-slate-800 text-slate-200 border-slate-700/60"
                    }`}
                  >
                    <p className="font-bold truncate">{tpl.title}</p>
                    <p className="text-[10px] text-emerald-200/70 uppercase tracking-wider mt-0.5">
                      {tpl.category} {tpl.isDefault ? "• Padrão" : ""}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-emerald-300/80 space-y-1 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
                <p className="font-bold text-white">Tags Dinâmicas Disponíveis:</p>
                <p className="font-mono text-[10px] text-emerald-200">
                  {"{NOME}"}, {"{PLACA}"}, {"{PROTOCOLO}"}, {"{AIT}"}, {"{ORGAO}"}, {"{LINK_DOWNLOAD}"}
                </p>
              </div>
            </div>

            {/* Editor e Visualizador da Mensagem */}
            <div className="lg:col-span-2 space-y-3 flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1.5 block">
                  Mensagem Pronta para Envio (Editável antes de enviar):
                </label>
                <textarea
                  rows={8}
                  value={customZapMessage}
                  onChange={(e) => setCustomZapMessage(e.target.value)}
                  placeholder="Selecione uma rotina ao lado ou digite uma mensagem personalizada com orientações para o cliente..."
                  className="w-full p-3.5 bg-slate-950/80 text-emerald-100 rounded-2xl border border-emerald-800/60 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none text-xs leading-relaxed font-sans"
                />
              </div>

              {/* Botões de Ação para Envio */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveRoutineModal(true)}
                  disabled={!customZapMessage.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition disabled:opacity-50"
                  title="Salvar o texto atual como um novo modelo reutilizável"
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-700/50 transition"
                      title="Abrir no WhatsApp Web/Desktop com esta mensagem"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir no Web
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleSendAutomaticZap}
                    disabled={sendingZap || !customZapMessage.trim() || !appeal.user.phone}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {sendingZap ? "Enviando..." : "🚀 Enviar pelo Samuca Bot (Automático)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Salvar Nova Rotina */}
        {showSaveRoutineModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-emerald-600" />
                Salvar Mensagem como Nova Rotina
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Dê um título representativo para reutilizar esta rotina de orientações nos próximos recursos.
              </p>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Título da Rotina:
                  </label>
                  <input
                    type="text"
                    value={newRoutineTitle}
                    onChange={(e) => setNewRoutineTitle(e.target.value)}
                    placeholder="Ex: Instruções de Protocolo na JARI"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveRoutineModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAsNewRoutine}
                  disabled={savingRoutine || !newRoutineTitle.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  {savingRoutine ? "Salvando..." : "Salvar Rotina"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda: Dados do Pedido, Pagamento e Documentos */}
          <div className="lg:col-span-1 space-y-6">
            {/* Box Status do Pagamento (Destaque) */}
            <div className="bg-white rounded-2xl border-2 border-amber-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-900 font-bold text-sm mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Pagamento do Pedido</span>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {isPaid ? "PAGO / CONFIRMADO" : "PENDENTE"}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p><strong>Valor do Serviço:</strong> R$ {appeal.paymentAmount.toFixed(2)}</p>
                <p><strong>Forma:</strong> Pix / Hotmart</p>
                {appeal.user.phone && (
                  <p className="flex items-center gap-1.5">
                    <strong>WhatsApp:</strong>
                    <span className="font-bold text-slate-900">{appeal.user.phone}</span>
                  </p>
                )}
                <p><strong>E-mail de Notificação:</strong> {appeal.user.email}</p>
                {appeal.sentToEmail && (
                  <p className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Notificação de liberação enviada
                  </p>
                )}
              </div>

              {!isPaid && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={confirmPayment}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmar Pagamento Pix Manualmente
                  </button>
                </div>
              )}
            </div>

            {/* Box Documentos Anexados pelo Cliente */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-900 font-bold text-sm mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Documentos Anexados ({appeal.documents.length})</span>
                </div>
              </div>

              {appeal.documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum anexo enviado.</p>
              ) : (
                <div className="space-y-2">
                  {appeal.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-blue-50/60 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs text-slate-800 font-medium transition group"
                    >
                      <div className="truncate mr-2">
                        <p className="font-bold text-blue-950 truncate group-hover:text-blue-700">
                          {doc.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{doc.fileName}</p>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-blue-600 font-bold flex-shrink-0 bg-white px-2 py-1 rounded">
                        Abrir <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Box Relato do Cliente */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Relato do Motorista:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                "{appeal.defenseArguments || "Nenhum relato registrado."}"
              </div>
            </div>

            {/* Box Dados da Infração */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3 border-b border-slate-100 pb-2">
                <Car className="w-4 h-4 text-blue-600" />
                <span>Dados da Infração</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p><strong>AIT:</strong> {appeal.aitNumber}</p>
                <p><strong>Órgão:</strong> {appeal.authority}</p>
                <p><strong>Placa:</strong> {appeal.plate} {appeal.vehicleModel ? `(${appeal.vehicleModel})` : ""}</p>
                <p><strong>Data/Hora:</strong> {appeal.infractionDate} {appeal.infractionTime ? `às ${appeal.infractionTime}` : ""}</p>
                <p><strong>Local:</strong> {appeal.infractionLocation}</p>
                <p><strong>Enquadramento:</strong> {appeal.ctbArticle}</p>
                {appeal.speedLimit && (
                  <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 bg-slate-50 p-2.5 rounded-lg text-slate-700">
                    <p><strong>Limite:</strong> {appeal.speedLimit}</p>
                    <p><strong>Medida:</strong> {appeal.speedMeasured} (Considerada: {appeal.speedConsidered})</p>
                    <p><strong>Radar:</strong> {appeal.radarModel || "N/A"}</p>
                    <p><strong>Última Aferição:</strong> {appeal.lastVerification || "N/A"}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Box Cliente */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Dados do Cliente</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p><strong>Nome:</strong> {appeal.user.name}</p>
                <p><strong>E-mail:</strong> {appeal.user.email}</p>
                <p><strong>CPF:</strong> {appeal.user.cpf || "Não informado"}</p>
                <p><strong>CNH:</strong> {appeal.user.cnh || "Não informada"}</p>
                <p><strong>Telefone:</strong> {appeal.user.phone || "Não informado"}</p>
              </div>
            </div>

            {/* Box Ações de Gestão de Histórico (ZERAR HISTÓRICO) */}
            <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-950 font-bold text-sm border-b border-rose-200 pb-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Gestão de Histórico & Testes</span>
              </div>
              <p className="text-xs text-rose-800">
                Ferramentas para reiniciar o atendimento deste cliente ou limpar registros de teste:
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleClearBotMemory}
                  disabled={actionLoading || !appeal.user.phone}
                  className="w-full py-2 px-3 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Zerar Memória do Samuca Bot
                </button>

                <button
                  type="button"
                  onClick={handleClearAppealArguments}
                  disabled={actionLoading}
                  className="w-full py-2 px-3 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Zerar Argumentos deste Recurso
                </button>

                <button
                  type="button"
                  onClick={handleDeleteTestAppeal}
                  disabled={actionLoading}
                  className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir Recurso de Teste
                </button>
              </div>
            </div>

            {/* Box Notas Internas */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Anotações Internas da Equipe:
              </p>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Anotações para uso exclusivo da sua equipe..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Coluna Direita: Editor Completo da Peça Recursal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Elaboração da Peça Recursal
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Redija ou revise a petição. Ao clicar em <strong>"Liberar Defesa"</strong>, ela será liberada para download no painel do cliente.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => saveAppeal("PROCESSING")}
                    disabled={saving}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    Salvar Rascunho
                  </button>
                  <button
                    onClick={() => saveAppeal("READY")}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isReleased ? "Salvar Atualização" : "Aprovar & Liberar Defesa"}
                  </button>
                </div>
              </div>

              <textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                rows={22}
                className="w-full p-4 font-mono text-xs sm:text-sm text-slate-900 bg-slate-50/50 rounded-xl border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none leading-relaxed transition resize-y"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
