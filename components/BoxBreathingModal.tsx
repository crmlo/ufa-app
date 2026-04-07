"use client";

import { useEffect, useMemo, useState } from "react";

type BoxBreathingModalProps = {
  open: boolean;
  onClose: () => void;
};

const TOTAL_SECONDS = 16;
const SIDE = 192;
const PAD = 20;
const X0 = PAD;
const Y0 = SIDE - PAD;
const X1 = PAD;
const Y1 = PAD;
const X2 = SIDE - PAD;
const Y2 = PAD;
const X3 = SIDE - PAD;
const Y3 = SIDE - PAD;
const THICK_STROKE = 16;
const TRACK_D = `M ${X0} ${Y0} L ${X1} ${Y1} L ${X2} ${Y2} L ${X3} ${Y3} L ${X0} ${Y0}`;

function getPhase(secondInCycle: number): "Inspire" | "Segure" | "Expire" {
  if (secondInCycle < 4) return "Inspire";
  if (secondInCycle < 8) return "Segure";
  if (secondInCycle < 12) return "Expire";
  return "Segure";
}

function phaseLine(
  phaseIndex: number,
  ratio: number
): { x1: number; y1: number; x2: number; y2: number } {
  if (phaseIndex === 0) {
    return { x1: X0, y1: Y0, x2: X0, y2: Y0 - (Y0 - Y1) * ratio };
  }
  if (phaseIndex === 1) {
    return { x1: X1, y1: Y1, x2: X1 + (X2 - X1) * ratio, y2: Y1 };
  }
  if (phaseIndex === 2) {
    return { x1: X2, y1: Y2, x2: X2, y2: Y2 + (Y3 - Y2) * ratio };
  }
  return { x1: X3, y1: Y3, x2: X3 - (X3 - X0) * ratio, y2: Y3 };
}

export function BoxBreathingModal({ open, onClose }: BoxBreathingModalProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!open) return;
    const startedAt = performance.now();
    let frame = 0;
    const tick = () => {
      setElapsedMs(performance.now() - startedAt);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const secondInCycle = useMemo(
    () => Math.floor(elapsedMs / 1000) % TOTAL_SECONDS,
    [elapsedMs]
  );
  const msInCycle = elapsedMs % (TOTAL_SECONDS * 1000);
  const phaseIndex = Math.floor(msInCycle / 4000);
  const phaseProgress = (msInCycle % 4000) / 4000;
  const phase = getPhase(secondInCycle);
  const counter = (secondInCycle % 4) + 1;
  const segment = phaseLine(phaseIndex, phaseProgress);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[160] bg-[#3d3429]/35" onClick={onClose} aria-hidden />
      <div
        className="fixed inset-0 z-[170] grid place-items-center p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Exercício de respiração quadrada"
      >
        <div className="relative w-full max-w-md rounded-[30px] border border-ufie-border bg-ufie-surface px-6 pb-7 pt-6 shadow-[var(--shadow-ufie-float)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-ufie-muted transition hover:bg-ufie-bg hover:text-ufie-text focus:outline-none focus:ring-2 focus:ring-ufie-accent/70"
            aria-label="Parar exercício"
          >
            ✕
          </button>

          <div className="flex flex-col items-center">
            <div className="relative h-60 w-60">
              <svg viewBox={`0 0 ${SIDE} ${SIDE}`} className="h-full w-full">
                <path
                  d={TRACK_D}
                  fill="none"
                  stroke="color-mix(in srgb, var(--color-ufie-border) 75%, white)"
                  strokeWidth={THICK_STROKE}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1={segment.x1}
                  y1={segment.y1}
                  x2={segment.x2}
                  y2={segment.y2}
                  fill="none"
                  stroke="var(--color-ufie-accent)"
                  strokeWidth={THICK_STROKE}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="absolute inset-0 grid place-items-center">
                <span key={counter} className="text-5xl font-semibold text-ufie-text animate-[box-counter-pulse_1000ms_ease-in-out]">
                  {counter}
                </span>
              </div>
            </div>

            <p
              key={phase}
              className="mt-2 text-base font-medium text-ufie-text animate-[fade-in_240ms_ease-out]"
            >
              {phase}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 min-w-[8rem] rounded-[14px] bg-ufie-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-ufie-card)] transition hover:bg-ufie-text/90 focus:outline-none focus:ring-2 focus:ring-ufie-accent/70 focus:ring-offset-2 focus:ring-offset-ufie-surface"
            >
              Encerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

