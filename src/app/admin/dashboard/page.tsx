"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileDown,
  Edit,
  ShieldCheck,
  Car,
  CreditCard,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { calculateDeadlineInfo } from "@/lib/deadlineUtils";

interface Appeal {
  id: string;
  protocol: string;
  type: string;
  authority: string;
  aitNumber: string;
  plate: string;
  vehicleModel?: string;
  ctbArticle: string;
  infractionDate: string;
  defenseDeadline?: string;
  isExpiredSubmission?: boolean;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  sentToEmail: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
  };
  documents: { id: string; title: string; fileName: string; fileUrl: string }[];
}

export default function AdminDashboard() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user || data.user.role !== "ADMIN") {
          router.push("/login");
        }
      });

    loadAppeals();
  }, [router]);

  const loadAppeals = () => {
    setLoading(true);
    fetch("/api/appeals")
      .then((res) => res.json())
      .then((data) => {
        if (data?.appeals) {
          setAppeals(data.appeals);
        }
      })
      .finally(() => setLoading(false));
  };

  // Filtros
  const filteredAppeals = appeals.filter((a) => {
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchesPayment =
      paymentFilter === "ALL" ||
      (paymentFilter === "PAID" && a.paymentStatus === "PAID") ||
      (paymentFilter === "PENDING" && a.paymentStatus !== "PAID");

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      a.protocol.toLowerCase().includes(term) ||
      a.plate.toLowerCase().includes(term) ||
      a.aitNumber.toLowerCase().includes(term) ||
      a.user.name.toLowerCase().includes(term) ||
      a.authority.toLowerCase().includes(term);

    return matchesStatus && matchesPayment && matchesSearch;
  });

  const total = appeals.length;
  const ready = appeals.filter((a) => a.status === "READY").length;
  const pending = appeals.filter((a) => a.status !== "READY").length;
  const urgentCount = appeals.filter((a) => {
    if (a.status === "READY" || !a.defenseDeadline) return false;
    const info = calculateDeadlineInfo(a.defenseDeadline);
    return info.urgencyLevel === "CRITICAL" || info.urgencyLevel === "WARNING";
  }).length;
  const totalPaidRevenue = appeals
    .filter((a) => a.paymentStatus === "PAID")
    .reduce((acc, a) => acc + (a.paymentAmount || 20.0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Topo do Painel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-slate-900 text-white rounded-xl shadow-sm">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Painel do Administrador
              </h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Controle de pedidos, pagamentos Pix e fila de elaboração ordenada por prazo mais curto.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/modelos"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Modelos do CTB
            </Link>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Prazos Urgentes (Destaque Principal) */}
          <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white p-5 rounded-3xl shadow-lg shadow-red-600/15">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-red-100">
                Prazos Mais Curtos (Urgentes)
              </p>
              <Flame className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black">{urgentCount}</span>
              <span className="text-xs text-red-100 font-medium">precisam de atenção</span>
            </div>
          </div>

          {/* Card 2: Faturamento Pix */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 executive-shadow">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pagamentos Confirmados
              </p>
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-700 mt-2">
              R$ {totalPaidRevenue.toFixed(2)}
            </p>
          </div>

          {/* Card 3: Defesas Liberadas */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 executive-shadow">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Defesas Liberadas
              </p>
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold text-blue-700 mt-2">{ready}</p>
          </div>

          {/* Card 4: Aguardando Elaboração */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 executive-shadow">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fila de Elaboração
              </p>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{pending}</p>
          </div>
        </div>

        {/* Tabela de Pedidos com Ordenação por Prazo Curto */}
        <div className="bg-white rounded-3xl border border-slate-200/80 executive-shadow overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por placa, protocolo, cliente, AIT..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Defesa:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none bg-white"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="PENDING">Pendentes de Elaboração</option>
                  <option value="PROCESSING">Em Elaboração</option>
                  <option value="READY">Liberados</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Pagamento:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none bg-white"
                >
                  <option value="ALL">Todos</option>
                  <option value="PAID">Pago via Pix</option>
                  <option value="PENDING">Aguardando Pagamento</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
              <p className="text-sm font-medium">Carregando pedidos prioritários...</p>
            </div>
          ) : filteredAppeals.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <p className="text-sm">Nenhum recurso encontrado para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Prazo / Urgência</th>
                    <th className="px-6 py-4">Protocolo</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Veículo / Placa</th>
                    <th className="px-6 py-4">Infração / AIT</th>
                    <th className="px-6 py-4">Pagamento</th>
                    <th className="px-6 py-4">Defesa</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppeals.map((item) => {
                    const deadline = calculateDeadlineInfo(item.defenseDeadline);
                    const isPaid = item.paymentStatus === "PAID";
                    const isReady = item.status === "READY";

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 transition ${
                          !isReady && deadline.urgencyLevel === "CRITICAL"
                            ? "bg-red-50/30"
                            : ""
                        }`}
                      >
                        {/* Prazo com Destaque / Ascensão de Urgência */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isReady ? (
                            <span className="text-xs text-slate-400 font-medium">
                              Concluído
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${deadline.badgeClass}`}
                            >
                              {deadline.badgeText}
                            </span>
                          )}
                          {item.isExpiredSubmission && !isReady && (
                            <span className="block text-[10px] text-amber-700 font-bold mt-1">
                              ⚠️ Enviado fora do prazo (vício formal)
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            {item.protocol}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-xs">{item.user.name}</p>
                          <p className="text-[11px] text-slate-400">{item.user.email}</p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900">
                            {item.plate}
                          </span>
                          {item.vehicleModel && (
                            <p className="text-[11px] text-slate-400">{item.vehicleModel}</p>
                          )}
                        </td>

                        <td className="px-6 py-4 max-w-xs">
                          <p className="font-medium text-slate-900 text-xs line-clamp-1">
                            {item.ctbArticle}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            AIT: <strong>{item.aitNumber}</strong> • {item.authority}
                          </p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Pago
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3" /> Pendente
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {isReady ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              Liberada
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                              Aguardando
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/admin/recursos/${item.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition shadow-xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Analisar / Liberar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
