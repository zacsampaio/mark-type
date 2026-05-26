-- MarkType — Modelo "manual" para documentação operacional

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_template_check;

ALTER TABLE public.documents
  ADD CONSTRAINT documents_template_check
  CHECK (
    template IN (
      'professional',
      'modern',
      'saas',
      'document',
      'manual',
      'compliance'
    )
  );
