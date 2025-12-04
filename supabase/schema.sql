-- Outfit Generator Database Schema
-- Create this table in your Supabase project

-- Outfits table to store generated outfit images
CREATE TABLE IF NOT EXISTS outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'twitter',
  style TEXT NOT NULL,
  original_image_url TEXT,
  generated_image_base64 TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast handle lookups
CREATE INDEX IF NOT EXISTS idx_outfits_handle ON outfits(handle);

-- Index for chronological queries (gallery)
CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read outfits (public gallery)
CREATE POLICY "Anyone can view outfits"
  ON outfits FOR SELECT
  USING (true);

-- Policy: Allow anyone to insert/update outfits (for now - you can restrict this later)
CREATE POLICY "Anyone can create outfits"
  ON outfits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update outfits"
  ON outfits FOR UPDATE
  USING (true);

-- Optional: Add a comment
COMMENT ON TABLE outfits IS 'Stores generated outfit images for caching and gallery display';

