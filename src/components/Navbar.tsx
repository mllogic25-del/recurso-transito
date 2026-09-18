"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  LogOut,
  Shield,
  User,
  PlusCircle,
  LayoutDashboard,
  Menu,
  X,
  ShieldCheck,
  HelpCircle,
  Phone,
  Info,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CLIENT";
}

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return { user: null };
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="bg-white text-slate-800 shadow-xs border-b border-slate-200 sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo estilo Recursos Detran / AutoRecurso */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:bg-blue-700 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 leading-none">
                Recursos
              </span>
              <span className="text-2xl font-black tracking-tight text-slate-900 leading-none mt-0.5">
                auto<span className="text-blue-600">recurso</span>
              </span>
            </div>
          </Link>

          {/* Menu Desktop Central / Direito */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link
              href="/"
              className={`text-sm font-semibold transition ${
                pathname === "/" ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
              }`}
            >
              Início
            </Link>
            <Link
              href="/#como-funciona"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Quem somos
            </Link>
            <Link
              href="/#pacotes"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Pacote & Preço
            </Link>
            <Link
              href="/#faq"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Perguntas e Respostas
            </Link>
            <Link
              href="/fale-conosco"
              className={`text-sm font-semibold transition ${
                pathname === "/fale-conosco" ? "text-blue-600 font-bold" : "text-slate-600 hover:text-blue-600"
              }`}
            >
              Fale conosco
            </Link>
          </nav>

          {/* Área de Autenticação e Perfis */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                    Painel Admin
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/cliente/dashboard"
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      Meus Recursos
                    </Link>
                    <Link
                      href="/cliente/novo"
                      className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Novo Recurso
                    </Link>
                  </>
                )}

                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <span className="text-xs font-bold text-slate-700">
                    Olá, {user.name.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Sair"
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : !loading ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 border-2 border-blue-600 hover:bg-blue-50 px-5 py-2 rounded-xl transition shadow-xs"
                >
                  Login
                </Link>
                <Link
                  href="/cadastro"
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition"
                >
                  Criar Conta
                </Link>
              </div>
            ) : null}
          </div>

          {/* Botão Menu Mobile */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            Início
          </Link>
          <Link
            href="/#como-funciona"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            Quem somos
          </Link>
          <Link
            href="/#pacotes"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            Pacote & Preço
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            Perguntas e Respostas
          </Link>
          <Link
            href="/fale-conosco"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-blue-600"
          >
            Fale conosco (Como funciona)
          </Link>
          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500">{user.name}</p>
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-bold text-blue-600"
                  >
                    Painel do Administrador
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/cliente/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm font-bold text-slate-700"
                    >
                      Meus Recursos
                    </Link>
                    <Link
                      href="/cliente/novo"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm font-bold text-blue-600"
                    >
                      + Novo Recurso
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left py-2 text-sm font-bold text-red-600"
                >
                  Sair da Conta
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-blue-600 border border-blue-600 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
