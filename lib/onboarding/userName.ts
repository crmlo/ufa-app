/** Nome para saudação local (não sensível). */
export const STORAGE_USER_NAME = "ufa_user_name";

export function persistUserName(nome: string): void {
  const t = nome.trim();
  if (!t) return;
  try {
    localStorage.setItem(STORAGE_USER_NAME, t);
  } catch {
    /* ignore */
  }
}
