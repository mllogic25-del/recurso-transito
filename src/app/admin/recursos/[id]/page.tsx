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
  ShieldCheck,
  Send,
  CreditCard,
  Mail,
  DollarSign,
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

export default function AdminEditarRecursoPage() {
  const params = useParams();
  const router = useRouter();
  const [appeal, setAppeal] = useState<AppealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Campos editáveis pelo Admin
  const [documentContent, setDocumentContent] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [adminNotes, setAdminNotes] = useState("");

  const loadAppeal = () => {
    if (!params.id) return;
    fetch(`/api/appeals/${params.id}`)
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
  }, [params.id]);

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
        setSuccessMsg(
          `✅ Recurso Aprovado e Liberado! Recurso liberado para download no painel do cliente.`
        );
      } else {
        setSuccessMsg("💾 Alterações salvas com sucesso!");
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      {/* Barra superior de ações */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 sticky top-20 z-40 no-print shadow-sm">
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
            {/* Botão Salvar Rascunho */}
            <button
              onClick={() => saveAppeal("PROCESSING")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Rascunho
            </button>

            {/* Botão Principal: Liberar e Enviar por E-mail */}
            <button
              onClick={() => saveAppeal("READY")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
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
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda: Dados do Pedido, Pagamento e Documentos */}
          <div className="lg:col-span-1 space-y-6">
            {/* Box Status do Pagamento (Destaque) */}
            <div className="bg-white rounded-2xl border-2 border-amber-200 p-5 shadow-sm">
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
                <p><strong>Forma:</strong> Pix</p>
                <p><strong>E-mail de Notificação:</strong> {appeal.user.email}</p>
                {appeal.sentToEmail && (
                  <p className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Recurso liberado para download no painel do cliente
                  </p>
                )}
              </div>

              {!isPaid && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={confirmPayment}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmar Pagamento Pix Manualmente
                  </button>
                </div>
              )}
            </div>

            {/* Box Documentos Anexados pelo Cliente */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-sm">
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
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Relato do Motorista:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                "{appeal.defenseArguments}"
              </div>
            </div>

            {/* Box Dados da Infração */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
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
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
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

            {/* Box Notas Internas */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
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
                rows={20}
                className="w-full p-4 font-mono text-xs sm:text-sm text-slate-900 bg-slate-50/50 rounded-xl border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none leading-relaxed transition resize-y"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
