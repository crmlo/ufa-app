"use client";

import { useEffect, useRef, useState } from "react";

interface BoxBreathingProps {
  onClose: () => void;
}

const PHASES = ["inspire", "segure", "expire", "segure"];
const PHASE_DURATION = 4000; // ms per phase
const TOTAL_DURATION = PHASE_DURATION * 4;

const SIZE = 260;
const STROKE = 22;
const RADIUS = 44;
const OFFSET = STROKE / 2;
const W = SIZE - STROKE;
const H = SIZE - STROKE;

const STRAIGHT = (W - 2 * RADIUS) * 2 + (H - 2 * RADIUS) * 2;
const CURVES = 2 * Math.PI * RADIUS;
const PERIMETER = STRAIGHT + CURVES;

export default function BoxBreathing({ onClose }: BoxBreathingProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [counter, setCounter] = useState(1);
  const traceRef = useRef<SVGRectElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const totalElapsed = elapsed % TOTAL_DURATION;
      const progress = totalElapsed / TOTAL_DURATION;

      // Update SVG trace
      if (traceRef.current) {
        const dashOffset = PERIMETER - progress * PERIMETER;
        traceRef.current.style.strokeDashoffset = String(dashOffset);
      }

      // Current phase and counter
      const currentPhase = Math.floor(totalElapsed / PHASE_DURATION);
      const phaseElapsed = totalElapsed - currentPhase * PHASE_DURATION;
      const currentCount = Math.floor(phaseElapsed / 1000) + 1;

      setPhaseIndex(currentPhase);
      setCounter(Math.min(currentCount, 4));

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          background: "#FAF5F0",
          borderRadius: 28,
          padding: "36px 32px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          minWidth: 320,
          position: "relative",
        }}
      >
        {/* X button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 22,
            color: "#6B6B80",
            cursor: "pointer",
            lineHeight: 1,
            padding: 4,
          }}
          aria-label="Fechar"
        >
          ×
        </button>

        {/* SVG — rotated -90deg so trace starts from left side going up */}
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ overflow: "visible", transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <rect
            x={OFFSET}
            y={OFFSET}
            width={W}
            height={H}
            rx={RADIUS}
            ry={RADIUS}
            fill="none"
            stroke="#C8C1E8"
            strokeWidth={STROKE}
            strokeOpacity={0.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Animated trace */}
          <rect
            ref={traceRef}
            x={OFFSET}
            y={OFFSET}
            width={W}
            height={H}
            rx={RADIUS}
            ry={RADIUS}
            fill="none"
            stroke="#7B6FE8"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={PERIMETER}
            style={{ strokeDashoffset: PERIMETER }}
          />

          {/* Counter — counter-rotated to stay upright */}
          <text
            x={SIZE / 2}
            y={SIZE / 2 - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={54}
            fontWeight="bold"
            fill="#1A1A2E"
            fontFamily="Arial, sans-serif"
            transform={`rotate(90, ${SIZE / 2}, ${SIZE / 2})`}
          >
            {counter}
          </text>

          {/* Phase label — counter-rotated */}
          <text
            x={SIZE / 2}
            y={SIZE / 2 + 38}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={18}
            fill="#6B6B80"
            fontFamily="Arial, sans-serif"
            transform={`rotate(90, ${SIZE / 2}, ${SIZE / 2})`}
          >
            {PHASES[phaseIndex]}
          </text>
        </svg>

        {/* Encerrar button */}
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "1.5px solid #C8C1E8",
            borderRadius: 12,
            padding: "10px 36px",
            fontSize: 16,
            color: "#6B6B80",
            cursor: "pointer",
            fontFamily: "Arial, sans-serif",
            marginTop: 4,
          }}
        >
          Encerrar
        </button>
      </div>
    </div>
  );
}
