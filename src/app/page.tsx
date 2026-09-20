"use client";

import { useState, useEffect } from "react";
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
  X,
  Smartphone,
  Check,
  Info,
  Lock,
  User,
  Phone,
  Sparkles,
  ArrowLeft,
  DollarSign,
} from "lucide-react";

// Lista de infrações comuns para o assistente de convencimento
const INFRACTION_TYPES = [
  {
    id: "EXCESSO_VELOCIDADE",
    label: "Excesso de Velocidade (Radar)",
    icon: "🏎️",
    law: "Art. 218 do CTB & Resolução 798/2020 do CONTRAN",
    thesis:
      "Aferição do radar pelo Inmetro dentro do prazo de 12 meses, desconto obrigatório da margem de erro (velocidade considerada vs. medida) e prazo limite de 30 dias para envio da Notificação.",
  },
  {
    id: "SEMAFORO",
    label: "Sinal Vermelho ou Faixa",
    icon: "🚦",
    law: "Art. 208 do CTB & Resolução 920/2022 do CONTRAN",
    thesis:
      "Exigência de fotos sequenciais nítidas antes da linha de retenção e durante o cruzamento, homologação Senatran do equipamento e verificação do tempo do amarelo.",
  },
  {
    id: "LEI_SECA",
    label: "Lei Seca / Bafômetro",
    icon: "🍷",
    law: "Art. 165 e 165-A do CTB & Resolução 432/2013 do CONTRAN",
    thesis:
      "Em caso de recusa ao teste, obrigatoriedade de termo minucioso com múltiplos sinais de alteração psicomotora e calibração anual do etilômetro pelo Inmetro.",
  },
  {
    id: "CELULAR",
    label: "Celular ao Volante / Cinto",
    icon: "📱",
    law: "Art. 252, Parágrafo Único do CTB",
    thesis:
      "Diferenciação legal entre segurar, manusear ou falar ao celular, detalhamento obrigatório da conduta nas observações do AIT e inexistência de contradição visual.",
  },
  {
    id: "ESTACIONAMENTO",
    label: "Estacionamento / Parada Proibida",
    icon: "🅿️",
    law: "Art. 181 do CTB & Manual Brasileiro de Fiscalização",
    thesis:
      "Visibilidade e conformidade das placas de sinalização regulamentar (R-6a/R-6c), indicação exata do imóvel defronte e diferenciação entre parada rápida de embarque e estacionamento.",
  },
  {
    id: "OUTROS",
    label: "Outra Notificação / Multa",
    icon: "📋",
    law: "Código de Trânsito Brasileiro & Súmula 312 do STJ",
    thesis:
      "Análise integral de requisitos formais obrigatórios do Art. 280 do CTB, prazo decadencial de expedição em 30 dias (Art. 281) e nulidades procedimentais.",
  },
];

