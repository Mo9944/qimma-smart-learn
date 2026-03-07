import { BarChart3, TrendingUp, BookOpen, Target, FileText, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Analytics() {
  const { data: quizzes = [] } = useQuery({
    queryKey: ["quizzes-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*, subjects(name)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*, lessons(id, completed)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const totalQuizzes = quizzes.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(quizzes.reduce((sum, q) => sum + ((q.score || 0) / (q.total_questions || 1)) * 100, 0) / totalQuizzes)
    : 0;
  const totalTime = quizzes.reduce((sum, q) => sum + (q.time_taken || 0), 0);
  const totalTimeMin = Math.round(totalTime / 60);
  const totalLessons = subjects.reduce((sum, s: any) => sum + (s.lessons?.length || 0), 0);

  // Per-subject quiz performance
  const subjectPerf = subjects.map((s: any) => {
    const subQuizzes = quizzes.filter(q => q.subject_id === s.id);
    const avg = subQuizzes.length > 0
      ? Math.round(subQuizzes.reduce((sum, q) => sum + ((q.score || 0) / (q.total_questions || 1)) * 100, 0) / subQuizzes.length)
      : 0;
    return { name: s.name, score: avg, tests: subQuizzes.length, lessons: s.lessons?.length || 0 };
  }).filter(s => s.tests > 0);

  // Recent quizzes for chart
  const recentQuizzes = quizzes.slice(0, 7).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">التحليل والتقارير</h1>
        <p className="text-muted-foreground text-sm">بيانات حقيقية من اختباراتك ودروسك</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "المعدل العام", value: `${avgScore}%`, icon: Target, color: "text-primary bg-primary/10" },
          { label: "الاختبارات", value: totalQuizzes.toString(), icon: FileText, color: "text-info bg-info/10" },
          { label: "الدروس", value: totalLessons.toString(), icon: BookOpen, color: "text-success bg-success/10" },
          { label: "وقت المذاكرة", value: `${totalTimeMin}د`, icon: Clock, color: "text-warning bg-warning/10" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 shadow-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${s.color} mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-semibold text-base mb-4">أداء المواد</h2>
          {subjectPerf.length > 0 ? (
            <div className="space-y-4">
              {subjectPerf.map((sub) => (
                <div key={sub.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{sub.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{sub.tests} اختبار</span>
                      <span className="font-medium">{sub.score}%</span>
                    </div>
                  </div>
                  <Progress value={sub.score} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">أكمل اختبارات لعرض أداء المواد</p>
          )}
        </div>

        {/* Recent Quizzes Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-semibold text-base mb-4">آخر الاختبارات</h2>
          {recentQuizzes.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-44">
              {recentQuizzes.map((q, i) => {
                const pct = q.total_questions ? Math.round(((q.score || 0) / q.total_questions) * 100) : 0;
                return (
                  <div key={q.id} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-xs font-medium">{pct}%</span>
                    <motion.div
                      className="w-full rounded-t-md gradient-primary min-h-[4px]"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct, 5)}%` }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                    />
                    <span className="text-[9px] text-muted-foreground truncate max-w-full">{(q as any).subjects?.name || "—"}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">لا توجد نتائج اختبارات بعد</p>
          )}
        </div>
      </div>

      {/* Quiz History */}
      {quizzes.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-semibold text-base mb-4">سجل الاختبارات</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-right py-2 pr-2">الاختبار</th>
                  <th className="text-right py-2">النتيجة</th>
                  <th className="text-right py-2">الأسئلة</th>
                  <th className="text-right py-2">الوقت</th>
                  <th className="text-right py-2">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.slice(0, 10).map((q) => {
                  const pct = q.total_questions ? Math.round(((q.score || 0) / q.total_questions) * 100) : 0;
                  return (
                    <tr key={q.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-2 font-medium">{q.title}</td>
                      <td className="py-2.5">
                        <span className={`font-medium ${pct >= 70 ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive"}`}>{pct}%</span>
                      </td>
                      <td className="py-2.5 text-muted-foreground">{q.score}/{q.total_questions}</td>
                      <td className="py-2.5 text-muted-foreground">{q.time_taken ? `${Math.round(q.time_taken / 60)}د` : "—"}</td>
                      <td className="py-2.5 text-muted-foreground text-xs">{q.created_at ? new Date(q.created_at).toLocaleDateString("ar-SA") : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
