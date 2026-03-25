export const TEMPLATE_IDS = [
  "professional",
  "modern",
  "saas",
  "document",
  "compliance",
] as const;

export type Template = (typeof TEMPLATE_IDS)[number];

export const TEMPLATE_OPTIONS: {
  value: Template;
  label: string;
  description: string;
}[] = [
  {
    value: "professional",
    label: "Profissional",
    description: "Serifado formal, capa acadêmica",
  },
  {
    value: "modern",
    label: "Moderno",
    description: "Visual limpo com destaque em hero",
  },
  {
    value: "saas",
    label: "SaaS",
    description: "Estilo produto / documentação de software",
  },
  {
    value: "document",
    label: "Documento",
    description: "Mínimo para leitura e impressão",
  },
  {
    value: "compliance",
    label: "Compliance",
    description: "Formal, com avisos e estrutura regulatória",
  },
];

export function isValidTemplate(value: string): value is Template {
  return (TEMPLATE_IDS as readonly string[]).includes(value);
}

export function templateLabel(template: Template): string {
  return TEMPLATE_OPTIONS.find((o) => o.value === template)?.label ?? template;
}
