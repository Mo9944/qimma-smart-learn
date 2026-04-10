
CREATE TABLE public.career_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  test_type TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_code TEXT,
  result_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.career_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select" ON public.career_assessments FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert" ON public.career_assessments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.career_assessments FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.career_assessments FOR DELETE TO public USING (true);

CREATE INDEX idx_career_assessments_type ON public.career_assessments(test_type);
CREATE INDEX idx_career_assessments_user ON public.career_assessments(user_id);
