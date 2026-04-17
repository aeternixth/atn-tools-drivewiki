-- Manual migration: Add tsvector column and GIN index for full-text search
-- This supplements the Prisma-managed schema for wiki_indices table
-- Required extensions: pg_trgm (trigram similarity), unaccent, uuid-ossp

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add tsvector column (not managed by Prisma)
ALTER TABLE wiki_indices
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_wiki_indices_search_vector
  ON wiki_indices USING GIN (search_vector);

-- Create trigram index for fuzzy/Thai text matching
CREATE INDEX IF NOT EXISTS idx_wiki_indices_trigram
  ON wiki_indices USING GIN (searchable_content gin_trgm_ops);

-- Function to update tsvector on insert/update
-- Uses 'simple' config for Thai (no stemming) + 'english' for English text
CREATE OR REPLACE FUNCTION update_wiki_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.searchable_content, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.searchable_content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search_vector
DROP TRIGGER IF EXISTS trg_wiki_search_vector ON wiki_indices;
CREATE TRIGGER trg_wiki_search_vector
  BEFORE INSERT OR UPDATE OF searchable_content
  ON wiki_indices
  FOR EACH ROW
  EXECUTE FUNCTION update_wiki_search_vector();
