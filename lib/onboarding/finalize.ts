import {
  STORAGE_ONBOARDING_COMPLETE,
  STORAGE_PENDING_PROFILE,
} from "@/lib/onboarding/constants";
import { upsertUserProfile } from "@/lib/onboarding/profileSync";
import type { PendingProfilePayload } from "@/lib/onboarding/types";
import { persistUserName } from "@/lib/onboarding/userName";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Se há sessão + payload pendente (pós magic link), grava user_profiles e marca onboarding completo.
 * @returns true se finalizou (pode pular a UI de onboarding)
 */
export async function tryFinalizeOnboardingFromPending(): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return false;

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_PENDING_PROFILE);
  } catch {
    return false;
  }
  if (!raw) return false;

  let payload: PendingProfilePayload;
  try {
    payload = JSON.parse(raw) as PendingProfilePayload;
  } catch {
    return false;
  }

  const { error } = await upsertUserProfile(supabase, user.id, payload);
  if (error) {
    console.error("[onboarding] upsert user_profiles:", error.message);
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_PENDING_PROFILE);
    localStorage.setItem(STORAGE_ONBOARDING_COMPLETE, "1");
  } catch {
    /* ignore */
  }
  persistUserName(payload.nome);
  return true;
}
