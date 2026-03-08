
-- Drop legacy "Allow all access to <table>" PERMISSIVE policies (public role, USING true)
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all access to subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow all access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow all access to files" ON public.files;
DROP POLICY IF EXISTS "Allow all access to quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Allow all access to riasec_results" ON public.riasec_results;

-- Drop legacy "Users manage own ..." and "Users can ..." policies (public role)
DROP POLICY IF EXISTS "Users manage own files" ON public.files;
DROP POLICY IF EXISTS "Users manage own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users manage own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users manage own riasec_results" ON public.riasec_results;
DROP POLICY IF EXISTS "Users manage own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
