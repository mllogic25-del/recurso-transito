"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { LogIn, AlertCircle, Shield, UserCheck, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-xl mb-3">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Acesse sua Conta</h1>
            <p className="text-slate-500 text-sm mt-1">
              Entre com suas credenciais de cliente ou administrador
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar no Sistema"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>



          <div className="mt-6 text-center text-sm text-slate-600">
            Ainda não tem conta?{" "}
            <Link
              href={placaParam ? `/cadastro?placa=${encodeURIComponent(placaParam)}&categoria=${encodeURIComponent(categoriaParam)}` : "/cadastro"}
              className="text-blue-600 font-semibold hover:underline"
            >
              Cadastre-se gratuitamente
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

