import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_TEMPLATES = [
  {
    title: "📋 Instruções de Protocolo Presencial (DETRAN / JARI)",
    category: "PROTOCOLO",
    content: `🏛️ *ORIENTAÇÕES PARA PROTOCOLO PRESENCIAL DO SEU RECURSO*

Olá, *{NOME}*! Seguem as instruções detalhadas para você protocolar a sua defesa referente à placa *{PLACA}* (Protocolo: *{PROTOCOLO}*):

📄 *DOCUMENTOS OBRIGATÓRIOS PARA LEVAR:*
1. *2 vias impressas e assinadas* da petição de recurso (uma via fica com o órgão e a outra fica com você com o carimbo).
2. *Cópia simples da sua CNH* (ou documento oficial com foto e assinatura).
3. *Cópia simples do CRLV* (documento do veículo).
4. *Cópia da Notificação de Autuação / Penalidade* (Auto de Infração: *{AIT}*).
5. *Comprovante de residência atualizado* (água, luz ou telefone).

📍 *ONDE DAR ENTRADA:*
- No posto de atendimento do *{ORGAO}* ou na unidade do DETRAN / Poupatempo / Ciretran mais próxima.

⚠️ *DICA DE OURO:*
Exija que o atendente carimbe, date e assine a sua segunda via com o número do protocolo do órgão. *Esse carimbo é o seu comprovante legal que garante o efeito suspensivo da multa e dos pontos na sua CNH enquanto o recurso for julgado!*

Qualquer dúvida durante o protocolo, estamos à sua disposição!
🛡️ *AutoRecurso - Recursos de Trânsito*`,
    isDefault: true,
  },
  {
    title: "📲 Protocolo 100% Online pelo App Carteira Digital (CDT)",
    category: "PROTOCOLO",
    content: `📲 *PASSO A PASSO PARA PROTOCOLAR ONLINE PELO APP CDT*

Olá, *{NOME}*! Você sabia que pode protocolar o seu recurso da placa *{PLACA}* direto pelo celular sem pegar filas? Veja como é simples:

1️⃣ Baixe e abra o aplicativo *Carteira Digital de Trânsito (CDT)* no seu celular e faça login com sua conta Gov.br (prata ou ouro).
2️⃣ Clique no menu *Veículos* e selecione o veículo de placa *{PLACA}*.
3️⃣ Toque na aba *Infrações* e selecione a autuação/multa (*{AIT}*).
4️⃣ Clique na opção *Apresentar Defesa Prévia / Recurso*.
5️⃣ O app vai solicitar os dados e o anexo do documento: basta anexar o arquivo da sua petição de recurso (arquivo baixado em Word ou PDF).
6️⃣ Confira as informações e clique em *Confirmar / Enviar*.
7️⃣ Salve o comprovante de envio em PDF gerado pelo próprio aplicativo CDT!

🔗 Link para baixar sua defesa pronta:
{LINK_DOWNLOAD}

Prontinho! Seu recurso estará oficialmente protocolado com efeito suspensivo.
🛡️ *AutoRecurso - Recursos de Trânsito*`,
    isDefault: true,
  },
  {
    title: "✅ Entrega de Recurso Pronto + Link de Acompanhamento",
    category: "ORIENTACOES",
    content: `🎉 *BOA NOTÍCIA: SUA DEFESA DE TRÂNSITO ESTÁ CONCLUÍDA!*

Olá, *{NOME}*!
A equipe técnica da *AutoRecurso* finalizou a confecção da sua peça jurídica de defesa referente ao veículo de placa *{PLACA}* (Protocolo: *{PROTOCOLO}*).

📥 *COMO BAIXAR SUA PEÇA AGORA:*
Clique no link oficial abaixo para acessar seu portal e fazer o download imediato do seu recurso pronto em formato Word/DOCX:
👉 {LINK_DOWNLOAD}

📌 *PRÓXIMO PASSO:*
Leia atentamente a peça, confira seus dados pessoais e assine no campo indicado. Em seguida, anexe cópia da sua CNH, CRLV e comprovante de endereço para protocolar presencialmente no *{ORGAO}* ou online pelo aplicativo Carteira Digital de Trânsito (CDT).

Desejamos muito sucesso na sua defesa!
🛡️ *AutoRecurso - Recursos de Trânsito*`,
    isDefault: true,
  },
  {
    title: "⚠️ Solicitação de Documentos Complementares",
    category: "DOCUMENTOS",
    content: `⚠️ *SOLICITAÇÃO DE DOCUMENTOS - DEFESA EM ANDAMENTO*

Olá, *{NOME}*!
Estamos na fase de redação técnica da sua defesa para a placa *{PLACA}* (Protocolo: *{PROTOCOLO}*).

Para deixarmos a fundamentação o mais sólida e precisa possível perante o órgão julgador, precisamos que você nos envie por aqui fotos legíveis ou PDFs de:
1. *CNH do condutor* (aberta, mostrando foto e assinatura)
2. *CRLV do veículo* (documento do ano vigente)
3. *Notificação de Infração / AIT* (onde conste data, local e enquadramento)

Assim que você nos enviar por aqui, nossa equipe dará continuidade imediata à finalização do seu recurso. Muito obrigado!
🛡️ *AutoRecurso - Recursos de Trânsito*`,
    isDefault: true,
  },
];

export async function GET() {
  try {
    let templates = await prisma.whatsAppTemplate.findMany({
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    // Se ainda não existir nenhum template cadastrado, popula com as rotinas padrão profissionais
    if (templates.length === 0) {
      await prisma.whatsAppTemplate.createMany({
        data: DEFAULT_TEMPLATES,
      });
      templates = await prisma.whatsAppTemplate.findMany({
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });
    }

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error("[Templates GET Error]:", error);
    return NextResponse.json(
      { error: "Erro ao buscar templates: " + (error?.message || error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, category, isDefault } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Título e conteúdo da mensagem são obrigatórios." },
        { status: 400 }
      );
    }

    const template = await prisma.whatsAppTemplate.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || "ORIENTACOES",
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error("[Templates POST Error]:", error);
    return NextResponse.json(
      { error: "Erro ao criar template: " + (error?.message || error) },
      { status: 500 }
    );
  }
}
