"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  FileText,
  Printer,
  FileDown,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Car,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Hourglass,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Mail,
  Upload,
} from "lucide-react";

interface AppealDetail {
  id: string;
  protocol: string;
  type: string;
  authority: string;
  aitNumber: string;
  plate: string;
  vehicleModel?: string;
  ctbArticle: string;
  infractionDate: string;
  infractionLocation: string;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentProofUrl?: string;
  sentToEmail: boolean;
  emailSentAt?: string;
  generatedDocument: string;
  adminNotes?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    cpf?: string;
    cnh?: string;
  };
  documents: {
    id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
}

export default function VisualizarRecursoPage() {
  const params = useParams();
  const router = useRouter();
  const [appeal, setAppeal] = useState<AppealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState("");

  const loadData = () => {
    if (!params.id) return;
    fetch(`/api/appeals/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Não foi possível carregar o recurso.");
        return res.json();
      })
      .then((data) => setAppeal(data.appeal))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const pixKey = "pix@autorecurso.com.br";
  const pixCopiaCola = `00020126580014BR.GOV.BCB.PIX0114pix@autorecurso.com.br5204000053039865405${(appeal?.paymentAmount || 20.0).toFixed(2)}5802BR5915AUTORECURSO LTDA6009SAO PAULO62070503***6304ABCD`;

  const copyPix = () => {
    navigator.clipboard.writeText(pixCopiaCola);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmPayment = async () => {
    if (!appeal) return;
    setPaymentSubmitting(true);
    try {
      const res = await fetch(`/api/appeals/${appeal.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLIENT_PAID" }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentMsg("Após o pagamento, o administrador confirmará e liberará seu recurso.");
        loadData();
      }
    } catch {
      setError("Erro ao registrar pagamento.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Clock className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !appeal) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Recurso não encontrado</h2>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <Link
            href="/cliente/dashboard"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = appeal.paymentStatus === "PAID";
  const isReady = appeal.status === "READY";

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      {/* Barra superior de identificação */}
      <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-8 sticky top-20 z-40 no-print shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/cliente/dashboard"
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              title="Voltar ao Painel"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  Protocolo: {appeal.protocol}
                </h1>
                {isReady ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Defesa Liberada
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Em Processamento
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Placa: {appeal.plate} • AIT: {appeal.aitNumber} • Órgão: {appeal.authority}
              </p>
            </div>
          </div>

          {isReady && (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Salvar PDF
              </button>

              <a
                href={`/api/appeals/${appeal.id}/docx`}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition"
              >
                <FileDown className="w-4 h-4 text-blue-400" />
                Baixar Word (.docx)
              </a>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {paymentMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            {paymentMsg}
          </div>
        )}

        {/* Linha do Tempo / Etapas do Pedido */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Etapas do Seu Atendimento:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Etapa 1 */}
            <div
              className={`p-4 rounded-xl border ${
                isPaid
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span>1. Pagamento</span>
                {isPaid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {isPaid
                  ? "Pagamento confirmado via Pix!"
                  : `Aguardando Pix de R$ ${appeal.paymentAmount.toFixed(2)}`}
              </p>
            </div>

            {/* Etapa 2 */}
            <div
              className={`p-4 rounded-xl border ${
                isReady
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                  : isPaid
                  ? "bg-blue-50 border-blue-200 text-blue-900"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span>2. Elaboração da Defesa</span>
                {isReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isPaid ? (
                  <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {isReady
                  ? "Defesa concluída e fundamentada"
                  : isPaid
                  ? "Nossa equipe está redigindo os autos"
                  : "Inicia após a confirmação do pagamento"}
              </p>
            </div>

            {/* Etapa 3 */}
            <div
              className={`p-4 rounded-xl border ${
                isReady
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span>3. Entrega (E-mail & Sistema)</span>
                {isReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {isReady
                  ? `Enviado para ${appeal.user.email} e liberado aqui!`
                  : `Será enviado para ${appeal.user.email}`}
              </p>
            </div>
          </div>
        </div>

        {/* Box de Pagamento Pix (Caso ainda não esteja pago) */}
        {!isPaid && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                  <CreditCard className="w-3.5 h-3.5" /> Pagamento do Recurso
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Realize o pagamento via Pix para iniciarmos sua defesa
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Valor do recurso: <strong className="text-slate-900 text-base">R$ {appeal.paymentAmount.toFixed(2)}</strong>.
                  Após o pagamento, nossa equipe elabora a petição jurídica personalizada e envia para o seu e-mail (<strong>{appeal.user.email}</strong>) e disponibiliza para download no sistema.
                </p>

                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-700 mb-1">Pague de forma segura:</p>
                  <a
                    href="https://pay.kiwify.com.br/AOM7Bs9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    Acessar Link de Pagamento (Kiwify)
                  </a>
                </div>
              </div>

              {/* Botão de confirmação direta e Link Kiwify */}
              <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm text-center flex-shrink-0 w-full md:w-64 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Pagamento 100% seguro via Pix ou Cartão:
                  </p>
                  <a
                    href="https://pay.kiwify.com.br/AOM7Bs9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mb-3 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    Pagar na Kiwify (R$ 20,00)
                  </a>
                </div>
                <button
                  onClick={handleConfirmPayment}
                  disabled={paymentSubmitting}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {paymentSubmitting ? "Avisando..." : "Já Paguei na Kiwify (Avisar Admin)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Seção de Status / Liberação da Petição */}
        {!isReady ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hourglass className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {isPaid
                ? "Pagamento recebido! Sua defesa está sendo elaborada"
                : "Aguardando confirmação do pagamento para liberação"}
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed mb-6">
              Nossa equipe está analisando os dados do AIT nº <strong>{appeal.aitNumber}</strong> e seus anexos. Assim que o especialista finalizar a petição, ela será:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-xs text-left mb-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Enviada para seu e-mail: <strong>{appeal.user.email}</strong></span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Disponibilizada para download (PDF e DOCX) aqui</span>
              </div>
            </div>

            {/* Documentos Anexados pelo Cliente */}
            {appeal.documents.length > 0 && (
              <div className="border-t border-slate-100 pt-6 text-left max-w-lg mx-auto">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Documentos Enviados por Você ({appeal.documents.length}):
                </p>
                <div className="space-y-2">
                  {appeal.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 transition"
                    >
                      <span className="font-semibold truncate mr-2">{doc.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Recurso Pronto e Liberado */
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 no-print shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-base mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Sua defesa está pronta e liberada!
              </div>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Enviamos uma cópia para o seu e-mail (<strong>{appeal.user.email}</strong>). Você também pode imprimir agora mesmo ou baixar em formato Word (.docx) editável.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 mb-4">
                <strong>Instruções para você protocolar no órgão:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Clique no botão <strong>"Imprimir / Salvar PDF"</strong> ou baixe em <strong>Word (.docx)</strong>.</li>
                  <li>Assine na linha indicada ao final da petição (ou assine com seu Gov.br).</li>
                  <li>Junte as cópias da sua CNH, CRLV do veículo e Notificação da multa.</li>
                  <li>Entregue presencialmente no {appeal.authority}, envie por Correios ou submeta no portal online do órgão.</li>
                </ol>
              </div>

              {appeal.documents.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Documentos da Infração:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {appeal.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        {doc.title} ({doc.fileName})
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Petição Formatada para Impressão Forense */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-300 p-8 sm:p-16 petition-document">
              <div className="max-w-[210mm] mx-auto text-slate-900">
                <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed text-justify text-slate-900 select-text">
                  {appeal.generatedDocument}
                </pre>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
