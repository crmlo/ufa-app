"use client";

import { useState } from "react";
import BoxBreathing from "@/components/BoxBreathing";
import {
  CONTENT_CATEGORIES,
  PLACEHOLDER_ARTICLES,
} from "./constants";

export function ConteudosTab() {
  const [breathingOpen, setBreathingOpen] = useState(false);

  return (
    <>
    <div className="flex flex-col gap-10 pb-4 pt-2">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-olie-text">
          Conteúdos
        </h1>
        <p className="mt-1 text-sm text-olie-text-secondary">
          Biblioteca em construção — estrutura placeholder.
        </p>
        <button
          type="button"
          onClick={() => setBreathingOpen(true)}
          className="inline-flex items-center rounded-full border border-olie-border bg-white/90 px-3 py-1.5 text-xs font-medium text-olie-text transition hover:bg-olie-surface focus:outline-none focus:ring-2 focus:ring-olie-accent/35"
        >
          Respiração quadrada
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CONTENT_CATEGORIES.map((c) => (
          <div
            key={c.id}
            className="flex flex-col items-center gap-2 rounded-2xl border border-olie-border/80 bg-white/90 p-4 text-center shadow-sm ring-1 ring-olie-border/40"
          >
            <span className="text-2xl" aria-hidden>
              {c.icon}
            </span>
            <span className="text-[13px] font-medium leading-snug text-olie-text">
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {CONTENT_CATEGORIES.map((cat) => {
        const items = PLACEHOLDER_ARTICLES[cat.id] ?? [];
        return (
          <section key={cat.id} className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-olie-text">
              <span aria-hidden>{cat.icon}</span>
              {cat.label}
            </h2>
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.title}>
                  <article className="rounded-2xl border border-olie-border/80 bg-white/90 p-4 shadow-sm ring-1 ring-olie-border/40">
                    <span className="inline-block rounded-full bg-olie-surface px-2 py-0.5 text-[11px] font-medium text-olie-text-secondary">
                      {cat.label}
                    </span>
                    <h3 className="mt-2 font-semibold text-olie-text">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-olie-text-secondary">
                      {item.blurb}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
    <BoxBreathing open={breathingOpen} onClose={() => setBreathingOpen(false)} />
    </>
  );
}
