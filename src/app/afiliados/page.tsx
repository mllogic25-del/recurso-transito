"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  DollarSign,
  Share2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Info,
  User,
  Mail,
  Lock,
  Phone,
  HelpCircle,
  CreditCard,
  PauseCircle,
} from "lucide-react";

export default function AfiliadosPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    cpf: "",
    pixKeyType: "CPF",
    pixKey: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isProgramActive, setIsProgramActive] = useState(true);

  useEffect(() => {
    fetch("/api/settings/affiliate")
      .then((res) => (res.ok ? res.json() : { active: true }))
      .then((data) => {
        if (typeof data.active === "boolean") {
          setIsProgramActive(data.active);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, []);

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleCpfChange = (val: string) => {
    const formatted = formatCpf(val);
    setFormData((prev) => ({
      ...prev,
      cpf: formatted,
      pixKey: prev.pixKeyType === "CPF" ? formatted : prev.pixKey,
    }));
  };

  const handlePixKeyTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      pixKeyType: type,
      pixKey: type === "CPF" ? prev.cpf : prev.pixKey,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanCpfDigits = formData.cpf.replace(/\D/g, "");
    if (cleanCpfDigits.length !== 11) {
      setError("Por favor, informe um CPF válido com 11 dígitos para comprovação da titularidade.");
      setLoading(false);
      return;
    }

    if (!formData.pixKey.trim()) {
      setError("Por favor, informe sua Chave Pix para receber as comissões.");
      setLoading(false);
      return;
    }

    if (formData.pixKeyType === "CPF") {
      const cleanPixDigits = formData.pixKey.replace(/\D/g, "");
      if (cleanPixDigits !== cleanCpfDigits) {
        setError("A Chave Pix do tipo CPF deve ser idêntica ao seu CPF cadastrado. Chave de outro titular não é permitida.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/affiliates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao realizar cadastro.");
        setLoading(false);
        return;
      }

      // Redireciona direto para o painel do afiliado
      router.push("/afiliados/dashboard");
    } catch {
      setError("Erro de conexão com o servidor.");
      setLoading(false);
    }
  };

  if (!checkingStatus && !isProgramActive) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mb-6 shadow-sm">
            <PauseCircle className="w-10 h-10" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-4 border border-amber-200">
            ADESÕES PAUSADAS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 leading-tight">
            Programa de Afiliados Temporariamente Suspenso
          </h1>
          <p className="text-slate-600 text-sm max-w-lg mb-8 leading-relaxed">
            O programa <strong className="text-slate-800">Indique & Ganhe</strong> está temporariamente suspenso para novas adesões e cadastros de parceiros. Caso você já possua um cadastro ativo, pode fazer login normalmente para consultar seu histórico.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
            >
              Voltar à Página Inicial
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 transition shadow-2xs"
            >
              Já sou Afiliado (Fazer Login)
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Banner Hero do Programa de Afiliados */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-emerald-900/15 relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="bg-white/20 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-xs inline-block">
              Programa Oficial de Parceiros & Indicação
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Indique e ganhe <span className="text-emerald-300">R$ 10,00</span> direto no seu Pix
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Ajude amigos, motoristas de aplicativo e condutores a recorrerem de suas multas de trânsito com segurança jurídica. Para cada indicado que emitir e pagar o recurso, você recebe R$ 10,00 no seu Pix.
            </p>
          </div>
        </div>

        {/* REGRAS CLARAS DA PROMOÇÃO (Destaque transparente conforme exigido) */}
        <div className="bg-amber-50/80 border-2 border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-900 font-extrabold text-base sm:text-lg">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>Regras Claras e Transparência do Programa de Indicação</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm text-amber-950">
            <div className="bg-white/90 p-4 rounded-2xl border border-amber-200 space-y-1.5">
              <p className="font-extrabold text-emerald-700 flex items-center gap-1.5 text-sm">
                <DollarSign className="w-4 h-4 text-emerald-600" /> R$ 10,00 no seu Pix
              </p>
              <p className="text-slate-600">
                Você recebe R$ 10,00 de comissão líquida diretamente na chave Pix cadastrada no seu perfil no prazo de até 72 horas após a confirmação.
              </p>
            </div>
            <div className="bg-white/90 p-4 rounded-2xl border border-amber-200 space-y-1.5">
              <p className="font-extrabold text-blue-700 flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Válido se o indicado pagar
              </p>
              <p className="text-slate-600">
                A comissão é gerada e confirmada assim que a pessoa indicada concluir o pagamento do recurso.
              </p>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-amber-200 space-y-1.5">
              <p className="font-extrabold text-purple-700 flex items-center gap-1.5 text-sm">
                <ShieldCheck className="w-4 h-4 text-purple-600" /> 1 única vez por indicado
              </p>
              <p className="text-slate-600">
                Cada pessoa indicada gera comissão apenas uma única vez (no primeiro recurso pago).
              </p>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-red-200 space-y-1.5">
              <p className="font-extrabold text-red-700 flex items-center gap-1.5 text-sm">
                <ShieldAlert className="w-4 h-4 text-red-600" /> Mesmo Titular (Nome e CPF)
              </p>
              <p className="text-slate-600">
                A chave Pix deve ser obrigatoriamente do mesmo Nome e CPF do cadastro. Chave de outro titular não é válida nem receberá o pagamento.
              </p>
            </div>
          </div>
        </div>

        {/* Como Funciona em 3 Passos */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900">Como funciona em 3 passos</h2>
            <p className="text-xs text-slate-500 mt-1">Simples, automático e transparente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
              <span className="w-12 h-12 bg-emerald-100 text-emerald-700 font-black rounded-2xl flex items-center justify-center text-lg mb-3">
                1
              </span>
              <h3 className="font-bold text-slate-900 mb-1">Faça seu cadastro</h3>
              <p className="text-xs text-slate-600">
                Cadastre-se gratuitamente informando seu nome, contato e sua Chave Pix para recebimento.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
              <span className="w-12 h-12 bg-blue-100 text-blue-700 font-black rounded-2xl flex items-center justify-center text-lg mb-3">
                2
              </span>
              <h3 className="font-bold text-slate-900 mb-1">Compartilhe seu link</h3>
              <p className="text-xs text-slate-600">
                Envie seu link exclusivo de indicação para contatos, no WhatsApp, grupos ou redes sociais.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
              <span className="w-12 h-12 bg-purple-100 text-purple-700 font-black rounded-2xl flex items-center justify-center text-lg mb-3">
                3
              </span>
              <h3 className="font-bold text-slate-900 mb-1">Receba no Pix</h3>
              <p className="text-xs text-slate-600">
                Quando o indicado pagar o recurso, o sistema registra sua comissão de R$ 10,00 e o valor é pago no seu Pix no prazo de até 72 horas.
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Cadastro de Afiliado */}
        <div id="cadastro-afiliado" className="max-w-xl mx-auto w-full bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 executive-shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-emerald-100 text-emerald-700 rounded-2xl mb-2">
              <DollarSign className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-950">Cadastre-se como Parceiro</h2>
            <p className="text-xs text-slate-500 mt-1">
              Informe seus dados e sua Chave Pix para gerar seu link de indicação imediato.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Seu Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Lucas Ferreira"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seu E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="lucas@email.com"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sua Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp / Telefone para Contato *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(DDD) 99999-9999"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seu CPF (Titular da Chave Pix) *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO DA CHAVE PIX */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Dados da Chave Pix para Recebimento</span>
              </div>

              {/* AVISO DE MESMA TITULARIDADE */}
              <div className="bg-amber-100/90 border border-amber-300 rounded-xl p-3 text-amber-950 text-xs font-semibold flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Regra Obrigatória de Titularidade:</strong> A conta bancária e chave Pix devem pertencer <u>obrigatoriamente</u> à mesma pessoa cadastrada (mesmo Nome e CPF). Chaves de outro titular ou terceiros <strong>não são válidas</strong> e não receberão o valor.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tipo de Chave
                  </label>
                  <select
                    value={formData.pixKeyType}
                    onChange={(e) => handlePixKeyTypeChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:border-emerald-600 outline-none font-medium"
                  >
                    <option value="CPF">CPF (Mesmo do Titular)</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="TELEFONE">Telefone</option>
                    <option value="ALEATORIA">Chave Aleatória</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sua Chave Pix *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pixKey}
                    onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                    placeholder={formData.pixKeyType === "CPF" ? "000.000.000-00" : "Digite sua chave Pix"}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:border-emerald-600 outline-none font-mono font-bold"
                  />
                  {formData.pixKeyType === "CPF" && (
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                      ✓ Preenchida automaticamente com seu CPF de titular.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-xl shadow-lg shadow-emerald-600/25 text-sm sm:text-base transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar e Pegar Meu Link de Indicação"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Já tem uma conta de afiliado ou usuário?{" "}
            <Link href="/login" className="text-emerald-700 font-bold hover:underline">
              Fazer login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
