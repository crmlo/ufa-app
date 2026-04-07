type ChatNav = {
  modeLabel: string;
  modeDescription: string;
  variant: "apoio" | "socorro";
  onBack: () => void;
};

type Props = {
  onOpenSos: () => void;
  chatNavigation: ChatNav;
};

/** Cabeçalho do chat: Voltar + SOS; tag de modo centralizada (sem saudação nem marca). */
export function AppMainHeader({ onOpenSos, chatNavigation }: Props) {
  const modeChipClass =
    chatNavigation.variant === "apoio"
      ? "inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-blue-800"
      : "inline-flex items-center rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-blue-900";

  return (
    <header className="border-b border-blue-100 bg-slate-50/95 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        <button
          type="button"
          onClick={chatNavigation.onBack}
          className="-ml-1 flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-1 text-slate-600 transition hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
          aria-label="Voltar à seleção de modo"
        >
          <span className="text-xl leading-none" aria-hidden>
            ←
          </span>
          <span className="text-[15px] font-medium">Voltar</span>
        </button>

        <button
          type="button"
          onClick={onOpenSos}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200/70 bg-red-50/95 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-red-800/90 shadow-sm transition hover:bg-red-100/95 focus:outline-none focus:ring-2 focus:ring-red-300/60"
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

      <div className="mx-auto mt-4 flex max-w-2xl justify-center px-2">
        <span
          className={modeChipClass}
          title={chatNavigation.modeDescription}
        >
          {chatNavigation.modeLabel}
        </span>
      </div>
    </header>
  );
}

export function FloatingSosButton({ onOpenSos }: { onOpenSos: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpenSos}
      className="fixed right-3 top-3 z-[100] flex items-center gap-1.5 rounded-full border border-red-200/70 bg-red-50/95 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-red-800/90 shadow-sm backdrop-blur-sm transition hover:bg-red-100/95 focus:outline-none focus:ring-2 focus:ring-red-300/60 sm:right-4 sm:top-4"
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
  );
}
