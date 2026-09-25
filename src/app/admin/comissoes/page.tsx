"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ArrowLeft,
  Search,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  Zap,
  PauseCircle,
} from "lucide-react";

export default function AdminComissoesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID">("PENDING");
  const [search, setSearch] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [affiliateActive, setAffiliateActive] = useState<boolean>(true);
  const [togglingAffiliate, setTogglingAffiliate] = useState(false);

  // Modal de Vínculo Manual (ex: cliente que veio pelo WhatsApp direto)
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualReferralCode, setManualReferralCode] = useState("");
  const [manualProtocolOrContact, setManualProtocolOrContact] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState("");

  const fetchCommissions = async () => {
    try {
      const res = await fetch("/api/admin/commissions");
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setCommissions(data.commissions || []);
    } catch (err) {
      console.error("Erro ao carregar comissões:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAffiliateStatus = () => {
    fetch("/api/settings/affiliate")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.active === "boolean") {
          setAffiliateActive(data.active);
        }
      })
      .catch(() => {});
  };

  const handleToggleAffiliate = async () => {
    const nextState = !affiliateActive;
    const msg = nextState
      ? "Deseja REATIVAR o programa de afiliados?\n\nA página de cadastro voltará a ficar disponível, os links aparecerão no site e o Samuca voltará a divulgar o programa no WhatsApp."
      : "Deseja SUSPENDER o programa de afiliados?\n\nA página de cadastro será bloqueada, todos os botões/links serão ocultados do site e o Samuca no WhatsApp NÃO oferecerá mais afiliação.";
    
    if (!confirm(msg)) return;

    setTogglingAffiliate(true);
    try {
      const res = await fetch("/api/settings/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextState }),
      });
      const data = await res.json();
      if (res.ok) {
        setAffiliateActive(data.active);
      } else {
        alert(data.error || "Erro ao alterar status do programa de afiliados.");
      }
    } catch {
      alert("Erro ao comunicar com o servidor.");
    } finally {
      setTogglingAffiliate(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
    loadAffiliateStatus();
  }, []);

  const handleCopyPix = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handleMarkAsPaid = async (commissionId: string, affiliateName?: string, affiliateCpf?: string) => {
    const titularDesc = affiliateName ? ` para ${affiliateName}${affiliateCpf ? ` (CPF: ${affiliateCpf})` : ""}` : "";
    if (!confirm(`Confirmar que você já realizou o repasse de R$ 10,00 via Pix${titularDesc} conferindo a mesma titularidade?`)) {
      return;
    }

    setProcessingId(commissionId);
    try {
      const res = await fetch("/api/admin/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionId, action: "MARK_AS_PAID" }),
      });

      if (res.ok) {
        fetchCommissions();
      } else {
        alert("Erro ao marcar comissão como paga.");
      }
    } catch {
      alert("Erro de conexão ao servidor.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleManualLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualSubmitting(true);
    setManualError("");
    setManualSuccess("");
    try {
      const isProtocol = manualProtocolOrContact.trim().toUpperCase().startsWith("REC-");
      const res = await fetch("/api/admin/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MANUAL_LINK",
          referralCode: manualReferralCode.trim().toUpperCase(),
          appealProtocol: isProtocol ? manualProtocolOrContact.trim() : undefined,
          clientEmailOrPhone: !isProtocol ? manualProtocolOrContact.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setManualError(data.error || "Erro ao vincular indicação.");
      } else {
        setManualSuccess(data.message || "Indicação vinculada com sucesso!");
        fetchCommissions();
        setTimeout(() => {
          setShowManualModal(false);
          setManualReferralCode("");
          setManualProtocolOrContact("");
          setManualSuccess("");
        }, 1500);
      }
    } catch {
      setManualError("Erro de comunicação com o servidor.");
    } finally {
      setManualSubmitting(false);
    }
  };

  // Filtros
  const filteredCommissions = commissions.filter((c) => {
    if (filter === "PENDING" && c.status !== "PENDING") return false;
    if (filter === "PAID" && c.status !== "PAID") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.affiliateName?.toLowerCase().includes(q) ||
        c.pixKey?.toLowerCase().includes(q) ||
        c.referralCode?.toLowerCase().includes(q) ||
        c.referredClientName?.toLowerCase().includes(q) ||
        c.appealProtocol?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const totalCommissionsAmount = commissions.reduce((acc, c) => acc + c.amount, 0);
  const pendingCommissions = commissions.filter((c) => c.status === "PENDING");
  const pendingAmount = pendingCommissions.reduce((acc, c) => acc + c.amount, 0);
  const paidAmount = commissions.filter((c) => c.status === "PAID").reduce((acc, c) => acc + c.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center font-bold text-slate-500">
          Carregando comissões...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/dashboard"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Painel Admin
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Gestão de Comissões & Repasses Pix
            </h1>
            <p className="text-xs text-slate-500">
              Controle dos pagamentos de R$ 10,00 por indicação aos parceiros e afiliados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Botão de Suspender/Ativar Afiliados */}
            <button
              onClick={handleToggleAffiliate}
              disabled={togglingAffiliate}
              className={`inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl border transition shadow-xs cursor-pointer disabled:opacity-50 ${
                affiliateActive
                  ? "bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-300 hover:border-rose-300"
                  : "bg-rose-600 hover:bg-emerald-600 text-white border-rose-700 hover:border-emerald-700 animate-pulse"
              }`}
              title={
                affiliateActive
                  ? "Clique para suspender o programa de afiliados"
                  : "Clique para reativar o programa de afiliados"
              }
            >
              {affiliateActive ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Afiliados: Ativo (Suspender)</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 text-white" />
                  <span>Afiliados: SUSPENSO (Reativar)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowManualModal(true)}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              + Vincular Indicação (WhatsApp / Manual)
            </button>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-2 rounded-xl border border-amber-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-700" />
              {pendingCommissions.length} repasses pendentes
            </span>
          </div>
        </div>

        {/* Banner Informativo quando o Programa de Afiliados estiver SUSPENSO */}
        {!affiliateActive && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <PauseCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-950 flex items-center gap-2">
                  <span>Programa de Afiliados está SUSPENSO</span>
                  <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                    Adesões Bloqueadas
                  </span>
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  A página /afiliados está bloqueada para novos cadastros, os botões foram ocultados da tela inicial e do menu, e o Samuca no WhatsApp não está oferecendo afiliação.
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleAffiliate}
              disabled={togglingAffiliate}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
            >
              Reativar Programa Agora
            </button>
          </div>
        )}

        {/* Métricas do Gestor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Pendente para Repasse Pix
            </span>
            <p className="text-3xl font-black text-amber-600">
              R$ {pendingAmount.toFixed(2).replace(".", ",")}
            </p>
            <span className="text-xs text-slate-500">
              {pendingCommissions.length} pagamentos de R$ 10,00 aguardando
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total já Quitado no Pix
            </span>
            <p className="text-3xl font-black text-emerald-600">
              R$ {paidAmount.toFixed(2).replace(".", ",")}
            </p>
            <span className="text-xs text-slate-500">Repasses concluídos</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total Histórico de Comissões
            </span>
            <p className="text-3xl font-black text-slate-900">
              R$ {totalCommissionsAmount.toFixed(2).replace(".", ",")}
            </p>
            <span className="text-xs text-slate-500">{commissions.length} indicações convertidas</span>
          </div>
        </div>

        {/* Aviso de mesma titularidade obrigatória */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-950 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block text-amber-900 mb-0.5">
              Regra Obrigatória de Titularidade do Pix:
            </span>
            <span>
              O repasse de R$ 10,00 só é válido e deve ser realizado exclusivamente para conta bancária do <strong>mesmo titular (mesmo Nome e CPF)</strong> cadastrado do parceiro. Chaves de terceiros ou outro titular <strong>não são válidas</strong>.
            </span>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter("PENDING")}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === "PENDING"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Pendentes ({pendingCommissions.length})
            </button>
            <button
              onClick={() => setFilter("PAID")}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === "PAID"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Pagas ({commissions.filter((c) => c.status === "PAID").length})
            </button>
            <button
              onClick={() => setFilter("ALL")}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Todas ({commissions.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por afiliado, chave Pix..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tabela de Comissões */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredCommissions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Nenhuma comissão encontrada para os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Indicador (Afiliado)</th>
                    <th className="py-3 px-4">Chave Pix para Pagamento</th>
                    <th className="py-3 px-4">Cliente Indicado</th>
                    <th className="py-3 px-4">Protocolo</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCommissions.map((c) => {
                    const isPending = c.status === "PENDING";
                    const isCopied = copiedKeyId === c.id;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{c.affiliateName}</p>
                          <p className="text-[11px] text-slate-600 font-mono font-bold">
                            CPF: {c.affiliateCpf || "Não informado"}
                          </p>
                          <p className="text-[11px] text-slate-500">{c.affiliatePhone}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 text-emerald-950 font-mono font-bold text-xs flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-black text-emerald-700">
                                {c.pixKeyType}:
                              </span>
                              <span>{c.pixKey}</span>
                            </div>
                            <button
                              onClick={() => handleCopyPix(c.pixKey, c.id)}
                              title="Copiar Chave Pix"
                              className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-md hover:bg-emerald-50 transition cursor-pointer"
                            >
                              {isCopied ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">
                            Titular exigido: <strong>{c.affiliateName}</strong>
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{c.referredClientName}</p>
                          <p className="text-[11px] text-slate-500">{c.referredClientEmail}</p>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {c.appealProtocol}
                        </td>

                        <td className="py-3.5 px-4 font-black text-slate-900 whitespace-nowrap">
                          R$ {c.amount.toFixed(2).replace(".", ",")}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-[11px]">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pendente Pix
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Pago no Pix
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isPending ? (
                            <button
                              onClick={() => handleMarkAsPaid(c.id, c.affiliateName, c.affiliateCpf)}
                              disabled={processingId === c.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50"
                            >
                              {processingId === c.id ? "Salvando..." : "Marcar como Pago no Pix"}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              Quitado em {c.paidAt ? new Date(c.paidAt).toLocaleDateString("pt-BR") : "—"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Vínculo Manual de Indicação (para clientes que vieram via WhatsApp direto) */}
        {showManualModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Vincular Indicação Manual
                  </h3>
                  <p className="text-xs text-slate-500">
                    Útil quando o contato foi compartilhado direto no WhatsApp ou telefone.
                  </p>
                </div>
                <button
                  onClick={() => setShowManualModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {manualError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}

              {manualSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{manualSuccess}</span>
                </div>
              )}

              <form onSubmit={handleManualLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código do Indicador (Afiliado) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: IND-A1B2C3"
                    value={manualReferralCode}
                    onChange={(e) => setManualReferralCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs uppercase outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-bold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    O código único do parceiro que indicou o cliente.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Protocolo do Recurso OU E-mail / Telefone do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: REC-2026-12345 ou cliente@email.com ou 11999999999"
                    value={manualProtocolOrContact}
                    onChange={(e) => setManualProtocolOrContact(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Digite o protocolo do recurso do cliente ou o telefone/e-mail dele.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  ℹ️ Se o recurso do cliente já estiver pago, a comissão de <strong>R$ 10,00</strong> será creditada imediatamente como pendente para repasse no Pix.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={manualSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {manualSubmitting ? "Vinculando..." : "Confirmar Vínculo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
