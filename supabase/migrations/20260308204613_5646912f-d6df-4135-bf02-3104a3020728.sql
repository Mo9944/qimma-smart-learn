
-- Fix riasec_results user_id: drop default first, then convert
ALTER TABLE public.riasec_results ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.riasec_results ALTER COLUMN user_id TYPE uuid USING CASE WHEN user_id = 'anonymous' THEN '00000000-0000-0000-0000-000000000000'::uuid ELSE user_id::uuid END;
ALTER TABLE public.riasec_results ALTER COLUMN user_id SET DEFAULT auth.uid();

CREATE POLICY "Users manage own riasec_results" ON public.riasec_results
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Fix files.user_id default
ALTER TABLE public.files ALTER COLUMN user_id SET DEFAULT auth.uid();
