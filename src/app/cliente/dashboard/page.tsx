"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  FileDown,
  ChevronRight,
  HelpCircle,
  AlertCircle,
  Car,
  CheckCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
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
  createdAt: string;
  documents: { id: string; title: string; fileName: string; fileUrl: string }[];
}

function DashboardContent() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const acabouDeEnviar = searchParams.get("enviado") === "1";

  useEffect(() => {
    fetch("/api/appeals")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.appeals) {
          setAppeals(data.appeals);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const total = appeals.length;
  const ready = appeals.filter((a) => a.status === "READY").length;
  const pending = appeals.filter((a) => a.status !== "READY").length;

  const getTypeName = (type: string) => {
    switch (type) {
      case "DEFESA_PREVIA":
        return "Defesa Prévia";
      case "JARI":
        return "Recurso 1ª Instância (JARI)";
      case "CETRAN":
        return "Recurso 2ª Instância (CETRAN)";
      default:
        return type;
    }
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner de Sucesso pós-envio */}
      {acabouDeEnviar && (
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-300 rounded-3xl flex items-start gap-4 executive-shadow animate-fade-in">
          <div className="p-2.5 bg-emerald-600 text-white rounded-2xl flex-shrink-0 shadow-sm">
            <CheckCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-emerald-950">
              Solicitação e Documentos Recebidos com Sucesso!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
              Registramos seus dados e todos os arquivos anexados. Agora, basta efetuar o pagamento via Pix para darmos início imediato à redação da sua defesa jurídica.
            </p>
          </div>
        </div>
      )}

      {/* Topo do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-1.5 inline-block">
            Portal do Cliente
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Meus Recursos de Trânsito
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Acompanhe o prazo de vencimento da notificação, status de pagamento e baixe suas peças prontas.
          </p>
        </div>

        <Link
          href="/cliente/novo"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/20 transition transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          Enviar Nova Multa & Documentos
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 executive-shadow flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Solicitado
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 executive-shadow flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Defesas Prontas
            </p>
            <p className="text-3xl font-extrabold text-emerald-700 mt-0.5">{ready}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 executive-shadow flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Em Processamento
            </p>
            <p className="text-3xl font-extrabold text-amber-700 mt-0.5">{pending}</p>
          </div>
        </div>
      </div>

      {/* Lista de Recursos */}
      <div className="bg-white rounded-3xl border border-slate-200/80 executive-shadow overflow-hidden mb-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">Seus Pedidos de Defesa</h2>
          <span className="text-xs text-slate-400 font-semibold">
            {appeals.length} registro(s)
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
            <p className="text-sm font-medium">Carregando seus recursos...</p>
          </div>
        ) : appeals.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Nenhuma solicitação cadastrada ainda
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
              Envie os dados da notificação de trânsito e seus documentos para que a equipe jurídica elabore sua defesa.
            </p>
            <Link
              href="/cliente/novo"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              Enviar Documentos da Multa
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appeals.map((item) => {
              const deadline = calculateDeadlineInfo(item.defenseDeadline);
              const isPaid = item.paymentStatus === "PAID";
              const isReady = item.status === "READY";

              return (
                <div
                  key={item.id}
                  className="p-6 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {item.protocol}
                      </span>

                      {/* Badge de Prazo de Vencimento */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs ${deadline.badgeClass}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {deadline.badgeText}
                      </span>

                      {/* Badge de Pagamento */}
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Pix Pago
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <CreditCard className="w-3 h-3" /> Aguardando Pix (R$ {(item.paymentAmount || 20.0).toFixed(2)})
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Car className="w-4 h-4 text-slate-500" />
                      Placa: {item.plate} {item.vehicleModel ? `(${item.vehicleModel})` : ""}
                      <span className="text-slate-300 font-normal">|</span>
                      <span className="text-slate-600 font-medium text-sm">
                        AIT: {item.aitNumber}
                      </span>
                    </h4>

                    <p className="text-sm text-slate-600">
                      <span className="font-bold text-slate-800">Infração:</span> {item.ctbArticle}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span>Órgão: <strong>{item.authority}</strong></span>
                      <span>Data da Infração: {item.infractionDate}</span>
                      {item.documents.length > 0 && (
                        <span>📎 {item.documents.length} anexo(s) enviado(s)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
                    {isReady ? (
                      <>
                        <Link
                          href={`/cliente/recursos/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Baixar Petição Pronta
                        </Link>

                        <a
                          href={`/api/appeals/${item.id}/docx`}
                          download
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition shadow-xs"
                          title="Baixar em Word"
                        >
                          <FileDown className="w-3.5 h-3.5 text-blue-600" />
                          Word (.docx)
                        </a>
                      </>
                    ) : (
                      <Link
                        href={`/cliente/recursos/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
                      >
                        {!isPaid ? (
                          <>
                            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                            Pagar Pix / Acompanhar
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            Acompanhar Elaboração
                          </>
                        )}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guia Informativo de Prazos */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl flex-shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white mb-1.5">
              Por que é fundamental observar o prazo de vencimento da notificação?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              Cada notificação de trânsito possui uma data limite fixada pelo órgão para recebimento da Defesa Prévia ou Recurso JARI. 
              Nosso sistema prioriza as defesas mais próximas do vencimento para garantir a tempestividade da sua peça. 
              Mesmo caso a notificação já tenha vencido, ainda podemos sustentar a tese de falta de notificação no prazo de 30 dias (Art. 281 do CTB).
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ClienteDashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      <Navbar />
      <Suspense fallback={<div className="p-16 text-center text-slate-400 font-medium">Carregando painel...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
