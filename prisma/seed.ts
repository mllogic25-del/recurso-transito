import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const clientPassword = await bcrypt.hash("cliente123", 10);

  // 1. Criar Administrador
  const admin = await prisma.user.upsert({
    where: { email: "admin@autorecurso.com.br" },
    update: {},
    create: {
      name: "Administrador do Sistema",
      email: "admin@autorecurso.com.br",
      passwordHash: adminPassword,
      role: "ADMIN",
      cpf: "000.000.000-00",
      phone: "(11) 99999-8888",
    },
  });

  // 2. Criar Cliente de Teste
  const client = await prisma.user.upsert({
    where: { email: "cliente@exemplo.com.br" },
    update: {},
    create: {
      name: "Carlos Eduardo da Silva",
      email: "cliente@exemplo.com.br",
      passwordHash: clientPassword,
      role: "CLIENT",
      cpf: "123.456.789-00",
      rg: "12.345.678-9 SSP/SP",
      cnh: "01234567890",
      phone: "(11) 98765-4321",
      address: "Av. Paulista, 1000, Apto 52, Bela Vista, São Paulo - SP",
    },
  });

  // 3. Criar Modelos Jurídicos Padrão
  const templates = [
    {
      title: "Recurso de Excesso de Velocidade (Radar Eletrônico)",
      category: "EXCESSO_VELOCIDADE",
      ctbArticle: "Art. 218 do CTB",
      description: "Arguição de nulidade por ausência de aferição metrológica nos últimos 12 meses (Res. CONTRAN 798/2020) e margem de erro não considerada.",
      defaultPreliminaries: "Nulidade por inobservância da Resolução 798/2020 do CONTRAN e prazo do art. 281 do CTB.",
      defaultMerit: "Ausência de comprovação de verificação do Inmetro no período de 12 meses anteriores ao ato.",
      defaultRequests: "Cancelamento da autuação e extinção de pontos.",
    },
    {
      title: "Defesa de Autuação por Recusa ao Bafômetro",
      category: "LEI_SECA",
      ctbArticle: "Art. 165-A do CTB",
      description: "Ausência de sinais notórios de embriaguez no termo de constatação (Res. CONTRAN 432/2013) e princípio da presunção de inocência.",
      defaultPreliminaries: "Direito de não autoincriminação (nemo tenetur se detegere) e falta de justa causa.",
      defaultMerit: "Falta de preenchimento do termo de sinais de alteração psicomotora.",
      defaultRequests: "Arquivamento e devolução provisória do direito de dirigir.",
    },
    {
      title: "Recurso por Avanço de Sinal Vermelho",
      category: "AVANCO_SEMAFORO",
      ctbArticle: "Art. 208 do CTB",
      description: "Transposição no amarelo ou para dar passagem a veículo de emergência / ambulância / segurança.",
      defaultPreliminaries: "Excludente de ilicitude por estado de necessidade ou trânsito livre de ambulância.",
      defaultMerit: "Transposição de sinal em cruzamento perigoso durante horário noturno para salvaguardar a integridade física.",
      defaultRequests: "Conversão em advertência ou cancelamento integral.",
    },
  ];

  for (const t of templates) {
    await prisma.legalTemplate.upsert({
      where: { category: t.category },
      update: {},
      create: t,
    });
  }

  // 4. Criar um recurso de exemplo para o cliente
  const existingAppeal = await prisma.appealRequest.findFirst({
    where: { aitNumber: "B45892147" },
  });

  if (!existingAppeal) {
    await prisma.appealRequest.create({
      data: {
        protocol: "REC-2026-00001",
        userId: client.id,
        status: "READY",
        type: "DEFESA_PREVIA",
        authority: "DETRAN-SP",
        aitNumber: "B45892147",
        plate: "ABC1D23",
        renavam: "00123456789",
        vehicleModel: "Fiat Argo Drive 1.0 2022",
        ctbArticle: "Art. 218, I - Transitar em velocidade superior à máxima em até 20%",
        infractionDate: "10/02/2026",
        infractionTime: "14:35",
        infractionLocation: "Av. 23 de Maio, Km 3, sentido Bairro, São Paulo - SP",
        speedLimit: "60 km/h",
        speedMeasured: "69 km/h",
        speedConsidered: "62 km/h",
        radarModel: "FOTOSSENSOR DIGITAL FX-200",
        lastVerification: "05/01/2025 (Mais de 12 meses)",
        notificationDate: "25/02/2026",
        defenseArguments: "No dia dos fatos, o tráfego estava em fluxo normal e o veículo estava acompanhando o fluxo de trânsito. Ademais, verifiquei que o equipamento de fiscalização eletrônica não continha a placa de sinalização de velocidade R-19 regulamentar visível no trecho anterior, além de o laudo de verificação periódica anual do INMETRO encontrar-se expirado, infringindo a Resolução 798/2020 do CONTRAN.",
        legalCategory: "EXCESSO_VELOCIDADE",
        generatedDocument: `ILUSTRÍSSIMO SENHOR PRESIDENTE DA AUTORIDADE DE TRÂNSITO DO ÓRGÃO AUTUADOR - DETRAN-SP

Assunto: DEFESA DA AUTUAÇÃO (DEFESA PRÉVIA)
Auto de Infração nº: B45892147
Veículo / Placa: ABC1D23 | RENAVAM: 00123456789
Órgão Autuador: DETRAN-SP

CARLOS EDUARDO DA SILVA, brasileiro(a), inscrito(a) no CPF/MF sob o nº 123.456.789-00, portador(a) do RG nº 12.345.678-9 SSP/SP, CNH nº 01234567890, residente e domiciliado(a) no endereço Av. Paulista, 1000, Apto 52, Bela Vista, São Paulo - SP, vem, respeitosamente, com fundamento na Lei Federal nº 9.503/1997 (Código de Trânsito Brasileiro), nas Resoluções vigentes do CONTRAN e na Constituição Federal de 1988, apresentar tempestivamente a presente:

DEFESA DA AUTUAÇÃO (DEFESA PRÉVIA)

em face do Auto de Infração de Trânsito nº B45892147, pelas razões fáticas e jurídicas articuladas a seguir.

================================================================================
I - PRELIMINARMENTE: DA NULIDADE DO AUTO DE INFRAÇÃO
================================================================================

1. DO DIREITO CONSTITUCIONAL À AMPLA DEFESA E AO CONTRADITÓRIO

A Carta Magna de 1988 preconiza expressamente em seu artigo 5º, incisos LIV e LV, a garantia pétrea de que ninguém será privado de seus bens ou direitos sem o devido processo legal, assegurando-se aos litigantes em processo administrativo ou judicial o direito irrestrito ao contraditório e à ampla defesa com os meios e recursos a ela inerentes.
Nesse liame, o processo administrativo de trânsito submete-se aos princípios da legalidade estrita, tipicidade e motivação dos atos administrativos.

--------------------------------------------------------------------------------

2. DA DECADÊNCIA DO DIREITO DE PUNIR - ART. 281, PARÁGRAFO ÚNICO, INCISO II DO CTB

Dispõe o Código de Trânsito Brasileiro em seu art. 281, parágrafo único, inciso II, que o auto de infração será arquivado e seu registro julgado insubsistente caso a notificação da autuação não seja expedida no prazo máximo de 30 (trinta) dias contados da data do cometimento da infração (Súmula 312 do STJ).

================================================================================
II - DOS FATOS
================================================================================

DOS FATOS E ALEGAÇÕES ESPECÍFICAS DO RECORRENTE

Trata-se de lavratura do Auto de Infração de Trânsito nº B45892147, imputando ao veículo de placa ABC1D23, modelo Fiat Argo Drive 1.0 2022, a suposta infração tipificada no Art. 218, I - Transitar em velocidade superior à máxima em até 20%, supostamente cometida em 10/02/2026 às 14:35 no endereço: Av. 23 de Maio, Km 3, sentido Bairro, São Paulo - SP.

Contudo, a referida autuação merece total arquivamento, pelos motivos concretos relatados a seguir:

"No dia dos fatos, o tráfego estava em fluxo normal e o veículo estava acompanhando o fluxo de trânsito. Ademais, verifiquei que o equipamento de fiscalização eletrônica não continha a placa de sinalização de velocidade R-19 regulamentar visível no trecho anterior, além de o laudo de verificação periódica anual do INMETRO encontrar-se expirado, infringindo a Resolução 798/2020 do CONTRAN."

Diante de tal panorama fático, resta evidente a incoerência da lavratura da autuação, tornando impositiva a reforma do ato administrativo.

================================================================================
III - DO MÉRITO E FUNDAMENTAÇÃO JURÍDICA
================================================================================

DOS REQUISITOS OBRIGATÓRIOS DO MEDIDOR DE VELOCIDADE (RESOLUÇÃO CONTRAN Nº 798/2020)

A Resolução CONTRAN nº 798/2020, em seus artigos 3º e 4º, estipula critérios rígidos e cogentes para a validade de autuações efetuadas por instrumentos medidores de velocidade (radares).
Para a regularidade do AIT, o aparelho medidor de velocidade deve OBRIGATORIAMENTE conter aprovação de modelo pelo INMETRO e laudo de verificação metrológica periódica realizado nos últimos 12 (doze) meses anteriores à data da infração.

Na autuação em exame, consta como limite regulamentado 60 km/h e velocidade aferida de 69 km/h (considerada 62 km/h). Entretanto, inexiste nos autos a comprovação indene de dúvidas da aferição metrológica tempestiva e regular do radar (FOTOSSENSOR DIGITAL FX-200), violando o art. 280, § 2º do CTB.

================================================================================
IV - DOS PEDIDOS
================================================================================

Ex positis, demonstradas a inconsistência do Auto de Infração de Trânsito e as razões de fato e de direito expostas, requer-se a esta respeitável Autoridade Julgadora:

a) O RECEBIMENTO da presente DEFESA DA AUTUAÇÃO (DEFESA PRÉVIA), porquanto tempestiva e instruída com os documentos de praxe (cópia da notificação/AIT, CNH, CRLV e provas documentais análogas);

b) A CONCESSÃO DE EFEITO SUSPENSIVO, nos termos do art. 285, § 3º do CTB, obstando a cobrança da penalidade pecuniária e a anotação provisória de pontos no prontuário do condutor até julgamento definitivo;

c) NO MÉRITO, seja dado INTEGRAL PROVIMENTO a esta defesa/recurso, com o consequente ARQUIVAMENTO do Auto de Infração de Trânsito nº B45892147 e a declaração de insubsistência de seu registro, com fulcro no art. 281, parágrafo único do CTB;

d) A baixa imediata de quaisquer restrições ou pontuações decorrentes da autuação guerreada;

e) A produção de todos os meios de prova em direito admitidos, especialmente documental já juntada e informações do banco de dados do órgão de trânsito.

Nestes termos,
Pede e espera Deferimento.

Localidade: São Paulo - SP
Data: 14 de setembro de 2026.


____________________________________________________________________
CARLOS EDUARDO DA SILVA
CPF: 123.456.789-00
Assinatura do Recorrente / Condutor ou Assinatura Digital (Gov.br)
`,
        readyAt: new Date(),
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
