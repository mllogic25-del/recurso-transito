interface AppealGenerationData {
  protocol: string;
  type: string; // DEFESA_PREVIA, JARI, CETRAN
  authority: string;
  requesterName: string;
  requesterCpf: string;
  requesterRg?: string;
  requesterCnh?: string;
  requesterAddress?: string;
  plate: string;
  renavam?: string;
  vehicleModel?: string;
  aitNumber: string;
  ctbArticle: string;
  infractionDate: string;
  infractionTime?: string;
  infractionLocation: string;
  speedLimit?: string;
  speedMeasured?: string;
  speedConsidered?: string;
  radarModel?: string;
  lastVerification?: string;
  notificationDate?: string;
  defenseArguments: string;
  legalCategory: string;
}

export function generateLegalAppealDocument(data: AppealGenerationData): string {
  // Endereçamento
  let authorityHeader = "";
  let appealTypeName = "";

  if (data.type === "DEFESA_PREVIA") {
    appealTypeName = "DEFESA DA AUTUAÇÃO (DEFESA PRÉVIA)";
    authorityHeader = `ILUSTRÍSSIMO SENHOR PRESIDENTE DA AUTORIDADE DE TRÂNSITO DO ÓRGÃO AUTUADOR - ${data.authority.toUpperCase()}`;
  } else if (data.type === "JARI") {
    appealTypeName = "RECURSO ADMINISTRATIVO EM 1ª INSTÂNCIA - JARI";
    authorityHeader = `ILUSTRÍSSIMA JUNTA ADMINISTRATIVA DE RECURSOS DE INFRAÇÕES - JARI DO(A) ${data.authority.toUpperCase()}`;
  } else {
    appealTypeName = "RECURSO ADMINISTRATIVO EM 2ª INSTÂNCIA - CETRAN / CONTRAN";
    authorityHeader = `COLENDO CONSELHO ESTADUAL DE TRÂNSITO - CETRAN (OU CONTRANDIFE / CONTRAN)`;
  }

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Preliminares e Fundamentação de acordo com a categoria e dados fornecidos
  const preliminaries: string[] = [];
  const merits: string[] = [];

  // Preliminar 1: Princípios Constitucionais
  preliminaries.push(
    `1. DO DIREITO CONSTITUCIONAL À AMPLA DEFESA E AO CONTRADITÓRIO\n\n` +
    `A Carta Magna de 1988 preconiza expressamente em seu artigo 5º, incisos LIV e LV, a garantia pétrea de que ninguém será privado de seus bens ou direitos sem o devido processo legal, assegurando-se aos litigantes em processo administrativo ou judicial o direito irrestrito ao contraditório e à ampla defesa com os meios e recursos a ela inerentes.\n` +
    `Nesse liame, o processo administrativo de trânsito submete-se aos princípios da legalidade estrita, tipicidade e motivação dos atos administrativos.`
  );

  // Preliminar 2: Artigo 281 do CTB se houver dados de notificação
  if (data.notificationDate) {
    preliminaries.push(
      `2. DA DECADÊNCIA DO DIREITO DE PUNIR - ART. 281, PARÁGRAFO ÚNICO, INCISO II DO CTB\n\n` +
      `Dispõe o Código de Trânsito Brasileiro em seu art. 281, parágrafo único, inciso II, que o auto de infração será arquivado e seu registro julgado insubsistente caso a notificação da autuação não seja expedida no prazo máximo de 30 (trinta) dias contados da data do cometimento da infração (Súmula 312 do STJ).\n` +
      `No caso em tela, verifica-se a inobservância do prazo decadencial legal pelo órgão autuador, impondo-se a nulidade absoluta do procedimento sancionatório.`
    );
  }

  // Nulidades específicas por Categoria
  if (data.legalCategory === "EXCESSO_VELOCIDADE") {
    merits.push(
      `DOS REQUISITOS OBRIGATÓRIOS DO MEDIDOR DE VELOCIDADE (RESOLUÇÃO CONTRAN Nº 798/2020)\n\n` +
      `A Resolução CONTRAN nº 798/2020, em seus artigos 3º e 4º, estipula critérios rígidos e cogentes para a validade de autuações efetuadas por instrumentos medidores de velocidade (radares).\n` +
      `Para a regularidade do AIT, o aparelho medidor de velocidade deve OBRIGATORIAMENTE conter aprovação de modelo pelo INMETRO e laudo de verificação metrológica periódica realizado nos últimos 12 (doze) meses anteriores à data da infração.` +
      (data.speedLimit && data.speedMeasured
        ? `\n\nNa autuação em exame, consta como limite regulamentado ${data.speedLimit} e velocidade aferida de ${data.speedMeasured} (considerada ${data.speedConsidered || "não informada adequadamente"}). ` +
          `Entretanto, inexiste nos autos a comprovação indene de dúvidas da aferição metrológica tempestiva e regular do radar (${data.radarModel || "dispositivo eletrônico"}), violando o art. 280, § 2º do CTB.`
        : `\n\nNa autuação, não restou demonstrada a conformidade técnica exigida pela legislação metrológica, razão pela qual o ato padece de vício insanável de motivação e eficácia probatória.`)
    );
  } else if (data.legalCategory === "LEI_SECA") {
    merits.push(
      `DA AUSÊNCIA DE PROVA DA ALTERAÇÃO DA CAPACIDADE PSICOMOTORA (ART. 165 E 165-A DO CTB E RESOLUÇÃO 432/2013)\n\n` +
      `O preceito sancionador de trânsito exige, para a imputação da infração cominada ao art. 165 ou 165-A do CTB, a estrita observância das balizas fixadas pela Resolução nº 432/2013 do CONTRAN.\n` +
      `A jurisprudência pátria é pacífica no sentido de que a mera recusa desacompanhada da descrição detalhada de sinais inequívocos de embriaguez constante no Termo de Constatação de Sinais ou prova testemunhal idônea não autoriza a aplicação automática de penalidade gravíssima sem respaldo fático substancial, em respeito ao princípio da presunção de não culpabilidade (art. 5º, LVII da CF/88).`
    );
  } else if (data.legalCategory === "AVANCO_SEMAFORO") {
    merits.push(
      `DA INCONSISTÊNCIA DO AUTO DE INFRAÇÃO POR AVANÇO DE SINAL VERMELHO (ART. 208 DO CTB)\n\n` +
      `Para que se configure a infração descrita no art. 208 do CTB mediante fiscalização eletrônica, a Resolução CONTRAN determina que o sistema registre de forma indelével a fase vermelha do semáforo quando da transposição da linha de retenção, vedada a autuação quando o ingresso no cruzamento ocorrer durante o tempo de sinal amarelo ou em situações de desobstrução de veículos de socorro (art. 29, VII, CTB).`
    );
  } else if (data.legalCategory === "ESTACIONAMENTO") {
    merits.push(
      `DA DEFICIÊNCIA NA SINALIZAÇÃO DE REGULAMENTAÇÃO (ART. 88 E 90 DO CTB)\n\n` +
      `O art. 90 do Código de Trânsito Brasileiro é categórico ao determinar que 'não serão aplicadas as sanções previstas neste Código por inobservância à sinalização quando esta for insuficiente ou incorreta'.\n` +
      `No trecho apontado no AIT, a sinalização vertical/horizontal encontrava-se em desconformidade com os manuais de sinalização de trânsito do CONTRAN, gerando indução ao erro e inviabilizando a conduta exigível do motorista.`
    );
  } else {
    merits.push(
      `DO MÉRITO E DA INEXISTÊNCIA DE MATERIALIDADE DA INFRAÇÃO\n\n` +
      `O ato administrativo sancionador goza de presunção relativa (juris tantum) de veracidade e legitimidade, admitindo plena prova em contrário.\n` +
      `No presente caso, o suposto fato gerador carece de comprovação idônea, não tendo o agente autuador acostado elementos mínimos de convicção ou narrativa circunstanciada indispensável para sustentar a tipicidade da conduta apontada.`
    );
  }

  // Razões fáticas fornecidas pelo condutor
  const facts = `DOS FATOS E ALEGAÇÕES ESPECÍFICAS DO RECORRENTE\n\n` +
    `Trata-se de lavratura do Auto de Infração de Trânsito nº ${data.aitNumber}, imputando ao veículo de placa ${data.plate}, modelo ${data.vehicleModel || "não especificado"}, a suposta infração tipificada no ${data.ctbArticle}, supostamente cometida em ${data.infractionDate}${data.infractionTime ? " às " + data.infractionTime : ""} no endereço: ${data.infractionLocation}.\n\n` +
    `Contudo, a referida autuação merece total arquivamento, pelos motivos concretos relatados a seguir:\n\n` +
    `"${data.defenseArguments.trim()}"\n\n` +
    `Diante de tal panorama fático, resta evidente a incoerência da lavratura da autuação, tornando impositiva a reforma do ato administrativo.`;

  // Montagem do corpo da petição
  return `${authorityHeader}

Assunto: ${appealTypeName}
Auto de Infração nº: ${data.aitNumber}
Veículo / Placa: ${data.plate} ${data.renavam ? " | RENAVAM: " + data.renavam : ""}
Órgão Autuador: ${data.authority}

${data.requesterName.toUpperCase()}, brasileiro(a), inscrito(a) no CPF/MF sob o nº ${data.requesterCpf || "[CPF DO CONDUTOR/PROPRIETÁRIO]"}${data.requesterRg ? ", portador(a) do RG nº " + data.requesterRg : ""}${data.requesterCnh ? ", CNH nº " + data.requesterCnh : ""}, residente e domiciliado(a) no endereço ${data.requesterAddress || "[ENDEREÇO COMPLETO]"}, vem, respeitosamente, com fundamento na Lei Federal nº 9.503/1997 (Código de Trânsito Brasileiro), nas Resoluções vigentes do CONTRAN e na Constituição Federal de 1988, apresentar tempestivamente a presente:

${appealTypeName}

em face do Auto de Infração de Trânsito nº ${data.aitNumber}, pelas razões fáticas e jurídicas articuladas a seguir.

================================================================================
I - PRELIMINARMENTE: DA NULIDADE DO AUTO DE INFRAÇÃO
================================================================================

${preliminaries.join("\n\n--------------------------------------------------------------------------------\n\n")}

================================================================================
II - DOS FATOS
================================================================================

${facts}

================================================================================
III - DO MÉRITO E FUNDAMENTAÇÃO JURÍDICA
================================================================================

${merits.join("\n\n--------------------------------------------------------------------------------\n\n")}

================================================================================
IV - DOS PEDIDOS
================================================================================

Ex positis, demonstradas a inconsistência do Auto de Infração de Trânsito e as razões de fato e de direito expostas, requer-se a esta respeitável Autoridade Julgadora:

a) O RECEBIMENTO da presente ${appealTypeName}, porquanto tempestiva e instruída com os documentos de praxe (cópia da notificação/AIT, CNH, CRLV e provas documentais análogas);

b) A CONCESSÃO DE EFEITO SUSPENSIVO, nos termos do art. 285, § 3º do CTB, obstando a cobrança da penalidade pecuniária e a anotação provisória de pontos no prontuário do condutor até julgamento definitivo;

c) NO MÉRITO, seja dado INTEGRAL PROVIMENTO a esta defesa/recurso, com o consequente ARQUIVAMENTO do Auto de Infração de Trânsito nº ${data.aitNumber} e a declaração de insubsistência de seu registro, com fulcro no art. 281, parágrafo único do CTB;

d) A baixa imediata de quaisquer restrições ou pontuações decorrentes da autuação guerreada;

e) A produção de todos os meios de prova em direito admitidos, especialmente documental já juntada e informações do banco de dados do órgão de trânsito.

Nestes termos,
Pede e espera Deferimento.

Localidade: ${data.infractionLocation.split("-")[0]?.trim() || "Localidade / UF"}
Data: ${currentDate}.


____________________________________________________________________
${data.requesterName.toUpperCase()}
CPF: ${data.requesterCpf || ""}
Assinatura do Recorrente / Condutor ou Assinatura Digital (Gov.br)
`;
}
