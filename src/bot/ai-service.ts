import { lookupAppealStatus, formatAppealHumanStatus } from "../lib/appeal-lookup";

const SYSTEM_PROMPT = `
Você é o Samuca, consultor especialista em recursos de multas e direito de trânsito da AutoRecurso.
Seu objetivo é atender clientes no WhatsApp de forma 100% humanizada, atenciosa, empática, objetiva e muito honesta e transparente.

DIRETRIZES DE PERSONALIDADE E ÉTICA (EXTREMAMENTE IMPORTANTE):
1. NUNCA PROMETA OU GARANTA ÊXITO/VITÓRIA: Na área jurídica de trânsito, a elaboração do recurso é uma obrigação de meio e não de resultado. Nunca diga "é causa ganha" ou "garantimos que sua multa vai ser cancelada".
2. TRANSPARÊNCIA COM O CLIENTE: Explique de forma simples e profissional que o recurso reúne os melhores argumentos técnicos, jurídicos e erros formais do auto para buscar o cancelamento, mas o resultado final depende do julgamento da autoridade/junta julgadora (como a JARI ou CETRAN) e de cada caso específico.
3. BENEFÍCIOS REAIS DO RECURSO: Lembre ao cliente que entrar com recurso é um direito garantido por lei e que, enquanto o processo estiver em julgamento, a pontuação fica com efeito suspensivo (não bloqueia nem entra na CNH) e ele ganha tempo legal para se defender.

DIRETRIZES DE COLETA DE DOCUMENTOS E DADOS:
4. DOCUMENTOS NECESSÁRIOS: Para confeccionar a melhor defesa possível, oriente o cliente a enviar fotos ou PDFs dos documentos principais:
   - Auto de Infração / Notificação da Multa (AIT)
   - CRLV (documento do veículo)
   - CNH do condutor
5. DOCUMENTOS ADICIONAIS / PROVAS: Sempre pergunte se ele tem mais algum documento ou prova que queira anexar (como fotos do local da infração, comprovante de venda, atestado médico, recibos ou testemunhas).
6. DADOS DE CONTATO E CADASTRO: Peça o e-mail do cliente (para envio da petição pronta) e confirme o telefone dele.
7. RELATO DETALHADO DO OCORRIDO: Pergunte se há alguma informação a mais sobre o que aconteceu no dia que ele queira acrescentar. Explique com gentileza que quanto mais detalhes ele relatar, mais personalizada e forte fica a confecção da peça de defesa!
8. TRANQUILIDADE E CONTATO DA EQUIPE: Deixe o cliente seguro avisando que, caso nossa equipe de especialistas precise de mais algum documento ou detalhe complementar durante a elaboração, entraremos em contato diretamente com ele por aqui mesmo!

CONSULTA DE PROTOCOLO E STATUS DO RECURSO (MUITO IMPORTANTE):
9. SE O CLIENTE QUISER CONSULTAR O ANDAMENTO / STATUS DO RECURSO:
   - Se o cliente perguntar como está o recurso mas NÃO informou o número do protocolo:
     Pergunte com gentileza: "Com certeza! Você tem o número do seu protocolo em mãos (ex: REC-2026-...)? Se não tiver ou tiver esquecido, não se preocupe: basta me informar a PLACA do seu veículo ou o seu CPF que eu localizo seu recurso agora mesmo!".
   - Se os dados do recurso constarem no contexto (encontrados no sistema):
     Apresente o status de forma clara, amigável e segura (diga o número do protocolo, a placa do veículo e como está o andamento).
   - Se o cliente informar protocolo, placa ou CPF e nada for encontrado no banco de dados:
     Explique educadamente que não localizou nenhum recurso com esses dados e pergunte se ele gostaria de dar entrada agora na elaboração da defesa.

COMO CONDUZIR A CONVERSA NO WHATSAPP:
10. Conduza passo a passo: Não mande tudo de uma vez só em um bloco gigante! Faça perguntas naturais e divididas (no máximo 2 a 3 frases por mensagem).
11. ANÁLISE DE DOCUMENTOS (UM POR VEZ OU VÁRIOS DE UMA VEZ):
   - O cliente pode enviar um documento por vez OU selecionar e enviar vários documentos de uma vez só no WhatsApp.
   - ANALISE CADA DOCUMENTO IDENTIFICADO:
     * Notificação / Auto de Infração (AIT): Cite a placa, a infração e os pontos identificados.
     * CRLV (Doc do Veículo): Cite o modelo do carro e o nome do proprietário registrado.
     * CNH (Habilitação): Cite o nome do condutor identificado na carteira.
   - ANÁLISE DO QUE FALTA (CHECKLIST INTELIGENTE):
     * Os 3 documentos principais necessários são: Notificação/AIT + CRLV + CNH.
     * Avalie todos os documentos recebidos até agora nesta conversa e informe com clareza o que foi reconhecido e o que AINDA FALTA:
       - Se enviou só a Notificação: "Recebi a notificação da multa! Para montarmos a defesa, agora só falta o CRLV do veículo e a sua CNH."
       - Se já tem Notificação e CRLV: "Ótimo, já temos a notificação e o CRLV! Agora só falta a foto da sua CNH."
       - Se enviou os 3 juntos ou já completou os 3: "Show de bola! Recebi todos os 3 documentos principais (Notificação, CRLV e CNH)! A documentação básica está completa. Agora, para finalizarmos o cadastro: qual o seu e-mail para enviarmos a defesa pronta? E você gostaria de relatar algum detalhe do ocorrido no dia?"
   - NUNCA peça novamente um documento que o cliente já enviou nesta conversa!
12. RECONHECIMENTO NATIVO DE VOZ E MENSAGENS DE ÁUDIO:
   - Você possui audição e compreensão profunda de mensagens de voz enviadas pelo cliente no WhatsApp!
   - Quando o cliente mandar um áudio / mensagem de voz:
     * Ouça com atenção tudo o que ele falou (o relato de como foi a multa, desabafo, dúvidas de prazos, perguntas de valores, dados do carro ou placa).
     * Deixe claro que você ouviu com atenção o áudio dele (ex: "Ouvi seu áudio aqui com atenção, fica tranquilo!", "Entendi perfeitamente o que você explicou no áudio sobre a situação do radar...").
     * Responda diretamente e com empatia ao que ele falou no áudio.
     * Se ele enviou áudio junto com fotos de documentos, cruze as informações do áudio com o que está visível nos documentos!
13. Valores e Pagamento:
   - Explique que a confecção da defesa técnica completa e personalizada custa apenas R$ 20,00 e fica pronta rapidamente.
   - Forneça o link seguro oficial da Kiwify para pagamento via Pix ou Cartão: https://pay.kiwify.com.br/AOM7Bs9
   - Peça para avisar assim que concluir para darmos prioridade máxima na elaboração.
14. Transbordo Humano:
   - Se o cliente pedir para falar com uma pessoa da equipe, diga: "Tranquilo! Já avisei nossa equipe e um dos nossos especialistas vai te chamar aqui em instantes, só um minutinho!".
15. Estilo de escrita: Use linguagem brasileira autêntica, calorosa e educada ("Opa, tudo bem?", "Tranquilo!", "Entendi perfeitamente", "Show de bola", "Fica em paz que a gente te ajuda"). Evite poluição de emojis e nunca mande textões compridos.
16. CLIENTE VINDO POR INDICAÇÃO / AFILIADO (PROGRAMA INDIQUE E GANHE):
   - Se a mensagem inicial contiver "[Indicação: CODIGO]", reconheça com entusiasmo: "Show de bola! Vi que você veio indicado pelo nosso parceiro [CODIGO]. Vamos cuidar do seu recurso com prioridade máxima!".
   - Se for um primeiro contato comum e o cliente ainda não informou código: após cumprimentar e antes de fechar o pedido, pergunte com naturalidade: "Ah, uma perguntinha rápida: você foi indicado por algum amigo ou possui algum código de indicação de parceiro nosso? Se tiver, pode me mandar aqui para eu registrar no seu cadastro!".
   - Se o cliente disser o código (ex: "fui indicado pelo código IND-1234") ou o nome de quem indicou: responda com gentileza confirmando o registro: "Perfeito! Já registrei aqui a indicação com sucesso."
`;

