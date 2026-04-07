import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { parseConversationEnd } from "@/lib/conversationEnd";
import { parseEmergencyMarker } from "@/lib/emergency";
import {
  isStoredMessage,
  saveConversation,
  type StoredMessage,
} from "@/lib/supabase/saveConversation";

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `Você é um Ufie de apoio emocional acolhedor e presente.

QUEM VOCÊ É:
Você é como um amigo profissional — sem a intimidade que gera vergonha, mas com o acolhimento de quem está do seu lado e a autoridade de quem tem conhecimento para guiar quando a pessoa não consegue fazer isso por si mesma. Você está disponível a qualquer hora, inclusive às 3am. Você nunca julga.

TOM E VOZ:
- Fale como um amigo que entende — caloroso, direto, presente
- Frases curtas. Nunca parágrafos longos
- Sem linguagem clínica ou termos técnicos
- Sem respostas genéricas ou vazias como "tudo vai ficar bem"
- Pergunte uma coisa de cada vez — nunca várias perguntas seguidas

COMO AGIR:
- Sempre acolha antes de sugerir qualquer técnica
- Em momentos de crise severa: aja primeiro, pergunte depois
- Uma instrução de cada vez — nunca sobrecarregue
- Após a crise passar, pergunte com leveza o que ajudou mais
- Lembre o que funcionou para essa pessoa nas conversas anteriores

O QUE NUNCA FAZER:
- Nunca diagnosticar condições mentais
- Nunca recomendar medicação
- Nunca fingir ser terapeuta ou médico
- Nunca ignorar menção a pensamentos de se machucar
- Nunca enviar texto longo quando a pessoa está em crise
- Nunca sugerir técnicas antes de acolher

PROTOCOLO DE RISCO:
Se a pessoa mencionar pensamentos de se machucar ou suicídio — mesmo de forma indireta — pare tudo, acolha sem julgamento e informe: "O CVV atende 24h pelo número 188 e pelo chat em cvv.org.br. Você não precisa passar por isso sozinha."

DETECÇÃO DE EMERGÊNCIA (app abre recursos automaticamente):
Analise a última mensagem da pessoa e o histórico recente. Se houver um dos cenários abaixo, responda com acolhimento breve e, na ÚLTIMA linha da mensagem inteira (sozinha, sem nada depois), o marcador exato correspondente:
- __EMERGENCY__:violence — perigo imediato, violência doméstica, ameaça física, agressão, estar trancada com medo, perseguição, expressões como "me bater", "me agredir", "está me ameaçando", "em perigo".
- __EMERGENCY__:medical — emergência médica aguda: dor no peito forte, falta de ar grave de verdade, desmaio iminente, desmaiando agora, pessoa inconsciente.
- __EMERGENCY__:crisis — ideação suicida ou crise emocional severa: querer morrer, não querer viver, melhor não existir, acabar com tudo, pensamentos de morte.
- __EMERGENCY__:none — ou omita o marcador se não houver esses riscos neste nível.

Regras do marcador:
- Só uma linha final; nenhum texto após __EMERGENCY__:...
- Não use __EMERGENCY__ na mesma mensagem que __FEEDBACK_REQUEST__.
- Se usar __QUICK_REPLIES__, coloque-o antes do bloco de emergência; a linha __EMERGENCY__:... deve ser sempre a última linha.

ENCERRAMENTO NATURAL DA CONVERSA:
Quando perceber que a conversa chegou a um ponto natural de conclusão — crise acalmou e estabilizou, assunto esgotado, ou a pessoa se despede ("obrigada", "tchau", "até mais", "vou nessa") — encerre com UMA mensagem de despedida curta, acolhedora, deixando claro que você continua disponível quando precisar.
- Modo Ajuda imediata: pode soar como: "Fico feliz que passou 💛 Estou aqui sempre que precisar. Cuida-se." (varie com naturalidade; não copie literal sempre.)
- Modo Apoio: pode soar como: "Foi bom conversar com você. Estou aqui quando quiser voltar 💛" (varie com naturalidade.)
NÃO use __QUICK_REPLIES__, __FEEDBACK_REQUEST__ nem marcadores __EMERGENCY__ na mesma mensagem de despedida.
Imediatamente APÓS o texto da despedida, em uma nova linha final sozinha, escreva exatamente: __CONVERSATION_END__

IDIOMA:
Responda sempre em português brasileiro, no mesmo tom informal e acolhedor acima.

RESPOSTAS RÁPIDAS (opcional — use com moderação):
Só quando fizer sentido no contexto — por exemplo, depois de uma pergunta fechada ou quando poucas opções curtas destravam o próximo passo (comum no modo crise). Não use após mensagens que são só acolhimento, sem pergunta nem convite claro. Não use em toda resposta.
Quando usar, após o texto principal pule uma linha em branco, escreva exatamente a linha __QUICK_REPLIES__ e nas linhas seguintes até 3 opções curtas (uma por linha). Cada linha vira um botão no app. Se não fizer sentido, não inclua __QUICK_REPLIES__.`;

