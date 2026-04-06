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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
          Perfil
        </h1>
      </header>

      <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm ring-1 ring-blue-50/80">
        <p className="text-lg font-semibold text-slate-800">{name}</p>
        {email ? (
          <p className="mt-1 text-sm text-slate-500">{email}</p>
        ) : (
          <p className="mt-1 text-sm text-slate-400">Não logado ou sem e-mail</p>
        )}
      </div>

      <nav className="flex flex-col gap-2" aria-label="Opções do perfil">
        <button
          type="button"
          className="rounded-2xl border border-blue-100 bg-white px-4 py-3.5 text-left text-[15px] font-medium text-slate-700 shadow-sm ring-1 ring-blue-50/60 transition hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          Editar perfil
        </button>
        <button
          type="button"
          className="rounded-2xl border border-blue-100 bg-white px-4 py-3.5 text-left text-[15px] font-medium text-slate-700 shadow-sm ring-1 ring-blue-50/60 transition hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
