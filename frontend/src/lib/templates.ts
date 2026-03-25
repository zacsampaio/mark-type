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
    description: "Formal tecnico com estrutura academica",
  },
  {
    value: "modern",
    label: "Moderno",
    description: "Visual limpo para leitura digital",
  },
  {
    value: "saas",
    label: "Simples",
    description: "Modelo cru, preto e branco, pronto para editar",
  },
  {
    value: "document",
    label: "Documento",
    description: "Impressão simples com tipografia clássica",
  },
  {
    value: "compliance",
    label: "Compliance",
    description: "Estrutura regulatória e auditoria",
  },
];

export function isValidTemplate(value: string): value is Template {
  return (TEMPLATE_IDS as readonly string[]).includes(value);
}

export function templateLabel(template: Template): string {
  return TEMPLATE_OPTIONS.find((o) => o.value === template)?.label ?? template;
}
