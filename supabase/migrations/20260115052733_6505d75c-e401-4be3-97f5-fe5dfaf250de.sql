-- Add 'image' to content_type enum
ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'image';

-- Add version column to content table for sync tracking
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS article_body text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;