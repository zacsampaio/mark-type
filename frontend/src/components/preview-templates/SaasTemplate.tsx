import { TemplateFrame } from "./TemplateFrame";

interface SaasTemplateProps {
  html: string;
  title: string;
  description?: string;
}

export function SaasTemplate({ html, title, description }: SaasTemplateProps) {
  return (
    <TemplateFrame
      title={title}
      description={description}
      meta={`Rascunho editavel · ${new Date().toLocaleDateString("pt-BR")}`}
      className="doc-preview template-saas"
      headerClassName="border-neutral-900"
      titleClassName="text-neutral-950 tracking-normal"
      descriptionClassName="text-neutral-700"
      metaClassName="text-neutral-500"
    >
      <div className="doc-preview template-saas" dangerouslySetInnerHTML={{ __html: html }} />
    </TemplateFrame>
  );
}
