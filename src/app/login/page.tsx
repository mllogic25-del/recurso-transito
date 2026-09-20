"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { LogIn, AlertCircle, ArrowRight, ShieldCheck, Check, Mail, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placaParam = searchParams.get("placa") || "";
  const categoriaParam = searchParams.get("categoria") || "";

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
        setError(data.error || "Falha ao entrar no sistema.");
        setLoading(false);
        return;
      }

      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (placaParam) {
        router.push(
          `/cliente/novo?placa=${encodeURIComponent(placaParam)}&categoria=${encodeURIComponent(
            categoriaParam
          )}`
        );
      } else {
        router.push("/cliente/dashboard");
      }
    } catch {
      setError("Erro de conexão ao servidor. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-12">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Coluna Esquerda - Identidade Visual com Samuca */}
          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between shadow-2xl border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src="/samuca.png"
                  alt="Samuca"
                  className="w-20 h-20 rounded-full border-3 border-emerald-400 shadow-2xl object-cover bg-white flex-shrink-0"
                />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
                    Samuca Assistente
                  </span>
                  <h2 className="text-2xl font-black text-white mt-1">
                    auto<span className="text-blue-400">recurso</span>
                  </h2>
                </div>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight leading-snug mb-3">
                Bem-vindo de volta ao seu portal de recursos.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
                Acompanhe o andamento das suas defesas, consulte prazos e baixe suas peças fundamentadas prontas para protocolo.
              </p>

              <div className="mt-8 space-y-3 pt-6 border-t border-zinc-800/80 text-xs text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Petições prontas em PDF e Word (.docx)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Atendimento integrado pelo WhatsApp</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Programa de afiliados com R$ 10 no Pix</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-800/60 relative z-10 flex items-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>Ambiente criptografado e seguro</span>
            </div>
          </div>

          {/* Coluna Direita - Formulário de Login Bold & Big */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-zinc-200/90 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-7">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/logo-icon.png"
                    alt="AutoRecurso - Recursos de Trânsito"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-amber-500/40 shadow-md object-cover bg-slate-950 flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-zinc-400 leading-none">
                      Recursos de Trânsito
                    </span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 leading-none mt-1">
                      auto<span className="text-blue-600">recurso</span>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 inline-block">
                  Acesso Seguro
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Acesse sua Conta
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                Entre com seu e-mail e senha cadastrados no sistema.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1.5">
                  Seu E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-zinc-300 text-sm focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 outline-none transition bg-zinc-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1.5">
                  Sua Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-zinc-300 text-sm focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 outline-none transition bg-zinc-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-zinc-950 hover:bg-zinc-800 text-white font-black py-4 px-6 rounded-2xl shadow-md text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 transform hover:-translate-y-0.5 cursor-pointer"
              >
                {loading ? "Verificando credenciais..." : "Entrar no Sistema"}
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-100 text-center text-xs text-zinc-500 font-medium">
              Ainda não possui uma conta?{" "}
              <Link
                href={
                  placaParam
                    ? `/cadastro?placa=${encodeURIComponent(placaParam)}&categoria=${encodeURIComponent(
                        categoriaParam
                      )}`
                    : "/cadastro"
                }
                className="text-zinc-950 font-black hover:underline"
              >
                Cadastre-se gratuitamente ➔
              </Link>
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
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-400 font-black">
          Carregando...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
