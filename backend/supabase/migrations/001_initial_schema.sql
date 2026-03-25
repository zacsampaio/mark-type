-- =============================================================================
-- DocCraft — Initial Database Schema
-- Run this in your Supabase SQL editor or via supabase db push
-- =============================================================================

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  title       TEXT NOT NULL DEFAULT 'Untitled Document',
  markdown    TEXT NOT NULL DEFAULT '',
  template    TEXT NOT NULL DEFAULT 'modern' CHECK (template IN ('professional', 'modern', 'saas', 'document', 'compliance')),
  pdf_url     TEXT,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON public.documents(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documents_updated_at ON public.documents;
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS: allow public read/write for MVP (lock down in production)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON public.documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select" ON public.documents
  FOR SELECT USING (true);

-- Storage bucket for PDFs
-- Run this separately in Supabase Storage settings, or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', true);

-- Storage policy: allow public uploads and reads
-- CREATE POLICY "Allow public uploads" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'pdfs');
-- CREATE POLICY "Allow public reads" ON storage.objects
--   FOR SELECT USING (bucket_id = 'pdfs');
