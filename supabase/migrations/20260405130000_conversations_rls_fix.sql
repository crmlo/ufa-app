-- Rode no Supabase: SQL Editor → New query → Run
-- Corrige RLS para permitir insert/update (e select no upsert) com a anon key.

-- 1) Remove políticas antigas (nomes da migration anterior)
DROP POLICY IF EXISTS "conversations_insert_anon" ON public.conversations;
DROP POLICY IF EXISTS "conversations_update_anon" ON public.conversations;
DROP POLICY IF EXISTS "conversations_anon_insert" ON public.conversations;
DROP POLICY IF EXISTS "conversations_anon_update" ON public.conversations;
DROP POLICY IF EXISTS "conversations_anon_select" ON public.conversations;
DROP POLICY IF EXISTS "conversations_anon_all" ON public.conversations;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Garante que os papéis da API possam usar a tabela (Supabase costuma já conceder isso)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.conversations TO anon, authenticated;

-- INSERT: novo registro (primeira parte do upsert)
CREATE POLICY "conversations_insert_anon_authenticated"
  ON public.conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- UPDATE: linha já existente (ON CONFLICT DO UPDATE no upsert)
CREATE POLICY "conversations_update_anon_authenticated"
  ON public.conversations
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- SELECT: útil para leituras e para alguns fluxos de upsert/returning
CREATE POLICY "conversations_select_anon_authenticated"
  ON public.conversations
  FOR SELECT
  TO anon, authenticated
  USING (true);
