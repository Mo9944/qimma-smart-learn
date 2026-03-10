ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;
ALTER TABLE public.subjects DROP CONSTRAINT subjects_user_id_fkey;
ALTER TABLE public.lessons DROP CONSTRAINT lessons_user_id_fkey;
ALTER TABLE public.files DROP CONSTRAINT files_user_id_fkey;
ALTER TABLE public.quizzes DROP CONSTRAINT quizzes_user_id_fkey;