"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      desc: "Verificação da aferição periódica do radar pelo Inmetro (máx. 12 meses), margem de tolerância obrigatória e prazo de expedição.",
    },
    {
      titulo: "Lei Seca / Bafômetro",
      artigo: "Art. 165 e 165-A do CTB",
      desc: "Nulidades em autos sem descrição de sinais psicomotores, irregularidades no termo de constatação e calibração do etilômetro.",
    },
    {
      titulo: "Sinal Vermelho / Radar",
      artigo: "Art. 208 do CTB",
      desc: "Falta de registro fotográfico panorâmico sequencial, ausência da linha de retenção e problemas de temporização semafórica.",
    },
    {
      titulo: "Uso de Celular ao Volante",
      artigo: "Art. 252 do CTB",
      desc: "Inviabilidade visual do agente em movimento, ausência de abordagem justificada e carência de detalhes essenciais no AIT.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 font-sans antialiased selection:bg-[#C5A059] selection:text-[#0B132B]">
      {/* 1. TOPO INSTITUCIONAL / BANNER INFORMATIVO */}
      <aside className="bg-[#070D1F] border-b border-slate-800/80 px-6 py-2.5 text-center text-xs text-slate-400">
        <p>
          <strong className="text-slate-200">Aviso Legal:</strong> Elaboramos peças técnicas fundamentadas. O protocolo
          administrativo é efetuado pelo condutor perante o órgão autuador.
        </p>
      </aside>

      {/* 2. CABEÇALHO (NAVBAR) */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B132B]/90 border-b border-[#C5A059]/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Brasão Oficial Dourado */}
            <img
              src="/logo-icon.png"
              alt="AutoRecurso"
              className="w-10 h-10 rounded-lg border border-[#C5A059]/50 shadow-inner object-cover bg-[#1C2541] group-hover:scale-105 transition duration-200"
            />
            <div>
              <span className="text-lg font-bold tracking-wider text-white uppercase block leading-tight">
                Auto<span className="text-[#E0B253]">Recurso</span>
              </span>
              <span className="text-[9px] tracking-[0.22em] text-[#94A3B8] uppercase block font-medium">
                Defesas &amp; Recursos de Trânsito
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <a href="#como-funciona" className="hover:text-[#E0B253] transition-colors">
              Como Funciona
            </a>
            <a href="#servicos" className="hover:text-[#E0B253] transition-colors">
              Infrações
            </a>
            <a href="#incluso" className="hover:text-[#E0B253] transition-colors">
              O Que Inclui
            </a>
            <a href="#faq" className="hover:text-[#E0B253] transition-colors">
              Dúvidas
            </a>
            <Link
              href="/afiliados"
              className="text-[#E0B253] hover:brightness-125 transition-colors font-bold flex items-center gap-1"
            >
              💰 Indique &amp; Ganhe R$ 10
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white px-3 py-2 transition"
            >
              Entrar
            </Link>
            <a
              href="#iniciar"
              className="px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#E0B253] to-[#C5A059] text-[#0B132B] hover:brightness-110 shadow-lg shadow-[#E0B253]/15 transition duration-200"
            >
              Gerar Defesa
            </a>
          </div>
        </div>
      </header>

      {/* 3. SECÇÃO HERO */}
      <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C5A059]/30 bg-[#1C2541]/70 text-[#E0B253] text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#E0B253] animate-pulse"></span>
            Conformidade Integral com o CTB &amp; CONTRAN
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Defenda os seus direitos com fundamentação jurídica de <span className="text-[#E0B253]">alto nível</span>.
          </h1>

          <p className="text-slate-300 text-base leading-relaxed max-w-xl">
            Crie defesas prévias e recursos administrativos personalizados contra multas do DETRAN, PRF, DNIT e
            municípios. Peça técnica completa em PDF e Word pronta para submissão.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="text-[#E0B253]">✓</span> Sem necessidade de advogado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#E0B253]">✓</span> Formatos PDF e Word (.docx)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#E0B253]">✓</span> Elaboração rápida e segura
            </span>
          </div>
        </div>

        {/* FORMULÁRIO DE ENTRADA */}
        <div
          id="iniciar"
          className="md:col-span-5 bg-[#1C2541]/90 backdrop-blur-md border border-[#C5A059]/30 rounded-xl p-7 shadow-2xl shadow-black/60 scroll-mt-28"
        >
          <div className="mb-6 pb-4 border-b border-slate-700/60 flex justify-between items-end">
            <div>
              <span className="text-[#E0B253] text-[10px] uppercase tracking-widest font-bold block mb-1">
                Elaboração Completa
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">R$ 30,00</span>
                <span className="text-xs text-slate-400">/ taxa única</span>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded bg-[#0B132B] border border-slate-700 text-slate-300 font-semibold">
              Entrega Digital
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wide">
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
                className="w-full bg-[#0B132B] border border-slate-700 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0B253] text-sm uppercase tracking-wider transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wide">
                Número do Auto de Infração (AIT)
              </label>
              <input
                type="text"
                placeholder="Código impresso na notificação"
                value={numeroAIT}
                onChange={(e) => setNumeroAIT(e.target.value.toUpperCase())}
                className="w-full bg-[#0B132B] border border-slate-700 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0B253] text-sm uppercase tracking-wider transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wide">
                Órgão Autuador
              </label>
              <select
                value={orgao}
                onChange={(e) => setOrgao(e.target.value)}
                className="w-full bg-[#0B132B] border border-slate-700 rounded-md px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E0B253] transition"
              >
                <option value="DETRAN">DETRAN (Estadual)</option>
                <option value="PRF">PRF (Polícia Rodoviária Federal)</option>
                <option value="DNIT">DNIT</option>
                <option value="PREFEITURA">Prefeitura / Trânsito Municipal</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 rounded-md font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-[#E0B253] to-[#C5A059] text-[#0B132B] hover:brightness-110 shadow-lg shadow-[#E0B253]/15 transition cursor-pointer"
            >
              Confeccionar Minha Defesa
            </button>
          </form>
        </div>
      </section>

      {/* 4. METODOLOGIA / COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 border-t border-slate-800 bg-[#070D1F]/50 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[#E0B253] text-xs font-bold uppercase tracking-widest">Passo a Passo</span>
            <h2 className="text-3xl font-bold text-white mt-2">Como confeccionamos o seu recurso</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1C2541]/40 border border-slate-800/80 rounded-lg p-7 hover:border-[#C5A059]/40 transition">
              <span className="text-2xl font-bold text-[#E0B253] font-serif">01</span>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Análise das Nulidades</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Identificação de vícios formais do Auto de Infração de Trânsito (AIT), prazos decadenciais e incongruências
                de preenchimento.
              </p>
            </div>

            <div className="bg-[#1C2541]/40 border border-slate-800/80 rounded-lg p-7 hover:border-[#C5A059]/40 transition">
              <span className="text-2xl font-bold text-[#E0B253] font-serif">02</span>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Fundamentação Legal</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Estruturação de argumentos com base estrita no Código de Trânsito Brasileiro, deliberações do CONTRAN e
                jurisprudência dos tribunais.
              </p>
            </div>

            <div className="bg-[#1C2541]/40 border border-slate-800/80 rounded-lg p-7 hover:border-[#C5A059]/40 transition">
              <span className="text-2xl font-bold text-[#E0B253] font-serif">03</span>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Emissão e Assinatura</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receba a minuta completa formatada nos padrões das câmaras recursais, pronta para ser assinada e protocolada
                pelo condutor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INFRAÇÕES MAIS RECORRIDAS */}
      <section id="servicos" className="py-20 px-6 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[#E0B253] text-xs font-bold uppercase tracking-widest">Ampla Cobertura</span>
          <h2 className="text-3xl font-bold text-white mt-2">Principais Infrações Defendidas</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {infracoes.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#1C2541]/30 border border-slate-800 hover:border-[#C5A059]/40 p-6 rounded-lg transition"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E0B253] block mb-1">
                {item.artigo}
              </span>
              <h3 className="text-base font-bold text-white mb-2">{item.titulo}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. O QUE ESTÁ INCLUÍDO */}
      <section id="incluso" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-800 scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[#E0B253] text-xs font-bold uppercase tracking-widest">Garantia Técnica</span>
          <h2 className="text-3xl font-bold text-white mt-2">O que recebe na sua defesa</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg bg-[#1C2541]/30 border border-slate-800">
            <h4 className="text-base font-bold text-white mb-2 text-[#E0B253]">Tese Personalizada</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Peça elaborada especificamente para as particularidades do seu auto, sem modelos genéricos.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-[#1C2541]/30 border border-slate-800">
            <h4 className="text-base font-bold text-white mb-2 text-[#E0B253]">Ficheiros PDF &amp; Word</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Liberdade para imprimir a versão definitiva em PDF ou efetuar edições adicionais no Word (.docx).
            </p>
          </div>
          <div className="p-6 rounded-lg bg-[#1C2541]/30 border border-slate-800">
            <h4 className="text-base font-bold text-white mb-2 text-[#E0B253]">Manual de Protocolo</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instruções claras de onde e como submeter a petição perante o Detran, Correios ou portal digital do órgão.
            </p>
          </div>
        </div>
      </section>

      {/* 7. PERGUNTAS FREQUENTES (ACCORDION) */}
      <section id="faq" className="py-20 border-t border-slate-800 bg-[#070D1F]/60 px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#E0B253] text-xs font-bold uppercase tracking-widest">Perguntas Frequentes</span>
            <h2 className="text-3xl font-bold text-white mt-2">Esclarecimentos Legais</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#1C2541]/60 border border-slate-800 rounded-lg overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center text-sm font-semibold text-white hover:text-[#E0B253] cursor-pointer"
                >
                  <span>{faq.pergunta}</span>
                  <span className="text-[#E0B253] text-lg font-mono ml-4">{openFaq === i ? "−" : "+"}</span>
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

      {/* 8. CANAL DE ATENDIMENTO FLUTUANTE (SUPORTE TÉCNICO WHATSAPP) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 rounded-full bg-[#1C2541] border border-[#C5A059]/50 shadow-2xl text-white hover:border-[#E0B253] transition duration-200 group"
        aria-label="Atendimento no WhatsApp"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">Suporte Técnico</p>
          <p className="text-xs font-medium text-slate-200 group-hover:text-[#E0B253] transition">Dúvidas no WhatsApp</p>
        </div>
      </a>

      {/* 9. RODAPÉ */}
      <footer className="border-t border-slate-800/80 bg-[#060913] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="AutoRecurso" className="w-8 h-8 rounded-md border border-[#C5A059]/30" />
            <div>
              <span className="text-slate-300 font-bold tracking-wider uppercase block leading-tight">
                Auto<span className="text-[#E0B253]">Recurso</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Sistemas Tecnológicos para Elaboração de Peças Administrativas de Trânsito.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <Link href="/fale-conosco" className="hover:text-slate-200 transition">
              Fale Conosco
            </Link>
            <Link href="/afiliados" className="hover:text-[#E0B253] transition text-[#E0B253] font-semibold">
              Programa de Afiliados (R$ 10)
            </Link>
            <Link href="/login" className="hover:text-slate-200 transition">
              Área do Cliente
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
