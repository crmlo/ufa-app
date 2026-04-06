"use client";

const PLACEHOLDER_ENTRIES = [
  {
    date: "28 mar 2026",
    mode: "Socorro",
    sintomas: "Coração acelerado, falta de ar",
    ajudou: "Respirar junto + presença",
  },
  {
    date: "22 mar 2026",
    mode: "Apoio",
    sintomas: "—",
    ajudou: "Conversar e nomear o que sentia",
  },
  {
    date: "15 mar 2026",
    mode: "Socorro",
    sintomas: "Medo intenso",
    ajudou: "Técnicas de ancoragem (placeholder)",
  },
] as const;

export function HistoricoTab() {
  return (
    <div className="flex flex-col gap-6 pb-4 pt-2">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
          Meu histórico
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Em breve seus padrões e insights aparecerão aqui
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {PLACEHOLDER_ENTRIES.map((e) => (
          <li key={e.date}>
            <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm ring-1 ring-blue-50/80">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <time className="text-[13px] font-medium text-slate-500">
                  {e.date}
                </time>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-900">
                  {e.mode}
                </span>
              </div>
              <p className="mt-3 text-[13px] text-slate-500">
                <span className="font-medium text-slate-600">Sintomas:</span>{" "}
                {e.sintomas}
              </p>
              <p className="mt-1 text-[13px] text-slate-500">
                <span className="font-medium text-slate-600">O que ajudou:</span>{" "}
                {e.ajudou}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
