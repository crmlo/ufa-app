type ChatNav = {
  modeLabel: string;
  modeDescription: string;
  variant: "apoio" | "socorro";
  onBack: () => void;
};

type Props = {
  displayName: string | null;
  onOpenSos: () => void;
  /** Tela de chat: seta voltar + modo ao lado, depois marca e SOS */
  chatNavigation?: ChatNav;
};

export function AppMainHeader({
  displayName,
  onOpenSos,
  chatNavigation,
}: Props) {
  const greeting = displayName ? `Oi, ${displayName}!` : "Olá!";

  const modeChipClass =
    chatNavigation?.variant === "apoio"
      ? "inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-blue-800"
      : "inline-flex items-center rounded-full border border-blue-300 bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-900";

  return (
    <header className="border-b border-blue-100 bg-slate-50/95 px-6 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {chatNavigation ? (
            <>
              <button
                type="button"
                onClick={chatNavigation.onBack}
                className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                aria-label="Voltar à seleção de modo"
              >
                <span className="text-xl leading-none" aria-hidden>
                  ←
                </span>
              </button>
              <span
                className={modeChipClass}
                title={chatNavigation.modeDescription}
              >
                {chatNavigation.modeLabel}
              </span>
              <div
                className="h-11 w-11 shrink-0 rounded-full"
                aria-hidden
              />
              <span className="text-lg font-semibold tracking-tight text-slate-800">
                Ufa!
              </span>
            </>
          ) : (
            <>
              <div
                className="h-11 w-11 shrink-0 rounded-full"
                aria-hidden
              />
              <span className="text-lg font-semibold tracking-tight text-slate-800">
                Ufa!
              </span>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
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
      </div>

      <div className="mt-4 min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Como posso te ajudar agora?
        </p>
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