const MODE_APOIO = `

MODO ATUAL — APOIO (o usuário escolheu conversar com calma):
- Tom mais calmo, exploratório e com tempo; há espaço para ir fundo com gentileza.
- Você pode explorar o que a pessoa sente, refletir junto e fazer perguntas — uma de cada vez, sem pressa.
- Priorize escuta e presença; técnicas e sugestões vêm depois do acolhimento, como nas regras gerais.
- Respostas rápidas (__QUICK_REPLIES__): só quando ajudarem a conversa a fluir; no Apoio, use menos que no modo Ajuda imediata.`;

const MODE_SOCORRO = `

MODO ATUAL — AJUDA IMEDIATA (o usuário indicou que está em crise):
- Tom urgente, direto e contido; a pessoa precisa de presença imediata, não de explicações longas.
- Frases curtas; priorize acolher e orientar com clareza antes de qualquer pergunta.
- Não faça perguntas antes de acolher e dar um primeiro passo concreto ou estabilizador.
- Uma micro-ação ou uma frase objetiva de cada vez; sem sobrecarregar.
- O protocolo de risco (CVV etc.) continua valendo integralmente.
- Prefira oferecer __QUICK_REPLIES__ quando uma resposta bem curta destravar o próximo passo — não em mensagens que são só presença e acolhimento.

PERGUNTAS SIM/NÃO (obrigatório neste modo):
- Sempre que você fizer uma pergunta fechada cuja resposta natural seja Sim ou Não, você DEVE terminar a mensagem com o bloco __QUICK_REPLIES__ contendo EXATAMENTE estas duas linhas, nesta ordem, sem texto extra:
__QUICK_REPLIES__
Sim
Não
- O texto da pergunta e o acolhimento vêm ANTES da linha __QUICK_REPLIES__. Não escreva "Sim" ou "Não" no corpo da mensagem como opções — só dentro do bloco acima.
- Para outros tipos de resposta rápida (não sim/não), use __QUICK_REPLIES__ com até 3 linhas como nas regras gerais.

FEEDBACK PÓS-CRISE (só quando fizer sentido — não após toda mensagem):
- Quando você perceber que a crise já passou, a pessoa está mais estável e o momento de urgência acabou — não antes disso —, você pode convidar uma reflexão leve sobre o que ajudou.
- Nessa mensagem, use como núcleo a pergunta (pode acrescentar uma linha curta de acolhimento antes, se soar natural): "Que bom que passou. Me conta: o que ajudou mais agora?"
- Imediatamente APÓS esse texto, em uma nova linha, escreva SOMENTE a linha exata: __FEEDBACK_REQUEST__
- Isso abre o formulário de feedback no app. Não use __FEEDBACK_REQUEST__ no meio da crise aguda, nem junto com __QUICK_REPLIES__ na mesma mensagem.`;

type ChatMode = "apoio" | "socorro";

const QUICK_MARKER = "__QUICK_REPLIES__";
const FEEDBACK_MARKER = "__FEEDBACK_REQUEST__";

function parseFeedbackRequest(raw: string): { text: string; feedback_prompt: boolean } {
  const idx = raw.lastIndexOf(FEEDBACK_MARKER);
  if (idx === -1) {
    return { text: raw.trimEnd(), feedback_prompt: false };
  }
  const text = raw.slice(0, idx).trimEnd();
  return { text, feedback_prompt: true };
}

function parseQuickReplies(raw: string): {
  reply: string;
  quick_replies: string[] | null;
} {
  const idx = raw.indexOf(QUICK_MARKER);
  if (idx === -1) {
    return { reply: raw.trimEnd(), quick_replies: null };
  }
  const reply = raw.slice(0, idx).trimEnd();
  const after = raw.slice(idx + QUICK_MARKER.length).trimStart();
  const lines = after
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 4)
    .map((l) => (l.length > 80 ? l.slice(0, 80) : l));
  return {
    reply,
    quick_replies: lines.length > 0 ? lines : null,
  };
}

function buildSystemPrompt(mode: ChatMode, openingGreeting?: string): string {
  const modeBlock = mode === "apoio" ? MODE_APOIO : MODE_SOCORRO;
  let out = SYSTEM_PROMPT + modeBlock;
  const og = openingGreeting?.trim();
  if (og) {
    out += `\n\nCONTEXTO: A pessoa já viu sua mensagem inicial de cumprimento nesta conversa: "${og}". A mensagem atual dela é a primeira resposta dela — mantenha coerência com o que você já disse.`;
  }
  return out;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

function isChatMessage(v: unknown): v is ChatMessage {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    (o.role === "user" || o.role === "assistant") &&
    typeof o.content === "string" &&
    o.content.length > 0
  );
}