// Ícone oficial em SVG do WhatsApp
function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();

  // Estados do Fluxo Interativo de Convencimento: "PLATE" -> "PERSUASION" -> "AUTH"
  const [step, setStep] = useState<"PLATE" | "PERSUASION" | "AUTH">("PLATE");
  const [plate, setPlate] = useState("");
  const [selectedInfraction, setSelectedInfraction] = useState("EXCESSO_VELOCIDADE");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [phoneSupport, setPhoneSupport] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5579998340176");

  // Estados de Cadastro / Login no passo AUTH
  const [authMode, setAuthMode] = useState<"REGISTER" | "LOGIN">("REGISTER");
  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Verifica se o usuário já está autenticado e busca número do WhatsApp
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    // Busca status do WhatsApp configurado
    fetch("/api/whatsapp/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.phone) {
          setPhoneSupport(data.phone);
        } else if (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) {
          setPhoneSupport(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
        }
      })
      .catch(() => {});
  }, []);

  // Formata o link do WhatsApp para atendimento (inclui código de indicação se houver)
  const openWhatsapp = (customMessage?: string) => {
    const cleanNumber = phoneSupport.replace(/\D/g, "") || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5579998340176";

    // Resgata o código do indicador do cookie ou localStorage
    let refCode = "";
    if (typeof window !== "undefined") {
      refCode = localStorage.getItem("autorecurso_referral_code") || "";
      if (!refCode) {
        const match = document.cookie.match(/referral_code=([^;]+)/);
        if (match) refCode = decodeURIComponent(match[1]);
      }
    }

    const refTag = refCode ? ` [Indicação: ${refCode.toUpperCase().trim()}]` : "";

    const defaultMsg = plate
      ? `Olá! Gostaria de consultar um recurso de multa para o veículo de placa *${plate}*. Poderia me ajudar?`
      : "Olá! Gostaria de informações sobre como recorrer de multas de trânsito.";
    const textToSend = `${customMessage || defaultMsg}${refTag}`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, "_blank");
  };

  // Validação inicial da placa (sem travar por AIT)
  const handleStartPlate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (cleanPlate.length < 7) {
      setError("Por favor, digite uma placa válida com 7 caracteres (ex: ABC1D23 ou ABC1234).");
      return;
    }
    setError("");
    setStep("PERSUASION");
  };

  // Ao clicar em "Gerar Meu Recurso" após o convencimento
  const handleProceedToResource = () => {
    if (currentUser) {
      router.push(
        `/cliente/novo?placa=${encodeURIComponent(plate.toUpperCase().trim())}&categoria=${encodeURIComponent(
          selectedInfraction
        )}`
      );
    } else {
      setStep("AUTH");
    }
  };

  // Cadastro ou Login Rápido
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "REGISTER") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authData.name,
            email: authData.email,
            password: authData.password,
            phone: authData.phone,
            role: "CLIENT",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || "Erro ao criar conta.");
          setAuthLoading(false);
          return;
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authData.email,
            password: authData.password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || "Credenciais inválidas.");
          setAuthLoading(false);
          return;
        }
      }

      router.push(
        `/cliente/novo?placa=${encodeURIComponent(plate.toUpperCase().trim())}&categoria=${encodeURIComponent(
          selectedInfraction
        )}`
      );
    } catch {
      setAuthError("Erro de conexão com o servidor.");
      setAuthLoading(false);
    }
  };

  const activeInfractionData =
    INFRACTION_TYPES.find((i) => i.id === selectedInfraction) || INFRACTION_TYPES[0];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 text-zinc-900 relative">
      <Navbar />

      {/* Seção Principal / Hero */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Banner Informativo de Escopo de Atuação */}
        <div className="mb-7 p-4 rounded-2xl bg-white border border-zinc-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs executive-shadow">
          <div className="flex items-center gap-3 text-zinc-800">
            <span className="p-2 bg-zinc-950 text-blue-400 rounded-xl flex-shrink-0">
              <Info className="w-4 h-4" />
            </span>
            <p className="leading-relaxed text-zinc-700">
              <strong className="text-zinc-950">Como atuamos:</strong> Elaboramos sua defesa técnica fundamentada em PDF e Word (.docx).
              <strong className="text-zinc-950"> Não damos entrada nem acompanhamos o processo</strong> — o protocolo é realizado por você diretamente no órgão autuador.
            </p>
          </div>
          <Link
            href="/fale-conosco"
            className="text-blue-600 hover:text-blue-800 font-black whitespace-nowrap flex items-center gap-1 hover:underline flex-shrink-0"
          >
            Entenda o serviço ➔
          </Link>
        </div>

        {/* Subtítulo discreto no topo */}
        <div className="mb-4">
          <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-zinc-400">
            Recursos Administrativos de Multas de Trânsito
          </p>
        </div>

        {/* Grid com Banner Escuro Executivo à Esquerda e Card Interativo à Direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* Card Banner Esquerdo - Bold & Big */}
          <div className="lg:col-span-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 rounded-3xl p-8 sm:p-11 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl border border-zinc-800/80 min-h-[440px]">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-950/80 border border-zinc-700/80 flex items-center justify-center text-white shadow-lg">
                    <ShieldCheck className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 leading-none">
                      Recursos de Trânsito
                    </span>
                    <span className="text-xl font-black tracking-tight text-white leading-none mt-1">
                      auto<span className="text-blue-400">recurso</span>
                    </span>
                  </div>
                </div>
                <span className="bg-white/10 text-zinc-200 text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
                  Processo 100% Online
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]">
                <span className="text-white">auto</span>
                <span className="text-blue-400">recurso</span>
                <br />
                <span className="text-zinc-300 font-extrabold text-2xl sm:text-3xl lg:text-3xl">
                  para todas as multas de trânsito
                </span>
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-4 max-w-md leading-relaxed font-medium">
                Elaboramos sua petição fundamentada no Código de Trânsito Brasileiro e nas Resoluções vigentes do CONTRAN. Rápido, seguro e sem sair de casa.
              </p>
            </div>

            {/* Destaque do Mascote Samuca Oficial */}
            <div className="my-6 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-4 relative z-10">
              <img
                src="/samuca.png"
                alt="Samuca - Defesa de Autuações de Trânsito"
                className="w-16 h-16 rounded-2xl border-2 border-emerald-400/80 shadow-lg object-cover bg-zinc-900 flex-shrink-0"
              />
              <div className="text-xs text-zinc-300">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-white text-sm">Samuca IA</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online no WhatsApp
                  </span>
                </div>
                <p className="text-zinc-200 leading-relaxed font-medium">
                  "Oi! Eu analiso sua multa, leio seus documentos e tiro dúvidas de trânsito em tempo real pelo WhatsApp!"
                </p>
              </div>
            </div>

            {/* Box inferior escuro com Escudo */}
            <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl flex-shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs text-zinc-300 font-bold">
                  Defesas para DETRAN, PRF, DNIT e Prefeituras.
                </p>
              </div>
              <span className="text-[11px] font-black text-blue-400 uppercase tracking-wider whitespace-nowrap">
                CTB Atualizado
              </span>
            </div>
          </div>

          {/* Card Formulário Direito - Bold & Big */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-7 sm:p-10 border border-zinc-200/90 executive-shadow-lg flex flex-col justify-center transition-all duration-300">
            {/* ETAPA 1: DIGITAÇÃO APENAS DA PLACA */}
            {step === "PLATE" && (
              <div>
                <div className="mb-6">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-100 mb-2.5 inline-block">
                    Consulta Rápida de Recursos
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                    Consulte o recurso da sua multa
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
                    Digite a placa do veículo para verificar as teses e prazos legais cabíveis.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleStartPlate} className="space-y-5">
                  <div>
                    <label className="block text-xs font-black text-zinc-800 mb-2">
                      Placa do Veículo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                        <Car className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={8}
                        value={plate}
                        onChange={(e) => {
                          setPlate(e.target.value.toUpperCase());
                          setError("");
                        }}
                        placeholder="Ex.: ABC1D23"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-300 text-lg font-mono font-black uppercase tracking-wider focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 outline-none transition bg-zinc-50/50"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 font-medium">
                      Aceita placa padrão Mercosul ou modelo tradicional cinza.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 bg-zinc-950 hover:bg-zinc-800 text-white font-black py-4 px-6 rounded-2xl shadow-md text-base transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Continuar Análise do Recurso
                    <ArrowRight className="w-5 h-5 text-blue-400" />
                  </button>
                </form>

                {/* Opção de Conversar pelo WhatsApp */}
                <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500 mb-3">
                    Prefere tirar dúvidas diretamente com nosso time?
                  </p>
                  <button
                    type="button"
                    onClick={() => openWhatsapp()}
                    className="w-full py-3.5 px-4 rounded-xl border-2 border-emerald-500/80 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm transition flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-5 h-5 text-emerald-600" />
                    Conversar pelo WhatsApp
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2: CONVERSA, DIAGNÓSTICO E CONVENCIMENTO DO CLIENTE */}
            {step === "PERSUASION" && (
              <div className="space-y-4 animate-fade-in">
                {/* Placa em Destaque */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900 text-white font-mono font-black text-xs px-2.5 py-1 rounded-md border border-slate-700 shadow-xs flex items-center gap-1.5">
                      <span>🇧🇷</span> {plate}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Placa registrada
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("PLATE")}
                    className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Trocar Placa
                  </button>
                </div>

                {/* Pergunta Conversacional */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Qual foi a infração que você deseja recorrer?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecione para ver a fundamentação jurídica e chances reais do seu caso:
                  </p>
                </div>

                {/* Seletor Rápido de Infração */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INFRACTION_TYPES.map((inf) => {
                    const isSelected = selectedInfraction === inf.id;
                    return (
                      <button
                        key={inf.id}
                        type="button"
                        onClick={() => setSelectedInfraction(inf.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between min-h-[62px] ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/90 text-blue-950 font-bold shadow-xs ring-2 ring-blue-500/20"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="text-base mb-1">{inf.icon}</span>
                        <span className="leading-tight line-clamp-2">{inf.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Caixa de Diagnóstico & Convencimento Técnico */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100/80 space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-slate-900">
                        {activeInfractionData.law}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {activeInfractionData.thesis}
                      </p>
                    </div>
                  </div>

                  {/* Vantagens Irrefutáveis para o Cliente */}
                  <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>
                        <strong>Efeito Suspensivo:</strong> Os pontos NÃO entram na sua CNH enquanto o recurso tramita.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>
                        <strong>Sem custo com advogado:</strong> O CTB autoriza o próprio condutor a protocolar.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>
                        <strong>Valor único de apenas R$ 30,00:</strong> Peça completa fundamentada em PDF e Word.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação: WhatsApp ou Gerar Recurso */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleProceedToResource}
                    className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-black py-4 px-6 rounded-2xl shadow-md text-sm sm:text-base transition flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    Prosseguir e Gerar Meu Recurso
                    <ArrowRight className="w-5 h-5 text-blue-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openWhatsapp(
                        `Olá! Gostaria de uma análise para o recurso da placa *${plate}* sobre a infração de *${activeInfractionData.label}*. Como podemos proceder?`
                      )
                    }
                    className="w-full py-3.5 px-4 rounded-2xl border border-emerald-500/80 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 font-black text-xs sm:text-sm transition flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                    Tirar Dúvidas no WhatsApp com Atendente
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: LOGIN / CADASTRO RÁPIDO (APÓS O CONVENCIMENTO) */}
            {step === "AUTH" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setStep("PERSUASION")}
                    className="text-xs text-zinc-500 hover:text-zinc-900 font-black flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao diagnóstico
                  </button>
                  <span className="font-mono text-xs font-black text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-md">
                    Placa: {plate}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-950 leading-tight">
                    {authMode === "REGISTER" ? "Crie seu acesso rápido" : "Entrar no sistema"}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {authMode === "REGISTER"
                      ? "Crie seu usuário e senha em segundos para salvar seu recurso e receber a petição pronta."
                      : "Digite seus dados de acesso para continuar."}
                  </p>
                </div>

                {/* Abas Alternar Cadastro / Login */}
                <div className="flex p-1 bg-zinc-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("REGISTER");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 text-xs font-black rounded-lg transition cursor-pointer ${
                      authMode === "REGISTER"
                        ? "bg-white text-zinc-950 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    Criar Nova Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("LOGIN");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 text-xs font-black rounded-lg transition cursor-pointer ${
                      authMode === "LOGIN"
                        ? "bg-white text-zinc-950 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    Já Tenho Conta
                  </button>
                </div>

                {authError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authMode === "REGISTER" && (
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Seu Nome Completo *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={authData.name}
                          onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                          placeholder="Ex: Carlos Silva"
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 text-xs focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100 outline-none bg-zinc-50/50"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Seu E-mail *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={authData.email}
                        onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                        placeholder="seuemail@exemplo.com"
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 text-xs focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100 outline-none bg-zinc-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Sua Senha *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={authData.password}
                        onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 text-xs focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100 outline-none bg-zinc-50/50"
                      />
                    </div>
                  </div>

                  {authMode === "REGISTER" && (
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Telefone / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={authData.phone}
                          onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
                          placeholder="(DDD) 99999-9999"
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 text-xs focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100 outline-none bg-zinc-50/50"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-2 bg-zinc-950 hover:bg-zinc-800 text-white font-black py-4 px-4 rounded-xl shadow-md text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5"
                  >
                    {authLoading
                      ? "Processando..."
                      : authMode === "REGISTER"
                      ? "Criar Acesso e Concluir Recurso ➔"
                      : "Entrar e Concluir Recurso ➔"}
                  </button>
                </form>

                {/* Link para Zap se preferir não cadastrar agora */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      openWhatsapp(
                        `Olá! Gostaria de atendimento pelo WhatsApp para recorrer da multa da placa *${plate}*.`
                      )
                    }
                    className="text-xs text-emerald-700 hover:underline font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Prefere não cadastrar agora? Fale no WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Destaque de Preço Bold & Big */}
      <section id="pacotes" className="py-10 px-4 max-w-5xl mx-auto w-full">
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-blue-950 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-zinc-800">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800 inline-block mb-2">
              Valor Fixo & Transparente
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pacote Completo de Elaboração
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-md">
              Peça técnica fundamentada em PDF e Word (.docx), pronta para assinar e protocolar.
            </p>
          </div>
          <div className="flex items-center gap-5 sm:self-center">
            <div className="text-right">
              <span className="text-xs font-bold text-zinc-400 block">Investimento único de</span>
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                R$ 30<span className="text-xl text-zinc-400 font-bold">,00</span>
              </span>
            </div>
            <button
              onClick={() => {
                const formEl = document.querySelector("input[placeholder='Ex.: ABC1D23']");
                if (formEl) (formEl as HTMLElement).focus();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-sm px-6 py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO CHAMATIVA INDIQUE E GANHE COM REGRAS CLARAS */}
      <section id="indique-ganhe" className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-br from-zinc-950 via-emerald-950 to-zinc-950 rounded-3xl p-8 sm:p-12 border-2 border-emerald-500/60 shadow-2xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Topo Chamativo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
              <div>
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-emerald-400 text-zinc-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md mb-3">
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  Programa Indique & Ganhe no Pix
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Ganhe <span className="text-emerald-400">R$ 10,00</span> por amigo indicado!
                </h2>
                <p className="text-zinc-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                  Ajude outros condutores a recorrerem de multas de trânsito por apenas <strong className="text-white">R$ 30,00</strong> e receba <strong className="text-emerald-400">R$ 10,00 líquido no seu Pix</strong> a cada recurso contratado.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link
                  href="/afiliados"
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black text-base px-8 py-4.5 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
                >
                  <DollarSign className="w-5 h-5 text-zinc-950" />
                  Quero Indicar e Ganhar R$ 10 no Pix
                </Link>
              </div>
            </div>

            {/* Regras Claras e Transparentes da Promoção */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
                <Info className="w-4 h-4" />
                <span>Regras Oficiais de Como Funciona a Indicação:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">
                    1
                  </span>
                  <h4 className="font-black text-white text-sm mb-1">Cadastre sua Chave Pix</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Crie sua conta gratuita em 1 minuto e cadastre o Pix onde receberá suas comissões.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs">
                  <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-black text-sm flex items-center justify-center mb-3">
                    2
                  </span>
                  <h4 className="font-black text-white text-sm mb-1">Compartilhe seu Link</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Envie seu link exclusivo para amigos, motoristas de app e grupos no WhatsApp.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center mb-3">
                    3
                  </span>
                  <h4 className="font-black text-white text-sm mb-1">Recurso por R$ 30,00</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Seu amigo contrata a defesa técnica completa personalizada pelo valor acessível de R$ 30,00.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs">
                  <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center mb-3">
                    4
                  </span>
                  <h4 className="font-black text-white text-sm mb-1">R$ 10,00 no seu Pix</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Com a confirmação do pagamento, R$ 10,00 são liberados direto no seu Pix cadastrado!
                  </p>
                </div>
              </div>

              {/* Detalhes de conformidade e sem limite */}
              <div className="p-4.5 rounded-2xl bg-white/5 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>Sem limite de ganhos:</strong> Indique 10 amigos = R$ 100 | 50 amigos = R$ 500 | 100 amigos = R$ 1.000 no Pix!
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  *Comissão válida 1 vez por novo cliente indicado após a confirmação do pagamento.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção "O que está incluído" - Bold & Big */}
      <section id="como-funciona" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2 inline-block">
            Metodologia Eficiente
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            O que está incluído no serviço
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1.5 max-w-lg mx-auto">
            Atendimento técnico especializado focado exclusivamente na confecção rigorosa da sua peça de defesa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-200/90 executive-shadow text-center flex flex-col items-center hover:border-zinc-400 transition">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center mb-6 shadow-xs">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-zinc-950 mb-2">
              Recurso Personalizado
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-medium">
              Preparado de acordo com a infração específica, resoluções vigentes do CONTRAN e jurisprudência pacificada do Código de Trânsito.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-200/90 executive-shadow text-center flex flex-col items-center hover:border-zinc-400 transition">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 shadow-xs">
              <Scale className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-zinc-950 mb-2">
              Revisão Técnica Especializada
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-medium">
              Análise criteriosa dos autos, verificação do prazo decadencial de 30 dias e consistência dos dados do agente antes da liberação ao cliente.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-200/90 executive-shadow text-center flex flex-col items-center hover:border-zinc-400 transition">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-xs">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-zinc-950 mb-2">
              Entrega em PDF e Word
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-medium">
              Documento formal pronto para imprimir, assinar e anexar aos seus documentos para protocolo no órgão autuador.
            </p>
          </div>
        </div>
      </section>

      {/* Seção de Dúvidas Frequentes (FAQ) - Bold & Big */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 mb-2.5 inline-block">
            Esclarecimentos Frequentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
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
              a: "Não. O Código de Trânsito Brasileiro garante expressamente a todo cidadão o direito de apresentar a sua própria defesa e recurso administrativo perante o órgão sem a necessidade de constituir advogado.",
            },
            {
              q: "E se o prazo da notificação já tiver expirado?",
              a: "Nosso sistema calcula a data limite na hora. Se o prazo tiver passado, é possível apresentar o recurso fundamentando a ausência de notificação no prazo legal de 30 dias (Art. 281 do CTB / Súmula 312 do STJ) ou vícios materiais do auto.",
            },
            {
              q: "Como recebo o recurso após o pagamento?",
              a: "Após a confirmação do pagamento de R$ 30,00, nossa equipe técnica elabora e revisa sua peça. Assim que liberada, o documento completo em PDF e Word (.docx) fica disponível imediatamente para download no seu painel.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-7 executive-shadow transition hover:border-zinc-300"
            >
              <h4 className="font-black text-zinc-950 text-base sm:text-lg mb-2 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-zinc-950 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                  ?
                </span>
                {item.q}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed pl-9 font-medium">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Botão Flutuante do WhatsApp com Mascote Samuca Oficial */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
        <div className="hidden sm:flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-zinc-950/95 backdrop-blur-md text-white py-2.5 px-4 rounded-2xl shadow-2xl border border-zinc-800 pointer-events-none transform translate-y-1 group-hover:translate-y-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-left">
            <p className="text-xs font-black text-white leading-none">Fale com o Samuca</p>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Consultor de trânsito no WhatsApp</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openWhatsapp()}
          aria-label="Atendimento com Samuca no WhatsApp"
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative group"
        >
          <img
            src="/samuca.png"
            alt="Samuca"
            className="w-16 h-16 rounded-full border-2 border-emerald-500 shadow-xl object-cover bg-white"
          />
          <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
            <WhatsAppIcon className="w-3 h-3 text-white" />
          </span>
        </button>
      </div>

      {/* Footer Elegante Bold & Big */}
      <footer id="contato" className="mt-auto bg-zinc-950 text-zinc-400 py-12 px-4 sm:px-8 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 leading-none">
                Recursos de Trânsito
              </span>
              <span className="text-xl font-black text-white tracking-tight leading-none mt-1">
                auto<span className="text-blue-500">recurso</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 text-center sm:text-left leading-relaxed">
            AutoRecurso &copy; {new Date().getFullYear()} — Plataforma de Elaboração Técnica de Recursos de Trânsito.
            <br />
            Este sistema elabora a peça fundamentada. O protocolo final no órgão autuador cabe ao cidadão.
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
            <Link
              href="/afiliados"
              className="text-emerald-400 hover:underline font-bold transition flex items-center gap-1"
            >
              💰 Indique e Ganhe R$ 10
            </Link>
            <button
              onClick={() => openWhatsapp()}
              className="hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp
            </button>
            <Link href="/login" className="hover:text-white transition">
              Acesso Restrito
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
