-- Create storage bucket for E-Book PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('ebooks', 'ebooks', true, 52428800);  -- 50MB limit for PDFs

-- Create policy for public read access to E-Book PDFs
CREATE POLICY "E-Book PDFs are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ebooks');

-- Create policy for teachers to upload E-Book PDFs
CREATE POLICY "Teachers can upload E-Book PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'ebooks' 
  AND has_role(auth.uid(), 'teacher'::app_role)
);

-- Create policy for teachers to update E-Book PDFs
CREATE POLICY "Teachers can update E-Book PDFs"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'ebooks' 
  AND has_role(auth.uid(), 'teacher'::app_role)
);

-- Create policy for teachers to delete E-Book PDFs
CREATE POLICY "Teachers can delete E-Book PDFs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'ebooks' 
  AND has_role(auth.uid(), 'teacher'::app_role)
);

-- Create ebooks table in database for better sync and management
CREATE TABLE public.ebooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  class TEXT NOT NULL,
  language content_language NOT NULL DEFAULT 'hindi',
  pdf_url TEXT NOT NULL,
  pdf_filename TEXT,
  offline_enabled BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ebooks table
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

-- Anyone can view ebooks
CREATE POLICY "Anyone can view ebooks"
ON public.ebooks
FOR SELECT
USING (true);

-- Teachers can insert ebooks
CREATE POLICY "Teachers can insert ebooks"
ON public.ebooks
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

-- Teachers can update ebooks
CREATE POLICY "Teachers can update ebooks"
ON public.ebooks
FOR UPDATE
USING (has_role(auth.uid(), 'teacher'::app_role));

-- Teachers can delete ebooks
CREATE POLICY "Teachers can delete ebooks"
ON public.ebooks
FOR DELETE
USING (has_role(auth.uid(), 'teacher'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_ebooks_updated_at
BEFORE UPDATE ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();