/** Conteúdo salvo em condicoes_saude / neurodivergencia (jsonb) */
export type HealthSelections = {
  selected: string[];
  outra?: string;
};

export type NeuroSelections = {
  selected: string[];
  outra?: string;
};

export type PendingProfilePayload = {
  nome: string;
  condicoes_saude: HealthSelections;
  neurodivergencia: NeuroSelections;
  gatilhos: string;
};
