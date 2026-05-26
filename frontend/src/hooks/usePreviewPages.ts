"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Template } from "@/lib/types";

type UsePreviewPagesOptions = {
  html: string;
  template: Template;
  previewStyle: CSSProperties;
};

/**
 * Paginação por “janela” de altura (scroll), alinhada ao fluxo contínuo do PDF.
 * Em vez de cortar por bloco (conservador demais), desloca o documento inteiro.
 */
export function usePreviewPages({
  html,
  template,
  previewStyle,
}: UsePreviewPagesOptions) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [pageContentHeightPx, setPageContentHeightPx] = useState(0);
  const [isPaginating, setIsPaginating] = useState(false);

  const recalculate = useCallback(() => {
    const slot = measureRef.current?.querySelector<HTMLElement>(
      ".preview-page-measure-slot"
    );
    const content = measureRef.current?.querySelector<HTMLElement>(
      ".preview-document-root"
    );
    if (!slot || !content) return;

    const pageHeight = slot.getBoundingClientRect().height;
    const scrollHeight = content.scrollHeight;

    if (pageHeight <= 0) return;

    setPageContentHeightPx(pageHeight);
    setPageCount(Math.max(1, Math.ceil(scrollHeight / pageHeight)));
    setIsPaginating(false);
  }, []);

  useLayoutEffect(() => {
    setIsPaginating(true);
    const id = requestAnimationFrame(() => {
      recalculate();
    });
    return () => cancelAnimationFrame(id);
  }, [html, template, previewStyle, recalculate]);

  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;

    const ro = new ResizeObserver(() => {
      setIsPaginating(true);
      requestAnimationFrame(recalculate);
    });
    ro.observe(root);

    const fonts = document.fonts;
    if (fonts?.ready) {
      fonts.ready.then(() => requestAnimationFrame(recalculate));
    }

    return () => ro.disconnect();
  }, [recalculate]);

  return {
    measureRef,
    pageCount,
    pageContentHeightPx,
    isPaginating,
  };
}
