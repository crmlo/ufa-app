"use client";

import Olie from "@/components/Olie";

export type MainTabId = "home" | "conteudos" | "historico" | "perfil";

type Props = {
  active: MainTabId;
  onChange: (tab: MainTabId) => void;
  onOliePress: () => void;
};

export function BottomNav({ active, onChange, onOliePress }: Props) {
  const itemClass = (tab: MainTabId) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition ${
      active === tab
        ? "text-blue-600"
        : "text-slate-400 hover:text-slate-600"
    }`;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-blue-100/80 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-4px_24px_rgba(30,58,138,0.06)] backdrop-blur-md"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between px-1">
        <button
          type="button"
          className={itemClass("home")}
          onClick={() => onChange("home")}
          aria-current={active === "home" ? "page" : undefined}
        >
          <span className="text-lg leading-none" aria-hidden>
            🏠
          </span>
          Home
        </button>

        <button
          type="button"
          className={itemClass("conteudos")}
          onClick={() => onChange("conteudos")}
          aria-current={active === "conteudos" ? "page" : undefined}
        >
          <span className="text-lg leading-none" aria-hidden>
            📚
          </span>
          Conteúdos
        </button>

        <div className="relative flex flex-1 flex-col items-center px-1 pb-1">
          <button
            type="button"
            onClick={onOliePress}
            className="-mt-7 flex h-[3.35rem] w-[3.35rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-500 shadow-[0_6px_20px_rgba(37,99,235,0.45)] ring-4 ring-white transition hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.98]"
            aria-label="Estou em crise — falar com a Olie"
          >
            <Olie state="calm" size={48} className="rounded-full object-cover" />
          </button>
          <span className="mt-1 text-[10px] font-semibold text-blue-600">
            Olie
          </span>
        </div>

        <button
          type="button"
          className={itemClass("historico")}
          onClick={() => onChange("historico")}
          aria-current={active === "historico" ? "page" : undefined}
        >
          <span className="text-lg leading-none" aria-hidden>
            📊
          </span>
          Histórico
        </button>

        <button
          type="button"
          className={itemClass("perfil")}
          onClick={() => onChange("perfil")}
          aria-current={active === "perfil" ? "page" : undefined}
        >
          <span className="text-lg leading-none" aria-hidden>
            👤
          </span>
          Perfil
        </button>
      </div>
    </nav>
  );
}
