"use client";

type Props = {
  displayName: string | null;
  email: string | null;
  onSignOut: () => void | Promise<void>;
};

export function PerfilTab({ displayName, email, onSignOut }: Props) {
  const name = displayName?.trim() || "Visitante";

  return (
    <div className="flex flex-col gap-8 pb-4 pt-2">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-olie-text">
          Perfil
        </h1>
      </header>

      <div className="rounded-2xl border border-olie-border/80 bg-white/90 p-5 shadow-sm ring-1 ring-olie-border/40">
        <p className="text-lg font-semibold text-olie-text">{name}</p>
        {email ? (
          <p className="mt-1 text-sm text-olie-text-secondary">{email}</p>
        ) : (
          <p className="mt-1 text-sm text-olie-text-secondary">Não logado ou sem e-mail</p>
        )}
      </div>

      <nav className="flex flex-col gap-2" aria-label="Opções do perfil">
        <button
          type="button"
          className="rounded-2xl border border-olie-border/80 bg-white/90 px-4 py-3.5 text-left text-[15px] font-medium text-olie-text shadow-sm ring-1 ring-olie-border/35 transition hover:bg-olie-surface/60 focus:outline-none focus:ring-2 focus:ring-olie-accent/30"
        >
          Editar perfil
        </button>
        <button
          type="button"
          className="rounded-2xl border border-olie-border/80 bg-white/90 px-4 py-3.5 text-left text-[15px] font-medium text-olie-text shadow-sm ring-1 ring-olie-border/35 transition hover:bg-olie-surface/60 focus:outline-none focus:ring-2 focus:ring-olie-accent/30"
        >
          Assinar Premium
        </button>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3.5 text-left text-[15px] font-medium text-red-900/90 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          Sair
        </button>
      </nav>
    </div>
  );
}
