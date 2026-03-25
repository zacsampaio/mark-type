import { TemplateFrame } from "./TemplateFrame";

interface DocumentTemplateProps {
  html: string;
  title: string;
  description?: string;
}

export function DocumentTemplate({
  html,
  title,
  description,
}: DocumentTemplateProps) {
  return (
    <TemplateFrame
      title={title}
      description={description}
      meta={`${new Date().toLocaleDateString("pt-BR")} · leitura e impressao`}
      className="doc-preview template-document"
      headerClassName="pb-4"
      badgeClassName="bg-neutral-100 text-neutral-700 border border-neutral-300"
      titleClassName="text-3xl"
      descriptionClassName="text-neutral-600"
      metaClassName="text-neutral-500"
    >
      <div className="doc-preview template-document" dangerouslySetInnerHTML={{ __html: html }} />
    </TemplateFrame>
  );
}
