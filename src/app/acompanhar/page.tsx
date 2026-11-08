"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail,
  Car,
  Calendar,
  Lock,
} from "lucide-react";

interface AppealPublicData {
  id: string;
  protocol: string;
  plate: string;
  aitNumber: string;
  type: string;
  authority: string;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  infractionDate: string;
  createdAt: string;
  readyAt?: string;
  isReady: boolean;
  hasDocument: boolean;
  clientName: string;
  clientEmail: string;
}

function AcompanharContent() {
  const searchParams = useSearchParams();
  const initialQuery =
    searchParams.get("protocolo") ||
    searchParams.get("p") ||
    searchParams.get("sck") ||
    searchParams.get("q") ||
    "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [appeal, setAppeal] = useState<AppealPublicData | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (queryToUse?: string) => {
    const q = (queryToUse !== undefined ? queryToUse : searchQuery).trim();
    if (!q) {
      setErrorMsg("Digite o número do seu protocolo, placa ou telefone.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSearched(true);

    try {
      const res = await fetch(`/api/appeals/public/status?protocolo=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (res.ok && data.found && data.appeal) {
        setAppeal(data.appeal);
      } else {
        setAppeal(null);
        setErrorMsg(data.message || "Nenhum recurso encontrado com estes dados.");
      }
    } catch {
      setErrorMsg("Erro ao consultar sistema. Tente novamente.");
      setAppeal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const isPaid = appeal?.paymentStatus === "PAID";
  const isReady = appeal?.isReady && appeal?.hasDocument;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Topo / Navbar Simplificada */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/acompanhar" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base text-white tracking-tight">AutoRecurso</span>
              <span className="text-[11px] block text-slate-400 font-medium -mt-1">
                Acompanhamento & Download de Defesas
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50"
          >
            <Lock className="w-3.5 h-3.5" /> Área Administrativa
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 w-full flex-1">
        {/* Barra de Consulta */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Acompanhe o Status do seu Recurso
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Consulte o andamento da sua defesa técnica de trânsito em tempo real e faça o download da petição pronta.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="bg-slate-800/80 border border-slate-700 p-2 sm:p-3 rounded-2xl shadow-xl mb-8 flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite seu Protocolo (ex: REC-2026-...), Placa ou Telefone"
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 flex-shrink-0"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" /> Consultando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Consultar
              </>
            )}
          </button>
        </form>

        {/* Mensagem de Erro / Não encontrado */}
        {errorMsg && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold">{errorMsg}</p>
              <p className="text-xs text-amber-400/80 mt-1">
                Dica: Verifique se digitou o protocolo completo ou envie uma mensagem no WhatsApp do Samuca para conferir seus dados.
              </p>
            </div>
          </div>
        )}

        {/* Card do Recurso Encontrado */}
        {appeal && (
          <div className="space-y-6">
            {/* Box Principal de Status */}
            {isReady ? (
              // ─── ESTADO 1: DEFESA PRONTA PARA DOWNLOAD ──────────
              <div className="bg-gradient-to-br from-emerald-950/70 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Concluído com Sucesso
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  🎉 Sua Defesa Técnica está Pronta!
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Nossa equipe de especialistas concluiu e revisou os fundamentos jurídicos da sua defesa para o veículo placa{" "}
                  <strong className="text-white">{appeal.plate}</strong>. O documento foi formatado nas normas oficiais da JARI / Órgão de Trânsito.
                </p>

                {/* Botão de Download DOCX */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`/api/appeals/public/docx?protocolo=${encodeURIComponent(appeal.protocol)}`}
                    download
                    className="flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-2xl transition flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 group"
                  >
                    <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                    Baixar Petição Pronta (.DOCX / Word)
                  </a>
                </div>

                <div className="mt-6 pt-5 border-t border-emerald-900/40 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span>📲 Enviado também diretamente no seu WhatsApp e e-mail</span>
                  <span className="text-emerald-400 font-semibold">Liberado para protocolo imediato</span>
                </div>
              </div>
            ) : isPaid ? (
              // ─── ESTADO 2: PAGO / EM ELABORAÇÃO (ATÉ 72 HORAS) ──
              <div className="bg-gradient-to-br from-blue-950/70 to-slate-900 border-2 border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Pagamento Confirmado
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Defesa em Elaboração por Especialistas
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">
                  Confirmamos o seu pagamento de <strong className="text-white">R$ 30,00</strong>. Nossa equipe jurídica já está redigindo a sua peça técnica com base no Código de Trânsito Brasileiro e nas provas anexadas.
                </p>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700/80 mb-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Prazo de Confecção</p>
                    <p className="text-lg font-black text-white">Até 72 Horas Úteis</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Você não precisa se preocupar: assim que finalizada, ela será liberada para download aqui e enviada no seu WhatsApp!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-900/20 border border-blue-800/40 p-3 rounded-xl">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Qualquer dúvida sobre seu pedido, basta responder a qualquer momento no WhatsApp do Samuca.
                  </span>
                </div>
              </div>
            ) : (
              // ─── ESTADO 3: AGUARDANDO PAGAMENTO ──────────────────
              <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Aguardando Pagamento
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Pedido Registrado com Sucesso
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Seus dados e documentos já foram recebidos no sistema. Para que nossa equipe inicie a confecção técnica da sua peça, conclua o pagamento com segurança:
                </p>

                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase block">Valor do Serviço</span>
                    <span className="text-3xl font-black text-emerald-400">R$ 30,00</span>
                    <span className="text-xs text-slate-400 block mt-0.5">Pagamento único via Pix ou Cartão</span>
                  </div>

                  <a
                    href={`https://pay.hotmart.com/W107769558Q?sck=${encodeURIComponent(appeal.protocol)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 flex-shrink-0"
                  >
                    Pagar no Hotmart Agora <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-slate-400 italic">
                  * Assim que o pagamento for concluído na Hotmart, nosso sistema identifica automaticamente em instantes e envia a confirmação no seu WhatsApp.
                </p>
              </div>
            )}

            {/* Ficha Resumo do Pedido */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-lg">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/60 pb-2">
                Dados do Recurso
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Protocolo</span>
                  <strong className="text-white font-mono text-sm">{appeal.protocol}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block">Veículo / Placa</span>
                  <strong className="text-white font-mono text-sm">{appeal.plate}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block">Auto de Infração (AIT)</span>
                  <strong className="text-white font-mono text-sm">{appeal.aitNumber}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block">Fase do Recurso</span>
                  <strong className="text-white">{appeal.type.replace("_", " ")}</strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400 flex flex-col sm:flex-row justify-between gap-1">
                <span>Cliente: <strong className="text-slate-200">{appeal.clientName}</strong></span>
                <span>Data de Abertura: <strong className="text-slate-200">{new Date(appeal.createdAt).toLocaleDateString("pt-BR")}</strong></span>
              </div>
            </div>

            {/* Como Protocolar (Orientações) */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 text-xs text-slate-300 leading-relaxed">
              <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" /> Como Funciona o Protocolo da sua Defesa:
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                <li>Assim que a petição for liberada, faça o download do arquivo Word (.docx).</li>
                <li>Imprima o documento ou protocole digitalmente pelo aplicativo da <strong>Carteira Digital de Trânsito (CDT)</strong> ou site do DETRAN do seu estado.</li>
                <li>Assine no campo indicado e anexe cópias da sua CNH, CRLV e Notificação.</li>
                <li>Acompanhe o julgamento com efeito suspensivo dos pontos na sua habilitação.</li>
              </ol>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} AutoRecurso - Recursos de Trânsito. Todos os direitos reservados.</p>
        <p className="mt-1">Atendimento ao cliente automatizado via WhatsApp e equipe jurídica especializada.</p>
      </footer>
    </div>
  );
}

export default function AcompanharPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Clock className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <AcompanharContent />
    </Suspense>
  );
}
