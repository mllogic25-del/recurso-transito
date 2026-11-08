"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return { user: null };
      })
      .then((data) => {
        if (data?.user?.role === "ADMIN") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="flex items-center gap-3.5 mb-4">
        <img
          src="/logo-icon.png"
          alt="AutoRecurso"
          className="w-12 h-12 rounded-xl border border-amber-500/40 shadow-md object-cover bg-slate-900"
        />
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tight text-white uppercase leading-none">
            Auto<span className="text-amber-500">Recurso</span>
          </span>
          <span className="text-[10px] tracking-[0.2em] text-emerald-400 uppercase font-bold mt-1 leading-none">
            Sistema Administrativo
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Acessando portal administrativo...</span>
      </div>
    </div>
  );
}
