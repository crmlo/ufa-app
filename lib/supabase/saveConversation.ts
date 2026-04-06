import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ChatMode = "apoio" | "socorro";

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export function isStoredMessage(v: unknown): v is StoredMessage {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    (o.role === "user" || o.role === "assistant") &&
    typeof o.text === "string"
  );
}

/** Persiste ou atualiza o histórico por session_id. Retorna erro do Supabase, se houver. */
export async function saveConversation(
  sessionId: string,
  mode: ChatMode,
  messages: StoredMessage[]
): Promise<{ error: Error | null }> {
  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("conversations").upsert(
      {
        session_id: sessionId.trim(),
        mode,
        messages,
      },
      { onConflict: "session_id" }
    );
    if (error) {
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e : new Error("Falha ao salvar conversa."),
    };
  }
}

export type FeedbackPayload = {
  selected: string[];
  detail?: string;
  submitted_at: string;
};

/** Atualiza só o campo feedback (pós-crise), por session_id */
export async function updateConversationFeedback(
  sessionId: string,
  feedback: FeedbackPayload
): Promise<{ error: Error | null }> {
  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("conversations")
      .update({ feedback })
      .eq("session_id", sessionId.trim());
    if (error) {
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e : new Error("Falha ao salvar feedback."),
    };
  }
}
