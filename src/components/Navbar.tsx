"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Bot,
  FileText,
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
        <div className="flex justify-between h-20 items-center py-2">
          {/* Logo Corporativo */}
          <Link href="/admin/dashboard" className="flex items-center gap-3.5 group flex-shrink-0">
            <img
              src="/logo-icon.png"
              alt="AutoRecurso - Sistema Administrativo"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-amber-500/40 shadow-md shadow-amber-950/20 group-hover:scale-105 transition-all duration-200 object-cover bg-slate-950 flex-shrink-0"
            />
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase leading-none">
                Auto<span className="text-amber-500">Recurso</span>
              </span>
              <span className="text-[10px] sm:text-xs tracking-[0.2em] text-emerald-700 uppercase font-bold mt-1 leading-none">
                Sistema Administrativo
              </span>
            </div>
          </Link>

          {/* Links do Menu Desktop (quando autenticado) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin/whatsapp"
                      className={`text-xs font-extrabold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 border ${
                        pathname === "/admin/whatsapp"
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                          : "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      <Bot className="w-4 h-4" />
                      <span>Samuca Bot</span>
                    </Link>

                    <Link
                      href="/admin/modelos"
                      className={`text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 border ${
                        pathname === "/admin/modelos"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Modelos CTB</span>
                    </Link>

                    <Link
                      href="/admin/dashboard"
                      className={`flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl transition shadow-sm ${
                        pathname === "/admin/dashboard"
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-950 text-white hover:bg-zinc-800"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-300" />
                      <span>Painel Admin</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/admin/dashboard"
                    className="text-xs font-black text-zinc-600 hover:text-zinc-950"
                  >
                    Painel
                  </Link>
                )}

                {/* Perfil & Logout */}
                <div className="flex items-center gap-2 pl-3 border-l border-zinc-200 ml-1">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-extrabold text-slate-900 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">Administrador</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sair do sistema"
                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : !loading ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  Acesso Restrito
                </span>
                <Link
                  href="/login"
                  className="text-xs font-black bg-zinc-950 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl shadow-sm transition"
                >
                  Entrar
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

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="pt-2">
            {user ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                  <div>
                    <p className="text-xs font-black text-zinc-900">{user.name}</p>
                    <p className="text-[10px] text-zinc-500">{user.email}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Administrador
                  </span>
                </div>

                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center text-xs font-black bg-zinc-950 text-white rounded-xl"
                >
                  Painel Admin
                </Link>
                <Link
                  href="/admin/whatsapp"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl"
                >
                  🤖 Samuca Bot
                </Link>
                <Link
                  href="/admin/modelos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center text-xs font-black bg-slate-50 text-slate-800 border border-slate-200 rounded-xl"
                >
                  Modelos do CTB
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 text-center text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                >
                  Sair da Conta
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 text-center text-xs font-black bg-zinc-950 text-white rounded-xl"
                >
                  Acessar Painel do Administrador
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
