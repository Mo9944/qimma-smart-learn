CREATE TABLE public.psych_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  confidence INTEGER NOT NULL DEFAULT 0,
  anxiety INTEGER NOT NULL DEFAULT 0,
  thinking_style TEXT NOT NULL DEFAULT 'analytical',
  decision_ability INTEGER NOT NULL DEFAULT 0,
  stress_tolerance INTEGER NOT NULL DEFAULT 0,
  burnout_risk INTEGER NOT NULL DEFAULT 0,
  raw_answers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.psych_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access to psych_assessments"
ON public.psych_assessments
FOR ALL
USING (true)
WITH CHECK (true);

CREATE INDEX idx_psych_assessments_created ON public.psych_assessments(created_at DESC);