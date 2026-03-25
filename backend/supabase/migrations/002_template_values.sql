-- =============================================================================
-- DocCraft — Ampliar valores permitidos em documents.template
-- Execute se você já rodou a 001 com apenas professional/modern.
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
