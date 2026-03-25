-- =============================================================================
-- MarkType — Ampliar valores permitidos em documents.template
-- =============================================================================

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_template_check;

ALTER TABLE public.documents
  ADD CONSTRAINT documents_template_check
  CHECK (
    template IN (
      'professional',
      'modern',
      'saas',
      'document',
      'compliance'
    )
  );
