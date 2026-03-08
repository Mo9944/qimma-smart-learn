
CREATE TABLE public.riasec_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'anonymous',
  code text NOT NULL,
  score_r integer NOT NULL DEFAULT 0,
  score_i integer NOT NULL DEFAULT 0,
  score_a integer NOT NULL DEFAULT 0,
  score_s integer NOT NULL DEFAULT 0,
  score_e integer NOT NULL DEFAULT 0,
  score_c integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.riasec_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to riasec_results"
  ON public.riasec_results FOR ALL
  USING (true)
  WITH CHECK (true);
