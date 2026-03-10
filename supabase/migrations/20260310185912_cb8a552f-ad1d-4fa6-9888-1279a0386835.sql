
-- Drop all restrictive owner-based policies and replace with public access

-- profiles
DROP POLICY IF EXISTS "Owner select" ON public.profiles;
DROP POLICY IF EXISTS "Owner insert" ON public.profiles;
DROP POLICY IF EXISTS "Owner update" ON public.profiles;
DROP POLICY IF EXISTS "Owner delete" ON public.profiles;
CREATE POLICY "Allow all select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.profiles FOR DELETE USING (true);

-- subjects
DROP POLICY IF EXISTS "Owner select" ON public.subjects;
DROP POLICY IF EXISTS "Owner insert" ON public.subjects;
DROP POLICY IF EXISTS "Owner update" ON public.subjects;
DROP POLICY IF EXISTS "Owner delete" ON public.subjects;
CREATE POLICY "Allow all select" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.subjects FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.subjects FOR DELETE USING (true);

-- lessons
DROP POLICY IF EXISTS "Owner select" ON public.lessons;
DROP POLICY IF EXISTS "Owner insert" ON public.lessons;
DROP POLICY IF EXISTS "Owner update" ON public.lessons;
DROP POLICY IF EXISTS "Owner delete" ON public.lessons;
CREATE POLICY "Allow all select" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.lessons FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.lessons FOR DELETE USING (true);

-- files
DROP POLICY IF EXISTS "Owner select" ON public.files;
DROP POLICY IF EXISTS "Owner insert" ON public.files;
DROP POLICY IF EXISTS "Owner update" ON public.files;
DROP POLICY IF EXISTS "Owner delete" ON public.files;
CREATE POLICY "Allow all select" ON public.files FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.files FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.files FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.files FOR DELETE USING (true);

-- quizzes
DROP POLICY IF EXISTS "Owner select" ON public.quizzes;
DROP POLICY IF EXISTS "Owner insert" ON public.quizzes;
DROP POLICY IF EXISTS "Owner update" ON public.quizzes;
DROP POLICY IF EXISTS "Owner delete" ON public.quizzes;
CREATE POLICY "Allow all select" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.quizzes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.quizzes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.quizzes FOR DELETE USING (true);

-- riasec_results
DROP POLICY IF EXISTS "Owner select" ON public.riasec_results;
DROP POLICY IF EXISTS "Owner insert" ON public.riasec_results;
DROP POLICY IF EXISTS "Owner update" ON public.riasec_results;
DROP POLICY IF EXISTS "Owner delete" ON public.riasec_results;
CREATE POLICY "Allow all select" ON public.riasec_results FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.riasec_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.riasec_results FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.riasec_results FOR DELETE USING (true);

-- Update storage policies for user-files bucket
DROP POLICY IF EXISTS "Owner upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner read" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete" ON storage.objects;
CREATE POLICY "Allow all upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-files');
CREATE POLICY "Allow all read" ON storage.objects FOR SELECT USING (bucket_id = 'user-files');
CREATE POLICY "Allow all delete" ON storage.objects FOR DELETE USING (bucket_id = 'user-files');
