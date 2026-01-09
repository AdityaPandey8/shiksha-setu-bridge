-- Create chatbot_summaries table for storing teacher-provided chapter summaries
CREATE TABLE public.chatbot_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  key_points TEXT[],
  language content_language NOT NULL DEFAULT 'hindi'::content_language,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class, subject, chapter_id, language)
);

-- Enable Row Level Security
ALTER TABLE public.chatbot_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view chatbot summaries"
ON public.chatbot_summaries
FOR SELECT
USING (true);

CREATE POLICY "Teachers can insert chatbot summaries"
ON public.chatbot_summaries
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can update chatbot summaries"
ON public.chatbot_summaries
FOR UPDATE
USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers can delete chatbot summaries"
ON public.chatbot_summaries
FOR DELETE
USING (has_role(auth.uid(), 'teacher'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chatbot_summaries_updated_at
BEFORE UPDATE ON public.chatbot_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();