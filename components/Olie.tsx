"use client";

import { useEffect, useRef, useState } from "react";

export type OlieState = "calm" | "welcoming" | "hug" | "listening";

interface OlieProps {
  state?: OlieState;
  size?: number;
  className?: string;
}

const images: Record<OlieState, { open: string; closed: string }> = {
  calm: {
    open: "/olie/olie-calm-open.png",
    closed: "/olie/olie-calm-closed.png",
  },
  welcoming: {
    open: "/olie/olie-welcoming-open.png",
    closed: "/olie/olie-welcoming-closed.png",
  },
  hug: {
    open: "/olie/olie-hug-open.png",
    closed: "/olie/olie-hug-closed.png",
  },
  listening: {
    open: "/olie/olie-listening-open.png",
    closed: "/olie/olie-listening-closed.png",
  },
};

export default function Olie({ state = "calm", size = 120, className = "" }: OlieProps) {
  const [blink, setBlink] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scheduleNext = () => {
      timeoutRef.current = setTimeout(() => {
        setBlink(true);
        blinkCloseRef.current = setTimeout(() => {
          setBlink(false);
          scheduleNext();
        }, 120);
      }, Math.random() * 4000 + 2000);
    };
    scheduleNext();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (blinkCloseRef.current) clearTimeout(blinkCloseRef.current);
    };
  }, []);

  const src = blink ? images[state].closed : images[state].open;

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`olie-breathe shrink-0 select-none ${className}`}
      aria-hidden
    />
  );
}
