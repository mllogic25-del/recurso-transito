"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import {
  AlertTriangle,
  CheckCircle2,
  Send,
  ShieldAlert,
} from "lucide-react";

export default function FaleConoscoPage() {
  // Formulário removido em favor do WhatsApp direto

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Banner Central de Esclarecimento de Escopo (Destaque Principal) */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 executive-shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500 text-white rounded-2xl flex-shrink-0 shadow-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
                Aviso Legal & Termo de Atuação
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
                Como funciona o serviço do AutoRecurso?
              </h1>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                Nosso sistema é uma plataforma especializada na <strong>elaboração técnica e fundamentação jurídica</strong> de peças de defesa de trânsito (Defesa Prévia, Recurso JARI e CETRAN), com base na Lei Federal nº 9.503/1997 (CTB) e Resoluções vigentes do CONTRAN.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-4 bg-white rounded-2xl border border-amber-200 text-slate-800 space-y-1.5 shadow-xs">
                  <p className="font-bold text-emerald-700 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> O que nós fazemos:
                  </p>
                  <p className="text-slate-600">
                    Redigimos e estruturamos a sua defesa técnica personalizada com teses do CTB, gerando o documento formal em PDF e Word (.docx) pronto para impressão e assinatura.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-amber-200 text-slate-800 space-y-1.5 shadow-xs">
                  <p className="font-bold text-red-700 flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> O que nós NÃO fazemos:
                  </p>
                  <p className="text-slate-600">
                    <strong>NÃO damos entrada (não protocolamos)</strong> no DETRAN, PRF, DNIT ou prefeituras e <strong>NÃO realizamos o acompanhamento processual</strong>. O protocolo e o acompanhamento são realizados diretamente por você.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Passo a Passo das Demais Etapas para o Cliente */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 executive-shadow">
          <div className="mb-8">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2 inline-block">
              Guia Prático
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quais são as próximas etapas após você receber sua defesa?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              O Código de Trânsito Brasileiro garante que você mesmo protocole sem advogado. Siga este roteiro simples:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Imprimir & Assinar
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Baixe o PDF ou Word em seu painel ou e-mail. Imprima e assine na linha indicada, ou utilize a <strong>assinatura digital gratuita do Gov.br</strong>.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Juntar Documentos
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anexe cópias simples da sua CNH, cópia do documento do carro (CRLV) e cópia da Notificação de Autuação da multa.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Protocolar no Órgão
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Envie pelo portal online do DETRAN/Senatran, ou envie por Correios com AR (Aviso de Recebimento), ou entregue no balcão presencial de atendimento do órgão.
              </p>
            </div>
          </div>
        </div>

        {/* Contato via WhatsApp */}
        <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 executive-shadow text-center">
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Ficou com alguma dúvida?
            </h3>
            <p className="text-sm text-slate-500 mb-8 max-w-lg mx-auto">
              Nossa equipe de atendimento está disponível para tirar todas as suas dúvidas sobre o serviço. Chame-nos no WhatsApp!
            </p>

            <a
              href="https://wa.me/5579998340176"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-4 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-base transition shadow-lg shadow-emerald-500/25"
            >
              <Send className="w-5 h-5" />
              Falar no WhatsApp
            </a>
          </div>
      </main>
    </div>
  );
}
