"use client";

import Olie from "@/components/Olie";

import { CONTENT_CATEGORIES } from "./constants";

type Props = {
  displayName: string | null;
  onOpenOlie: () => void;
};

export function HomeTab({ displayName, onOpenOlie }: Props) {
  const greeting = displayName ? `Oi, ${displayName}!` : "Oi!";

  return (
    <div className="flex flex-col gap-8 pb-4 pt-2">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-olie-text">
          {greeting}
        </h1>
        <p className="text-sm text-olie-text-secondary">
          Como posso te ajudar hoje?
        </p>
      </header>

      <button
        type="button"
        onClick={onOpenOlie}
        className="group relative flex w-full overflow-hidden rounded-2xl border-[0.5px] border-olie-border bg-[linear-gradient(135deg,#F0F7F4_0%,#C8DDD7_100%)] p-4 text-left shadow-sm transition hover:opacity-[0.98] focus:outline-none focus:ring-2 focus:ring-olie-accent/35 active:scale-[0.99]"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1 pr-3">
          <span className="text-lg font-semibold text-olie-text">
            Estou em crise
          </span>
          <span className="text-sm font-medium text-olie-text-secondary">
            Fale com a Olie
          </span>
        </div>
        <div
          className="flex h-[5.5rem] w-24 shrink-0 items-center justify-center"
          aria-hidden
        >
          <Olie state="welcoming" size={88} />
        </div>
      </button>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-olie-text-secondary">
          Para você hoje
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-olie-border/90 bg-white/90 p-4 shadow-sm ring-1 ring-olie-border/40">
            <p className="text-[11px] font-medium uppercase tracking-wide text-olie-text-secondary">
              Em breve
            </p>
            <h3 className="mt-1 font-semibold text-olie-text">
              Conteúdo sugerido A
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-olie-text-secondary">
              Descrição placeholder para um artigo ou exercício.
            </p>
          </article>
          <article className="rounded-2xl border border-olie-border/90 bg-white/90 p-4 shadow-sm ring-1 ring-olie-border/40">
            <p className="text-[11px] font-medium uppercase tracking-wide text-olie-text-secondary">
              Em breve
            </p>
            <h3 className="mt-1 font-semibold text-olie-text">
              Conteúdo sugerido B
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-olie-text-secondary">
              Outro card placeholder com texto fictício.
            </p>
          </article>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-olie-text-secondary">
          Explorar
        </h2>
        <div className="flex flex-wrap gap-2">
          {CONTENT_CATEGORIES.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-olie-border/80 bg-white/90 px-3 py-2 text-[13px] text-olie-text shadow-sm ring-1 ring-olie-border/35"
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
