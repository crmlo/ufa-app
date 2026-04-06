/** Categorias de conteúdo / explorar — placeholders */
export const CONTENT_CATEGORIES = [
  { id: "ansiedade", icon: "🧠", label: "Entendendo a ansiedade" },
  { id: "crises", icon: "🆘", label: "Técnicas para crises" },
  { id: "respiracao", icon: "🌬️", label: "Respiração" },
  { id: "sono", icon: "😴", label: "Sono e descanso" },
  { id: "autoconhecimento", icon: "💭", label: "Autoconhecimento" },
  { id: "diaadia", icon: "☀️", label: "Para o dia a dia" },
] as const;

export const PLACEHOLDER_ARTICLES: Record<
  string,
  { title: string; blurb: string }[]
> = {
  ansiedade: [
    { title: "O que é ansiedade?", blurb: "Texto introdutório virá aqui." },
    { title: "Sinais no corpo", blurb: "Placeholder de descrição curta." },
    { title: "Quando pedir ajuda", blurb: "Conteúdo em construção." },
  ],
  crises: [
    { title: "Âncora 5-4-3-2-1", blurb: "Técnica de grounding — em breve." },
    { title: "Nomear o que sente", blurb: "Descrição placeholder." },
    { title: "Pedir apoio na hora", blurb: "Em construção." },
  ],
  respiracao: [
    { title: "Respiração quadrada", blurb: "Passo a passo em breve." },
    { title: "Expiração longa", blurb: "Placeholder." },
    { title: "Rotina de 2 minutos", blurb: "Conteúdo futuro." },
  ],
  sono: [
    { title: "Higiene do sono", blurb: "Dicas placeholder." },
    { title: "Ambiente para descansar", blurb: "Em breve." },
    { title: "Quando a mente não para", blurb: "Texto futuro." },
  ],
  autoconhecimento: [
    { title: "Diário de humor", blurb: "Placeholder." },
    { title: "Identificar gatilhos", blurb: "Em construção." },
    { title: "Pequenos hábitos", blurb: "Conteúdo futuro." },
  ],
  diaadia: [
    { title: "Rotina leve", blurb: "Placeholder." },
    { title: "Micro pausas", blurb: "Em breve." },
    { title: "Gentileza consigo", blurb: "Texto futuro." },
  ],
};
