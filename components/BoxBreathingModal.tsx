"use client";

import { useEffect, useMemo, useState } from "react";

type BoxBreathingModalProps = {
  open: boolean;
  onClose: () => void;
};

const TOTAL_SECONDS = 16;
const SIDE = 192;
const PAD = 20;
const PATH_D = `M ${PAD} ${SIDE - PAD} L ${PAD} ${PAD} L ${SIDE - PAD} ${PAD} L ${SIDE - PAD} ${SIDE - PAD} L ${PAD} ${SIDE - PAD}`;
const PATH_LENGTH = (SIDE - PAD * 2) * 4;

function getPhase(secondInCycle: number): "Inspire" | "Segure" | "Expire" {
  if (secondInCycle < 4) return "Inspire";
  if (secondInCycle < 8) return "Segure";
  if (secondInCycle < 12) return "Expire";
  return "Segure";
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
  const progress = ((elapsedMs % (TOTAL_SECONDS * 1000)) / 1000 / TOTAL_SECONDS) * PATH_LENGTH;
  const phase = getPhase(secondInCycle);
  const counter = (secondInCycle % 4) + 1;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[160] bg-[#3d3429]/35" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-[170] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Exercício de respiração quadrada">
        <div className="relative w-full max-w-sm rounded-[28px] border border-ufie-border bg-ufie-surface px-5 pb-6 pt-5 shadow-[var(--shadow-ufie-float)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-ufie-muted transition hover:bg-ufie-bg hover:text-ufie-text focus:outline-none focus:ring-2 focus:ring-ufie-accent/70"
            aria-label="Parar exercício"
          >
            ✕
          </button>

          <div className="flex flex-col items-center">
            <div className="relative h-56 w-56">
              <svg viewBox={`0 0 ${SIDE} ${SIDE}`} className="h-full w-full">
                <path
                  d={PATH_D}
                  fill="none"
                  stroke="color-mix(in srgb, var(--color-ufie-border) 75%, white)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={PATH_D}
                  fill="none"
                  stroke="var(--color-ufie-accent)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={PATH_LENGTH}
                  strokeDashoffset={PATH_LENGTH - progress}
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
          </div>
        </div>
      </div>
    </>
  );
}

