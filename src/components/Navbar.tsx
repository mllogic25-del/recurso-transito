"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
  MessageCircle,
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
    <header className="bg-white/95 backdrop-blur-md text-zinc-900 border-b border-zinc-200/80 sticky top-0 z-50 no-print transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Estilo Bold & Big */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/samuca.png"
              alt="AutoRecurso - Samuca"
              className="w-12 h-12 rounded-full border-2 border-emerald-400 shadow-md group-hover:scale-105 transition-all duration-200 object-cover bg-white flex-shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 leading-none">
                Recursos de Trânsito
              </span>
              <span className="text-2xl font-black tracking-tight text-zinc-950 leading-none mt-1">
                auto<span className="text-blue-600">recurso</span>
              </span>
            </div>
          </Link>

          {/* Menu Desktop Enxuto: Se DESLOGADO mostra 3 links institucionais; se LOGADO esconde para não poluir */}
          {!user && (
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/#como-funciona"
                className="text-sm font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                Como Funciona
              </Link>
              <Link
                href="/#pacotes"
                className="text-sm font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                Valores
              </Link>
              <Link
                href="/#faq"
                className="text-sm font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                Dúvidas
              </Link>
              <Link
                href="/fale-conosco"
                className="text-sm font-bold text-zinc-600 hover:text-zinc-950 transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                WhatsApp
              </Link>
            </nav>
          )}

          {/* Área de Autenticação / Painel */}
          <div className="hidden md:flex items-center gap-3">
            {/* Botão Chamativo Indique e Ganhe para Todos */}
            <Link
              href="/afiliados"
              className="text-xs font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/25 border border-emerald-400/40 flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>💰 Indique & Ganhe R$ 10</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin/comissoes"
                      className="text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-200/80 px-3.5 py-2.5 rounded-xl hover:bg-amber-100 transition shadow-2xs"
                    >
                      Comissões Pix
                    </Link>
                    <Link
                      href="/admin/whatsapp"
                      className="text-xs font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-3.5 py-2.5 rounded-xl hover:bg-emerald-100 transition shadow-2xs"
                    >
                      🤖 Samuca Bot
                    </Link>
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-1.5 text-xs font-black bg-zinc-950 text-white px-4 py-2.5 rounded-xl hover:bg-zinc-800 transition shadow-sm"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-400" />
                      Painel Admin
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/cliente/dashboard"
                      className={`text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
                        pathname === "/cliente/dashboard"
                          ? "bg-zinc-100 text-zinc-950"
                          : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      Meus Recursos
                    </Link>
                    <Link
                      href="/cliente/novo"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4.5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition transform hover:-translate-y-0.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Novo Recurso
                    </Link>
                  </>
                )}

                {/* Perfil & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sair do sistema"
                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : !loading ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-black text-zinc-700 hover:text-zinc-950 px-4 py-2.5 rounded-xl hover:bg-zinc-100 transition"
                >
                  Entrar
                </Link>
                <Link
                  href="/"
                  className="text-xs font-black bg-zinc-950 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl shadow-sm transition transform hover:-translate-y-0.5"
                >
                  Consultar Minha Multa
                </Link>
              </div>
            ) : null}
          </div>

          {/* Botão Menu Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Enxuto */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-200/80 px-5 pt-4 pb-6 space-y-3 animate-fade-in shadow-xl">
          {!user && (
            <>
              <Link
                href="/#como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-zinc-700"
              >
                Como Funciona
              </Link>
              <Link
                href="/#pacotes"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-zinc-700"
              >
                Valores
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-zinc-700"
              >
                Dúvidas Frequentes
              </Link>
              <Link
                href="/fale-conosco"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-emerald-700"
              >
                Atendimento WhatsApp
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-zinc-100">
            {user ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-1">
                  <p className="text-xs font-black text-zinc-900">{user.name}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                    {isAdmin ? "Administrador" : "Cliente"}
                  </span>
                </div>
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 text-center text-xs font-black bg-zinc-950 text-white rounded-xl"
                    >
                      Painel Admin
                    </Link>
                    <Link
                      href="/admin/comissoes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 text-center text-xs font-black bg-amber-50 text-amber-900 border border-amber-200 rounded-xl"
                    >
                      💰 Comissões Pix
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/cliente/novo"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 text-center text-xs font-black bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/20"
                    >
                      + Novo Recurso
                    </Link>
                    <Link
                      href="/cliente/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2 text-center text-xs font-black bg-zinc-100 text-zinc-900 rounded-xl"
                    >
                      Meus Recursos
                    </Link>
                    <Link
                      href="/afiliados"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2 text-center text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl"
                    >
                      💰 Indique & Ganhe R$ 10
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-center text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  Sair da Conta
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 text-center text-xs font-black text-zinc-900 bg-zinc-100 rounded-xl"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 text-center text-xs font-black bg-zinc-950 text-white rounded-xl"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
