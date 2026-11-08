"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  LogIn,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Lock,
  Bot,
  FileText,
  Clock,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciais inválidas. Verifique seu e-mail e senha.");
        setLoading(false);
        return;
      }

      // Login efetuado: direciona imediatamente para o Painel Administrativo
      router.push("/admin/dashboard");
    } catch {
      setError("Erro de conexão ao servidor. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 relative">
      {/* Luzes de ambientação corporativa escura */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-12 relative z-10">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Coluna Esquerda - Apresentação Corporativa do Sistema */}
          <div className="lg:col-span-5 bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between shadow-2xl border border-slate-700/80 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3.5 mb-6">
                <img
                  src="/logo-icon.png"
                  alt="AutoRecurso"
                  className="w-12 h-12 rounded-xl border border-amber-400/50 shadow-md object-cover bg-slate-950 flex-shrink-0"
                />
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-2xl font-black tracking-tight text-white uppercase leading-none">
                    Auto<span className="text-amber-400">Recurso</span>
                  </span>
                  <span className="text-[10px] tracking-[0.2em] text-emerald-400 uppercase font-bold mt-1 leading-none">
                    Sistema Administrativo
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-[11px] font-bold tracking-wide mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Módulo de Gestão Operacional
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight leading-snug mb-3">
                Painel de Controle e Elaboração de Defesas
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Acesso restrito para administração de atendimentos, conferência de documentos recebidos pelo WhatsApp e controle da fila técnica.
              </p>

              <div className="mt-8 space-y-3 pt-6 border-t border-slate-700/80 text-xs text-slate-200">
                <div className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                  <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-slate-200">Integração WhatsApp &amp; Samuca IA</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-slate-200">Recepção de Notificações, CRLV e CNH</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-semibold text-slate-200">Gestão de Prazos do CTB e JARI</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-700/80 relative z-10 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ambiente Administrativo Seguro</span>
            </div>
          </div>

          {/* Coluna Direita - Formulário de Login Executivo */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-2xl border-2 border-slate-200 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 inline-block">
                  Acesso Restrito
                </span>
                <span className="text-xs text-slate-400 font-semibold">v2.0 Admin</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Entrar no Sistema
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Informe as credenciais de administrador para acessar o painel de gestão.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  E-mail do Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@autorecurso.com.br"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-slate-50 text-slate-950 font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Senha de Acesso
                  </label>
                  <Link
                    href="/recuperar-senha"
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline transition"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-slate-50 text-slate-950 font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-slate-900 hover:to-slate-800 text-white font-black py-4 px-6 rounded-xl shadow-xl shadow-slate-950/20 text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-50 transform hover:scale-[1.01] cursor-pointer border border-slate-800"
              >
                <span>{loading ? "Verificando credenciais..." : "Acessar Painel do Administrador"}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
              AutoRecurso • Todos os direitos reservados. Uso restrito e monitorado.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-bold">
          Carregando portal administrativo...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
