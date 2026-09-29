"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  KeyRound,
  Mail,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";

export default function RecuperarSenhaPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [documentOrPhone, setDocumentOrPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Por favor, informe seu e-mail cadastrado.");
      return;
    }

    if (!documentOrPhone.trim()) {
      setError("Por favor, informe seu CPF ou Telefone cadastrado.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("A confirmação da senha não coincide com a nova senha digitada.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          documentOrPhone: documentOrPhone.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível redefinir a senha.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch {
      setError("Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.");
      setLoading(false);
    }
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5579998340176";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Estou precisando de ajuda para recuperar minha senha no portal AutoRecurso."
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 relative">
      {/* Luzes Ambientais de Fundo */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[130px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-12 relative z-10">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border-2 border-amber-400/80 p-6 sm:p-10">
          {/* Cabeçalho */}
          <div className="mb-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao Login
            </Link>

            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-icon.png"
                  alt="AutoRecurso"
                  className="w-10 h-10 rounded-xl border border-amber-500/40 shadow-md object-cover bg-slate-950 flex-shrink-0"
                />
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none">
                    Auto<span className="text-amber-500">Recurso</span>
                  </span>
                  <span className="text-[10px] tracking-[0.2em] text-emerald-700 uppercase font-bold mt-1 leading-none">
                    Segurança de Acesso
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Recuperação
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-amber-500" />
              Redefinir sua Senha
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
              Informe seu e-mail cadastrado e seu CPF ou Telefone para confirmar sua titularidade e cadastrar sua nova senha imediatamente.
            </p>
          </div>

          {/* Mensagem de Sucesso */}
          {success ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-emerald-950">
                Senha Alterada com Sucesso!
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Sua nova senha já está valendo. Você será redirecionado para a tela de login em instantes...
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                <span>Ir para o Login Agora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* E-mail */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  E-mail Cadastrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-slate-50 text-slate-950 font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              {/* CPF ou Telefone para validação de segurança */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    CPF ou Telefone Cadastrado
                  </label>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    (Confirmação de titular)
                  </span>
                </div>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    required
                    value={documentOrPhone}
                    onChange={(e) => setDocumentOrPhone(e.target.value)}
                    placeholder="Digite seu CPF ou Celular da conta"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-slate-50 text-slate-950 font-medium placeholder-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pode ser o seu CPF (somente números) ou o seu número de WhatsApp cadastrado.
                </p>
              </div>

              {/* Nova Senha */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Nova Senha (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-slate-50 text-slate-950 font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-slate-50 text-slate-950 font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Botão de Enviar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-yellow-300 font-black py-4 px-6 rounded-xl shadow-xl shadow-amber-400/25 text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-50 transform hover:scale-[1.01] cursor-pointer"
              >
                <span>{loading ? "Redefinindo senha..." : "Salvar Nova Senha"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Suporte no WhatsApp & Rodapé */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              ← Lembra da sua senha? Entrar
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:text-emerald-800 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Ajuda pelo WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
