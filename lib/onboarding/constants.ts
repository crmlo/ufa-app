export const STORAGE_ONBOARDING_COMPLETE = "ufa_onboarding_complete_v1";
export const STORAGE_PENDING_PROFILE = "ufa_pending_profile_sync_v1";

export const HEALTH_EXCLUSIVE = ["Nenhuma", "Prefiro não dizer"] as const;

export const HEALTH_SECTIONS: {
  title: string;
  items: readonly string[];
}[] = [
  {
    title: "Cardiovascular",
    items: [
      "Arritmia",
      "Pressão alta",
      "Insuficiência cardíaca",
      "Histórico de infarto",
    ],
  },
  {
    title: "Metabólico",
    items: [
      "Diabetes tipo 1",
      "Diabetes tipo 2",
      "Hipotireoidismo",
      "Hipertireoidismo",
    ],
  },
  {
    title: "Neurológico",
    items: ["Epilepsia", "Enxaqueca crônica", "AVC prévio"],
  },
  {
    title: "Saúde mental",
    items: [
      "Depressão",
      "TAG",
      "Transtorno de Pânico",
      "TOC",
      "TEPT",
      "Bipolaridade",
      "Esquizofrenia",
      "Borderline",
    ],
  },
] as const;

export const OUTRA_CONDICAO = "Outra condição";

export const NEURO_EXCLUSIVE = [
  "Não fui diagnosticado",
  "Prefiro não dizer",
] as const;

export const NEURO_ITEMS = [
  "TDAH",
  "Autismo (TEA)",
  "Dislexia",
  "Altas Habilidades",
  "Outra",
] as const;

export const OUTRA_NEURO = "Outra";

export const TOTAL_ONBOARDING_STEPS = 7;
