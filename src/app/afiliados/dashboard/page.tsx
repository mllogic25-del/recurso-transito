"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  DollarSign,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Edit2,
  Zap,
  ArrowRight,
  Info,
} from "lucide-react";

export default function AfiliadoDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Modal para editar Chave Pix
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixType, setPixType] = useState("CPF");
  const [pixKey, setPixKey] = useState("");
  const [savingPix, setSavingPix] = useState(false);
  const [pixSuccess, setPixSuccess] = useState("");

  const fetchAffiliateData = async () => {
    try {
      const res = await fetch("/api/affiliates/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (json.affiliate) {
        setData(json.affiliate);
        setPixType(json.affiliate.pixKeyType);
        setPixKey(json.affiliate.pixKey);
      } else {
        // Usuário logado mas sem perfil de afiliado
        setData(null);
      }
    } catch (err) {
      console.error("Erro ao carregar painel do afiliado:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = data?.referralCode ? `${origin}/?ref=${data.referralCode}` : "";

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5579998340176";

  const handleShareWhatsAppSite = () => {
    const text = `Olá! Se você recebeu alguma multa de trânsito ou precisa de recurso para Defesa Prévia ou JARI, use esse link com desconto para gerar sua defesa personalizada em PDF e Word por apenas R$ 30,00:\n\n${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareWhatsAppDirect = () => {
    const directZap = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá! Fui indicado pelo parceiro [Indicação: ${data?.referralCode}] e gostaria de recorrer de uma multa.`)}`;
    const text = `Olá! Se você levou alguma multa de trânsito, fale direto com o especialista do AutoRecurso no WhatsApp oficial deles pelo link abaixo. Já deixei meu código de indicação vinculado para você ter prioridade:\n\n${directZap}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSavePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPix(true);
    try {
      const res = await fetch("/api/affiliates/update-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixKeyType: pixType, pixKey }),
      });
      if (res.ok) {
        setPixSuccess("Chave Pix atualizada com sucesso!");
        fetchAffiliateData();
        setTimeout(() => {
          setPixSuccess("");
          setShowPixModal(false);
        }, 1500);
      }
    } catch {
      alert("Erro ao atualizar chave Pix.");
    } finally {
      setSavingPix(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center font-bold text-slate-500">
          Carregando painel de indicação...
        </div>
      </div>
    );
  }

  // Se o usuário estiver logado mas não tiver perfil de afiliado ainda
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto w-full px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center">
            <DollarSign className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Ative seu Perfil de Indicador</h1>
          <p className="text-sm text-slate-600">
            Você ainda não possui um código de afiliado ativo. Cadastre sua chave Pix abaixo para começar a ganhar R$ 10,00 por indicação!
          </p>
          <Link
            href="/afiliados"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition"
          >
            Cadastrar Chave Pix e Ativar ➔
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md mb-1 inline-block">
              Programa de Afiliados AutoRecurso
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Painel do Indicador
            </h1>
            <p className="text-xs text-slate-500">
              Acompanhe seus cliques, indicados cadastrados e comissões no Pix.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPixModal(true)}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              Chave Pix: <span className="font-mono text-slate-900">{data.pixKey}</span>
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Card de Destaque: Seu Link de Indicação */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-700/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                Seu Link Exclusivo de Indicação
              </span>
              <p className="text-xs text-emerald-100 mt-0.5">
                Compartilhe este link. Cada amigo que emitir e pagar o recurso gera <strong>R$ 10,00</strong> no seu Pix.
              </p>
            </div>
            <span className="bg-white/20 font-mono font-black text-xs px-3 py-1 rounded-lg self-start sm:self-auto border border-white/20">
              CÓDIGO: {data.referralCode}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="flex-1 bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/25 flex items-center overflow-x-auto">
              <span className="text-sm font-mono font-bold text-white whitespace-nowrap">
                {referralLink}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="bg-white hover:bg-emerald-50 text-emerald-900 font-black px-5 py-3 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-700" />
                  Copiar Link
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsAppSite}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-black px-4 py-3 rounded-2xl transition flex items-center justify-center gap-1.5 text-xs shadow-md cursor-pointer whitespace-nowrap"
              title="Compartilha o link da página no WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              Indicar Site no Zap
            </button>

            <button
              onClick={handleShareWhatsAppDirect}
              className="bg-teal-500 hover:bg-teal-400 text-white font-black px-4 py-3 rounded-2xl transition flex items-center justify-center gap-1.5 text-xs shadow-md cursor-pointer whitespace-nowrap"
              title="Abre conversa direto com nosso WhatsApp já com seu código"
            >
              <Zap className="w-4 h-4" />
              Indicar Zap Direto
            </button>
          </div>

          <div className="text-[11px] text-emerald-100/90 pt-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                <strong>Indicação pelo WhatsApp direto:</strong> O link &quot;Indicar Zap Direto&quot; já envia para o seu amigo uma mensagem que abre o nosso WhatsApp com o seu código de indicação pré-preenchido.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                Se você apenas passou nosso número ou cartão de contato no Zap, avise seu amigo para informar seu código <strong>({data.referralCode})</strong> na conversa com nosso assistente ou especialista!
              </span>
            </div>
          </div>
        </div>

        {/* 4 Cards de Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Ganho</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              R$ {data.totalEarnings.toFixed(2).replace(".", ",")}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold">Comissões confirmadas</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Aguardando Pix</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-600">
              R$ {data.pendingAmount.toFixed(2).replace(".", ",")}
            </p>
            <span className="text-[11px] text-slate-500">Em fila de repasse</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Indicados</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{data.totalReferralsCount}</p>
            <span className="text-[11px] text-slate-500">Motoristas cadastrados</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Recursos Pagos</span>
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-700">{data.convertedCount}</p>
            <span className="text-[11px] text-slate-500">Geraram comissão</span>
          </div>
        </div>

        {/* Tabela de Indicados e Status */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Pessoas Indicadas por Você</h2>
              <p className="text-xs text-slate-500">
                Acompanhe o andamento dos motoristas que se cadastraram com o seu link.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {data.referrals.length} no total
            </span>
          </div>

          {data.referrals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              Você ainda não possui motoristas indicados. Compartilhe seu link exclusivo para começar!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Indicado</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4">Status da Indicação</th>
                    <th className="py-3 px-4">Comissão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.referrals.map((ref: any) => {
                    const isConverted = ref.status === "PAID_CONVERTED";
                    return (
                      <tr key={ref.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {new Date(ref.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{ref.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{ref.email}</td>
                        <td className="py-3 px-4">
                          {isConverted ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Recurso Pago (Convertido)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Aguardando emissão do recurso
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-black">
                          {isConverted ? (
                            <span className="text-emerald-600">+ R$ 10,00</span>
                          ) : (
                            <span className="text-slate-400">Pendente de pagamento</span>
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

        {/* Tabela de Histórico de Comissões e Repasses Pix */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Histórico de Comissões no Pix</h2>
              <p className="text-xs text-slate-500">
                Lista de todos os R$ 10,00 creditados e repassados na sua chave Pix.
              </p>
            </div>
          </div>

          {data.commissions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              Nenhuma comissão confirmada ainda. Assim que seus indicados pagarem o recurso, os repasses aparecerão aqui!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Data do Recurso</th>
                    <th className="py-3 px-4">Protocolo</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Status do Repasse</th>
                    <th className="py-3 px-4">Data do Pix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.commissions.map((c: any) => {
                    const isPaid = c.status === "PAID";
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {c.protocol}
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900">
                          R$ {c.amount.toFixed(2).replace(".", ",")}
                        </td>
                        <td className="py-3 px-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Pago via Pix
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Aguardando envio do Pix
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {c.paidAt ? new Date(c.paidAt).toLocaleDateString("pt-BR") : "—"}
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

      {/* Modal para Alterar Chave Pix */}
      {showPixModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-fade-in">
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              Atualizar Chave Pix para Recebimento
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Informe a chave Pix onde deseja receber suas comissões de R$ 10,00.
            </p>

            {pixSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{pixSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePix} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo da Chave Pix
                </label>
                <select
                  value={pixType}
                  onChange={(e) => setPixType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:border-emerald-600 outline-none font-medium"
                >
                  <option value="CPF">CPF</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="TELEFONE">Telefone</option>
                  <option value="ALEATORIA">Chave Aleatória</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chave Pix *
                </label>
                <input
                  type="text"
                  required
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPixModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPix}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {savingPix ? "Salvando..." : "Salvar Chave Pix"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
