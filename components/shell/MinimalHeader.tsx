"use client";

type Props = {
  onBack: () => void;
  onOpenSos: () => void;
  backLabel?: string;
};

/** Barra superior só com voltar + SOS — tela de seleção de modo Olie */
export function MinimalHeader({
  onBack,
  onOpenSos,
  backLabel = "Voltar",
}: Props) {
  return (
    <header className="shrink-0 border-b border-olie-border/80 bg-[linear-gradient(160deg,#F0F7F4_0%,#F7FAF9_100%)]/95 px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 flex h-10 min-w-[2.5rem] items-center justify-center rounded-full text-olie-text-secondary transition hover:bg-olie-surface/80 hover:text-olie-text focus:outline-none focus:ring-2 focus:ring-olie-accent/35"
          aria-label={backLabel}
        >
          <span className="text-xl leading-none" aria-hidden>
            ←
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenSos}
          className="flex items-center gap-1.5 rounded-full border border-red-200/70 bg-red-50/95 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-red-800/90 shadow-sm transition hover:bg-red-100/95 focus:outline-none focus:ring-2 focus:ring-red-300/60"
          aria-label="SOS — ajuda urgente"
        >
          <svg
            className="h-3.5 w-3.5 shrink-0 text-red-700/85"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          SOS
        </button>
      </div>
    </header>
  );
}
