"use client";

import { CONTENT_CATEGORIES } from "./constants";

type Props = {
  displayName: string | null;
  onOpenUfie: () => void;
};

export function HomeTab({ displayName, onOpenUfie }: Props) {
  const greeting = displayName ? `Oi, ${displayName}!` : "Oi!";

  return (
    <div className="flex flex-col gap-8 pb-4 pt-2">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
          {greeting}
        </h1>
        <p className="text-sm text-slate-500">Como posso te ajudar agora?</p>
      </header>

      <button
        type="button"
        onClick={onOpenUfie}
        className="group relative flex w-full overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-100/90 via-blue-50 to-white p-4 text-left shadow-[0_4px_20px_rgba(30,64,175,0.1)] ring-1 ring-blue-100/60 transition hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300/70 active:scale-[0.99]"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3 pr-3">
          <span className="text-lg font-semibold text-blue-950">
            Falar com a Ufie
          </span>
          <span className="text-sm leading-snug text-blue-900/80">
            Apoio ou socorro — escolha o modo na próxima tela.
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-700">
            Começar
            <span aria-hidden className="transition group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
        <div
          className="flex h-[5.5rem] w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-blue-200/80 bg-blue-50/50 text-[11px] text-blue-400/90"
          aria-hidden
        >
          Mascote
        </div>
      </button>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Para você hoje
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm ring-1 ring-blue-50/80">
            <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600/80">
              Em breve
            </p>
            <h3 className="mt-1 font-semibold text-slate-800">
              Conteúdo sugerido A
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Descrição placeholder para um artigo ou exercício.
            </p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm ring-1 ring-blue-50/80">
            <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600/80">
              Em breve
            </p>
            <h3 className="mt-1 font-semibold text-slate-800">
              Conteúdo sugerido B
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Outro card placeholder com texto fictício.
            </p>
          </article>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Explorar
        </h2>
        <div className="flex flex-wrap gap-2">
          {CONTENT_CATEGORIES.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-2 text-[13px] text-slate-700 shadow-sm ring-1 ring-blue-50/60"
            >
              <span aria-hidden>{c.icon}</span>
              {c.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
