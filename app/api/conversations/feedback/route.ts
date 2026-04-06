import { NextResponse } from "next/server";
import {
  updateConversationFeedback,
  type FeedbackPayload,
} from "@/lib/supabase/saveConversation";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const o = body as {
    session_id?: unknown;
    selected?: unknown;
    detail?: unknown;
  };

  if (typeof o.session_id !== "string" || o.session_id.trim() === "") {
    return NextResponse.json(
      { error: "Envie `session_id`." },
      { status: 400 }
    );
  }

  if (!Array.isArray(o.selected)) {
    return NextResponse.json(
      { error: "Envie `selected` (array de strings)." },
      { status: 400 }
    );
  }

  for (const item of o.selected) {
    if (typeof item !== "string") {
      return NextResponse.json(
        { error: "Cada item de `selected` deve ser string." },
        { status: 400 }
      );
    }
  }

  const detail =
    typeof o.detail === "string" && o.detail.trim() !== ""
      ? o.detail.trim()
      : undefined;

  if (o.selected.length === 0 && !detail) {
    return NextResponse.json(
      { error: "Envie ao menos uma opção ou texto em `detail`." },
      { status: 400 }
    );
  }

  const payload: FeedbackPayload = {
    selected: o.selected as string[],
    ...(detail ? { detail } : {}),
    submitted_at: new Date().toISOString(),
  };

  const { error } = await updateConversationFeedback(
    o.session_id.trim(),
    payload
  );

  if (error) {
    console.error("[api/conversations/feedback]", error);
    return NextResponse.json(
      { error: error.message ?? "Erro ao salvar feedback." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
