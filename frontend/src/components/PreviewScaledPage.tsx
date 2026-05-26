"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { previewPageSizePx } from "@/lib/preview-page-layout";

interface PreviewScaledPageProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Escala a folha A4 para caber na largura do painel (sem scroll horizontal).
 */
export function PreviewScaledPage({
  children,
  className,
  style,
}: PreviewScaledPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const { width: pageWidthPx, height: pageHeightPx } = previewPageSizePx();

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const available = el.clientWidth;
      if (available <= 0) return;
      const next = Math.min(1, available / pageWidthPx);
      setScale(next);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageWidthPx]);

  const scaledW = pageWidthPx * scale;
  const scaledH = pageHeightPx * scale;

  return (
    <div
      ref={containerRef}
      className="flex w-full min-w-0 justify-center overflow-x-hidden"
    >
      <div
        style={{
          width: scaledW,
          height: scaledH,
          flexShrink: 0,
        }}
      >
        <div
          className={className}
          style={{
            ...style,
            width: pageWidthPx,
            minHeight: pageHeightPx,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
