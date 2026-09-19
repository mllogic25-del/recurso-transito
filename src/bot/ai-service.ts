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
11. Se o cliente enviar foto ou PDF da notificação/multa:
   - Avise que abriu e conseguiu ver com clareza.
   - Mencione algum detalhe identificado (ex: artigo do CTB ou local).
   - Peça os demais documentos (CRLV, CNH) e o e-mail dele.
12. Se o cliente enviar áudio:
   - Responda normalmente e com simpatia ao que ele falou.
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
  mediaData?: { buffer: Buffer; mimeType: string } | null
): Promise<string> {
  try {
    let history = chatHistories.get(userPhone) || [];

    // Mantém as últimas 10 mensagens no histórico
    if (history.length > 10) {
      history = history.slice(history.length - 10);
    }

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

    // Se houver arquivo (foto, PDF ou áudio)
    if (mediaData && mediaData.buffer) {
      const cleanMimeType = mediaData.mimeType.split(";")[0].trim();
      currentParts.push({
        inline_data: {
          mime_type: cleanMimeType,
          data: mediaData.buffer.toString("base64"),
        },
      });
    }

    // Adiciona o texto ou prompt padrão
    let textPrompt =
      userMessage && userMessage.trim()
        ? userMessage
        : mediaData
        ? "Analise este documento ou foto de multa de trânsito que acabei de enviar e me diga o que encontrou."
        : "Olá";

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

    // Modelos modernos ordenados por velocidade e maior disponibilidade
    const candidateModels = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
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

          // Salva no histórico (apenas texto para manter o histórico leve)
          history.push({
            role: "user",
            parts: [{ text: userMessage || "[Enviou arquivo/foto de multa]" }],
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
