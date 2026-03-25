import { TemplateFrame } from "./TemplateFrame";

interface ProfessionalTemplateProps {
  html: string;
  title: string;
  description?: string;
}

export function ProfessionalTemplate({
  html,
  title,
  description,
}: ProfessionalTemplateProps) {
  return (
    <TemplateFrame
      title={title}
      description={description}
      meta={`${new Date().toLocaleDateString("pt-BR")} · MarkType`}
      className="doc-preview template-professional"
      headerClassName="text-center border-ink-950 pb-8"
      badgeClassName="bg-ink-950 text-white rounded-md tracking-wide uppercase"
      titleClassName="text-5xl font-display tracking-tight"
      descriptionClassName="mx-auto text-ink-700 italic"
      metaClassName="uppercase tracking-[0.12em] text-ink-500"
    >
      <div
        className="doc-preview template-professional"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </TemplateFrame>
  );
}
