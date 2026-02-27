import { BookOpen, Brain, FileText, BarChart3, Trophy, Clock, Flame, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const quickStats = [
  { icon: BookOpen, label: "المواد", value: "5", sub: "مادة نشطة", color: "text-primary", bg: "bg-primary/10" },
  { icon: FileText, label: "الاختبارات", value: "23", sub: "اختبار مكتمل", color: "text-info", bg: "bg-info/10" },
  { icon: Flame, label: "السلسلة", value: "7", sub: "أيام متتالية", color: "text-destructive", bg: "bg-destructive/10" },
  { icon: Trophy, label: "المستوى", value: "12", sub: "1,450 XP", color: "text-accent", bg: "bg-accent/10" },
];

const recentSubjects = [
  { name: "الرياضيات", progress: 72, lessons: 18 },
  { name: "الفيزياء", progress: 45, lessons: 12 },
  { name: "الكيمياء", progress: 88, lessons: 15 },
];

const dailyChallenges = [
  { title: "أكمل درسًا واحدًا", done: true, xp: 20 },
  { title: "أجب على 10 أسئلة", done: false, xp: 30 },
  { title: "ذاكر 30 دقيقة", done: false, xp: 25 },
];

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">مرحبًا بك! 👋</h1>
        <p className="text-muted-foreground">تابع رحلتك التعليمية</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((s, i) => (
          <motion.div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 shadow-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} ${s.color} mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Subjects */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">المواد الأخيرة</h2>
            <Link to="/dashboard/subjects" className="text-sm text-primary hover:underline">عرض الكل</Link>
          </div>
          <div className="space-y-4">
            {recentSubjects.map((sub) => (
              <div key={sub.name} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{sub.name}</span>
                    <span className="text-xs text-muted-foreground">{sub.progress}%</span>
                  </div>
                  <Progress value={sub.progress} className="h-2" />
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{sub.lessons} درس</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Challenges */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <Flame className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-lg">تحديات اليوم</h2>
          </div>
          <div className="space-y-3">
            {dailyChallenges.map((c) => (
              <div key={c.title} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${c.done ? "border-success bg-success" : "border-muted-foreground/30"}`}>
                  {c.done && <span className="text-success-foreground text-xs">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${c.done ? "line-through text-muted-foreground" : ""}`}>{c.title}</span>
                </div>
                <span className="text-xs text-accent font-medium">+{c.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Brain, label: "أداة AI", path: "/dashboard/ai", color: "text-info" },
          { icon: FileText, label: "اختبار سريع", path: "/dashboard/quizzes", color: "text-primary" },
          { icon: Clock, label: "بومودورو", path: "/dashboard/time", color: "text-warning" },
          { icon: BarChart3, label: "التقارير", path: "/dashboard/analytics", color: "text-success" },
        ].map((a) => (
          <Link
            key={a.label}
            to={a.path}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <a.icon className={`h-5 w-5 ${a.color}`} />
            <span className="text-sm font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
