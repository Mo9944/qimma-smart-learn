
-- Drop all RESTRICTIVE "Allow all access" policies on all 6 tables
DROP POLICY IF EXISTS "Allow all access" ON public.profiles;
DROP POLICY IF EXISTS "Allow all access" ON public.subjects;
DROP POLICY IF EXISTS "Allow all access" ON public.lessons;
DROP POLICY IF EXISTS "Allow all access" ON public.files;
DROP POLICY IF EXISTS "Allow all access" ON public.quizzes;
DROP POLICY IF EXISTS "Allow all access" ON public.riasec_results;

-- Also drop any existing owner policies to avoid conflicts
DROP POLICY IF EXISTS "Owner access" ON public.profiles;
DROP POLICY IF EXISTS "Owner access" ON public.subjects;
DROP POLICY IF EXISTS "Owner access" ON public.lessons;
DROP POLICY IF EXISTS "Owner access" ON public.files;
DROP POLICY IF EXISTS "Owner access" ON public.quizzes;
DROP POLICY IF EXISTS "Owner access" ON public.riasec_results;

-- Create proper PERMISSIVE policies scoped to auth.uid() = user_id

-- profiles
CREATE POLICY "Owner select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- subjects
CREATE POLICY "Owner select" ON public.subjects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner insert" ON public.subjects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update" ON public.subjects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete" ON public.subjects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- lessons
CREATE POLICY "Owner select" ON public.lessons FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner insert" ON public.lessons FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update" ON public.lessons FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete" ON public.lessons FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- files
CREATE POLICY "Owner select" ON public.files FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner insert" ON public.files FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update" ON public.files FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete" ON public.files FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- quizzes
CREATE POLICY "Owner select" ON public.quizzes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner insert" ON public.quizzes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update" ON public.quizzes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete" ON public.quizzes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- riasec_results
CREATE POLICY "Owner select" ON public.riasec_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner insert" ON public.riasec_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update" ON public.riasec_results FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete" ON public.riasec_results FOR DELETE TO authenticated USING (auth.uid() = user_id);
