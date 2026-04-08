"use client";

import { BookOpen, History, Home, User } from "lucide-react";

import Olie from "@/components/Olie";

export type MainTabId = "home" | "conteudos" | "historico" | "perfil";

type Props = {
  active: MainTabId;
  onChange: (tab: MainTabId) => void;
  onOliePress: () => void;
};

const iconClass = "h-[22px] w-[22px] shrink-0 stroke-[1.75]";

export function BottomNav({ active, onChange, onOliePress }: Props) {
  const itemClass = (tab: MainTabId) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition ${
      active === tab
        ? "text-olie-text"
        : "text-olie-muted hover:text-olie-text-secondary"
    }`;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-olie-border/90 bg-[#f7faf9]/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-4px_24px_rgba(26,26,46,0.05)] backdrop-blur-md"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between px-1">
        <button
          type="button"
          className={itemClass("home")}
          onClick={() => onChange("home")}
          aria-current={active === "home" ? "page" : undefined}
        >
          <Home className={iconClass} aria-hidden stroke="currentColor" />
          Home
        </button>

        <button
          type="button"
          className={itemClass("conteudos")}
          onClick={() => onChange("conteudos")}
          aria-current={active === "conteudos" ? "page" : undefined}
        >
          <BookOpen className={iconClass} aria-hidden stroke="currentColor" />
          Conteúdos
        </button>

        <div className="relative flex flex-1 flex-col items-center px-1 pb-1">
          <button
            type="button"
            onClick={onOliePress}
            className="-mt-7 flex h-[3.35rem] w-[3.35rem] shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-olie-border bg-[linear-gradient(135deg,#F0F7F4_0%,#C8DDD7_100%)] shadow-[0_6px_20px_rgba(26,26,46,0.12)] ring-4 ring-[#f7faf9] transition hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-olie-border/80 active:scale-[0.98]"
            aria-label="Estou em crise — falar com a Olie"
          >
            <Olie state="calm" size={48} className="rounded-full object-cover" />
          </button>
          <span className="mt-1 text-[10px] font-semibold text-olie-text">
            Olie
          </span>
        </div>

        <button
          type="button"
          className={itemClass("historico")}
          onClick={() => onChange("historico")}
          aria-current={active === "historico" ? "page" : undefined}
        >
          <History className={iconClass} aria-hidden stroke="currentColor" />
          Histórico
        </button>

        <button
          type="button"
          className={itemClass("perfil")}
          onClick={() => onChange("perfil")}
          aria-current={active === "perfil" ? "page" : undefined}
        >
          <User className={iconClass} aria-hidden stroke="currentColor" />
          Perfil
        </button>
      </div>
    </nav>
  );
}
