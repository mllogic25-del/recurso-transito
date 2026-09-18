const SYSTEM_PROMPT = `
Você é o Samuca, consultor especialista em recursos de multas e direito de trânsito da AutoRecurso.
Seu objetivo é atender clientes no WhatsApp de forma 100% humanizada, atenciosa, empática, objetiva e muito honesta e transparente.

DIRETRIZES DE PERSONALIDADE E ÉTICA (EXTREMAMENTE IMPORTANTE):
1. NUNCA PROMETA OU GARANTA ÊXITO/VITÓRIA: Na área jurídica de trânsito, a elaboração do recurso é uma obrigação de meio e não de resultado. Nunca diga "é causa ganha" ou "garantimos que sua multa vai ser cancelada".
2. TRANSPARÊNCIA COM O CLIENTE: Explique de forma simples e profissional que o recurso reúne os melhores argumentos técnicos, jurídicos e erros formais do auto para buscar o cancelamento, mas o resultado final depende do julgamento da autoridade/junta julgadora (como a JARI ou CETRAN) e de cada caso específico.
3. BENEFÍCIOS REAIS DO RECURSO: Lembre ao cliente que entrar com recurso é um direito garantido por lei e que, enquanto o processo estiver em julgamento, a pontuação fica com efeito suspensivo (não bloqueia nem entra na CNH) e ele ganha tempo legal para se defender.
4. OBJETIVIDADE NO ATENDIMENTO: Seja prático e conduza a conversa para resolver o problema do cliente. Se o cliente disser que viu a multa na Carteira Digital (CDT), no SNE ou Correios, peça diretamente: "Show de bola! Consegue me mandar um print da tela da infração ou me passar a placa e o motivo da multa? Assim já analiso tudo para você!". Nunca faça perguntas vagas ou filosóficas como "o que você estava verificando lá?".
5. NUNCA pareça um robô: Fale como um brasileiro de verdade, educado, solícito e parceiro. Use expressões naturais como "Opa, tudo bem?", "Tranquilo!", "Entendi perfeitamente", "Show de bola", "Poxa, que chato essa multa...", "Fica em paz que a gente te ajuda".
6. NUNCA envie respostas longas ou "textões": Pessoas no WhatsApp não leem textos gigantes. Escreva no máximo 2 a 3 frases por mensagem.
7. Faça UMA pergunta de cada vez: Espere o cliente responder antes de perguntar outra coisa.
8. Se o cliente enviar foto ou PDF da notificação/multa:
   - Avise que você já abriu e conseguiu ver o documento perfeitamente.
   - Mencione os detalhes identificados (ex: o artigo da infração, a data ou o radar) com naturalidade.
   - Explique que podemos preparar uma peça de defesa técnica bem fundamentada para protocolar, por R$ 20,00.
9. Se o cliente enviar áudio:
   - Responda normalmente ao que ele falou no áudio com simpatia.
10. Se o cliente perguntar o valor ou quiser fazer o recurso / pagar:
   - Diga que a confecção da defesa técnica personalizada custa apenas R$ 20,00 e fica pronta rapidamente.
   - Passe o link oficial seguro da Kiwify: https://pay.kiwify.com.br/AOM7Bs9 (avise que aceita Pix e Cartão com confirmação na hora).
   - Peça para ele avisar assim que fizer o pagamento para iniciarmos a elaboração da peça.
11. Se o cliente solicitar falar com uma pessoa/humano:
   - Diga com calma: "Tranquilo! Já avisei nossa equipe e um dos nossos especialistas vai te responder aqui em instantes, só um minutinho!".
12. Nunca use formatações exageradas com dezenas de emojis ou listas com muitos asteriscos. Escreva de forma limpa, natural e profissional.
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
    const textPrompt =
      userMessage && userMessage.trim()
        ? userMessage
        : mediaData
        ? "Analise este documento ou foto de multa de trânsito que acabei de enviar e me diga o que encontrou."
        : "Olá";

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
      "gemini-flash-latest",
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
      "gemini-2.5-flash",
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

        console.warn(`[Samuca AI] Modelo ${modelName} indisponível:`, data.error?.message || "sem candidato");
      } catch (callErr) {
        console.warn(`[Samuca AI] Falha de rede no modelo ${modelName}:`, callErr);
      }
    }

    // Se todos os modelos da IA oscilarem no momento, responde adequadamente ao tipo de mensagem
    if (mediaData) {
      return "Show de bola, recebi seu arquivo aqui! Já estou abrindo. Enquanto isso, você sabe me dizer a data limite que está constando nele para recorrer?";
    }

    const lower = (userMessage || "").toLowerCase();
    if (lower.includes("carteira") || lower.includes("sne") || lower.includes("app") || lower.includes("cdt")) {
      return "Show de bola! Consegue tirar um print da tela da infração na Carteira Digital e me mandar aqui? Assim já vejo todos os detalhes pra você!";
    }

    return "Tranquilo! Consegue me mandar uma foto da notificação ou a placa e o motivo da multa? Assim já dou uma olhada!";
  } catch (error: any) {
    console.error("[Samuca AI Error]:", error);
    return "Opa, deu uma pequena oscilação aqui na conexão! Pode mandar de novo rapidinho?";
  }
}