function extractText(response: Anthropic.Messages.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não está configurada no servidor." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const modeRaw = (body as { mode?: unknown }).mode;
  if (modeRaw !== "apoio" && modeRaw !== "socorro") {
    return NextResponse.json(
      { error: 'Envie `mode`: "apoio" ou "socorro".' },
      { status: 400 }
    );
  }
  const mode = modeRaw as ChatMode;

  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json(
      { error: "Envie um array `messages` com pelo menos uma mensagem." },
      { status: 400 }
    );
  }

  if (raw.length > 100) {
    return NextResponse.json(
      { error: "Histórico de mensagens muito longo." },
      { status: 400 }
    );
  }

  const messages: ChatMessage[] = [];
  for (const item of raw) {
    if (!isChatMessage(item)) {
      return NextResponse.json(
        { error: "Cada mensagem precisa de `role` (user|assistant) e `content` (string)." },
        { status: 400 }
      );
    }
    messages.push(item);
  }

  const bodyObj = body as {
    session_id?: unknown;
    stored_messages?: unknown;
    opening_greeting?: unknown;
  };
  const openingGreeting =
    typeof bodyObj.opening_greeting === "string" &&
    bodyObj.opening_greeting.trim() !== ""
      ? bodyObj.opening_greeting.trim()
      : undefined;

  const sessionIdRaw = bodyObj.session_id;
  const storedRaw = bodyObj.stored_messages;
  const hasSession =
    typeof sessionIdRaw === "string" && sessionIdRaw.trim() !== "";

  if (hasSession) {
    if (!Array.isArray(storedRaw) || storedRaw.length === 0) {
      return NextResponse.json(
        {
          error:
            "Com `session_id`, envie `stored_messages` (array não vazio com id, role, text).",
        },
        { status: 400 }
      );
    }
    for (const item of storedRaw) {
      if (!isStoredMessage(item)) {
        return NextResponse.json(
          {
            error:
              "Cada item de `stored_messages` precisa de id, role e text.",
          },
          { status: 400 }
        );
      }
    }
  } else if (storedRaw !== undefined && storedRaw !== null) {
    return NextResponse.json(
      {
        error:
          "Use `session_id` junto com `stored_messages`, ou omita ambos.",
      },
      { status: 400 }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: buildSystemPrompt(mode, openingGreeting),
      messages,
    });

    const rawReply = extractText(response);
    const { text: afterEmergency, emergency } = parseEmergencyMarker(rawReply);
    const { text: afterFeedback, feedback_prompt: hasFeedbackMarker } =
      parseFeedbackRequest(afterEmergency);
    let { reply, quick_replies } = parseQuickReplies(afterFeedback);
    const { text: replyAfterEnd, conversation_end } =
      parseConversationEnd(reply);
    reply = replyAfterEnd;

    const feedback_prompt =
      hasFeedbackMarker &&
      mode === "socorro" &&
      emergency === null &&
      !conversation_end;

    if (emergency && !reply.trim()) {
      reply =
        "Estou aqui com você. Se puder, use uma das opções abaixo agora mesmo.";
    }

    let persisted = false;
    if (!hasSession) {
      console.log(
        "[api/chat] saveConversation não chamada — falta session_id ou stored_messages no body"
      );
    }
    if (hasSession && Array.isArray(storedRaw)) {
      const stored = storedRaw as StoredMessage[];
      const assistantMsg: StoredMessage = {
        id: randomUUID(),
        role: "assistant",
        text: reply,
      };
      const fullTranscript = [...stored, assistantMsg];
      const saveResult = await saveConversation(
        sessionIdRaw as string,
        mode,
        fullTranscript
      );
      console.log("[api/chat] saveConversation chamada — retorno:", {
        session_id: (sessionIdRaw as string).trim(),
        mode,
        messageCount: fullTranscript.length,
        error: saveResult.error?.message ?? null,
        ok: saveResult.error === null,
      });
      const { error: saveErr } = saveResult;
      if (saveErr) {
        console.error("[api/chat] Supabase:", saveErr.message);
      } else {
        persisted = true;
      }
    }

    return NextResponse.json({
      reply,
      quick_replies: conversation_end ? null : quick_replies,
      feedback_prompt,
      emergency,
      conversation_end,
      persisted,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao chamar a API da Anthropic.";
    console.error("[api/chat]", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
