"use client";

import {
  CONTENT_CATEGORIES,
  PLACEHOLDER_ARTICLES,
} from "./constants";

export function ConteudosTab() {
  return (
    <div className="flex flex-col gap-10 pb-4 pt-2">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
          Conteúdos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Biblioteca em construção — estrutura placeholder.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CONTENT_CATEGORIES.map((c) => (
          <div
            key={c.id}
            className="flex flex-col items-center gap-2 rounded-2xl border border-blue-100 bg-white p-4 text-center shadow-sm ring-1 ring-blue-50/70"
          >
            <span className="text-2xl" aria-hidden>
              {c.icon}
            </span>
            <span className="text-[13px] font-medium leading-snug text-slate-800">
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {CONTENT_CATEGORIES.map((cat) => {
        const items = PLACEHOLDER_ARTICLES[cat.id] ?? [];
        return (
          <section key={cat.id} className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <span aria-hidden>{cat.icon}</span>
              {cat.label}
            </h2>
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.title}>
                  <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm ring-1 ring-blue-50/80">
                    <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800">
                      {cat.label}
                    </span>
                    <h3 className="mt-2 font-semibold text-slate-800">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
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
  );
}
