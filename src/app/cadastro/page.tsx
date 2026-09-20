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
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-12">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Coluna Esquerda - Identidade Visual com Samuca */}
          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between shadow-2xl border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3.5 mb-6">
                <img
                  src="/samuca.png"
                  alt="Samuca"
                  className="w-16 h-16 rounded-2xl border-2 border-emerald-400 shadow-xl object-cover bg-zinc-900"
                />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                    Samuca Assistente
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">
                    auto<span className="text-blue-400">recurso</span>
                  </h2>
                </div>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight leading-snug mb-3">
                Crie sua conta e proteja sua CNH agora mesmo.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
                Cadastre-se em menos de 1 minuto para dar entrada na sua defesa técnica personalizada e receber a petição pronta para protocolo.
              </p>

              <div className="mt-8 space-y-3 pt-6 border-t border-zinc-800/80 text-xs text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Sem assinatura e sem mensalidades</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Investimento fixo de R$ 30,00 por recurso</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Ganhe R$ 10 no Pix indicando amigos</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-800/60 relative z-10 flex items-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>Seus dados protegidos pela LGPD</span>
            </div>
          </div>

          {/* Coluna Direita - Formulário de Cadastro Bold & Big */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-zinc-200/90 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2.5 inline-block">
                Cadastro Rápido
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Criar Nova Conta
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                Preencha os dados abaixo para gerar e acompanhar seus recursos.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: João da Silva"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-zinc-300 text-sm focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 outline-none transition bg-zinc-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-zinc-800 mb-1">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-4" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="w-full pl-11 pr-3 py-3.5 rounded-2xl border border-zinc-300 text-sm focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 outline-none transition bg-zinc-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-zinc-800 mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-4" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full pl-11 pr-3 py-3.5 rounded-2xl border border-zinc-300 text-sm focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 outline-none transition bg-zinc-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-zinc-800 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-4 top-4" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(DDD) 99999-9999"
                      className="w-full pl-11 pr-3 py-3.5 rounded-2xl border border-zinc-300 text-sm focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 outline-none transition bg-zinc-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-zinc-800 mb-1">
                    CPF (Opcional)
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-zinc-400 absolute left-4 top-4" />
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full pl-11 pr-3 py-3.5 rounded-2xl border border-zinc-300 text-sm focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 outline-none transition bg-zinc-50/50"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-zinc-950 hover:bg-zinc-800 text-white font-black py-4 px-6 rounded-2xl shadow-md text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 transform hover:-translate-y-0.5 cursor-pointer"
              >
                {loading ? "Criando sua conta..." : "Criar Minha Conta"}
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-100 text-center text-xs text-zinc-500 font-medium">
              Já possui uma conta?{" "}
              <Link
                href={
                  placaParam
                    ? `/login?placa=${encodeURIComponent(placaParam)}&categoria=${encodeURIComponent(
                        categoriaParam
                      )}`
                    : "/login"
                }
                className="text-zinc-950 font-black hover:underline"
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
