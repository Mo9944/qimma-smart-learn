import { Trophy, Star, Flame, Target, Medal, Zap, BookOpen, FileText, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";

export default function Achievements() {
  const { data: profile } = useQuery({
    queryKey: ["profile-achievements"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").limit(1);
      return data?.[0] || null;
    },
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["quizzes-achievements"],
    queryFn: async () => {
      const { data } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: habits = [] } = useQuery({
    queryKey: ["habits-achievements"],
    queryFn: async () => {
      const { data } = await supabase.from("habits").select("*");
      return data || [];
    },
  });

  const { data: habitProgress = [] } = useQuery({
    queryKey: ["habit-progress-achievements"],
    queryFn: async () => {
      const { data } = await supabase.from("habit_progress").select("*").gte("date", format(subDays(new Date(), 365), "yyyy-MM-dd"));
      return data || [];
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects-achievements"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("*, lessons(id, completed)");
      return data || [];
    },
  });

  const { data: riasecResults = [] } = useQuery({
    queryKey: ["riasec-achievements"],
    queryFn: async () => {
      const { data } = await supabase.from("riasec_results").select("*").limit(1);
      return data || [];
    },
  });

  // Calculate real stats
  const totalLessons = subjects.reduce((s: number, sub: any) => s + (sub.lessons?.length || 0), 0);
  const completedLessons = subjects.reduce((s: number, sub: any) => s + (sub.lessons?.filter((l: any) => l.completed).length || 0), 0);

  // Calculate streak
  function getStreak(): number {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      if (habitProgress.some(p => p.date === d)) streak++;
      else break;
    }
    return streak;
  }
  const streak = getStreak();

  // XP calculation based on real actions
  const quizXP = quizzes.length * 50;
  const lessonXP = completedLessons * 30;
  const habitXP = habitProgress.length * 10;
  const riasecXP = riasecResults.length > 0 ? 100 : 0;
  const totalXP = quizXP + lessonXP + habitXP + riasecXP;
  const level = Math.floor(totalXP / 500) + 1;
  const xpInLevel = totalXP % 500;
  const nextLevelXP = 500;

  // Perfect quiz check
  const hasPerfectQuiz = quizzes.some(q => q.total_questions && q.score === q.total_questions);

  // Fast quiz check (under 2 minutes)
  const hasFastQuiz = quizzes.some(q => q.time_taken && q.time_taken < 120 && q.total_questions && q.total_questions >= 5);

  // Badges with real unlock conditions
  const badges = [
    { icon: Flame, label: "سلسلة 7 أيام", desc: "التزم بعاداتك 7 أيام متتالية", unlocked: streak >= 7 },
    { icon: Star, label: "المتعلم النشط", desc: "أكمل 10 اختبارات", unlocked: quizzes.length >= 10 },
    { icon: Target, label: "دقة 100%", desc: "احصل على درجة كاملة في اختبار", unlocked: hasPerfectQuiz },
    { icon: Medal, label: "المثابر", desc: "أكمل 20 درساً", unlocked: completedLessons >= 20 },
    { icon: Trophy, label: "البطل", desc: "وصلت للمستوى 10", unlocked: level >= 10 },
    { icon: Zap, label: "السريع", desc: "أنهِ اختباراً في أقل من دقيقتين", unlocked: hasFastQuiz },
    { icon: BookOpen, label: "القارئ", desc: "أضف 5 مواد دراسية", unlocked: subjects.length >= 5 },
    { icon: FileText, label: "المكتشف", desc: "أكمل اختبار الشخصية", unlocked: riasecResults.length > 0 },
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الإنجازات والتحفيز</h1>
        <p className="text-muted-foreground text-sm">تقدّمك ومكافآتك الحقيقية</p>
      </div>

      {/* Level Card */}
      <motion.div
        className="rounded-xl gradient-hero p-6 text-center space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-3xl font-bold text-accent animate-pulse-glow">
          {level}
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary-foreground">المستوى {level}</h2>
          <p className="text-primary-foreground/60 text-sm">{xpInLevel} / {nextLevelXP} XP</p>
        </div>
        <div className="max-w-xs mx-auto">
          <Progress value={(xpInLevel / nextLevelXP) * 100} className="h-3" />
        </div>
        <p className="text-xs text-primary-foreground/50">
          باقي {nextLevelXP - xpInLevel} XP للمستوى التالي
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي XP", value: totalXP.toLocaleString("ar-SA") },
          { label: "سلسلة الأيام", value: `${streak} 🔥` },
          { label: "الأوسمة", value: `${unlockedCount}/${badges.length}` },
          { label: "الاختبارات", value: quizzes.length.toString() },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* XP Breakdown */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-semibold text-base mb-4">مصادر النقاط</h2>
        <div className="space-y-3">
          {[
            { label: "الاختبارات", value: quizXP, detail: `${quizzes.length} × 50` },
            { label: "الدروس المكتملة", value: lessonXP, detail: `${completedLessons} × 30` },
            { label: "تقدم العادات", value: habitXP, detail: `${habitProgress.length} × 10` },
            { label: "اختبار الشخصية", value: riasecXP, detail: riasecXP > 0 ? "مكتمل" : "غير مكتمل" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">({item.detail})</span>
                <span className="font-bold">{item.value} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="font-semibold text-lg mb-4">الأوسمة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {badges.map((b, i) => (
            <motion.div
              key={b.label}
              className={`rounded-xl border p-4 text-center space-y-2 transition-all ${
                b.unlocked
                  ? "border-accent/30 bg-card shadow-card"
                  : "border-border bg-muted/50 opacity-50"
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: b.unlocked ? 1 : 0.5, scale: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
                b.unlocked ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
              }`}>
                <b.icon className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-sm">{b.label}</h3>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
              {b.unlocked && <span className="text-xs text-accent font-medium">✅ مفتوح</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
