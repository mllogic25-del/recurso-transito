"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { UserPlus, AlertCircle, ArrowRight, ShieldCheck, Check, Mail, Lock, User, Phone, CreditCard } from "lucide-react";

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placaParam = searchParams.get("placa") || "";
  const categoriaParam = searchParams.get("categoria") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    cpf: "",
    role: "CLIENT",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Falha ao realizar cadastro.");
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
      setError("Erro ao conectar com o servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 relative">
      {/* Luzes Ambientais de Fundo Suaves */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-[130px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-12 relative z-10">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Coluna Esquerda - Identidade Visual com Samuca */}
          <div className="lg:col-span-5 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 rounded-3xl p-8 sm:p-10 text-slate-900 flex flex-col justify-between shadow-xl border border-slate-200/90 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src="/samuca.png"
                  alt="Samuca"
                  className="w-20 h-20 rounded-full border-3 border-emerald-500 shadow-xl object-cover bg-white flex-shrink-0"
                />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300">
                    Samuca Assistente
                  </span>
                  <h2 className="text-2xl font-black text-slate-950 mt-1">
                    auto<span className="text-blue-600">recurso</span>
                  </h2>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-950 tracking-tight leading-snug mb-3">
                Crie sua conta e proteja sua CNH agora mesmo.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Cadastre-se em menos de 1 minuto para dar entrada na sua defesa técnica personalizada e receber a petição pronta para protocolo.
              </p>

              <div className="mt-8 space-y-3 pt-6 border-t border-slate-200 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-800">Sem assinatura e sem mensalidades</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-800">Investimento fixo de R$ 30,00 por recurso</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-800">Ganhe R$ 10 no Pix indicando amigos</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 relative z-10 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Seus dados protegidos pela LGPD</span>
            </div>
          </div>

          {/* Coluna Direita - Formulário de Cadastro Bold & Big */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border-2 border-amber-400/80 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/logo-icon.png"
                    alt="AutoRecurso - Recursos de Trânsito"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-amber-500/40 shadow-md object-cover bg-slate-950 flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400 leading-none">
                      Recursos de Trânsito
                    </span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 leading-none mt-1">
                      auto<span className="text-blue-600">recurso</span>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                  Cadastro Rápido
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Criar Nova Conta
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Preencha os dados abaixo para gerar e acompanhar seus recursos.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: João da Silva"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-slate-50 text-slate-950 font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="w-full pl-11 pr-3 py-3.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-slate-50 text-slate-950 font-medium placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full pl-11 pr-3 py-3.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-slate-50 text-slate-950 font-medium placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(DDD) 99999-9999"
                      className="w-full pl-11 pr-3 py-3.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-slate-50 text-slate-950 font-medium placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    CPF (Opcional)
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full pl-11 pr-3 py-3.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-slate-50 text-slate-950 font-medium placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-yellow-300 font-black py-4 px-6 rounded-xl shadow-xl shadow-amber-400/25 text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-50 transform hover:scale-[1.01] cursor-pointer"
              >
                <span>{loading ? "Criando sua conta..." : "Criar Minha Conta"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
              Já possui uma conta?{" "}
              <Link
                href={
                  placaParam
                    ? `/login?placa=${encodeURIComponent(placaParam)}&categoria=${encodeURIComponent(
                        categoriaParam
                      )}`
                    : "/login"
                }
                className="text-blue-600 font-bold hover:underline"
              >
                Fazer login ➔
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-400 font-black">
          Carregando...
        </div>
      }
    >
      <CadastroForm />
    </Suspense>
  );
}
