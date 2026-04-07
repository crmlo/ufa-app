"use client";

import { useCallback, useEffect, useState } from "react";

import {
  HEALTH_EXCLUSIVE,
  HEALTH_SECTIONS,
  NEURO_EXCLUSIVE,
  NEURO_ITEMS,
  OUTRA_CONDICAO,
  OUTRA_NEURO,
  STORAGE_ONBOARDING_COMPLETE,
  STORAGE_PENDING_PROFILE,
  TOTAL_ONBOARDING_STEPS,
} from "@/lib/onboarding/constants";
import { upsertUserProfile } from "@/lib/onboarding/profileSync";
import { persistUserName } from "@/lib/onboarding/userName";
import type {
  HealthSelections,
  NeuroSelections,
  PendingProfilePayload,
} from "@/lib/onboarding/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  onComplete: () => void;
};

function isExclusiveHealth(label: string): boolean {
  return (HEALTH_EXCLUSIVE as readonly string[]).includes(label);
}

function isExclusiveNeuro(label: string): boolean {
  return (NEURO_EXCLUSIVE as readonly string[]).includes(label);
}

function toggleHealth(prev: HealthSelections, label: string): HealthSelections {
  if (isExclusiveHealth(label)) {
    return { selected: [label], outra: undefined };
  }
  const withoutExclusive = prev.selected.filter((s) => !isExclusiveHealth(s));
  if (label === OUTRA_CONDICAO) {
    const next = withoutExclusive.includes(OUTRA_CONDICAO)
      ? withoutExclusive.filter((s) => s !== OUTRA_CONDICAO)
      : [...withoutExclusive, OUTRA_CONDICAO];
    return {
      selected: next,
      outra: next.includes(OUTRA_CONDICAO) ? prev.outra : undefined,
    };
  }
  if (withoutExclusive.includes(label)) {
    return { ...prev, selected: withoutExclusive.filter((s) => s !== label) };
  }
  return {
    ...prev,
    selected: [...withoutExclusive, label],
  };
}

function toggleNeuro(prev: NeuroSelections, label: string): NeuroSelections {
  if (isExclusiveNeuro(label)) {
    return { selected: [label], outra: undefined };
  }
  const withoutExclusive = prev.selected.filter((s) => !isExclusiveNeuro(s));
  if (label === OUTRA_NEURO) {
    const next = withoutExclusive.includes(OUTRA_NEURO)
      ? withoutExclusive.filter((s) => s !== OUTRA_NEURO)
      : [...withoutExclusive, OUTRA_NEURO];
    return {
      selected: next,
      outra: next.includes(OUTRA_NEURO) ? prev.outra : undefined,
    };
  }
  if (withoutExclusive.includes(label)) {
    return { ...prev, selected: withoutExclusive.filter((s) => s !== label) };
  }
  return { ...prev, selected: [...withoutExclusive, label] };
}

function chipClass(selected: boolean): string {
  return `rounded-full border px-3.5 py-2 text-left text-[13px] leading-snug transition focus:outline-none focus:ring-2 focus:ring-blue-300/60 active:scale-[0.99] ${
    selected
      ? "border-blue-400/70 bg-blue-100/90 text-slate-800 ring-1 ring-blue-200/50"
      : "border-blue-200/90 bg-white/90 text-slate-800 hover:border-blue-300/70"
  }`;
}

function buildPayload(
  nome: string,
  health: HealthSelections,
  neuro: NeuroSelections,
  gatilhos: string
): PendingProfilePayload {
  const condicoes_saude: HealthSelections = {
    selected: [...health.selected],
    ...(health.outra?.trim() ? { outra: health.outra.trim() } : {}),
  };
  const neurodivergencia: NeuroSelections = {
    selected: [...neuro.selected],
    ...(neuro.outra?.trim() ? { outra: neuro.outra.trim() } : {}),
  };
  return {
    nome: nome.trim(),
    condicoes_saude,
    neurodivergencia,
    gatilhos: gatilhos.trim(),
  };
}

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Tela “Já tenho conta” — pede só o email */
const STEP_LOGIN_EMAIL = 10;

function getEmailRedirectTo(): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const redirectBase = fromEnv || origin;
  return redirectBase ? `${redirectBase}/` : undefined;
}

function isLikelyNoAccountError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("signups not allowed") ||
    m.includes("user not found") ||
    m.includes("email not found") ||
    m.includes("no user") ||
    m.includes("not registered")
  );
}

