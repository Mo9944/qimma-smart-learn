import { BookOpen, Brain, FileText, BarChart3, Trophy, Clock, Target, Compass, Sparkles, TrendingUp, Flame, Download, Repeat } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import AskAboutMe from "@/components/AskAboutMe";
import SmartPdfReport from "@/components/SmartPdfReport";

const typeNames: Record<string, string> = {
  R: "واقعي", I: "بحثي", A: "فني", S: "اجتماعي", E: "مبادر", C: "تقليدي"
};

const careerMap: Record<string, string> = {
  R: "هندسة وتقنية", I: "بحث علمي وطب", A: "تصميم وإبداع",
  S: "تعليم وإرشاد", E: "إدارة وريادة أعمال", C: "محاسبة وتنظيم"
};

export default function DashboardHome() {
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects-home"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*, lessons(id, completed)").order("created_at", { ascending: false }).limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["quizzes-home"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: riasecResults = [] } = useQuery({
    queryKey: ["riasec-home"],
    queryFn: async () => {
      const { data, error } = await supabase.from("riasec_results").select("*").order("created_at", { ascending: false }).limit(1);
      if (error) throw error;
      return data;
    },
  });

  const { data: habits = [] } = useQuery({
    queryKey: ["habits-home"],
    queryFn: async () => {
      const { data, error } = await supabase.from("habits").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: habitProgress = [] } = useQuery({
    queryKey: ["habit-progress-home"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const { data, error } = await supabase.from("habit_progress").select("*").gte("date", thirtyDaysAgo);
      if (error) throw error;
      return data;
    },
  });

  const totalQuizzes = quizzes.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(quizzes.reduce((sum, q) => sum + ((q.score || 0) / (q.total_questions || 1)) * 100, 0) / totalQuizzes)
    : 0;

  const lastRiasec = riasecResults[0];
  const today = format(new Date(), "yyyy-MM-dd");
  const todayCompleted = habits.filter(h => habitProgress.some(p => p.habit_id === h.id && p.date === today)).length;
  const habitRate = habits.length > 0
    ? Math.round(habits.reduce((s, h) => s + (habitProgress.filter(p => p.habit_id === h.id).length / 30) * 100, 0) / habits.length)
    : 0;

  // Weekly focus hours from quiz time_taken
  const weekQuizzes = quizzes.filter(q => {
    if (!q.created_at) return false;
    return new Date(q.created_at) > subDays(new Date(), 7);
  });
  const weekMinutes = Math.round(weekQuizzes.reduce((s, q) => s + (q.time_taken || 0), 0) / 60);

  // Development score
  const devScore = Math.round(
    (lastRiasec ? 25 : 0) +
    (avgScore > 0 ? Math.min(avgScore * 0.25, 25) : 0) +
    (habitRate > 0 ? Math.min(habitRate * 0.25, 25) : 0) +
    (subjects.length > 0 ? Math.min(subjects.length * 5, 25) : 0)
  );

  // Strengths/weaknesses from RIASEC
  const topTypes = lastRiasec ? lastRiasec.code.split("").slice(0, 3) : [];
  const scores = lastRiasec ? [
    { key: "R", value: lastRiasec.score_r },
    { key: "I", value: lastRiasec.score_i },
    { key: "A", value: lastRiasec.score_a },
    { key: "S", value: lastRiasec.score_s },
    { key: "E", value: lastRiasec.score_e },
    { key: "C", value: lastRiasec.score_c },
  ].sort((a, b) => b.value - a.value) : [];

  const quickStats = [
    { icon: Compass, label: "الشخصية", value: lastRiasec?.code || "—", sub: "نمطك", color: "text-primary", bg: "bg-primary/10" },
    { icon: Target, label: "التطور", value: `${devScore}%`, sub: "درجة التطور", color: "text-success", bg: "bg-success/10" },
    { icon: Repeat, label: "العادات", value: `${todayCompleted}/${habits.length}`, sub: "اليوم", color: "text-warning", bg: "bg-warning/10" },
    { icon: FileText, label: "المعدل", value: `${avgScore}%`, sub: `${totalQuizzes} اختبار`, color: "text-info", bg: "bg-info/10" },
  ];

  // Daily recommendations
  const dailyRecs = [
    { emoji: "🎯", text: habitRate < 50 ? "حاول إكمال عاداتك اليوم للوصول لنسبة أعلى" : "أداؤك ممتاز! حافظ على عاداتك" },
    { emoji: "📚", text: avgScore < 70 ? "راجع المواد التي حصلت فيها على درجات منخفضة" : "جرّب مادة جديدة لتوسيع معرفتك" },
    { emoji: "💡", text: !lastRiasec ? "أكمل اختبار الشخصية لاكتشاف مواهبك" : `طوّر مهاراتك في مجال ${careerMap[topTypes[0]] || "تخصصك"}` },
  ];

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">مرحبًا بك في أثر 👋</h1>
          <p className="text-muted-foreground text-sm">اكتشف مواهبك وطوّر ذاتك</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <AskAboutMe />
          <SmartPdfReport />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map((s, i) => (
          <motion.div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-card"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.bg} ${s.color} mb-2`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* CTA if no RIASEC */}
      {!lastRiasec && (
        <motion.div className="rounded-xl gradient-primary p-6 text-primary-foreground" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
              <Compass className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg font-display mb-1">اكتشف شخصيتك!</h3>
              <p className="text-primary-foreground/80 text-sm mb-3">أجب على 30 سؤال واكتشف مواهبك ونقاط قوتك ومسارك المهني</p>
              <Link to="/dashboard/riasec">
                <button className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                  ابدأ الاختبار الآن ←
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Section 1: Personality Summary */}
        {lastRiasec && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">ملخص الشخصية</h2>
            </div>
            <div className="space-y-3">
              <div className="text-center py-2">
                <div className="text-3xl font-bold text-primary">{lastRiasec.code}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {lastRiasec.code.split("").map((c: string) => typeNames[c] || c).join(" - ")}
                </p>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">أفضل مسار مهني:</p>
                <p className="text-muted-foreground">{careerMap[topTypes[0]] || "—"}</p>
              </div>
              <div>
                <p className="font-medium text-sm mb-2">درجة التطور العامة:</p>
                <Progress value={devScore} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-left">{devScore}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Performance */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">الأداء</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ساعات التركيز (أسبوعي)</span>
              <span className="font-bold">{weekMinutes} دقيقة</span>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">معدل الالتزام بالعادات</span>
                <span className="font-medium">{habitRate}%</span>
              </div>
              <Progress value={habitRate} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">معدل الاختبارات</span>
                <span className="font-medium">{avgScore}%</span>
              </div>
              <Progress value={avgScore} className="h-2" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">المهام المكتملة</span>
              <span className="font-bold">{todayCompleted}/{habits.length}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Strengths/Weaknesses */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">نقاط القوة والضعف</h2>
          </div>
          {scores.length > 0 ? (
            <div className="space-y-3">
              {scores.map((s, i) => (
                <div key={s.key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={i < 3 ? "font-medium text-success" : "text-muted-foreground"}>
                      {i < 3 ? "💪" : "📈"} {typeNames[s.key]}
                    </span>
                    <span className="text-xs">{s.value * 10}%</span>
                  </div>
                  <Progress value={s.value * 10} className="h-1.5" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">أكمل اختبار الشخصية أولاً</p>
          )}
        </div>
      </div>

      {/* Daily Recommendations */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">التوصيات اليومية</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {dailyRecs.map((r, i) => (
            <motion.div key={i} className="rounded-lg border border-border bg-secondary/30 p-4"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <span className="text-2xl mb-2 block">{r.emoji}</span>
              <p className="text-sm">{r.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Subjects & Quizzes */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">المواد</h2>
            <Link to="/dashboard/subjects" className="text-sm text-primary hover:underline">عرض الكل</Link>
          </div>
          {subjects.length > 0 ? (
            <div className="space-y-3">
              {subjects.slice(0, 4).map((sub: any) => {
                const total = sub.lessons?.length || 0;
                const done = sub.lessons?.filter((l: any) => l.completed).length || 0;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={sub.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{sub.name}</span>
                        <span className="text-xs text-muted-foreground">{total} درس</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">أضف مادتك الأولى من صفحة المواد</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">آخر الاختبارات</h2>
          </div>
          {quizzes.length > 0 ? (
            <div className="space-y-2">
              {quizzes.slice(0, 5).map((q) => {
                const pct = q.total_questions ? Math.round(((q.score || 0) / q.total_questions) * 100) : 0;
                return (
                  <div key={q.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                    <span className="text-sm truncate flex-1">{q.title}</span>
                    <span className={`text-sm font-bold mr-2 ${pct >= 70 ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive"}`}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">لم تُكمل أي اختبار بعد</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Compass, label: "اختبار الشخصية", path: "/dashboard/riasec", color: "text-primary" },
          { icon: Brain, label: "أدوات AI", path: "/dashboard/ai", color: "text-info" },
          { icon: Clock, label: "تنظيم الوقت", path: "/dashboard/time", color: "text-warning" },
          { icon: BarChart3, label: "التقارير", path: "/dashboard/analytics", color: "text-success" },
        ].map((a) => (
          <Link key={a.label} to={a.path}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3.5 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <a.icon className={`h-5 w-5 ${a.color}`} />
            <span className="text-sm font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
