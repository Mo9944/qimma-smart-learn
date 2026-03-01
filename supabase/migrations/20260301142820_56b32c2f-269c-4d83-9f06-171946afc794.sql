
-- Drop existing RLS policies that require auth
DROP POLICY IF EXISTS "Users can view their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can create their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can update their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete their own subjects" ON public.subjects;

DROP POLICY IF EXISTS "Users can view their own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can create their own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can update their own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can delete their own lessons" ON public.lessons;

DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
DROP POLICY IF EXISTS "Users can create their own files" ON public.files;
DROP POLICY IF EXISTS "Users can update their own files" ON public.files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;

DROP POLICY IF EXISTS "Users can view their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON public.quizzes;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create open policies for all tables
CREATE POLICY "Allow all access to subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lessons" ON public.lessons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to files" ON public.files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to quizzes" ON public.quizzes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Allow anonymous storage access
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

CREATE POLICY "Allow all uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-files');
CREATE POLICY "Allow all reads" ON storage.objects FOR SELECT USING (bucket_id = 'user-files');
CREATE POLICY "Allow all deletes" ON storage.objects FOR DELETE USING (bucket_id = 'user-files');
