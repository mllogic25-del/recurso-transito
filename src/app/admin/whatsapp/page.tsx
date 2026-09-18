"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  MessageSquare,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Smartphone,
  Shield,
  Bot,
} from "lucide-react";

export default function AdminWhatsAppPage() {
  const [statusData, setStatusData] = useState<{
    status: string;
    qr: string | null;
    updatedAt?: string;
  }>({ status: "LOADING", qr: null });
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (err) {
      console.error("Erro ao buscar status do WhatsApp:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Atualiza automaticamente a cada 3 segundos enquanto não estiver conectado
    const interval = setInterval(() => {
      fetchStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = statusData.status === "CONNECTED";
  const isQrReady = statusData.status === "QR_READY" && statusData.qr;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/dashboard"
                className="text-slate-500 hover:text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Painel
              </Link>
            </div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Bot className="w-7 h-7 text-emerald-600" />
              Atendente Virtual Samuca (WhatsApp)
            </h1>
            <p className="text-slate-500 text-sm">
              Gerencie a conexão e o status do assistente de inteligência artificial
            </p>
          </div>

          <button
            onClick={fetchStatus}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar Status
          </button>
        </div>

        {/* Card Principal de Conexão */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          {isConnected ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE E ATENDENDO
              </span>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                O Samuca está conectado no WhatsApp!
              </h2>
              <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                Todas as mensagens, fotos de multas e comprovantes enviados pelos clientes estão sendo respondidos e processados automaticamente pela Inteligência Artificial.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-xs text-slate-500 flex items-center justify-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                Conexão ativa e sincronizada 24h na nuvem
              </div>
            </div>
          ) : isQrReady ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
              <div className="space-y-4 max-w-md">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <QrCode className="w-3.5 h-3.5" /> AGUARDANDO ESCANEAMENTO
                </span>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  Escaneie o QR Code com o WhatsApp do Samuca
                </h2>
                <ol className="space-y-2.5 text-sm text-slate-600 list-decimal list-inside font-medium">
                  <li>Abra o WhatsApp no seu celular</li>
                  <li>Toque em <strong className="text-slate-800">⋮ (Menu)</strong> ou <strong className="text-slate-800">Configurações</strong></li>
                  <li>Selecione <strong className="text-slate-800">Aparelhos conectados</strong></li>
                  <li>Toque em <strong className="text-slate-800">Conectar um aparelho</strong></li>
                  <li>Aponte a câmera para o QR Code ao lado</li>
                </ol>
                <p className="text-xs text-slate-400">
                  O código atualiza sozinho automaticamente. Aponte a câmera e aguarde 2 segundos.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center">
                <img
                  src={statusData.qr!}
                  alt="QR Code WhatsApp Samuca"
                  className="w-64 h-64 rounded-2xl shadow-md bg-white p-2"
                />
                <span className="text-[11px] font-bold text-slate-400 mt-3 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando em tempo real
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Iniciando Serviço do WhatsApp...
              </h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">
                Aguardando o serviço gerar o QR Code de conexão. Isso leva apenas alguns instantes.
              </p>
              <button
                onClick={fetchStatus}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Verificar Agora
              </button>
            </div>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" /> Sessão Segura
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              A conexão é feita diretamente com a criptografia de ponta a ponta do WhatsApp Web.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> Respostas Inteligentes
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              O Samuca responde dúvidas sobre CNH, multas de trânsito, lê fotos de notificações e direciona para o pagamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
