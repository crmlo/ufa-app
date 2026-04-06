import { NextResponse } from "next/server";
import {
  isStoredMessage,
  saveConversation,
  type ChatMode,
  type StoredMessage,
} from "@/lib/supabase/saveConversation";

function isChatMode(v: unknown): v is ChatMode {
  return v === "apoio" || v === "socorro";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const o = body as {
    session_id?: unknown;
    mode?: unknown;
    messages?: unknown;
  };

  if (typeof o.session_id !== "string" || o.session_id.trim() === "") {
    return NextResponse.json(
      { error: "Envie `session_id` (string não vazia)." },
      { status: 400 }
    );
  }

  if (!isChatMode(o.mode)) {
    return NextResponse.json(
      { error: 'Envie `mode`: "apoio" ou "socorro".' },
      { status: 400 }
    );
  }

  if (!Array.isArray(o.messages)) {
    return NextResponse.json(
      { error: "Envie `messages` (array)." },
      { status: 400 }
    );
  }

  for (const item of o.messages) {
    if (!isStoredMessage(item)) {
      return NextResponse.json(
        { error: "Cada item de `messages` precisa de id, role e text." },
        { status: 400 }
      );
    }
  }

  const { error } = await saveConversation(
    o.session_id.trim(),
    o.mode,
    o.messages as StoredMessage[]
  );

  if (error) {
    console.error("[api/conversations]", error);
    return NextResponse.json(
      { error: error.message ?? "Erro ao salvar no Supabase." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
