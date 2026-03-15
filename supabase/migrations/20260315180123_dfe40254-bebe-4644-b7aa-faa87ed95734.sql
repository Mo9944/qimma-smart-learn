
-- Habits table
CREATE TABLE public.habits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  name text NOT NULL,
  description text,
  days_per_week integer NOT NULL DEFAULT 7,
  reminder_time time,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.habits FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert" ON public.habits FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.habits FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.habits FOR DELETE TO public USING (true);

-- Habit progress table
CREATE TABLE public.habit_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(habit_id, date)
);

ALTER TABLE public.habit_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.habit_progress FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert" ON public.habit_progress FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.habit_progress FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.habit_progress FOR DELETE TO public USING (true);

-- Learning plans table
CREATE TABLE public.learning_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  user_goal text NOT NULL,
  daily_time integer NOT NULL DEFAULT 30,
  duration text NOT NULL DEFAULT '4 weeks',
  plan_content text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.learning_plans FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert" ON public.learning_plans FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.learning_plans FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.learning_plans FOR DELETE TO public USING (true);

-- Learning tasks table
CREATE TABLE public.learning_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id uuid NOT NULL REFERENCES public.learning_plans(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  week_number integer DEFAULT 1,
  day_number integer,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.learning_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.learning_tasks FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert" ON public.learning_tasks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.learning_tasks FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.learning_tasks FOR DELETE TO public USING (true);

-- Search history table
CREATE TABLE public.search_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  query text NOT NULL,
  response text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.search_history FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert" ON public.search_history FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.search_history FOR DELETE TO public USING (true);
