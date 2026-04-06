import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/** Nome no perfil Supabase, se existir. */
export async function fetchProfileNomeForUser(
  userId: string
): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("nome")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.nome) return null;
  const n = String(data.nome).trim();
  return n.length > 0 ? n : null;
}
