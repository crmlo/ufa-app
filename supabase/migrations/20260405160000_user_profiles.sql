-- Perfis pós-onboarding (ligados ao Auth). Execute no SQL Editor ou supabase db push.

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text,
  condicoes_saude jsonb not null default '{}'::jsonb,
  neurodivergencia jsonb not null default '{}'::jsonb,
  gatilhos text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_user_id_key unique (user_id)
);

create index if not exists user_profiles_user_id_idx on public.user_profiles (user_id);

comment on table public.user_profiles is 'Respostas do onboarding Ufa! (por usuário autenticado)';

alter table public.user_profiles enable row level security;

create policy "user_profiles_select_own"
  on public.user_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_profiles_insert_own"
  on public.user_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_profiles_update_own"
  on public.user_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
