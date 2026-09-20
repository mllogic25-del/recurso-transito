"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Coins,
  Share2,
  QrCode,
  DollarSign,
  TrendingUp,
  FileText,
  AlertTriangle,
  Flame,
  Zap,
} from "lucide-react";

export default function AutoRecursoLandingPage() {
  const router = useRouter();
  const [placa, setPlaca] = useState("");
  const [numeroAIT, setNumeroAIT] = useState("");
  const [orgao, setOrgao] = useState("DETRAN");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5579998340176";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Gostaria de uma análise técnica para recorrer da minha multa de trânsito."
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlaca = placa.trim().toUpperCase();
    if (!cleanPlaca) {
      const el = document.getElementById("input-placa");
      el?.focus();
      return;
    }
    const params = new URLSearchParams({
      placa: cleanPlaca,
      ait: numeroAIT.trim().toUpperCase(),
      orgao,
    });
    router.push(`/cliente/novo?${params.toString()}`);
  };

  const faqs = [
    {
      pergunta: "O que é o número do Auto de Infração (AIT)?",
      resposta:
        "É o identificador único da sua autuação, impresso no cabeçalho ou na lateral superior da Notificação de Autuação enviada pelo Detran, PRF, DNIT ou órgão de trânsito municipal.",
    },
    {
      pergunta: "Preciso de constituir advogado para protocolar a defesa?",
      resposta:
        "Não. O Código de Trânsito Brasileiro assegura formalmente a qualquer cidadão o direito de interpor a sua própria defesa prévia e recursos perante a JARI e o CETRAN sem intermédio de advogado.",
    },
    {
      pergunta: "Qual o formato do documento que irei receber?",
      resposta:
        "O documento é disponibilizado imediatamente em formato PDF (pronto para imprimir e assinar) e Word editável (.docx), acompanhado das orientações passo a passo para envio presencial ou eletrônico.",
    },
    {
      pergunta: "E se o prazo da notificação já tiver expirado?",
      resposta:
        "Se o prazo tiver sido ultrapassado por falta de envio ou falha de entrega pelo órgão, o sistema estrutura a tese preliminar de decadência ou nulidade por inobservância do Artigo 281 do CTB e Súmula 312 do STJ.",
    },
  ];

  const infracoes = [
    {
      titulo: "Excesso de Velocidade",
      artigo: "Art. 218 do CTB",
      badgeColor: "bg-amber-400 text-slate-950 border-amber-300 font-black",
      cardBorder: "hover:border-amber-400 hover:shadow-amber-400/20",
      accentDot: "bg-amber-400 shadow-sm shadow-amber-400",
      desc: "Aferição periódica do radar pelo Inmetro (validade de 12 meses), margem de tolerância obrigatória e prazo legal de 30 dias para notificação.",
    },
    {
      titulo: "Lei Seca / Bafômetro",
      artigo: "Art. 165 e 165-A do CTB",
      badgeColor: "bg-rose-500 text-white border-rose-400 font-black",
      cardBorder: "hover:border-rose-400 hover:shadow-rose-400/20",
      accentDot: "bg-rose-400 shadow-sm shadow-rose-400",
      desc: "Nulidades em autos sem descrição objetiva de sinais psicomotores, irregularidades formais no termo de constatação e calibração anual do etilômetro.",
    },
    {
      titulo: "Sinal Vermelho / Radar",
      artigo: "Art. 208 do CTB",
      badgeColor: "bg-red-500 text-white border-red-400 font-black",
      cardBorder: "hover:border-red-400 hover:shadow-red-400/20",
      accentDot: "bg-red-400 shadow-sm shadow-red-400",
      desc: "Falta de sequência de fotos nítidas do veículo cruzando a linha de retenção, ausência de homologação e problemas de tempo no amarelo.",
    },
    {
      titulo: "Uso de Celular ao Volante",
      artigo: "Art. 252 do CTB",
      badgeColor: "bg-cyan-400 text-slate-950 border-cyan-300 font-black",
      cardBorder: "hover:border-cyan-400 hover:shadow-cyan-400/20",
      accentDot: "bg-cyan-400 shadow-sm shadow-cyan-400",
      desc: "Inviabilidade visual evidente do agente em patrulhamento, ausência de abordagem justificada e ausência de elementos fáticos no auto.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070D1F] text-slate-100 font-sans antialiased selection:bg-[#E0B253] selection:text-[#0B132B] relative overflow-x-hidden">
      {/* Luzes Ambientais de Fundo (Glow Multicolorido) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[800px] left-10 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[1400px] right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      {/* 1. TOPO INSTITUCIONAL COM DEGRADÊ REFINADO */}
      <aside className="bg-gradient-to-r from-[#060B18] via-[#0D1B3E] to-[#060B18] border-b border-blue-900/40 px-6 py-2.5 text-center text-xs text-slate-300 shadow-sm relative z-10">
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Plataforma 100% Online
          </span>
          <span>
            <strong className="text-amber-300">Aviso Legal:</strong> Elaboramos peças técnicas fundamentadas. O
            protocolo administrativo é efetuado pelo condutor perante o órgão autuador.
          </span>
        </p>
      </aside>

      {/* 2. CABEÇALHO (NAVBAR) REFINADO E BEM DISTRIBUÍDO */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070D1F]/95 border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all shadow-xl shadow-black/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo / Marca */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-xl blur-xs opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <img
                src="/logo-icon.png"
                alt="AutoRecurso"
                className="relative w-11 h-11 rounded-lg border border-amber-400/50 shadow-md object-cover bg-[#0F172A] group-hover:scale-105 transition duration-200"
              />
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-xl font-black tracking-tight text-white uppercase leading-none">
                Auto<span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Recurso</span>
              </span>
              <span className="text-[10px] tracking-[0.2em] text-emerald-400 uppercase font-bold mt-1 leading-none">
                Defesas &amp; Recursos de Trânsito
              </span>
            </div>
          </Link>

          {/* Links Centrais Limpos e Espaçados */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <a
              href="#como-funciona"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Como Funciona
            </a>
            <a
              href="#servicos"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Infrações
            </a>
            <a
              href="#incluso"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              O Que Inclui
            </a>
            <a
              href="#faq"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Dúvidas
            </a>
          </nav>

          {/* Ações / Botões no Topo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Botão Único e Chamativo Indique e Ganhe R$ 10 */}
            <Link
              href="/afiliados"
              className="text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 border border-emerald-300/60 flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <Coins className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Indique &amp; Ganhe R$ 10</span>
            </Link>

            <Link
              href="/login"
              className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white px-2.5 py-2 transition whitespace-nowrap"
            >
              Entrar
            </Link>

            <a
              href="#iniciar"
              className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-400/20 hover:scale-105 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              Gerar Defesa
            </a>
          </div>
        </div>
      </header>

      {/* 3. SECÇÃO HERO MULTICOLORIDA & IMPACTANTE */}
      <section className="relative px-6 pt-12 pb-16 max-w-6xl mx-auto grid md:grid-cols-12 gap-10 items-center z-10">
        <div className="md:col-span-7 space-y-6">
          {/* Badge Chamativo */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-400/40 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-blue-950/80 text-emerald-300 text-xs font-bold tracking-wide shadow-md shadow-emerald-900/30">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            Conformidade Integral com o CTB &amp; CONTRAN
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.15] text-white">
            Defenda os seus direitos com fundamentação jurídica de{" "}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-sm">
              alto nível
            </span>
            .
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
            Crie defesas prévias e recursos administrativos personalizados contra multas do{" "}
            <strong className="text-white">DETRAN, PRF, DNIT e prefeituras</strong>. Peça técnica pronta em PDF e Word
            feita sob medida para o seu caso.
          </p>

          {/* Destaques com Alto Contraste Límpido */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sem advogado necessário
            </span>
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white shadow-md">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Formatos PDF e Word (.docx)
            </span>
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/25">
              <CheckCircle2 className="w-4 h-4 text-slate-950" /> Elaboração em minutos
            </span>
          </div>
        </div>

        {/* FORMULÁRIO DE ENTRADA COM BORDA E BRILHO DOURADO */}
        <div
          id="iniciar"
          className="md:col-span-5 relative group bg-gradient-to-b from-[#111C38] to-[#0A1128] border-2 border-amber-400/40 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/80 scroll-mt-28"
        >
          {/* Brilho de fundo no card */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="mb-6 pb-4 border-b border-slate-700/60 flex justify-between items-end">
            <div>
              <span className="text-amber-400 text-[10px] uppercase tracking-widest font-black block mb-1">
                Elaboração Completa &amp; Técnica
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
                  R$ 30,00
                </span>
                <span className="text-xs font-semibold text-slate-400">/ taxa única</span>
              </div>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 text-emerald-400" /> Entrega Digital
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5 uppercase tracking-wide">
                Placa do Veículo
              </label>
              <input
                id="input-placa"
                type="text"
                maxLength={8}
                placeholder="Ex.: ABC-1234 ou ABC1D23"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                required
                className="w-full bg-[#060B18] border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none text-sm uppercase tracking-wider transition font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5 uppercase tracking-wide">
                Número do Auto de Infração (AIT)
              </label>
              <input
                type="text"
                placeholder="Código impresso na notificação"
                value={numeroAIT}
                onChange={(e) => setNumeroAIT(e.target.value.toUpperCase())}
                className="w-full bg-[#060B18] border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none text-sm uppercase tracking-wider transition font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5 uppercase tracking-wide">
                Órgão Autuador
              </label>
              <select
                value={orgao}
                onChange={(e) => setOrgao(e.target.value)}
                className="w-full bg-[#060B18] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition font-medium cursor-pointer"
              >
                <option value="DETRAN">DETRAN (Estadual)</option>
                <option value="PRF">PRF (Polícia Rodoviária Federal)</option>
                <option value="DNIT">DNIT</option>
                <option value="PREFEITURA">Prefeitura / Trânsito Municipal</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 transition duration-200 cursor-pointer flex items-center justify-center gap-2 transform hover:scale-[1.02]"
            >
              <span>Confeccionar Minha Defesa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* 4. MEGA PAINEL CHAMATIVO: INDIQUE & GANHE R$ 10,00 NO PIX (SHOWSTOPPER) */}
      <section id="indique-ganhe" className="py-12 px-6 max-w-6xl mx-auto scroll-mt-24 relative z-20">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border-2 border-emerald-400/50 bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 shadow-[0_0_50px_-10px_rgba(16,185,129,0.35)]">
          {/* Efeitos de iluminação interna */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header do Painel */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-emerald-500/30">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider mb-3 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  PROGRAMA DE AFILIADOS EXCLUSIVO
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  Indique e Ganhe{" "}
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent underline decoration-emerald-400/60 decoration-wavy">
                    R$ 10,00 no PIX
                  </span>{" "}
                  por indicação!
                </h2>
                <p className="text-slate-200 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                  Conhece amigos, familiares ou motoristas de aplicativo com multas? Compartilhe seu link exclusivo. A
                  cada defesa gerada (R$ 30), <strong className="text-emerald-300">você recebe R$ 10,00 no Pix</strong>.
                  Sem limite de indicações!
                </p>
              </div>

              {/* Card de Simulação Rápida */}
              <div className="bg-[#070D1F]/80 backdrop-blur-md border border-emerald-400/30 rounded-2xl p-5 shrink-0 w-full lg:w-auto shadow-lg text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Exemplo de Lucro
                </span>
                <div className="flex items-center justify-center gap-3 text-emerald-300 font-black">
                  <div className="bg-emerald-950/80 px-3.5 py-2 rounded-xl border border-emerald-500/40">
                    <span className="text-xs block text-slate-400">10 Amigos</span>
                    <span className="text-lg text-amber-300">R$ 100 Pix</span>
                  </div>
                  <div className="bg-emerald-950/80 px-3.5 py-2 rounded-xl border border-emerald-500/40">
                    <span className="text-xs block text-slate-400">50 Amigos</span>
                    <span className="text-lg text-emerald-300">R$ 500 Pix</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Passos Rápidos com Cores Vivas */}
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="bg-[#070D1F]/70 border border-blue-500/30 hover:border-blue-400/60 rounded-2xl p-6 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-black text-xl mb-4 border border-blue-500/30 group-hover:scale-110 transition">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">Passo 1</span>
                <h3 className="text-base font-bold text-white mb-2">Pegue seu Link Único</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cadastre sua chave Pix em 30 segundos no painel de afiliados e receba seu link exclusivo.
                </p>
              </div>

              <div className="bg-[#070D1F]/70 border border-purple-500/30 hover:border-purple-400/60 rounded-2xl p-6 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-xl mb-4 border border-purple-500/30 group-hover:scale-110 transition">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">Passo 2</span>
                <h3 className="text-base font-bold text-white mb-2">Compartilhe no WhatsApp</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Envie para amigos, grupos de motoristas, táxi, Uber ou redes sociais com um toque.
                </p>
              </div>

              <div className="bg-[#070D1F]/70 border border-emerald-500/40 hover:border-emerald-400/70 rounded-2xl p-6 transition-all duration-300 group shadow-md shadow-emerald-950">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-xl mb-4 border border-emerald-500/40 group-hover:scale-110 transition">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Passo 3</span>
                <h3 className="text-base font-bold text-white mb-2">Receba R$ 10 no Pix</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A cada cliente que contratar o recurso, R$ 10,00 caem diretamente na sua chave Pix!
                </p>
              </div>
            </div>

            {/* Chamada para Ação Vibrante */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Sem taxa de adesão • 100% gratuito • Acesso instantâneo</span>
              </div>

              <Link
                href="/afiliados"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-slate-950 hover:from-emerald-300 hover:to-amber-200 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-400/50 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Quero Começar a Indicar e Lucrar Agora</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. METODOLOGIA / COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 border-t border-slate-800/80 bg-[#070D1F]/70 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Passo a Passo</span>
            <h2 className="text-3xl font-black text-white mt-2">Como confeccionamos o seu recurso</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-b from-[#111B35] to-[#0A1128] border border-blue-500/30 hover:border-blue-400/60 rounded-2xl p-7 transition shadow-lg">
              <span className="text-3xl font-black text-blue-400 font-mono">01</span>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Análise das Nulidades</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Identificação de vícios formais do Auto de Infração de Trânsito (AIT), prazos decadenciais e
                incongruências de preenchimento.
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#111B35] to-[#0A1128] border border-purple-500/30 hover:border-purple-400/60 rounded-2xl p-7 transition shadow-lg">
              <span className="text-3xl font-black text-purple-400 font-mono">02</span>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Fundamentação Legal</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Estruturação de argumentos com base estrita no Código de Trânsito Brasileiro, deliberações do CONTRAN e
                jurisprudência dos tribunais.
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#111B35] to-[#0A1128] border border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl p-7 transition shadow-lg">
              <span className="text-3xl font-black text-emerald-400 font-mono">03</span>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Emissão e Assinatura</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Receba a minuta completa formatada nos padrões das câmaras recursais, pronta para ser assinada e
                protocolada pelo condutor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INFRAÇÕES MAIS RECORRIDAS */}
      <section id="servicos" className="py-20 px-6 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Ampla Cobertura</span>
          <h2 className="text-3xl font-black text-white mt-2">Principais Infrações Defendidas</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {infracoes.map((item, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-b from-[#101932] to-[#080E20] border border-slate-800 ${item.cardBorder} p-6 rounded-2xl transition-all duration-200 shadow-md`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border inline-block mb-3 ${item.badgeColor}`}>
                {item.artigo}
              </span>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.accentDot}`}></span>
                {item.titulo}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. O QUE ESTÁ INCLUÍDO */}
      <section id="incluso" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-800/80 scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Garantia Técnica</span>
          <h2 className="text-3xl font-black text-white mt-2">O que você recebe na sua defesa</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-7 rounded-2xl bg-gradient-to-b from-[#101932] to-[#080E20] border border-amber-500/30 shadow-lg">
            <h4 className="text-base font-bold text-amber-300 mb-2">Tese Personalizada</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Peça elaborada especificamente para as particularidades do seu auto, sem modelos genéricos.
            </p>
          </div>
          <div className="p-7 rounded-2xl bg-gradient-to-b from-[#101932] to-[#080E20] border border-blue-500/30 shadow-lg">
            <h4 className="text-base font-bold text-blue-300 mb-2">Ficheiros PDF &amp; Word</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Liberdade para imprimir a versão definitiva em PDF ou efetuar edições adicionais no Word (.docx).
            </p>
          </div>
          <div className="p-7 rounded-2xl bg-gradient-to-b from-[#101932] to-[#080E20] border border-emerald-500/30 shadow-lg">
            <h4 className="text-base font-bold text-emerald-300 mb-2">Manual de Protocolo</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instruções claras de onde e como submeter a petição perante o Detran, Correios ou portal digital do órgão.
            </p>
          </div>
        </div>
      </section>

      {/* 8. PERGUNTAS FREQUENTES (ACCORDION) */}
      <section id="faq" className="py-20 border-t border-slate-800/80 bg-[#070D1F]/80 px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Perguntas Frequentes</span>
            <h2 className="text-3xl font-black text-white mt-2">Esclarecimentos Legais</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#101932]/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4.5 text-left flex justify-between items-center text-sm font-bold text-white hover:text-amber-300 cursor-pointer transition"
                >
                  <span>{faq.pergunta}</span>
                  <span className="text-amber-400 text-lg font-mono ml-4">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. RODAPÉ INSTITUCIONAL */}
      <footer className="border-t border-slate-800/80 bg-[#050914] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="AutoRecurso" className="w-9 h-9 rounded-lg border border-amber-400/40" />
            <div>
              <span className="text-white font-black tracking-wider uppercase block leading-tight">
                Auto<span className="text-amber-400">Recurso</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Sistemas Tecnológicos para Elaboração de Peças Administrativas de Trânsito.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-slate-300 font-bold">
            <Link href="/fale-conosco" className="hover:text-amber-300 transition">
              Fale Conosco
            </Link>
            <Link href="/afiliados" className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
              💰 Programa de Afiliados (R$ 10)
            </Link>
            <Link href="/login" className="hover:text-amber-300 transition">
              Área do Cliente
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
