-- Execute no Supabase: SQL Editor → New query → colar e Run
-- Ou: supabase db push (se usar CLI)

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mode text not null check (mode in ('apoio', 'socorro')),
  messages jsonb not null default '[]'::jsonb,
  session_id text not null unique
);

create index if not exists conversations_session_id_idx on public.conversations (session_id);

comment on table public.conversations is 'Histórico de conversas Ufa! (Ufie)';

alter table public.conversations enable row level security;

-- Cliente Next.js usa a anon key; ajuste políticas se passar a usar autenticação.
create policy "conversations_insert_anon"
  on public.conversations
  for insert
  to anon
  with check (true);

create policy "conversations_update_anon"
  on public.conversations
  for update
  to anon
  using (true)
  with check (true);
