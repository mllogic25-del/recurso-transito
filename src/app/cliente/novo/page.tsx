"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Car,
  User,
  Shield,
  Clock,
  ArrowLeft,
  X,
  Plus,
  AlertTriangle,
  FileCheck,
  Calendar,
  Sparkles,
} from "lucide-react";
import { calculateDeadlineInfo } from "@/lib/deadlineUtils";

interface UploadedDoc {
  title: string;
  originalName: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

function NovoRecursoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Dados do Condutor / Requerente
  const [requesterName, setRequesterName] = useState("");
  const [requesterCpf, setRequesterCpf] = useState("");
  const [requesterRg, setRequesterRg] = useState("");
  const [requesterCnh, setRequesterCnh] = useState("");
  const [requesterAddress, setRequesterAddress] = useState("");

  // Dados da Infração (pré-preenchidos se vierem da busca na home)
  const [type, setType] = useState("DEFESA_PREVIA");
  const [authority, setAuthority] = useState("DETRAN-SP");
  const [aitNumber, setAitNumber] = useState(searchParams.get("ait") || "");
  const [plate, setPlate] = useState((searchParams.get("placa") || "").toUpperCase());
  const [renavam, setRenavam] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [ctbArticle, setCtbArticle] = useState("Art. 218, I - Velocidade até 20% acima do limite");
  const [infractionDate, setInfractionDate] = useState("");
  const [infractionTime, setInfractionTime] = useState("");
  const [infractionLocation, setInfractionLocation] = useState("");
  const [notificationDate, setNotificationDate] = useState("");
  
  // Controle de Prazo de Defesa
  const [defenseDeadline, setDefenseDeadline] = useState("");
  const [confirmExpiredSubmission, setConfirmExpiredSubmission] = useState(false);

  // Categoria Jurídica e Campos Específicos
  const [legalCategory, setLegalCategory] = useState(searchParams.get("categoria") || "EXCESSO_VELOCIDADE");
  const [speedLimit, setSpeedLimit] = useState("");
  const [speedMeasured, setSpeedMeasured] = useState("");
  const [speedConsidered, setSpeedConsidered] = useState("");
  const [radarModel, setRadarModel] = useState("");
  const [lastVerification, setLastVerification] = useState("");

  // Relato
  const [defenseArguments, setDefenseArguments] = useState("");

  // Múltiplos Documentos Anexados
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [docCategory, setDocCategory] = useState("Auto de Infração / Notificação");

