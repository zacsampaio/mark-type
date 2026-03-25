import { TemplateFrame } from "./TemplateFrame";

interface ModernTemplateProps {
  html: string;
  title: string;
  description?: string;
}

export function ModernTemplate({ html, title, description }: ModernTemplateProps) {
  return (
    <TemplateFrame
      title={title}
      description={description}
      meta={`MarkType · ${new Date().getFullYear()}`}
      className="doc-preview template-modern"
      badgeClassName="bg-jade/10 text-jade border border-jade/20"
      titleClassName="font-body font-semibold text-ink-950"
    >
      <div
        className="doc-preview template-modern"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </TemplateFrame>
  );
}
