"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  FileText,
  Shield,
  ArrowLeft,
  Plus,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

interface LegalTemplate {
  id: string;
  title: string;
  category: string;
  ctbArticle: string;
  description: string;
  defaultPreliminaries: string;
  defaultMerit: string;
  defaultRequests: string;
}

export default function ModelosAdminPage() {
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data?.templates) {
          setTemplates(data.templates);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/admin/dashboard"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Teses e Modelos Jurídicos Cadastrados
            </h1>
            <p className="text-slate-500 text-sm">
              Base técnica utilizada pelo motor de geração para fundamentação legal no CTB e CONTRAN.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
            <p className="text-sm">Carregando modelos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {tpl.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {tpl.ctbArticle}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {tpl.title}
                  </h3>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-700">
                    <div>
                      <span className="font-bold text-slate-900 block">Preliminares de Nulidade:</span>
                      <p className="text-slate-500 italic mt-0.5">{tpl.defaultPreliminaries}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 block">Fundamento de Mérito:</span>
                      <p className="text-slate-500 italic mt-0.5">{tpl.defaultMerit}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 block">Pedidos Formais:</span>
                      <p className="text-slate-500 italic mt-0.5">{tpl.defaultRequests}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ativo no Sistema
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
