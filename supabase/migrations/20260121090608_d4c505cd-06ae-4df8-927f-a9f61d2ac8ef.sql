-- Add subject column to content table
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS subject text;

-- Add subject column to quizzes table
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS subject text;

-- Add selected_subjects to profiles table for student subject selection
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selected_subjects text[] DEFAULT '{}';

-- Add languages to teacher_assignments table
ALTER TABLE public.teacher_assignments ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY['hindi', 'english'];

-- Create subjects configuration table
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label_en text NOT NULL,
  label_hi text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on subjects table
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Anyone can view active subjects
CREATE POLICY "Anyone can view subjects"
ON public.subjects
FOR SELECT
USING (true);

-- Only admins can insert subjects
CREATE POLICY "Admins can insert subjects"
ON public.subjects
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update subjects
CREATE POLICY "Admins can update subjects"
ON public.subjects
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete subjects
CREATE POLICY "Admins can delete subjects"
ON public.subjects
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed initial subjects
INSERT INTO public.subjects (name, label_en, label_hi) VALUES
  ('mathematics', 'Mathematics', 'गणित'),
  ('science', 'Science', 'विज्ञान'),
  ('english', 'English', 'अंग्रेज़ी'),
  ('hindi', 'Hindi', 'हिंदी'),
  ('social_science', 'Social Science', 'सामाजिक विज्ञान'),
  ('computer_science', 'Computer Science', 'कंप्यूटर विज्ञान'),
  ('sanskrit', 'Sanskrit', 'संस्कृत'),
  ('physical_education', 'Physical Education', 'शारीरिक शिक्षा')
ON CONFLICT (name) DO NOTHING;

-- Create trigger for updated_at on subjects
CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON public.subjects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();