interface ChatMessage {
  role: "user" | "model";
  parts: Array<any>;
}

const chatHistories = new Map<string, ChatMessage[]>();

export async function generateSamucaResponse(
  userPhone: string,
  userMessage: string,
  apiKey: string,
  mediaData?: { buffer: Buffer; mimeType: string } | Array<{ buffer: Buffer; mimeType: string }> | null
): Promise<string> {
  try {
    let history = chatHistories.get(userPhone) || [];

    // Mantém as últimas 12 mensagens no histórico
    if (history.length > 12) {
      history = history.slice(history.length - 12);
    }

    // Normaliza arquivos recebidos (seja único ou múltiplos)
    const files: Array<{ buffer: Buffer; mimeType: string }> = Array.isArray(mediaData)
      ? mediaData
      : mediaData && mediaData.buffer
      ? [mediaData]
      : [];

    // Classifica os tipos de arquivos recebidos
    const hasAudio = files.some((f) => f.mimeType.startsWith("audio/"));
    const hasMediaDocs = files.some((f) => f.mimeType.startsWith("image/") || f.mimeType === "application/pdf");

    // Verifica se é uma solicitação de consulta de protocolo/status/placa/cpf
    let systemContextExtra = "";
    const lowerMsg = (userMessage || "").toLowerCase();
    const isStatusQuery =
      lowerMsg.includes("status") ||
      lowerMsg.includes("protocolo") ||
      lowerMsg.includes("andamento") ||
      lowerMsg.includes("como esta") ||
      lowerMsg.includes("como tá") ||
      lowerMsg.includes("consultar") ||
      lowerMsg.includes("meu recurso") ||
      /rec-\d{4}-\d+/i.test(userMessage || "") ||
      /[a-z]{3}[0-9][a-z0-9][0-9]{2}/i.test((userMessage || "").replace(/[^a-zA-Z0-9]/g, "")) ||
      /\d{11}/.test((userMessage || "").replace(/\D/g, ""));

    if (isStatusQuery && userMessage.trim().length >= 3) {
      const appealFound = await lookupAppealStatus(userMessage, userPhone);
      if (appealFound) {
        systemContextExtra = `\n\n[SISTEMA - RECURSO ENCONTRADO NO BANCO DE DADOS]:\n${formatAppealHumanStatus(
          appealFound
        )}\nInstrução: Informe este status com clareza, empatia e entusiasmo para o cliente! Diga o protocolo e a placa dele.`;
      }
    }

    const currentParts: any[] = [];

    // Anexa todos os arquivos do lote (seja áudios, fotos ou PDFs)
    for (const file of files) {
      if (file && file.buffer) {
        const cleanMimeType = file.mimeType.split(";")[0].trim();
        currentParts.push({
          inline_data: {
            mime_type: cleanMimeType,
            data: file.buffer.toString("base64"),
          },
        });
      }
    }

    // Adiciona o prompt contextualizado para voz, fotos ou texto
    let textPrompt = "";
    if (userMessage && userMessage.trim()) {
      textPrompt = userMessage;
      if (hasAudio) {
        textPrompt += "\n[Nota do Sistema: O cliente também enviou um áudio / mensagem de voz. Ouça atentamente e responda ao que ele falou no áudio!]";
      }
    } else if (hasAudio && hasMediaDocs) {
      textPrompt = "Analise os documentos e fotos enviados e ouça atentamente a mensagem de voz do cliente. Conecte o que ele relatou no áudio com os documentos para responder de forma completa e personalizada.";
    } else if (hasAudio) {
      textPrompt = "Ouça atentamente esta mensagem de voz enviada pelo cliente. Transcreva e compreenda tudo o que ele falou (relato da multa, dúvidas, placas, dados) e responda de forma acolhedora, humana e prestativa diretamente ao áudio dele.";
    } else if (files.length > 1) {
      textPrompt = `Analise estes ${files.length} documentos/fotos que acabei de enviar juntos. Identifique cada um deles individualmente (Notificação/AIT de multa, CRLV, CNH, Comprovante, etc.), confira com os que já te mandei antes e me diga o que encontrou e se ainda falta algum documento para dar entrada no recurso.`;
    } else if (files.length === 1) {
      textPrompt = "Analise esta foto ou documento que acabei de enviar. Identifique exatamente o que é (CNH, CRLV, Notificação de Multa ou outro), confira com os que já te mandei antes e me diga o que encontrou e se ainda falta algum documento.";
    } else {
      textPrompt = "Olá";
    }

    if (systemContextExtra) {
      textPrompt += `\n${systemContextExtra}`;
    }

    currentParts.push({ text: textPrompt });

    const newContents = [
      ...history,
      {
        role: "user",
        parts: currentParts,
      },
    ];

    // Modelos oficiais validados e ativos na API do Google com tolerância a picos de demanda
    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-flash-lite-latest",
      "gemini-3-flash-preview",
      "gemini-flash-latest",
    ];

    for (const modelName of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents: newContents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        });

        const data: any = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const responseText = data.candidates[0].content.parts[0].text.trim();

          // Salva no histórico mantendo o contexto rico
          const userSummary = userMessage
            ? hasAudio
              ? `${userMessage} [Mensagem de voz/áudio enviada]`
              : userMessage
            : hasAudio
            ? "[Enviou mensagem de voz / áudio relatando o caso]"
            : files.length > 0
            ? `[Enviou ${files.length} documento(s) / foto(s)]`
            : "Olá";

          history.push({
            role: "user",
            parts: [{ text: userSummary }],
          });
          history.push({ role: "model", parts: [{ text: responseText }] });
          chatHistories.set(userPhone, history);

          return responseText;
        }

        console.warn(`[Samuca AI] Modelo ${modelName} indisponível:`, JSON.stringify(data.error || data).substring(0, 300));
      } catch (callErr) {
        console.warn(`[Samuca AI] Falha de rede no modelo ${modelName}:`, callErr);
      }
    }

    // Se todos os modelos da IA oscilarem, responde de forma variada baseado no histórico
    console.error("[Samuca AI] TODOS os modelos falharam. Usando fallback estático.");

    const totalMsgs = history.length;

    if (mediaData) {
      // Varia a resposta para não repetir em loop
      if (totalMsgs <= 2) {
        return "Show de bola, recebi seu arquivo aqui! Já estou abrindo. Além da notificação, você teria o CRLV do veículo e sua CNH para anexarmos na defesa?";
      } else if (totalMsgs <= 6) {
        return "Recebi mais esse documento! Obrigado por enviar. Se tiver mais algum, pode mandar que vou organizando tudo aqui. Quando tiver todos os documentos, seguimos para o recurso!";
      } else {
        return "Ótimo, recebi! Pode ficar tranquilo que seus documentos estão salvos aqui comigo. Precisa de mais alguma coisa?";
      }
    }

    if (lowerMsg.includes("status") || lowerMsg.includes("protocolo")) {
      return "Com certeza! Você tem o número do seu protocolo em mãos (ex: REC-2026-...)? Se não tiver ou tiver esquecido, pode me passar a PLACA do seu carro ou o seu CPF que eu puxo o andamento aqui!";
    }

    const lower = (userMessage || "").toLowerCase();
    if (lower.includes("carteira") || lower.includes("sne") || lower.includes("app") || lower.includes("cdt")) {
      return "Show de bola! Consegue tirar um print da tela da infração na Carteira Digital e me mandar aqui? Aproveita e me manda também seu e-mail para cadastro!";
    }

    return "Tranquilo! Consegue me mandar uma foto da notificação ou a placa e o motivo da multa? Assim já dou uma olhada para você!";
  } catch (error: any) {
    console.error("[Samuca AI Error]:", error);
    return "Opa, deu uma pequena oscilação aqui na conexão! Pode mandar de novo rapidinho?";
  }
}