  // Carrega dados do usuário logado
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) router.push("/login");
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setRequesterName(data.user.name || "");
          setRequesterCpf(data.user.cpf || "");
        }
      });
  }, [router]);

  // Cálculo do status do prazo em tempo real
  const deadlineInfo = defenseDeadline ? calculateDeadlineInfo(defenseDeadline) : null;
  const isDeadlineExpired = deadlineInfo?.isExpired || false;

  // Upload de MÚLTIPLOS arquivos
  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      formData.append("title", docCategory);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro no envio dos arquivos.");
        setUploading(false);
        return;
      }

      if (data.files && Array.isArray(data.files)) {
        setDocuments((prev) => [...prev, ...data.files]);
      } else if (data.file) {
        setDocuments((prev) => [...prev, data.file]);
      }

      e.target.value = "";
    } catch {
      setError("Falha ao enviar os arquivos.");
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Se o prazo expirou e o usuário não confirmou o envio mesmo assim
    if (isDeadlineExpired && !confirmExpiredSubmission) {
      setError("O prazo legal desta defesa já expirou. Para enviar, marque a caixa confirmando que deseja prosseguir mesmo com o prazo vencido.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          authority,
          aitNumber,
          plate,
          renavam,
          vehicleModel,
          ctbArticle,
          infractionDate,
          infractionTime,
          infractionLocation,
          speedLimit,
          speedMeasured,
          speedConsidered,
          radarModel,
          lastVerification,
          notificationDate,
          defenseDeadline: defenseDeadline ? new Date(defenseDeadline).toISOString() : null,
          isExpiredSubmission: isDeadlineExpired,
          defenseArguments,
          legalCategory,
          requesterName,
          requesterCpf,
          requesterRg,
          requesterCnh,
          requesterAddress,
          documents,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao registrar solicitação.");
        setLoading(false);
        return;
      }

      // Redireciona para o dashboard com mensagem de confirmação de envio
      router.push("/cliente/dashboard?enviado=1");
    } catch {
      setError("Erro de comunicação com o servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </button>

        <div className="bg-white rounded-3xl executive-shadow-lg border border-slate-200/80 p-6 sm:p-12 overflow-hidden">
          {/* Cabeçalho do Formulário */}
          <div className="mb-10 pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2 inline-block">
                Nova Defesa de Autuação
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Enviar Infração & Documentos
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Preencha os dados do auto e anexe seus arquivos para elaboração da sua peça técnica.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-600">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Conforme CTB & CONTRAN</span>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Bloco 1: Qualificação do Condutor */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>1. Qualificação do Requerente / Condutor</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={requesterCpf}
                    onChange={(e) => setRequesterCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    RG (Opcional)
                  </label>
                  <input
                    type="text"
                    value={requesterRg}
                    onChange={(e) => setRequesterRg(e.target.value)}
                    placeholder="Ex: 12.345.678-9 SSP/SP"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Número da CNH (Opcional)
                  </label>
                  <input
                    type="text"
                    value={requesterCnh}
                    onChange={(e) => setRequesterCnh(e.target.value)}
                    placeholder="Ex: 01234567890"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Endereço Completo com CEP
                  </label>
                  <input
                    type="text"
                    value={requesterAddress}
                    onChange={(e) => setRequesterAddress(e.target.value)}
                    placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Dados da Infração e Prazos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                <Car className="w-4 h-4 text-blue-600" />
                <span>2. Dados da Infração, Veículo & Prazo de Vencimento</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tipo de Recurso *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white font-medium transition"
                  >
                    <option value="DEFESA_PREVIA">Defesa da Autuação (Prévia)</option>
                    <option value="JARI">Recurso 1ª Instância (JARI)</option>
                    <option value="CETRAN">Recurso 2ª Instância (CETRAN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Órgão Autuador *
                  </label>
                  <input
                    type="text"
                    required
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    placeholder="Ex: DETRAN-SP, PRF, DNIT"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nº do Auto de Infração (AIT) *
                  </label>
                  <input
                    type="text"
                    required
                    value={aitNumber}
                    onChange={(e) => setAitNumber(e.target.value)}
                    placeholder="Ex: B45892147"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-mono font-bold transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Placa do Veículo *
                  </label>
                  <input
                    type="text"
                    required
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder="ABC1D23"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none uppercase font-mono font-bold transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Renavam (Opcional)
                  </label>
                  <input
                    type="text"
                    value={renavam}
                    onChange={(e) => setRenavam(e.target.value)}
                    placeholder="00123456789"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-mono transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Marca / Modelo do Veículo
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Ex: Fiat Argo 1.0 2022"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Artigo / Enquadramento do CTB *
                  </label>
                  <input
                    type="text"
                    required
                    value={ctbArticle}
                    onChange={(e) => setCtbArticle(e.target.value)}
                    placeholder="Ex: Art. 218, I - Excesso de velocidade em até 20%"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                {/* CAMPO DE PRAZO DA DEFESA COM CÁLCULO E ALERTA */}
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Data Limite da Defesa *
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Consta na Notificação</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={defenseDeadline}
                    onChange={(e) => {
                      setDefenseDeadline(e.target.value);
                      setConfirmExpiredSubmission(false);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-blue-300 focus:border-blue-600 text-sm outline-none transition font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Data da Infração *
                  </label>
                  <input
                    type="text"
                    required
                    value={infractionDate}
                    onChange={(e) => setInfractionDate(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Horário da Infração
                  </label>
                  <input
                    type="text"
                    value={infractionTime}
                    onChange={(e) => setInfractionTime(e.target.value)}
                    placeholder="Ex: 15:45"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Local da Infração *
                  </label>
                  <input
                    type="text"
                    required
                    value={infractionLocation}
                    onChange={(e) => setInfractionLocation(e.target.value)}
                    placeholder="Av. Exemplo, Km 10, São Paulo - SP"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>
              </div>

              {/* ALERTA VISUAL SE O PRAZO JÁ EXPIROU */}
              {isDeadlineExpired && (
                <div className="p-5 bg-amber-50/90 border-2 border-amber-400 rounded-2xl text-amber-950 space-y-3 executive-shadow animate-fade-in">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm text-amber-900">
                        Atenção: O prazo legal para esta defesa expirou em {deadlineInfo?.formattedDeadline}!
                      </h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Embora a data limite da notificação tenha passado, <strong>ainda é juridicamente viável apresentar o recurso</strong> alegando falta de notificação válida dentro dos 30 dias (decadência do art. 281 do CTB / Súmula 312 do STJ) ou ausência de citação formal.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/80">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-amber-900 hover:text-black">
                      <input
                        type="checkbox"
                        checked={confirmExpiredSubmission}
                        onChange={(e) => setConfirmExpiredSubmission(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                      />
                      <span>Sim, estou ciente do prazo expirado e desejo enviar mesmo assim para alegar nulidade.</span>
                    </label>
                  </div>
                </div>
              )}

              {/* AVISO DE PRAZO CURTO (URGENTE) */}
              {!isDeadlineExpired && deadlineInfo && deadlineInfo.urgencyLevel === "CRITICAL" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-900 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <span>🔥 Prazo Muito Curto! Esta defesa vence em {deadlineInfo.daysRemaining} dia(s). Ela terá prioridade máxima no atendimento!</span>
                </div>
              )}
            </div>

            {/* Bloco 3: Categoria Jurídica e Fatos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>3. Categoria da Infração & Relato dos Fatos</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Selecione o enquadramento principal da autuação:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: "EXCESSO_VELOCIDADE", label: "Velocidade / Radar" },
                    { id: "LEI_SECA", label: "Lei Seca / Bafômetro" },
                    { id: "AVANCO_SEMAFORO", label: "Sinal Vermelho" },
                    { id: "ESTACIONAMENTO", label: "Estacionamento" },
                    { id: "OUTROS", label: "Outras Infrações" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setLegalCategory(cat.id)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition ${
                        legalCategory === cat.id
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detalhes de radar se velocidade */}
              {legalCategory === "EXCESSO_VELOCIDADE" && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mt-3">
                  <p className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                    Dados Metrológicos do Radar (Resolução CONTRAN 798/2020)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Limite Regulamentado
                      </label>
                      <input
                        type="text"
                        value={speedLimit}
                        onChange={(e) => setSpeedLimit(e.target.value)}
                        placeholder="Ex: 60 km/h"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Velocidade Medida
                      </label>
                      <input
                        type="text"
                        value={speedMeasured}
                        onChange={(e) => setSpeedMeasured(e.target.value)}
                        placeholder="Ex: 72 km/h"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Velocidade Considerada
                      </label>
                      <input
                        type="text"
                        value={speedConsidered}
                        onChange={(e) => setSpeedConsidered(e.target.value)}
                        placeholder="Ex: 65 km/h"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Relato do Condutor / O que aconteceu? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={defenseArguments}
                  onChange={(e) => setDefenseArguments(e.target.value)}
                  placeholder="Conte com suas palavras os detalhes do ocorrido (ex: ausência de placa de radar visível, urgência médica, condutor diferente, venda anterior do veículo, sinalização apagada, etc.)..."
                  className="w-full p-4 rounded-2xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none leading-relaxed transition"
                />
              </div>
            </div>

            {/* Bloco 4: Upload de MÚLTIPLOS Arquivos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>4. Envio de Documentos & Anexos (Múltiplos Arquivos)</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {documents.length} anexo(s)
                </span>
              </div>

              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 text-center hover:border-blue-400 transition">
                <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs border border-slate-200">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  Selecione um ou mais arquivos simultaneamente
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Envie a Notificação / Auto de Infração, CNH do condutor, CRLV do veículo e fotos probatórias (PDF, JPG, PNG).
                </p>

                <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center gap-3 justify-center">
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-semibold outline-none w-full sm:w-auto"
                  >
                    <option value="Auto de Infração / Notificação">Notificação / Auto de Infração</option>
                    <option value="CNH do Condutor">CNH do Condutor</option>
                    <option value="CRLV do Veículo">CRLV do Veículo</option>
                    <option value="Foto / Prova do Local">Foto / Prova do Local</option>
                    <option value="Outro Documento">Outro Documento</option>
                  </select>

                  <label className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Escolher Arquivos
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleMultipleFilesUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploading && (
                  <p className="text-xs text-blue-600 font-bold mt-4 flex items-center justify-center gap-1.5 animate-pulse">
                    <Clock className="w-4 h-4 animate-spin" /> Enviando arquivos selecionados...
                  </p>
                )}
              </div>

              {/* Lista dos Documentos Já Anexados */}
              {documents.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Documentos prontos para envio ({documents.length}):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 text-xs executive-shadow"
                      >
                        <div className="flex items-center gap-2.5 truncate mr-2">
                          <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-slate-800 truncate">{doc.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{doc.originalName} • {(doc.fileSize / 1024).toFixed(0)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDoc(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                          title="Remover anexo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Envio com Destaque Executivo */}
            <div className="pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading || (isDeadlineExpired && !confirmExpiredSubmission)}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:bg-slate-900 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Registrando Solicitação e Documentos...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    Enviar Solicitação para Elaboração da Defesa
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-500 mt-3 font-medium">
                Sua solicitação entrará em análise técnica. Prazo de elaboração de até 72 horas após confirmação do pagamento.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function NovoRecursoPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-slate-400 font-bold">Carregando formulário...</div>}>
      <NovoRecursoForm />
    </Suspense>
  );
}
