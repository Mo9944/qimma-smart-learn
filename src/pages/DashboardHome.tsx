import { BookOpen, Brain, FileText, BarChart3, Trophy, Clock, Flame, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function DashboardHome() {
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*, lessons(id, completed)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["quizzes-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const totalQuizzes = quizzes.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(quizzes.reduce((sum, q) => sum + ((q.score || 0) / (q.total_questions || 1)) * 100, 0) / totalQuizzes)
    : 0;

  const quickStats = [
    { icon: BookOpen, label: "المواد", value: subjects.length.toString(), sub: "مادة", color: "text-primary", bg: "bg-primary/10" },
    { icon: FileText, label: "الاختبارات", value: totalQuizzes.toString(), sub: "اختبار", color: "text-info", bg: "bg-info/10" },
    { icon: Target, label: "المعدل", value: `${avgScore}%`, sub: "معدل عام", color: "text-success", bg: "bg-success/10" },
    { icon: Trophy, label: "الإنجازات", value: "3", sub: "أوسمة", color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">مرحبًا بك! 👋</h1>
        <p className="text-muted-foreground text-sm">تابع رحلتك التعليمية</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map((s, i) => (
          <motion.div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 shadow-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.bg} ${s.color} mb-2`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Subjects */}
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

        {/* Recent Quizzes */}
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
          { icon: Brain, label: "أداة AI", path: "/dashboard/ai", color: "text-primary" },
          { icon: FileText, label: "اختبار سريع", path: "/dashboard/quizzes", color: "text-info" },
          { icon: Clock, label: "جدول المذاكرة", path: "/dashboard/time", color: "text-warning" },
          { icon: BarChart3, label: "التقارير", path: "/dashboard/analytics", color: "text-success" },
        ].map((a) => (
          <Link
            key={a.label}
            to={a.path}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3.5 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <a.icon className={`h-5 w-5 ${a.color}`} />
            <span className="text-sm font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
