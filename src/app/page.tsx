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
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden">
      {/* Luzes Ambientais de Fundo Suaves */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-[450px] h-[450px] bg-emerald-400/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[800px] left-10 w-[550px] h-[550px] bg-amber-400/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[1400px] right-1/4 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* 1. TOPO INSTITUCIONAL */}
      <aside className="bg-slate-900 border-b border-slate-800 px-6 py-2 text-center text-xs text-slate-300 shadow-xs relative z-10">
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

      {/* 2. CABEÇALHO (NAVBAR) BRANCO COM MÁXIMO CONTRASTE */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200/90 px-4 sm:px-8 py-3.5 transition-all shadow-md shadow-slate-200/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo / Marca */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <img
                src="/logo-icon.png"
                alt="AutoRecurso"
                className="w-11 h-11 rounded-xl border border-amber-500/40 shadow-md object-cover bg-slate-950 group-hover:scale-105 transition duration-200"
              />
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none">
                Auto<span className="text-amber-500">Recurso</span>
              </span>
              <span className="text-[10px] tracking-[0.2em] text-emerald-700 uppercase font-bold mt-1 leading-none">
                Defesas &amp; Recursos de Trânsito
              </span>
            </div>
          </Link>

          {/* Links Centrais Limpos e com Alto Contraste */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <a
              href="#como-funciona"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-950 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Como Funciona
            </a>
            <a
              href="#servicos"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-950 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Infrações
            </a>
            <a
              href="#incluso"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-950 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              O Que Inclui
            </a>
            <a
              href="#faq"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-950 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Dúvidas
            </a>
          </nav>

          {/* Ações / Botões no Topo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Botão Chamativo Indique e Ganhe */}
            <Link
              href="/afiliados"
              className="text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 border border-emerald-500/40 flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <Coins className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Indique &amp; Ganhe R$ 10</span>
            </Link>

            <Link
              href="/login"
              className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-950 px-2.5 py-2 transition whitespace-nowrap"
            >
              Entrar
            </Link>

            <a
              href="#iniciar"
              className="px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-400/25 hover:scale-105 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              Gerar Defesa
            </a>
          </div>
        </div>
      </header>

      {/* 3. SECÇÃO HERO DE ALTO CONTRASTE (TEMA CLARO ELEGANTE) */}
      <section className="relative px-6 pt-12 pb-16 max-w-6xl mx-auto grid md:grid-cols-12 gap-10 items-center z-10">
        <div className="md:col-span-7 space-y-6">
          {/* Badge Chamativo */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Conformidade Integral com o CTB &amp; CONTRAN
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.15] text-slate-950">
            Defenda os seus direitos com fundamentação jurídica de{" "}
            <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-xs">
              alto nível
            </span>
            .
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl font-medium">
            Crie defesas prévias e recursos administrativos personalizados contra multas do{" "}
            <strong className="text-slate-950 font-black">DETRAN, PRF, DNIT e prefeituras</strong>. Peça técnica pronta em PDF e Word
            feita sob medida para o seu caso.
          </p>

          {/* Destaques com Alto Contraste Límpido */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-800 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sem advogado necessário
            </span>
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-800 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Formatos PDF e Word (.docx)
            </span>
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-400/25">
              <CheckCircle2 className="w-4 h-4 text-slate-950" /> Elaboração em minutos
            </span>
          </div>
        </div>

        {/* FORMULÁRIO DE ENTRADA COM CARD BRANCO ELEGANTE E BORDA DOURADA */}
        <div
          id="iniciar"
          className="md:col-span-5 relative group bg-white border-2 border-amber-400/80 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-slate-300/70 scroll-mt-28"
        >
          {/* Brilho suave de fundo no card */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-end">
            <div>
              <span className="text-amber-600 text-[10px] uppercase tracking-widest font-black block mb-1">
                Elaboração Completa &amp; Técnica
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-950">
                  R$ 30,00
                </span>
                <span className="text-xs font-semibold text-slate-500">/ taxa única</span>
              </div>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 font-extrabold flex items-center gap-1 shadow-xs">
              <Zap className="w-3 h-3 text-emerald-600" /> Entrega Digital
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
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
                className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 rounded-xl px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none text-sm uppercase tracking-wider transition font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                Número do Auto de Infração (AIT)
              </label>
              <input
                type="text"
                placeholder="Código impresso na notificação"
                value={numeroAIT}
                onChange={(e) => setNumeroAIT(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 rounded-xl px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none text-sm uppercase tracking-wider transition font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                Órgão Autuador
              </label>
              <select
                value={orgao}
                onChange={(e) => setOrgao(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 rounded-xl px-4 py-3 text-slate-950 focus:outline-none text-sm font-semibold transition cursor-pointer"
              >
                <option value="DETRAN">DETRAN (Estadual)</option>
                <option value="PRF">PRF (Polícia Rodoviária Federal)</option>
                <option value="DNIT">DNIT</option>
                <option value="PREFEITURA">Prefeitura / Trânsito Municipal</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-400/30 transition duration-200 cursor-pointer flex items-center justify-center gap-2 transform hover:scale-[1.02]"
            >
              <span>Confeccionar Minha Defesa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* 4. MEGA PAINEL CHAMATIVO: INDIQUE & GANHE R$ 10,00 NO PIX (SHOWSTOPPER CLARO) */}
      <section id="indique-ganhe" className="py-12 px-6 max-w-6xl mx-auto scroll-mt-24 relative z-20">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border-2 border-emerald-500/60 bg-gradient-to-br from-white via-emerald-50/70 to-teal-50 shadow-2xl shadow-emerald-900/10">
          {/* Efeitos de iluminação interna suave */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header do Painel */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-emerald-200/80">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-black tracking-wider mb-3 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  PROGRAMA DE AFILIADOS EXCLUSIVO
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 leading-tight">
                  Indique e Ganhe{" "}
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent underline decoration-emerald-400 decoration-wavy">
                    R$ 10,00 no PIX
                  </span>{" "}
                  por indicação!
                </h2>
                <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed font-medium">
                  Conhece amigos, familiares ou motoristas de aplicativo com multas? Compartilhe seu link exclusivo. A
                  cada defesa gerada (R$ 30), <strong className="text-emerald-700 font-black">você recebe R$ 10,00 no Pix</strong>.
                  Sem limite de indicações!
                </p>
              </div>

              {/* Card de Simulação Rápida */}
              <div className="bg-white/95 backdrop-blur-md border border-emerald-300 rounded-2xl p-5 shrink-0 w-full lg:w-auto shadow-md text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Exemplo de Lucro
                </span>
                <div className="flex items-center justify-center gap-3 font-black">
                  <div className="bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200">
                    <span className="text-xs block text-slate-500 font-semibold">10 Amigos</span>
                    <span className="text-lg text-amber-600 font-black">R$ 100 Pix</span>
                  </div>
                  <div className="bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200">
                    <span className="text-xs block text-slate-500 font-semibold">50 Amigos</span>
                    <span className="text-lg text-emerald-700 font-black">R$ 500 Pix</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Passos Rápidos com Cores Vivas */}
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="bg-white/90 border border-blue-200 hover:border-blue-400 rounded-2xl p-6 transition-all duration-300 group shadow-sm hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl mb-4 border border-blue-200 group-hover:scale-110 transition">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Passo 1</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">Pegue seu Link Único</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cadastre sua chave Pix em 30 segundos no painel de afiliados e receba seu link exclusivo.
                </p>
              </div>

              <div className="bg-white/90 border border-purple-200 hover:border-purple-400 rounded-2xl p-6 transition-all duration-300 group shadow-sm hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl mb-4 border border-purple-200 group-hover:scale-110 transition">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">Passo 2</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">Compartilhe no WhatsApp</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Envie para amigos, grupos de motoristas, táxi, Uber ou redes sociais com um toque.
                </p>
              </div>

              <div className="bg-white/90 border border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 group shadow-sm hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl mb-4 border border-emerald-200 group-hover:scale-110 transition">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">Passo 3</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">Receba R$ 10 no Pix</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A cada cliente que contratar o recurso, R$ 10,00 caem diretamente na sua chave Pix!
                </p>
              </div>
            </div>

            {/* Chamada para Ação Vibrante */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Sem taxa de adesão • 100% gratuito • Acesso instantâneo</span>
              </div>

              <Link
                href="/afiliados"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-600/25 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Quero Começar a Indicar e Lucrar Agora</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. METODOLOGIA / COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 border-t border-slate-200 bg-white px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-amber-600 text-xs font-black uppercase tracking-widest">Passo a Passo</span>
            <h2 className="text-3xl font-black text-slate-950 mt-2">Como confeccionamos o seu recurso</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-2xl p-7 transition">
              <span className="text-3xl font-black text-blue-600 font-mono">01</span>
              <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">Análise das Nulidades</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Identificação de vícios formais do Auto de Infração de Trânsito (AIT), prazos decadenciais e
                incongruências de preenchimento.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 hover:border-purple-400 hover:shadow-md rounded-2xl p-7 transition">
              <span className="text-3xl font-black text-purple-600 font-mono">02</span>
              <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">Fundamentação Legal</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Estruturação de argumentos com base estrita no Código de Trânsito Brasileiro, deliberações do CONTRAN e
                jurisprudência dos tribunais.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:shadow-md rounded-2xl p-7 transition">
              <span className="text-3xl font-black text-emerald-600 font-mono">03</span>
              <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">Emissão e Assinatura</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
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
          <span className="text-emerald-700 text-xs font-black uppercase tracking-widest">Ampla Cobertura</span>
          <h2 className="text-3xl font-black text-slate-950 mt-2">Principais Infrações Defendidas</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {infracoes.map((item, idx) => (
            <div
              key={idx}
              className={`bg-white border border-slate-200 hover:shadow-lg ${item.cardBorder} p-6 rounded-2xl transition-all duration-200 shadow-xs`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border inline-block mb-3 ${item.badgeColor}`}>
                {item.artigo}
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.accentDot}`}></span>
                {item.titulo}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. O QUE ESTÁ INCLUÍDO */}
      <section id="incluso" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-200 scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-amber-600 text-xs font-black uppercase tracking-widest">Garantia Técnica</span>
          <h2 className="text-3xl font-black text-slate-950 mt-2">O que você recebe na sua defesa</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition shadow-xs">
            <h4 className="text-base font-bold text-amber-700 mb-2">Tese Personalizada</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Peça elaborada especificamente para as particularidades do seu auto, sem modelos genéricos.
            </p>
          </div>
          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition shadow-xs">
            <h4 className="text-base font-bold text-blue-700 mb-2">Ficheiros PDF &amp; Word</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Liberdade para imprimir a versão definitiva em PDF ou efetuar edições adicionais no Word (.docx).
            </p>
          </div>
          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition shadow-xs">
            <h4 className="text-base font-bold text-emerald-700 mb-2">Manual de Protocolo</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instruções claras de onde e como submeter a petição perante o Detran, Correios ou portal digital do órgão.
            </p>
          </div>
        </div>
      </section>

      {/* 8. PERGUNTAS FREQUENTES (ACCORDION) */}
      <section id="faq" className="py-20 border-t border-slate-200 bg-white px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-amber-600 text-xs font-black uppercase tracking-widest">Perguntas Frequentes</span>
            <h2 className="text-3xl font-black text-slate-950 mt-2">Esclarecimentos Legais</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden transition shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4.5 text-left flex justify-between items-center text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition"
                >
                  <span>{faq.pergunta}</span>
                  <span className="text-amber-600 text-lg font-mono ml-4">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/80 pt-3">
                    {faq.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. RODAPÉ INSTITUCIONAL */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-6">
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
