import type { ReactNode } from "react";

interface TemplateFrameProps {
  title: string;
  description?: string;
  meta: string;
  className?: string;
  headerClassName?: string;
  badgeClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  metaClassName?: string;
  children: ReactNode;
}

export function TemplateFrame({
  title,
  description,
  meta,
  className,
  headerClassName,
  badgeClassName,
  titleClassName,
  descriptionClassName,
  metaClassName,
  children,
}: TemplateFrameProps) {
  return (
    <div className={className}>
      <header className={`mb-8 border-b border-ink-200 pb-6 ${headerClassName ?? ""}`}>
        <h1 className={`mb-2 text-4xl font-bold leading-tight text-ink-950 ${titleClassName ?? ""}`}>
          {title}
        </h1>
        {description && (
          <p className={`max-w-2xl text-base leading-relaxed text-ink-600 ${descriptionClassName ?? ""}`}>
            {description}
          </p>
        )}
        <p className={`mt-4 text-xs text-ink-400 ${metaClassName ?? ""}`}>{meta}</p>
      </header>
      {children}
    </div>
  );
}
