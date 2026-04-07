"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { AutoEmergencyDrawer } from "@/components/AutoEmergencyDrawer";
import { AppMainHeader, FloatingSosButton } from "@/components/AppMainHeader";
import { BottomNav, type MainTabId } from "@/components/shell/BottomNav";
import { ConteudosTab } from "@/components/shell/ConteudosTab";
import { HistoricoTab } from "@/components/shell/HistoricoTab";
import { HomeTab } from "@/components/shell/HomeTab";
import { PerfilTab } from "@/components/shell/PerfilTab";
import type { EmergencyKind } from "@/lib/emergency";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { STORAGE_ONBOARDING_COMPLETE } from "@/lib/onboarding/constants";
import { fetchProfileNomeForUser } from "@/lib/onboarding/fetchProfileNome";
import { tryFinalizeOnboardingFromPending } from "@/lib/onboarding/finalize";
import { persistUserName, STORAGE_USER_NAME } from "@/lib/onboarding/userName";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Role = "user" | "assistant";

type ChatMode = "apoio" | "socorro";

type Message = {
  id: string;
  role: Role;
  text: string;
  /** Mensagem automática ao escolher modo — não entra no array enviado à API Anthropic como primeira mensagem */
  opening?: boolean;
};

type InlineFeedbackPoll = {
  id: string;
  question: string;
  selected: string[];
  detail: string;
  submitting: boolean;
  submitted: boolean;
};

const OPENING_APOIO =
  "Oi! Estou aqui pra gente conversar agora. Me conta como você está? Pode contar com calma, sou toda ouvidos.";

const OPENING_SOCORRO =
  "Estou com você agora. O que você está sentindo?";

/** Mesma pergunta da Olie — título do drawer */
const SOCORRO_DRAWER_TITLE = "O que você está sentindo?";

const OPENING_SOCORRO_OPTIONS = [
  "Falta de ar",
  "Coração acelerado",
  "Aperto no peito",
  "Tontura / fraqueza / cabeça aérea",
  "Pensamentos acelerados",
  "Medo / sensação de perigo / algo ruim vai acontecer",
  "Não sei explicar",
] as const;

const POST_CRISIS_FEEDBACK_OPTIONS = [
  "Conversar ajudou",
  "Respirar com você ajudou",
  "Só precisava de presença",
  "As opções de sintoma ajudaram a nomear o que sentia",
  "Não sei bem",
] as const;

const SOS_CONTACTS = [
  {
    icon: "🚑",
    name: "SAMU",
    description: "Emergências médicas",
    tel: "192",
  },
  {
    icon: "💛",
    name: "CVV",
    description: "Crise emocional e ideação suicida, 24h gratuito",
    tel: "188",
  },
  {
    icon: "🔥",
    name: "Bombeiros",
    description: "Emergências gerais",
    tel: "193",
  },
  {
    icon: "🚔",
    name: "Polícia",
    description: "Emergência policial",
    tel: "190",
  },
] as const;

function buildSocorroDrawerMessage(
  selected: string[],
  freeText: string
): string {
  const ft = freeText.trim();
  if (selected.length === 0 && ft) return ft;
  if (selected.length === 0) return "";

  const lines: string[] = ["Estou sentindo:"];
  selected.forEach((s) => lines.push(`• ${s}`));
  if (ft) {
    lines.push("");
    lines.push(`Também quis dizer: ${ft}`);
  }
  return lines.join("\n");
}

