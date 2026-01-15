-- Create a storage bucket for content files (images and PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-files', 
  'content-files', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
);

-- Create storage policies for content-files bucket

-- Anyone can view content files (public bucket)
CREATE POLICY "Anyone can view content files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'content-files');

-- Teachers can upload content files
CREATE POLICY "Teachers can upload content files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'content-files' 
  AND has_role(auth.uid(), 'teacher'::app_role)
);

-- Teachers can update their content files
CREATE POLICY "Teachers can update content files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'content-files' 
  AND has_role(auth.uid(), 'teacher'::app_role)
);

-- Teachers can delete content files
CREATE POLICY "Teachers can delete content files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'content-files' 
  AND has_role(auth.uid(), 'teacher'::app_role)
);