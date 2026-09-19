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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 relative">
      <Navbar />

      {/* Seção Principal / Hero */}
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

        {/* Subtítulo discreto no topo - Ajustado conforme solicitado */}
        <div className="mb-4">
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-500">
            Recursos Administrativos de Multas de Trânsito
          </p>
        </div>

        {/* Grid com Banner Azul à Esquerda e Card Interativo à Direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card Banner Esquerdo (Azul Vibrante) */}
          <div className="lg:col-span-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-xl shadow-blue-600/15 min-h-[420px]">
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

          {/* Card Formulário Direito com Fluxo Interativo de Convencimento */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 executive-shadow-lg flex flex-col justify-center transition-all duration-300">
            {/* ETAPA 1: DIGITAÇÃO APENAS DA PLACA */}
            {step === "PLATE" && (
              <div>
                <div className="mb-6">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 mb-2 inline-block">
                    Consulta Rápida de Recursos
                  </span>
                  <h2 className="text-2xl font-black text-slate-950">
                    Consulte o recurso da sua multa
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Digite a placa do veículo para verificar as teses e prazos legais cabíveis.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleStartPlate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Placa do Veículo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-base font-mono font-black uppercase tracking-wider focus:border-blue-600 focus:ring-3 focus:ring-blue-100 outline-none transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Aceita placa padrão Mercosul ou modelo tradicional cinza.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-xl shadow-lg shadow-blue-600/25 text-base transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Continuar Análise do Recurso
                    <ArrowRight className="w-5 h-5" />
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
                        <strong>Valor único de apenas R$ 20,00:</strong> Peça completa fundamentada em PDF e Word.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação: WhatsApp ou Gerar Recurso */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleProceedToResource}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-5 rounded-xl shadow-lg shadow-blue-600/20 text-sm transition flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    Prosseguir e Gerar Meu Recurso
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openWhatsapp(
                        `Olá! Gostaria de uma análise para o recurso da placa *${plate}* sobre a infração de *${activeInfractionData.label}*. Como podemos proceder?`
                      )
                    }
                    className="w-full py-3 px-4 rounded-xl border border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
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
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep("PERSUASION")}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao diagnóstico
                  </button>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    Placa: {plate}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {authMode === "REGISTER" ? "Crie seu acesso rápido" : "Entrar no sistema"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {authMode === "REGISTER"
                      ? "Crie seu usuário e senha em segundos para salvar seu recurso e receber a petição pronta."
                      : "Digite seus dados de acesso para continuar."}
                  </p>
                </div>

                {/* Abas Alternar Cadastro / Login */}
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("REGISTER");
                      setAuthError("");
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      authMode === "REGISTER"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
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
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      authMode === "LOGIN"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Já Tenho Conta
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  {authMode === "REGISTER" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Seu Nome Completo *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={authData.name}
                          onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                          placeholder="Ex: Carlos Silva"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Seu E-mail *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={authData.email}
                        onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                        placeholder="seuemail@exemplo.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sua Senha *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={authData.password}
                        onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>

                  {authMode === "REGISTER" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Telefone / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={authData.phone}
                          onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
                          placeholder="(DDD) 99999-9999"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/25 text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                    className="text-xs text-emerald-700 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
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
              Revisão técnica especializada
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Análise criteriosa dos autos, dos prazos legais e dos documentos antes da liberação da peça ao cliente.
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

      {/* Botão Flutuante do WhatsApp */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group">
        <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl pointer-events-none">
          Fale Conosco no WhatsApp
        </div>
        <button
          type="button"
          onClick={() => openWhatsapp()}
          aria-label="Atendimento no WhatsApp"
          className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
        >
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse" />
          <WhatsAppIcon className="w-7 h-7" />
        </button>
      </div>

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
