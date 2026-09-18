"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Car,
  FileText,
  ArrowRight,
  ShieldCheck,
  Scale,
  Mail,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  X,
  Smartphone,
  Check,
  Info,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [plate, setPlate] = useState("");
  const [aitNumber, setAitNumber] = useState("");
  const [error, setError] = useState("");
  const [showAitHelp, setShowAitHelp] = useState(false);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) {
      setError("Por favor, insira a placa do veículo.");
      return;
    }
    if (!aitNumber.trim()) {
      setError("Por favor, insira o número do Auto de Infração (AIT).");
      return;
    }

    // Redireciona para o formulário de cadastro com a placa e o AIT pré-preenchidos
    router.push(
      `/cliente/novo?placa=${encodeURIComponent(
        plate.toUpperCase().trim()
      )}&ait=${encodeURIComponent(aitNumber.toUpperCase().trim())}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      {/* Seção Principal / Hero idêntico ao modelo da imagem */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Banner Informativo de Escopo de Atuação */}
        <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-blue-50/90 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-800">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg flex-shrink-0">
              <Info className="w-4 h-4" />
            </span>
            <p className="leading-relaxed text-slate-700">
              <strong>Como atuamos:</strong> Elaboramos sua defesa técnica fundamentada em PDF e Word. 
              <strong> Não damos entrada nem acompanhamos o processo</strong> — o protocolo é feito por você no órgão autuador.
            </p>
          </div>
          <Link
            href="/fale-conosco"
            className="text-blue-700 hover:text-blue-900 font-extrabold whitespace-nowrap flex items-center gap-1 hover:underline flex-shrink-0"
          >
            Entenda o serviço ➔
          </Link>
        </div>

        {/* Subtítulo discreto no topo */}
        <div className="mb-4">
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-500">
            Cancelamento de Multas
          </p>
        </div>

        {/* Grid com Banner Azul à Esquerda e Card de Entrada à Direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card Banner Esquerdo (Azul Vibrante) */}
          <div className="lg:col-span-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-xl shadow-blue-600/15 min-h-[380px]">
            {/* Decorações sutis de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20 backdrop-blur-xs">
                  Processo 100% Online
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                <span className="text-white">Recurso</span>
                <span className="text-sky-300">Fácil</span>
                <br />
                <span className="text-slate-100 font-bold text-2xl sm:text-3xl">
                  para todas as multas de trânsito
                </span>
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-3 max-w-md leading-relaxed">
                Elaboramos sua defesa fundamentada no Código de Trânsito Brasileiro e nas Resoluções do CONTRAN. Rápido, seguro e sem sair de casa.
              </p>
            </div>

            {/* Ilustração / Destaque central */}
            <div className="my-6 py-2 flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                <Smartphone className="w-8 h-8 text-sky-200" />
              </div>
              <div className="text-xs text-blue-100 space-y-1">
                <p className="font-bold text-white flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-300" /> Defesa Prévia, JARI e CETRAN
                </p>
                <p className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-300" /> Análise de prazos e inconsistências
                </p>
              </div>
            </div>

            {/* Box inferior escuro com Escudo */}
            <div className="relative z-10 bg-slate-900/40 border border-white/20 backdrop-blur-md rounded-2xl p-3.5 flex items-center gap-3">
              <div className="p-2 bg-blue-500 text-white rounded-xl flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-100 font-medium">
                Vamos verificar se temos o recurso disponível para sua multa.
              </p>
            </div>
          </div>

          {/* Card Formulário Direito (Branco com foco em conversão) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 executive-shadow-lg flex flex-col justify-center">
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              Insira os dados da sua multa
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Digite a placa e o auto de infração para iniciar sua solicitação.
            </p>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sua placa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Car className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={plate}
                    onChange={(e) => {
                      setPlate(e.target.value.toUpperCase());
                      setError("");
                    }}
                    placeholder="Ex.: ABC1D23"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-mono font-bold uppercase focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Número da autuação / AIT / Auto de infração <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={aitNumber}
                    onChange={(e) => {
                      setAitNumber(e.target.value);
                      setError("");
                    }}
                    placeholder="Ex.: 12345678901 ou B45892147"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 px-6 rounded-xl shadow-lg shadow-blue-600/25 text-base transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowAitHelp(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 hover:underline"
              >
                <HelpCircle className="w-4 h-4" />
                Não sei o número / Como localizar?
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Divisor com Preço em Pílula (Pacote completo R$ 20,00) */}
      <section id="pacotes" className="py-6 px-4 max-w-5xl mx-auto w-full">
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-300 w-full" />
          <div className="absolute bg-slate-50 px-6">
            <span className="text-sm font-semibold text-slate-600">
              Pacote completo <strong className="text-slate-900 text-lg">R$ 20,00</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Seção "O que está incluído" (Os 3 cards da imagem) */}
      <section id="como-funciona" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            O que está incluído
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Atendimento técnico especializado focado exclusivamente na elaboração e geração da sua peça
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 executive-shadow text-center flex flex-col items-center hover:border-blue-400 transition">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-xs">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Recurso personalizado
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Preparado de acordo com a infração e com as resoluções vigentes do CONTRAN e Código de Trânsito Brasileiro.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 executive-shadow text-center flex flex-col items-center hover:border-amber-400 transition">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 shadow-xs">
              <Scale className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Revisão pela equipe jurídica
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Uma camada adicional de análise técnica dos autos, dos prazos e dos documentos antes da liberação ao cliente.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 executive-shadow text-center flex flex-col items-center hover:border-emerald-400 transition">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-xs">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Envio automático & no sistema
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Quando revisado e liberado, o recurso pronto para imprimir e assinar chega no seu e-mail e fica disponível para download.
            </p>
          </div>
        </div>
      </section>

      {/* Seção de Dúvidas Frequentes (FAQ) */}
      <section id="faq" className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2 inline-block">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Perguntas e Respostas
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "O que é o número do Auto de Infração (AIT)?",
              a: "É o código alfanumérico identificador único da sua multa, localizado no cabeçalho ou canto superior da Notificação de Autuação enviada pelo Detran, PRF, DNIT ou prefeitura municipal.",
            },
            {
              q: "Preciso de advogado para protocolar o recurso?",
              a: "Não. O Código de Trânsito Brasileiro garante a todo cidadão o direito de apresentar a sua própria defesa e recurso administrativo perante o órgão sem a necessidade de constituir advogado.",
            },
            {
              q: "E se o prazo da notificação já tiver expirado?",
              a: "Nosso sistema calcula a data limite na hora. Se o prazo tiver passado, é possível apresentar o recurso fundamentando a ausência de notificação no prazo de 30 dias (Art. 281 do CTB / Súmula 312 do STJ) ou vícios formais.",
            },
            {
              q: "Como recebo o recurso após o pagamento?",
              a: "Após a confirmação do Pix (R$ 20,00), nossa equipe técnica elabora e revisa sua peça. Assim que liberada, o documento completo em PDF e Word (.docx) é enviado para o seu e-mail e liberado no seu painel.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs"
            >
              <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5 flex items-center gap-2">
                <span className="text-blue-600 font-black">?</span> {item.q}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-4 border-l-2 border-blue-100">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Modal / Ajuda sobre Onde Localizar o AIT */}
      {showAitHelp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-fade-in">
            <button
              onClick={() => setShowAitHelp(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-blue-600 font-bold mb-3">
              <HelpCircle className="w-6 h-6" />
              <h3 className="text-lg font-extrabold text-slate-900">
                Onde localizar o Auto de Infração (AIT)?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
              O número do Auto de Infração é o código que identifica a multa. Veja onde encontrá-lo:
            </p>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p>
                <strong>1. Na Notificação Impressa:</strong> Procure no topo do documento por <em>"Auto de Infração nº"</em>, <em>"Nº do AIT"</em> ou <em>"Identificação da Autuação"</em>. Geralmente tem letras e números (ex: <code>B45892147</code> ou <code>1234567890</code>).
              </p>
              <p>
                <strong>2. No Aplicativo Carteira Digital (CDT):</strong> Acesse a aba <em>"Veículos"</em> ➔ <em>"Infrações"</em> ➔ Clique na multa. O número do Auto de Infração estará no topo dos detalhes.
              </p>
              <p>
                <strong>3. No Portal do DETRAN do seu estado:</strong> Na consulta de débitos do veículo, cada multa listada possui o seu respectivo número do AIT.
              </p>
            </div>

            <button
              onClick={() => setShowAitHelp(false)}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
            >
              Entendi, voltar ao formulário
            </button>
          </div>
        </div>
      )}

      {/* Footer elegante */}
      <footer id="contato" className="mt-auto bg-slate-900 text-slate-400 py-10 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-lg font-black text-white">
              auto<span className="text-blue-400">recurso</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 text-center sm:text-left">
            AutoRecurso &copy; {new Date().getFullYear()} - Sistema de Gestão e Geração de Recursos de Trânsito.
            <br />
            Este sistema elabora a peça técnica. O protocolo final perante o órgão cabe ao usuário.
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <Link href="/login" className="hover:text-white transition">
              Acesso Restrito
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