export default function Home() {
  const [mode, setMode] = useState<ChatMode | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[] | null>(null);

  /** Painel inicial Socorro (drawer) — some após o primeiro envio */
  const [socorroInitialDrawer, setSocorroInitialDrawer] = useState(false);
  const [socorroSelected, setSocorroSelected] = useState<string[]>([]);
  const [socorroDrawerFreeText, setSocorroDrawerFreeText] = useState("");

  const [inlineFeedbackPoll, setInlineFeedbackPoll] =
    useState<InlineFeedbackPoll | null>(null);
  const [modePickerDrawerOpen, setModePickerDrawerOpen] = useState(false);

  const [sosDrawerOpen, setSosDrawerOpen] = useState(false);

  /** Drawer de emergência disparado pela API (prioridade máxima) */
  const [autoEmergency, setAutoEmergency] = useState<EmergencyKind | null>(
    null
  );

  /** Olie encerrou a conversa (despedida); mostra "Voltar para o início" */
  const [conversationEnded, setConversationEnded] = useState(false);

  const [onboardingReady, setOnboardingReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  /** Nome para saudação; null = mostrar só "Olá!" */
  const [displayName, setDisplayName] = useState<string | null>(null);

  /** E-mail do usuário logado (aba Perfil) */
  const [userEmail, setUserEmail] = useState<string | null>(null);

  /** Aba inferior no shell principal (fora do fluxo Olie em tela cheia) */
  const [mainTab, setMainTab] = useState<MainTabId>("home");

  /** true = fluxo Olie em tela cheia; false = shell com navbar */
  const [olieFlowOpen, setOlieFlowOpen] = useState(false);

  const chatInputRef = useRef<HTMLInputElement>(null);
  const socorroDrawerPanY = useRef<number | null>(null);

  const refreshDisplayName = useCallback(async () => {
    let fromProfile: string | null = null;
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        fromProfile = await fetchProfileNomeForUser(user.id);
      }
    } catch {
      /* ignore */
    }
    if (fromProfile) {
      persistUserName(fromProfile);
      setDisplayName(fromProfile);
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_USER_NAME)?.trim();
      setDisplayName(stored && stored.length > 0 ? stored : null);
    } catch {
      setDisplayName(null);
    }
  }, []);

  const lockBodyScroll =
    !!autoEmergency ||
    socorroInitialDrawer ||
    modePickerDrawerOpen ||
    sosDrawerOpen;

  useEffect(() => {
    if (lockBodyScroll) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [lockBodyScroll]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const runFinalize = () => {
      void (async () => {
        const ok = await tryFinalizeOnboardingFromPending();
        if (ok) setOnboardingComplete(true);
      })();
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (
        session?.user &&
        (event === "SIGNED_IN" || event === "INITIAL_SESSION")
      ) {
        runFinalize();
        void refreshDisplayName();
      }
    });

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);

      const finalized = await tryFinalizeOnboardingFromPending();
      if (finalized) {
        setOnboardingComplete(true);
      } else {
        try {
          setOnboardingComplete(
            localStorage.getItem(STORAGE_ONBOARDING_COMPLETE) === "1"
          );
        } catch {
          setOnboardingComplete(false);
        }
      }
      setOnboardingReady(true);
    })();

    return () => subscription.unsubscribe();
  }, [refreshDisplayName]);

  useEffect(() => {
    if (!onboardingReady || !onboardingComplete) return;
    void refreshDisplayName();
  }, [onboardingReady, onboardingComplete, refreshDisplayName]);

  function resetOlieChatState() {
    setMode(null);
    setSessionId(null);
    setMessages([]);
    setConversationEnded(false);
    setSocorroInitialDrawer(false);
    setModePickerDrawerOpen(false);
    setInlineFeedbackPoll(null);
    setSosDrawerOpen(false);
    setAutoEmergency(null);
    setQuickReplies(null);
    setDraft("");
    setError(null);
    setSocorroSelected([]);
    setSocorroDrawerFreeText("");
  }

  /** Volta ao shell e limpa o fluxo da Olie */
  function goToModeSelection() {
    resetOlieChatState();
    setOlieFlowOpen(false);
  }

  async function handleSignOut() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    setUserEmail(null);
  }

  function selectMode(next: ChatMode) {
    setSessionId(crypto.randomUUID());
    setMode(next);
    setConversationEnded(false);
    setSocorroSelected([]);
    setSocorroDrawerFreeText("");
    setInlineFeedbackPoll(null);
    setModePickerDrawerOpen(false);
    setSocorroInitialDrawer(next === "socorro");
    setAutoEmergency(null);
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: next === "apoio" ? OPENING_APOIO : OPENING_SOCORRO,
        opening: true,
      },
    ]);
    setQuickReplies(null);
  }

  function toggleSocorroOption(label: string) {
    setSocorroSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  }

  function handleSocorroDrawerSubmit() {
    const text = buildSocorroDrawerMessage(
      socorroSelected,
      socorroDrawerFreeText
    );
    if (!text.trim() || pending || !sessionId || !mode) return;
    setSocorroInitialDrawer(false);
    setSocorroSelected([]);
    setSocorroDrawerFreeText("");
    void sendUserMessage(text);
  }

  const canSubmitSocorroDrawer =
    socorroSelected.length > 0 || socorroDrawerFreeText.trim().length > 0;

  async function submitPostCrisisFeedback() {
    if (!sessionId || !inlineFeedbackPoll || inlineFeedbackPoll.submitted) return;
    const detail = inlineFeedbackPoll.detail.trim();
    if (inlineFeedbackPoll.selected.length === 0 && !detail) return;
    setError(null);
    setInlineFeedbackPoll((prev) =>
      prev ? { ...prev, submitting: true } : prev
    );
    try {
      const res = await fetch("/api/conversations/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          selected: inlineFeedbackPoll.selected,
          ...(detail ? { detail } : {}),
        }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? `Erro ${res.status}`);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Não foi possível enviar o feedback.";
      setError(msg);
      setInlineFeedbackPoll((prev) =>
        prev ? { ...prev, submitting: false } : prev
      );
      return;
    }
    setInlineFeedbackPoll((prev) =>
      prev ? { ...prev, submitting: false, submitted: true } : prev
    );
  }

  function toggleFeedbackOption(label: string) {
    setInlineFeedbackPoll((prev) => {
      if (!prev || prev.submitted) return prev;
      const selected = prev.selected.includes(label)
        ? prev.selected.filter((x) => x !== label)
        : [...prev.selected, label];
      return { ...prev, selected };
    });
  }

  function updateFeedbackDetail(detail: string) {
    setInlineFeedbackPoll((prev) =>
      prev && !prev.submitted ? { ...prev, detail } : prev
    );
  }

  const canSubmitFeedback = inlineFeedbackPoll
    ? inlineFeedbackPoll.selected.length > 0 ||
      inlineFeedbackPoll.detail.trim().length > 0
    : false;

  async function sendUserMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending || !mode || !sessionId) return;

    setAutoEmergency(null);
    setConversationEnded(false);
    setInlineFeedbackPoll((prev) => (prev && prev.submitted ? prev : null));
    setQuickReplies(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setError(null);
    setPending(true);

    const baseForApi = messages.filter((m) => !m.opening);
    const history = [...baseForApi, userMsg].map((m) => ({
      role: m.role,
      content: m.text,
    }));

    const opening_greeting =
      messages.length > 0 && messages.every((m) => m.opening)
        ? messages[0].text
        : undefined;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          mode,
          session_id: sessionId,
          stored_messages: [...messages, userMsg].map(({ id, role, text }) => ({
            id,
            role,
            text,
          })),
          ...(opening_greeting ? { opening_greeting } : {}),
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        quick_replies?: string[] | null;
        feedback_prompt?: boolean;
        emergency?: EmergencyKind | null;
        conversation_end?: boolean;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? `Erro ${res.status}`);
      }
      if (!data.reply?.trim()) {
        throw new Error("Resposta vazia da Olie.");
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.reply!,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      const qr = data.quick_replies;
      const em = data.emergency;
      const isEmergency =
        em === "violence" || em === "medical" || em === "crisis";

      if (isEmergency) {
        setAutoEmergency(em);
        setConversationEnded(false);
        setSocorroInitialDrawer(false);
        setInlineFeedbackPoll((prev) => (prev && prev.submitted ? prev : null));
        setSosDrawerOpen(false);
        setQuickReplies(null);
      } else if (data.conversation_end) {
        setConversationEnded(true);
      } else if (data.feedback_prompt && mode === "socorro") {
        setConversationEnded(false);
        setInlineFeedbackPoll({
          id: crypto.randomUUID(),
          question: data.reply!.trim(),
          selected: [],
          detail: "",
          submitting: false,
          submitted: false,
        });
        setQuickReplies(null);
      } else {
        setConversationEnded(false);
        setQuickReplies(Array.isArray(qr) && qr.length > 0 ? qr : null);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Não foi possível obter resposta.";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendUserMessage(draft);
  }

  const showChatForm = true;

  const sosDrawerPortal = sosDrawerOpen ? (
        <>
          <div
            className="ufie-drawer-backdrop fixed inset-0 z-[110] bg-[#3d3429]/30"
            aria-hidden
            onClick={() => setSosDrawerOpen(false)}
          />
          <div
            className="ufie-drawer-sheet fixed bottom-0 left-0 right-0 z-[120] flex max-h-[min(90vh,560px)] flex-col rounded-t-3xl border border-blue-100 border-b-0 bg-white shadow-[0_-12px_48px_rgba(60,40,20,0.14)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sos-drawer-title"
          >
            <div className="flex shrink-0 flex-col items-center pt-3 pb-1">
              <div className="h-1.5 w-11 rounded-full bg-blue-200/70" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              <h2
                id="sos-drawer-title"
                className="text-lg font-semibold text-slate-800"
              >
                Precisa de ajuda urgente?
              </h2>
              <p className="mt-1 text-[13px] leading-snug text-slate-500">
                Toque para ligar direto do celular.
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {SOS_CONTACTS.map((c) => (
                  <li
                    key={c.tel}
                    className="rounded-2xl border border-blue-100 bg-white/90 p-3 shadow-sm sm:p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl"
                          aria-hidden
                        >
                          {c.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {c.name}
                          </p>
                          <p className="text-[13px] leading-snug text-slate-600">
                            {c.description}
                          </p>
                          <p className="mt-0.5 text-[12px] text-slate-500">
                            {c.tel}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`tel:${c.tel}`}
                        className="shrink-0 rounded-xl bg-blue-500 px-3.5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        Ligar
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0 border-t border-blue-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <button
                type="button"
                onClick={() => setSosDrawerOpen(false)}
                className="w-full rounded-xl border border-blue-200 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-blue-50/80"
              >
                Fechar
              </button>
            </div>
          </div>
        </>
      ) : null;

  if (!onboardingReady) {
    return (
      <div
        className="min-h-screen bg-slate-50"
        aria-busy="true"
        aria-label="Carregando"
      />
    );
  }

  if (!onboardingComplete) {
    return (
      <>
        <FloatingSosButton onOpenSos={() => setSosDrawerOpen(true)} />
        {sosDrawerPortal}
        <OnboardingFlow onComplete={() => setOnboardingComplete(true)} />
      </>
    );
  }

  if (mode === null && !olieFlowOpen) {
    return (
      <>
        <FloatingSosButton onOpenSos={() => setSosDrawerOpen(true)} />
        {sosDrawerPortal}
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
          <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto px-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))] pt-4 sm:px-6">
            {mainTab === "home" && (
              <HomeTab
                displayName={displayName}
                onOpenOlie={() => setModePickerDrawerOpen(true)}
              />
            )}
            {mainTab === "conteudos" && <ConteudosTab />}
            {mainTab === "historico" && <HistoricoTab />}
            {mainTab === "perfil" && (
              <PerfilTab
                displayName={displayName}
                email={userEmail}
                onSignOut={handleSignOut}
              />
            )}
          </main>
          <BottomNav
            active={mainTab}
            onChange={setMainTab}
            onOliePress={() => setModePickerDrawerOpen(true)}
          />
        </div>
        {modePickerDrawerOpen && (
          <>
            <div
              className="ufie-drawer-backdrop fixed inset-0 z-40 bg-[#3d3429]/25"
              aria-hidden
              onClick={() => setModePickerDrawerOpen(false)}
            />
            <div
              className="ufie-drawer-sheet fixed bottom-0 left-0 right-0 z-50 flex max-h-[min(88vh,520px)] flex-col rounded-t-3xl border border-blue-100 border-b-0 bg-white shadow-[0_-12px_48px_rgba(60,40,20,0.14)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mode-picker-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 flex-col items-center pt-3 pb-1">
                <div className="h-1.5 w-11 rounded-full bg-blue-200/70" aria-hidden />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <h2 id="mode-picker-title" className="text-lg font-semibold leading-snug text-slate-800">
                  Como você quer começar agora?
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOlieFlowOpen(true);
                      selectMode("apoio");
                    }}
                    className="w-full min-h-[3.25rem] rounded-2xl border border-blue-200 bg-white px-4 py-3 text-left text-[15px] font-medium leading-snug text-slate-800 shadow-sm transition hover:border-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-300/70 active:scale-[0.99]"
                  >
                    💬 Quero conversar um pouco
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOlieFlowOpen(true);
                      selectMode("socorro");
                    }}
                    className="w-full min-h-[3.25rem] rounded-2xl border border-blue-200 bg-white px-4 py-3 text-left text-[15px] font-medium leading-snug text-slate-800 shadow-sm transition hover:border-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-300/70 active:scale-[0.99]"
                  >
                    ⚡ Estou em crise
                  </button>
                </div>
              </div>
              <div className="shrink-0 border-t border-blue-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
                <button
                  type="button"
                  onClick={() => setModePickerDrawerOpen(false)}
                  className="w-full rounded-xl border border-blue-200 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-blue-50/80"
                >
                  Fechar
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  if (mode === null && olieFlowOpen) return null;

  if (!mode) {
    return null;
  }

  const modeDescription =
    mode === "apoio" ? "Conversa com calma" : "Presença imediata";

  return (
    <>
      {sosDrawerPortal}
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <AppMainHeader
        onOpenSos={() => setSosDrawerOpen(true)}
        chatNavigation={{
          modeLabel:
            mode === "apoio" ? "Apoio" : "Ajuda imediata",
          modeDescription,
          variant: mode,
          onBack: goToModeSelection,
        }}
      />

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-6 pt-4 sm:px-6">
        <div
          className="flex min-h-[min(420px,50vh)] flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_1px_3px_rgba(30,58,138,0.06)] sm:p-5"
          role="log"
          aria-live="polite"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-blue-100 to-blue-50 px-4 py-2.5 text-[15px] leading-relaxed text-slate-800 shadow-sm ring-1 ring-blue-200/50"
                    : "max-w-[85%] rounded-2xl rounded-bl-md border border-blue-100 bg-slate-100/90 px-4 py-2.5 text-[15px] leading-relaxed text-slate-800 shadow-sm"
                }
              >
                {m.text}
              </div>
            </div>
          ))}
          {inlineFeedbackPoll && (
            <div className="flex justify-start">
              <div className="w-full max-w-[92%] rounded-[20px] border border-ufie-border/90 bg-ufie-surface px-3.5 py-3 shadow-[var(--shadow-ufie-card)]">
                <p className="text-[15px] leading-relaxed text-ufie-text">
                  {inlineFeedbackPoll.question}
                </p>
                {!inlineFeedbackPoll.submitted && (
                  <>
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {POST_CRISIS_FEEDBACK_OPTIONS.map((label) => {
                        const selected = inlineFeedbackPoll.selected.includes(label);
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => toggleFeedbackOption(label)}
                            className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition focus:outline-none focus:ring-2 focus:ring-ufie-accent/70 focus:ring-offset-2 focus:ring-offset-ufie-surface ${
                              selected
                                ? "border-ufie-accent/70 bg-ufie-accent/25 text-ufie-text shadow-[var(--shadow-ufie-card)]"
                                : "border-ufie-border bg-ufie-bg text-ufie-muted hover:border-ufie-accent/45 hover:bg-ufie-accent/10"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      value={inlineFeedbackPoll.detail}
                      onChange={(e) => updateFeedbackDetail(e.target.value)}
                      placeholder="Se quiser detalhar..."
                      className="mt-3.5 w-full rounded-[14px] border border-ufie-border/90 bg-ufie-bg px-3 py-2.5 text-sm text-ufie-text placeholder:text-ufie-muted/65 focus:outline-none focus:ring-2 focus:ring-ufie-accent/70 focus:ring-offset-2 focus:ring-offset-ufie-surface"
                    />
                    <button
                      type="button"
                      disabled={!canSubmitFeedback || inlineFeedbackPoll.submitting}
                      onClick={() => void submitPostCrisisFeedback()}
                      className="mt-3.5 rounded-[14px] bg-ufie-primary px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-ufie-card)] transition hover:bg-ufie-text/90 focus:outline-none focus:ring-2 focus:ring-ufie-accent focus:ring-offset-2 focus:ring-offset-ufie-surface disabled:pointer-events-none disabled:opacity-45"
                    >
                      {inlineFeedbackPoll.submitting ? "Enviando..." : "Enviar feedback"}
                    </button>
                  </>
                )}
                {inlineFeedbackPoll.submitted && (
                  <p className="mt-2.5 text-xs font-medium text-ufie-muted">
                    Feedback enviado. Obrigada por me contar.
                  </p>
                )}
              </div>
            </div>
          )}
          {pending && (
            <div className="flex justify-start py-1">
              <div
                className="ufie-presence"
                aria-hidden
                title="Olie está aqui"
              >
                <div className="ufie-presence__halo" />
                <div className="ufie-presence__core">
                  <div className="ufie-presence__glow" />
                </div>
              </div>
              <span className="sr-only">Olie está respondendo</span>
            </div>
          )}
        </div>

        {conversationEnded && !pending && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={goToModeSelection}
              className="rounded-full border border-blue-200/80 bg-white/90 px-4 py-2 text-[13px] font-medium text-slate-500 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200/80"
            >
              Voltar para o início
            </button>
          </div>
        )}

        {error && (
          <p
            className="mt-2 rounded-xl border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-900"
            role="alert"
          >
            {error}
          </p>
        )}

        {quickReplies &&
          quickReplies.length > 0 &&
          !pending &&
          showChatForm && (
            <div className="mt-3 space-y-2">
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Respostas rápidas"
              >
                {quickReplies.map((label, i) => (
                  <button
                    key={`${i}-${label}`}
                    type="button"
                    onClick={() => sendUserMessage(label)}
                    className="max-w-full rounded-full border border-blue-200 bg-gradient-to-b from-[#fffbf5] to-blue-100/90 px-3 py-2 text-left text-[13px] leading-snug text-slate-800 shadow-sm ring-1 ring-blue-100/60 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300/70 active:scale-[0.98] sm:max-w-[calc(50%-0.25rem)] sm:text-center"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

        {showChatForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex gap-3 rounded-2xl border border-blue-100 bg-white/90 p-2 shadow-[0_2px_8px_rgba(139,94,60,0.07)] ring-1 ring-blue-50/60 backdrop-blur-sm"
          >
            <label htmlFor="chat-input" className="sr-only">
              Mensagem
            </label>
            <input
              ref={chatInputRef}
              id="chat-input"
              type="text"
              value={draft}
              onChange={(e) => {
                const v = e.target.value;
                setDraft(v);
                if (v.length > 0) setQuickReplies(null);
              }}
              placeholder="Escreva sua mensagem…"
              autoComplete="off"
              className="min-h-12 flex-1 rounded-xl border-0 bg-transparent px-3 text-[15px] text-slate-800 placeholder:text-[#b0a090] focus:outline-none focus:ring-2 focus:ring-blue-200/80 disabled:opacity-60"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {pending ? "…" : "Enviar"}
            </button>
          </form>
        )}
      </main>

      {/* Drawer inicial — modo ajuda imediata */}
      {mode === "socorro" &&
        socorroInitialDrawer &&
        !autoEmergency && (
        <>
          <div
            className="ufie-drawer-backdrop fixed inset-0 z-40 bg-[#3d3429]/25"
            aria-hidden
            onClick={() => setSocorroInitialDrawer(false)}
          />
          <div
            className="ufie-drawer-sheet fixed bottom-0 left-0 right-0 z-50 flex max-h-[min(88vh,640px)] flex-col rounded-t-3xl border border-blue-100 border-b-0 bg-white shadow-[0_-12px_48px_rgba(60,40,20,0.14)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="socorro-drawer-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex shrink-0 flex-col items-center pt-3 pb-1"
              onTouchStart={(e) => {
                socorroDrawerPanY.current = e.touches[0].clientY;
              }}
              onTouchEnd={(e) => {
                const start = socorroDrawerPanY.current;
                socorroDrawerPanY.current = null;
                if (start == null) return;
                const dy = e.changedTouches[0].clientY - start;
                if (dy > 56) setSocorroInitialDrawer(false);
              }}
            >
              <div
                className="h-1.5 w-11 rounded-full bg-blue-200/70"
                aria-hidden
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <h2
                  id="socorro-drawer-heading"
                  className="text-lg font-semibold leading-snug text-slate-800"
                >
                  {SOCORRO_DRAWER_TITLE}
                </h2>
                <button
                  type="button"
                  onClick={() => setSocorroInitialDrawer(false)}
                  className="shrink-0 text-[13px] font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                >
                  Fechar
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-2.5" role="group">
                {OPENING_SOCORRO_OPTIONS.map((label) => {
                  const selected = socorroSelected.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleSocorroOption(label)}
                      className={`w-full min-h-[3.25rem] rounded-2xl border px-4 py-3 text-left text-[15px] leading-snug transition focus:outline-none focus:ring-2 focus:ring-blue-300/70 active:scale-[0.99] ${
                        selected
                          ? "border-blue-400/70 bg-blue-100/90 text-slate-800 ring-2 ring-blue-200/50 shadow-sm"
                          : "border-blue-200 bg-white text-slate-800 shadow-sm hover:border-blue-300/60"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}

                <div className="pt-1">
                  <label htmlFor="socorro-drawer-free" className="sr-only">
                    Se preferir, escreva com suas palavras
                  </label>
                  <input
                    id="socorro-drawer-free"
                    type="text"
                    value={socorroDrawerFreeText}
                    onChange={(e) => setSocorroDrawerFreeText(e.target.value)}
                    placeholder="Se preferir, escreva aqui"
                    autoComplete="off"
                    className="w-full min-h-[3.25rem] rounded-2xl border border-blue-200 bg-white px-4 py-3 text-[15px] text-slate-800 shadow-sm placeholder:text-[#b0a090] focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-blue-100 bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                disabled={!canSubmitSocorroDrawer || pending}
                onClick={handleSocorroDrawerSubmit}
                className="flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-blue-500 text-[15px] font-semibold text-white shadow-md transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white disabled:pointer-events-none disabled:opacity-45"
              >
                Enviar
              </button>
            </div>
          </div>
        </>
      )}

      {autoEmergency && (
        <AutoEmergencyDrawer
          kind={autoEmergency}
          onClose={() => setAutoEmergency(null)}
        />
      )}
    </div>
    </>
  );
}
