import type { SupabaseClient } from "@supabase/supabase-js";

import type { PendingProfilePayload } from "@/lib/onboarding/types";

export async function upsertUserProfile(
  supabase: SupabaseClient,
  userId: string,
  payload: PendingProfilePayload
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("user_profiles").upsert(
    {
      user_id: userId,
      nome: payload.nome.trim() || null,
      condicoes_saude: payload.condicoes_saude,
      neurodivergencia: payload.neurodivergencia,
      gatilhos: payload.gatilhos.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: new Error(error.message) };
  }
  return { error: null };
}