export function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [health, setHealth] = useState<HealthSelections>({
    selected: [],
  });
  const [neuro, setNeuro] = useState<NeuroSelections>({ selected: [] });
  const [gatilhos, setGatilhos] = useState("");
  const [email, setEmail] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resendCooldownEnds, setResendCooldownEnds] = useState(0);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  const persistPending = useCallback(
    (payload: PendingProfilePayload) => {
      try {
        localStorage.setItem(STORAGE_PENDING_PROFILE, JSON.stringify(payload));
      } catch {
        /* ignore quota */
      }
    },
    []
  );

  const clearPending = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_PENDING_PROFILE);
    } catch {
      /* ignore */
    }
  }, []);

  const finishWithoutAccount = useCallback(() => {
    clearPending();
    persistUserName(nome);
    try {
      localStorage.setItem(STORAGE_ONBOARDING_COMPLETE, "1");
    } catch {
      /* ignore */
    }
    onComplete();
  }, [clearPending, nome, onComplete]);

  const trySyncSessionAndFinish = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      setAuthError(
        "Ainda não detectamos o login. Abra o link do email neste aparelho."
      );
      return;
    }
    const raw = localStorage.getItem(STORAGE_PENDING_PROFILE);
    if (!raw) {
      try {
        localStorage.setItem(STORAGE_ONBOARDING_COMPLETE, "1");
      } catch {
        /* ignore */
      }
      onComplete();
      return;
    }
    let payload: PendingProfilePayload;
    try {
      payload = JSON.parse(raw) as PendingProfilePayload;
    } catch {
      clearPending();
      try {
        localStorage.setItem(STORAGE_ONBOARDING_COMPLETE, "1");
      } catch {
        /* ignore */
      }
      onComplete();
      return;
    }
    const { error } = await upsertUserProfile(supabase, user.id, payload);
    if (error) {
      setAuthError(error.message);
      return;
    }
    persistUserName(payload.nome);
    clearPending();
    try {
      localStorage.setItem(STORAGE_ONBOARDING_COMPLETE, "1");
    } catch {
      /* ignore */
    }
    onComplete();
  }, [clearPending, onComplete]);

  const sendMagicLink = async () => {
    const em = email.trim();
    if (!EMAIL_RE.test(em)) {
      setAuthError("Digite um email válido.");
      return;
    }
    setAuthError(null);
    setAuthBusy(true);
    const payload = buildPayload(nome, health, neuro, gatilhos);
    persistPending(payload);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: {
          emailRedirectTo: getEmailRedirectTo(),
        },
      });
      if (error) {
        setAuthError(error.message);
        return;
      }
      setResendCooldownEnds(Date.now() + 60_000);
      setStep(7);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Erro ao enviar o link.");
    } finally {
      setAuthBusy(false);
    }
  };

  const sendLoginMagicLink = async () => {
    const em = email.trim();
    if (!EMAIL_RE.test(em)) {
      setAuthError("Digite um email válido.");
      return;
    }
    setAuthError(null);
    setAuthBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: {
          emailRedirectTo: getEmailRedirectTo(),
          shouldCreateUser: false,
        },
      });
      if (error) {
        const eml = error.message.toLowerCase();
        if (eml.includes("rate") || eml.includes("many requests")) {
          setAuthError(error.message);
          return;
        }
        if (isLikelyNoAccountError(error.message)) {
          setAuthError(
            "Este email ainda não está cadastrado. Vamos criar seu perfil no passo a passo — é bem rapidinho."
          );
          setStep(2);
          return;
        }
        setAuthError(error.message);
        return;
      }
      setResendCooldownEnds(Date.now() + 60_000);
      setStep(7);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Erro ao enviar o link.");
    } finally {
      setAuthBusy(false);
    }
  };

  const resendMagicLink = async () => {
    if (Date.now() < resendCooldownEnds || authBusy) return;
    const em = email.trim();
    if (!EMAIL_RE.test(em)) {
      setAuthError("Digite um email válido.");
      return;
    }
    setAuthError(null);
    setAuthBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const hasPending = !!localStorage.getItem(STORAGE_PENDING_PROFILE);
      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: {
          emailRedirectTo: getEmailRedirectTo(),
          ...(hasPending ? {} : { shouldCreateUser: false }),
        },
      });
      if (error) {
        setAuthError(error.message);
        return;
      }
      setResendCooldownEnds(Date.now() + 60_000);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Erro ao reenviar.");
    } finally {
      setAuthBusy(false);
    }
  };

  useEffect(() => {
    if (step !== 7) return;
    const tick = () => {
      setResendSecondsLeft(
        Math.max(0, Math.ceil((resendCooldownEnds - Date.now()) / 1000))
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [step, resendCooldownEnds]);

  useEffect(() => {
    if (step !== 7) return;
    const onVis = () => {
      if (document.visibilityState === "visible") void trySyncSessionAndFinish();
    };
    const onFocus = () => void trySyncSessionAndFinish();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    const poll = window.setInterval(() => void trySyncSessionAndFinish(), 5000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(poll);
    };
  }, [step, trySyncSessionAndFinish]);

  const progressStep =
    step === STEP_LOGIN_EMAIL ? 1 : Math.min(step, TOTAL_ONBOARDING_STEPS);
  const progress = (progressStep / TOTAL_ONBOARDING_STEPS) * 100;

  const canContinueStep2 = nome.trim().length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <div className="sticky top-0 z-10 border-b border-blue-100 bg-slate-50/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm">
        <div
          className="mx-auto mb-3 h-1.5 max-w-md overflow-hidden rounded-full bg-blue-100/90"
          role="progressbar"
          aria-valuenow={progressStep}
          aria-valuemin={1}
          aria-valuemax={TOTAL_ONBOARDING_STEPS}
          aria-label={`Etapa ${progressStep} de ${TOTAL_ONBOARDING_STEPS}`}
        >
          <div
            className="h-full rounded-full bg-blue-500 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {step > 1 && (
          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              if (step === STEP_LOGIN_EMAIL) {
                setStep(1);
                return;
              }
              setStep((s) => Math.max(1, s - 1));
            }}
            className="text-[13px] font-medium text-slate-500 underline-offset-2 hover:text-slate-600 hover:underline"
          >
            Voltar
          </button>
        )}
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
        {step === 1 && (
          <div className="flex flex-1 flex-col justify-center gap-8">
            <div className="space-y-4 text-left">
              <p className="text-2xl font-semibold leading-snug text-slate-800">
                Oi! Eu sou a Ufie 💛
              </p>
              <p className="text-[15px] leading-relaxed text-slate-800">
                Eu vou estar aqui com você sempre que precisar, nos momentos
                difíceis, no dia a dia e principalmente quando a ansiedade
                apertar.
              </p>
              <p className="text-[15px] leading-relaxed text-slate-700">
                Antes da gente começar, me conta um pouquinho sobre você? Assim
                eu consigo te ajudar de um jeito que faça sentido pra você.
              </p>
              <p className="text-[14px] leading-relaxed text-slate-500">
                É bem rapidinho e leva menos de 1 minuto.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-2xl bg-blue-500 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-50"
              >
                Começar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setStep(STEP_LOGIN_EMAIL);
                }}
                className="w-full rounded-2xl border border-blue-200 bg-white py-3.5 text-[15px] font-medium text-blue-800 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Já tenho conta
              </button>
            </div>
          </div>
        )}

        {step === STEP_LOGIN_EMAIL && (
          <div className="flex flex-1 flex-col gap-5">
            <h1 className="text-xl font-semibold leading-snug text-slate-800">
              Entrar com seu email
            </h1>
            <p className="text-[14px] leading-relaxed text-slate-600">
              Enviamos um link mágico para você acessar sua conta — sem senha.
            </p>
            <label htmlFor="onb-login-email" className="sr-only">
              Email
            </label>
            <input
              id="onb-login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3.5 text-[15px] text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
            />
            {authError && (
              <p className="text-sm text-red-800" role="alert">
                {authError}
              </p>
            )}
            <div className="mt-auto flex flex-col gap-3 pt-6">
              <button
                type="button"
                disabled={authBusy}
                onClick={() => void sendLoginMagicLink()}
                className="w-full rounded-2xl bg-blue-500 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-50"
              >
                {authBusy ? "Enviando…" : "Enviar link de acesso"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-1 flex-col gap-6">
            <h1 className="text-xl font-semibold leading-snug text-slate-800">
              Como prefere que eu te chame?
            </h1>
            <label htmlFor="onb-nome" className="sr-only">
              Nome ou apelido
            </label>
            <input
              id="onb-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome ou apelido"
              autoComplete="name"
              className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3.5 text-[15px] text-slate-800 shadow-sm placeholder:text-[#b0a090] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
            />
            <div className="mt-auto pt-8">
              <button
                type="button"
                disabled={!canContinueStep2}
                onClick={() => setStep(3)}
                className="w-full rounded-2xl bg-blue-500 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-1 flex-col gap-5">
            <h1 className="text-xl font-semibold leading-snug text-slate-800">
              Tem alguma condição de saúde que devo saber?
            </h1>
            <div className="flex flex-wrap gap-2">
              {(HEALTH_EXCLUSIVE as readonly string[]).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setHealth((h) => toggleHealth(h, label))}
                  className={chipClass(health.selected.includes(label))}
                >
                  {label}
                </button>
              ))}
            </div>
            {HEALTH_SECTIONS.map((sec) => (
              <div key={sec.title}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {sec.title}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sec.items.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setHealth((h) => toggleHealth(h, label))}
                      className={chipClass(health.selected.includes(label))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <button
                type="button"
                onClick={() => setHealth((h) => toggleHealth(h, OUTRA_CONDICAO))}
                className={chipClass(health.selected.includes(OUTRA_CONDICAO))}
              >
                {OUTRA_CONDICAO}
              </button>
              {health.selected.includes(OUTRA_CONDICAO) && (
                <label htmlFor="onb-outra-cond" className="mt-3 block">
                  <span className="sr-only">Descreva a condição</span>
                  <input
                    id="onb-outra-cond"
                    type="text"
                    value={health.outra ?? ""}
                    onChange={(e) =>
                      setHealth((h) => ({ ...h, outra: e.target.value }))
                    }
                    placeholder="Qual condição?"
                    className="mt-2 w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-[15px] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                  />
                </label>
              )}
            </div>
            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full rounded-2xl bg-blue-500 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-1 flex-col gap-5">
            <h1 className="text-xl font-semibold leading-snug text-slate-800">
              Você tem algum diagnóstico de neurodivergência?
            </h1>
            <div className="flex flex-wrap gap-2">
              {NEURO_ITEMS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setNeuro((n) => toggleNeuro(n, label))}
                  className={chipClass(neuro.selected.includes(label))}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(NEURO_EXCLUSIVE as readonly string[]).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setNeuro((n) => toggleNeuro(n, label))}
                  className={chipClass(neuro.selected.includes(label))}
                >
                  {label}
                </button>
              ))}
            </div>
            {neuro.selected.includes(OUTRA_NEURO) && (
              <label htmlFor="onb-outra-neuro" className="block">
                <span className="sr-only">Descreva</span>
                <input
                  id="onb-outra-neuro"
                  type="text"
                  value={neuro.outra ?? ""}
                  onChange={(e) =>
                    setNeuro((n) => ({ ...n, outra: e.target.value }))
                  }
                  placeholder="Qual neurodivergência?"
                  className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-[15px] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                />
              </label>
            )}
            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full rounded-2xl bg-blue-500 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-1 flex-col gap-5">
            <h1 className="text-xl font-semibold leading-snug text-slate-800">
              Como você costuma perceber que uma crise está chegando?
            </h1>
            <label htmlFor="onb-gatilhos" className="sr-only">
              Sinais de crise
            </label>
            <textarea
              id="onb-gatilhos"
              value={gatilhos}
              onChange={(e) => setGatilhos(e.target.value)}
              placeholder="Ex: coração acelera, fico irritada, perco o foco..."
              rows={5}
              className="w-full resize-y rounded-2xl border border-blue-200 bg-white px-4 py-3.5 text-[15px] leading-relaxed text-slate-800 shadow-sm placeholder:text-[#b0a090] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
            />
            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={() => {
                  const payload = buildPayload(nome, health, neuro, gatilhos);
                  persistPending(payload);
                  setStep(6);
                }}
                className="w-full rounded-2xl bg-blue-500 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-1 flex-col gap-5">
            <h1 className="text-xl font-semibold leading-snug text-slate-800">
              Quer que eu me lembre de tudo que você me contou? É só criar sua
              conta gratuita. Enviamos um link mágico por email — sem senha para
              decorar 😌
            </h1>
            <label htmlFor="onb-email" className="sr-only">
              Email
            </label>
            <input
              id="onb-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3.5 text-[15px] text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
            />
            {authError && (
              <p className="text-sm text-red-800" role="alert">
                {authError}
              </p>
            )}
            <div className="mt-auto flex flex-col gap-3 pt-6">
              <button
                type="button"
                disabled={authBusy}
                onClick={() => void sendMagicLink()}
                className="w-full rounded-2xl bg-blue-500 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-50"
              >
                {authBusy ? "Enviando…" : "Enviar link de acesso"}
              </button>
              <button
                type="button"
                onClick={finishWithoutAccount}
                className="text-center text-[14px] font-medium text-slate-500 underline decoration-blue-200/80 underline-offset-2 transition hover:text-slate-700"
              >
                Prefiro continuar sem salvar meu histórico
              </button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="flex flex-1 flex-col justify-center gap-8">
            <div className="space-y-3">
              <h1 className="text-xl font-semibold leading-snug text-slate-800">
                Te mandei um link no seu email. É só clicar nele para começar
                ☺️.
              </h1>
              <p className="text-[13px] leading-relaxed text-slate-500">
                Depois de abrir o link, volte a esta aba — vamos detectar seu
                login automaticamente.
              </p>
              {authError ? (
                <p className="text-sm text-red-800" role="alert">
                  {authError}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={
                  authBusy ||
                  resendSecondsLeft > 0 ||
                  !EMAIL_RE.test(email.trim())
                }
                onClick={() => void resendMagicLink()}
                className="text-[13px] font-medium text-blue-700 underline decoration-blue-200 underline-offset-2 transition hover:text-blue-900 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
              >
                {resendSecondsLeft > 0
                  ? `Reenviar email (${resendSecondsLeft}s)`
                  : "Reenviar email"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
