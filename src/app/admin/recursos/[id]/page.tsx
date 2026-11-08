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

      setSuccessMsg("Mensagem enviada para a fila de WhatsApp do cliente com sucesso!");
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
    if (!confirm("Deseja limpar os argumentos e relato deste recurso?")) return;

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
        setSuccessMsg("Recurso liberado com sucesso!");
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
        setSuccessMsg("Pagamento confirmado!");
        loadAppeal();
      }
    } catch {
      setErrorMsg("Erro ao confirmar pagamento.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Clock className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (!appeal) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-slate-500 font-medium">Recurso não encontrado.</p>
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
            `Olá ${appeal.user.name}! Tudo bem?\n\nA sua defesa técnica da AutoRecurso referente à placa *${appeal.plate}* (Protocolo: *${appeal.protocol}*) está concluída. Acesse: ${typeof window !== "undefined" ? window.location.origin : ""}/acompanhar?protocolo=${appeal.protocol}`
        )}`
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      {/* BARRA SUPERIOR LIMPA */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 sticky top-20 z-40 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              title="Voltar ao Painel"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 font-mono">
                  {appeal.protocol}
                </h1>
                <span className="text-xs text-slate-500">
                  {isPaid ? "• Pago" : "• Aguardando Pagamento"}
                </span>
                <span className="text-xs text-slate-500">
                  {isReleased ? "• Liberado" : "• Pendente"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {appeal.user.name} | Placa: {appeal.plate} | AIT: {appeal.aitNumber}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => saveAppeal("PROCESSING")}
              disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Rascunho
            </button>

            <button
              onClick={() => saveAppeal("READY")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {saving ? "Salvando..." : isReleased ? "Atualizar" : "Liberar Defesa"}
            </button>

            <a
              href={`/api/appeals/${appeal.id}/docx`}
              download
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg transition"
            >
              <FileDown className="w-3.5 h-3.5" />
              Word (DOCX)
            </a>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-5">
        {/* FEEDBACK */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* ROTINAS & ENVIO DE MENSAGENS NO WHATSAPP (VISUAL LIMPO E SEM GRADIENTE) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-slate-700" />
                Rotinas de Mensagens no WhatsApp
              </h2>
              <p className="text-xs text-slate-500">
                Envie orientações de protocolo e checklist com tags dinâmicas preenchidas.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              WhatsApp Cliente: <strong className="text-slate-800">{appeal.user.phone || "Não informado"}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lista de Rotinas */}
            <div className="lg:col-span-1 space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Escolha uma Rotina Salva:
              </label>

              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition border ${
                      selectedTemplateId === tpl.id
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    <p className="font-semibold truncate">{tpl.title}</p>
                    <p className={`text-[10px] mt-0.5 ${selectedTemplateId === tpl.id ? "text-slate-300" : "text-slate-400"}`}>
                      {tpl.category}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Caixa de Texto e Envio */}
            <div className="lg:col-span-2 space-y-2 flex flex-col justify-between">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Mensagem (Editável antes de enviar):
                </label>
                <textarea
                  rows={6}
                  value={customZapMessage}
                  onChange={(e) => setCustomZapMessage(e.target.value)}
                  placeholder="Selecione uma rotina ao lado ou digite a mensagem de orientação que deseja enviar..."
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs outline-none focus:bg-white focus:border-slate-400 leading-relaxed font-sans"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSaveRoutineModal(true)}
                  disabled={!customZapMessage.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition disabled:opacity-50"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  Salvar como Nova Rotina
                </button>

                <div className="flex items-center gap-2">
                  {directZapUrl && (
                    <a
                      href={directZapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir no Web
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleSendAutomaticZap}
                    disabled={sendingZap || !customZapMessage.trim() || !appeal.user.phone}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingZap ? "Enviando..." : "Enviar pelo Bot"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Salvar Rotina */}
        {showSaveRoutineModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Salvar Mensagem como Nova Rotina
              </h3>
              <p className="text-xs text-slate-500">
                Dê um título para reutilizar esta orientação em outros atendimentos.
              </p>
              <input
                type="text"
                value={newRoutineTitle}
                onChange={(e) => setNewRoutineTitle(e.target.value)}
                placeholder="Ex: Instruções de Protocolo na JARI"
                className="w-full p-2 rounded-lg border border-slate-200 text-xs outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveRoutineModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAsNewRoutine}
                  disabled={savingRoutine || !newRoutineTitle.trim()}
                  className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                >
                  {savingRoutine ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Coluna Esquerda: Informações e Limpeza */}
          <div className="lg:col-span-1 space-y-4">
            {/* Box Pagamento */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Pagamento</span>
                <span className="text-xs font-semibold text-slate-600">
                  {isPaid ? "✓ Confirmado" : "Pendente"}
                </span>
              </div>
              <p className="text-xs text-slate-600">Valor: R$ {appeal.paymentAmount.toFixed(2)}</p>
              {!isPaid && (
                <button
                  onClick={confirmPayment}
                  className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                >
                  Confirmar Pagamento Manualmente
                </button>
              )}
            </div>

            {/* Box Documentos */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-2">
                Anexos ({appeal.documents.length})
              </span>
              {appeal.documents.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum documento anexado.</p>
              ) : (
                <div className="space-y-1.5">
                  {appeal.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 text-xs text-slate-800"
                    >
                      <span className="truncate">{doc.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Box Dados Infração */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1.5 text-xs text-slate-600">
              <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-2">
                Infração & Veículo
              </span>
              <p>AIT: {appeal.aitNumber}</p>
              <p>Órgão: {appeal.authority}</p>
              <p>Placa: {appeal.plate}</p>
              <p>Artigo: {appeal.ctbArticle}</p>
              <p>Data: {appeal.infractionDate}</p>
            </div>

            {/* Box Ações de Gestão e Limpeza */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-2">
                Ações de Histórico
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleClearBotMemory}
                  disabled={actionLoading || !appeal.user.phone}
                  className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg transition text-left"
                >
                  🧹 Zerar Memória do Bot Samuca
                </button>
                <button
                  type="button"
                  onClick={handleClearAppealArguments}
                  disabled={actionLoading}
                  className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg transition text-left"
                >
                  🔄 Zerar Argumentos deste Recurso
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTestAppeal}
                  disabled={actionLoading}
                  className="w-full py-1.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-medium rounded-lg transition text-left"
                >
                  🗑️ Excluir este Recurso de Teste
                </button>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Editor de Texto da Petição */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">
                  Petição de Defesa (Texto Jurídico)
                </span>
                <span className="text-[11px] text-slate-400">
                  Editável antes de liberar ao cliente
                </span>
              </div>
              <textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                rows={22}
                className="w-full p-3 font-mono text-xs text-slate-900 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white outline-none leading-relaxed resize-y"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
