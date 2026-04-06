-- Rode no SQL Editor do Supabase se a tabela já existir sem esta coluna

alter table public.conversations
  add column if not exists feedback jsonb;

comment on column public.conversations.feedback is 'Feedback pós-crise (opções + texto) — personalização futura';
