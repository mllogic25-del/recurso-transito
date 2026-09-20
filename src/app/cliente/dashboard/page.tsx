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
  Car,
  CheckCheck,
  Calendar,
  CreditCard,
  ArrowRight,
  Sparkles,
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

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner de Sucesso pós-envio */}
      {acabouDeEnviar && (
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-start gap-4 executive-shadow animate-fade-in">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl flex-shrink-0 shadow-sm">
            <CheckCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-emerald-950">
              Solicitação e Documentos Recebidos com Sucesso!
            </h3>
            <p className="text-sm text-emerald-800 mt-1 leading-relaxed">
              Registramos seus dados e todos os arquivos anexados. Agora, basta efetuar o pagamento via Pix para darmos início imediato à redação da sua defesa técnica.
            </p>
          </div>
        </div>
      )}

      {/* Topo do Painel - Estilo Bold & Big */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700">
              Portal do Condutor
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Meus Recursos de Trânsito
          </h1>
          <p className="text-zinc-500 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Acompanhe o status de análise, o prazo de vencimento da notificação e faça o download das suas peças jurídicas finalizadas.
          </p>
        </div>

        <Link
          href="/cliente/novo"
          className="inline-flex items-center justify-center gap-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-black px-7 py-4 rounded-2xl shadow-md transition transform hover:-translate-y-0.5 flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-blue-400" />
          Cadastrar Nova Multa
        </Link>
      </div>

      {/* Métricas Bold & Big */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {/* Total Solicitado */}
        <div className="bg-white p-7 rounded-3xl border border-zinc-200/80 executive-shadow transition hover:border-zinc-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Total Solicitado
            </span>
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-zinc-950 tracking-tight">{total}</p>
          <p className="text-xs text-zinc-400 mt-2 font-medium">Processos cadastrados no sistema</p>
        </div>

        {/* Defesas Prontas */}
        <div className="bg-white p-7 rounded-3xl border border-zinc-200/80 executive-shadow transition hover:border-zinc-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Defesas Concluídas
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tight">{ready}</p>
          <p className="text-xs text-zinc-400 mt-2 font-medium">Prontas para download e protocolo</p>
        </div>

        {/* Em Elaboração */}
        <div className="bg-white p-7 rounded-3xl border border-zinc-200/80 executive-shadow transition hover:border-zinc-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Em Análise / Elaboração
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-amber-600 tracking-tight">{pending}</p>
          <p className="text-xs text-zinc-400 mt-2 font-medium">Aguardando pagamento ou redação</p>
        </div>
      </div>

      {/* Lista de Recursos com Visual Limpo e Bold */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 executive-shadow overflow-hidden mb-12">
        <div className="p-6 sm:p-7 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-zinc-950">Seus Pedidos de Defesa</h2>
            <span className="text-xs font-black bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">
              {appeals.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-zinc-400">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-zinc-900" />
            <p className="text-sm font-bold">Carregando seus recursos...</p>
          </div>
        ) : appeals.length === 0 ? (
          <div className="p-16 sm:p-20 text-center">
            <div className="w-20 h-20 bg-zinc-100 text-zinc-400 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-zinc-950">
              Nenhuma solicitação cadastrada ainda
            </h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mt-2 mb-7 leading-relaxed">
              Envie os dados da notificação de trânsito e seus documentos para que nossa equipe técnica elabore a sua peça jurídica fundamentada.
            </p>
            <Link
              href="/cliente/novo"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black px-6 py-3.5 rounded-2xl transition shadow-md shadow-blue-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              Cadastrar Minha Primeira Multa
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {appeals.map((item) => {
              const deadline = calculateDeadlineInfo(item.defenseDeadline);
              const isPaid = item.paymentStatus === "PAID";
              const isReady = item.status === "READY";

              return (
                <div
                  key={item.id}
                  className="p-6 sm:p-8 hover:bg-zinc-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-black text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-200">
                        {item.protocol}
                      </span>

                      {/* Badge de Prazo */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold ${deadline.badgeClass}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {deadline.badgeText}
                      </span>

                      {/* Badge de Pagamento */}
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pix Confirmado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                          <CreditCard className="w-3.5 h-3.5" /> Aguardando Pix (R$ {(item.paymentAmount || 20.0).toFixed(2)})
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                      <Car className="w-5 h-5 text-zinc-400" />
                      Placa: {item.plate} {item.vehicleModel ? `(${item.vehicleModel})` : ""}
                      <span className="text-zinc-300 font-normal">|</span>
                      <span className="text-zinc-500 font-bold text-sm">
                        AIT: {item.aitNumber}
                      </span>
                    </h4>

                    <p className="text-sm text-zinc-600 font-medium">
                      <strong className="text-zinc-900 font-black">Infração:</strong> {item.ctbArticle}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-semibold pt-1">
                      <span>Órgão: <strong className="text-zinc-700">{item.authority}</strong></span>
                      <span>Data: <strong className="text-zinc-700">{item.infractionDate}</strong></span>
                      {item.documents.length > 0 && (
                        <span className="text-zinc-600">📎 {item.documents.length} anexo(s) enviado(s)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:self-center">
                    {isReady ? (
                      <>
                        <Link
                          href={`/cliente/recursos/${item.id}`}
                          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition"
                        >
                          <FileText className="w-4 h-4" />
                          Baixar Petição Pronta
                        </Link>

                        <a
                          href={`/api/appeals/${item.id}/docx`}
                          download
                          className="inline-flex items-center gap-1.5 px-4 py-3 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-xs font-black rounded-xl transition"
                          title="Baixar em Word"
                        >
                          <FileDown className="w-4 h-4 text-blue-600" />
                          Word (.docx)
                        </a>
                      </>
                    ) : (
                      <Link
                        href={`/cliente/recursos/${item.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-zinc-950 hover:bg-blue-600 text-white text-xs font-black rounded-xl shadow-sm transition transform hover:-translate-y-0.5"
                      >
                        {!isPaid ? (
                          <>
                            <CreditCard className="w-4 h-4 text-amber-400" />
                            Pagar Pix / Acompanhar
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-blue-400" />
                            Acompanhar Elaboração
                          </>
                        )}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Informativo Executivo */}
      <div className="bg-zinc-950 text-white rounded-3xl p-7 sm:p-9 shadow-xl border border-zinc-800">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="p-3.5 bg-zinc-900 text-blue-400 rounded-2xl flex-shrink-0 border border-zinc-800">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white mb-2">
              Efeito Suspensivo e Prazos Administrativos
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
              Ao apresentar a sua Defesa Prévia ou Recurso dentro do prazo regulamentar, a pontuação correspondente NÃO ingressa na sua CNH enquanto o processo estiver em julgamento. 
              Nosso sistema analisa os prazos de expedição e notificação (Art. 281 do CTB) para fundamentar a nulidade do auto de infração caso tenha havido decadência do direito de punir.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ClienteDashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/60">
      <Navbar />
      <Suspense fallback={<div className="p-20 text-center text-zinc-400 font-black">Carregando painel...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
