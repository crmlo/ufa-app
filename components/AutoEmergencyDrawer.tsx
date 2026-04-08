"use client";

import type { EmergencyKind } from "@/lib/emergency";

type Props = {
  kind: EmergencyKind;
  onClose: () => void;
};

export function AutoEmergencyDrawer({ kind, onClose }: Props) {
  return (
    <>
      <div
        className="fixed inset-0 z-[130] bg-slate-900/35"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="ufie-drawer-sheet fixed bottom-0 left-0 right-0 z-[140] flex max-h-[min(88vh,560px)] flex-col rounded-t-3xl border border-olie-border/90 border-b-0 bg-white shadow-[0_-12px_48px_rgba(26,26,46,0.08)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auto-emergency-title"
      >
        <div className="relative shrink-0 border-b border-olie-border/80 px-4 pb-3 pt-3">
          <div className="flex justify-center pb-1">
            <div
              className="h-1.5 w-11 rounded-full bg-olie-border"
              aria-hidden
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-olie-text-secondary transition hover:bg-olie-surface hover:text-olie-text focus:outline-none focus:ring-2 focus:ring-olie-accent/35"
            aria-label="Fechar"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-1">
          {kind === "violence" && (
            <ViolenceContent />
          )}
          {kind === "medical" && <MedicalContent />}
          {kind === "crisis" && <CrisisContent />}
        </div>
      </div>
    </>
  );
}

function TelButton({
  href,
  icon,
  label,
  variant = "primary",
}: {
  href: string;
  icon: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";
  return (
    <a
      href={href}
      className={`flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-2xl px-4 text-center text-[15px] font-semibold leading-snug shadow-sm transition focus:outline-none focus:ring-2 focus:ring-olie-accent/45 focus:ring-offset-2 focus:ring-offset-white ${
        isPrimary
          ? "bg-olie-accent text-white hover:opacity-95"
          : "border-2 border-olie-border bg-white text-olie-text hover:bg-olie-surface/80"
      }`}
    >
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      {label}
    </a>
  );
}

function ViolenceContent() {
  return (
    <>
      <h2
        id="auto-emergency-title"
        className="text-lg font-semibold leading-snug text-olie-text"
      >
        Você está em perigo?
      </h2>
      <div className="mt-6 flex flex-col gap-3">
        <TelButton
          href="tel:190"
          icon="🚨"
          label="Ligar para a Polícia — 190"
          variant="primary"
        />
        <TelButton
          href="tel:192"
          icon="🚑"
          label="Ligar para o SAMU — 192"
          variant="secondary"
        />
      </div>
    </>
  );
}

function MedicalContent() {
  return (
    <>
      <h2
        id="auto-emergency-title"
        className="text-lg font-semibold leading-snug text-olie-text"
      >
        Precisa de ajuda médica?
      </h2>
      <div className="mt-6 flex flex-col gap-3">
        <TelButton
          href="tel:192"
          icon="🚑"
          label="Ligar para o SAMU — 192"
          variant="primary"
        />
        <TelButton
          href="tel:193"
          icon="🔥"
          label="Ligar para os Bombeiros — 193"
          variant="secondary"
        />
      </div>
    </>
  );
}

function CrisisContent() {
  return (
    <>
      <h2
        id="auto-emergency-title"
        className="text-lg font-semibold leading-snug text-olie-text"
      >
        Você não está sozinha
      </h2>
      <div className="mt-6 flex flex-col gap-3">
        <TelButton
          href="tel:188"
          icon="💛"
          label="Falar com alguém do suporte emocional agora — 188"
          variant="primary"
        />
        <p className="text-center text-[14px] leading-relaxed text-olie-text-secondary">
          Prefere o chat? Acesse{" "}
          <a
            href="https://cvv.org.br"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-olie-text underline decoration-olie-border underline-offset-2 hover:text-olie-text-secondary"
          >
            cvv.org.br
          </a>
        </p>
      </div>
    </>
  );
}
