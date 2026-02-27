import { BarChart3, TrendingUp, BookOpen, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const subjectPerformance = [
  { name: "الرياضيات", score: 85, tests: 8, trend: "+5%" },
  { name: "الفيزياء", score: 72, tests: 5, trend: "+12%" },
  { name: "الكيمياء", score: 91, tests: 6, trend: "+3%" },
  { name: "الأحياء", score: 68, tests: 4, trend: "+8%" },
  { name: "اللغة العربية", score: 94, tests: 7, trend: "+2%" },
];

const weeklyData = [
  { day: "الأحد", hours: 3.5 },
  { day: "الإثنين", hours: 2 },
  { day: "الثلاثاء", hours: 4 },
  { day: "الأربعاء", hours: 1.5 },
  { day: "الخميس", hours: 5 },
  { day: "الجمعة", hours: 0.5 },
  { day: "السبت", hours: 3 },
];

const maxHours = Math.max(...weeklyData.map(d => d.hours));

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">التحليل والتقارير</h1>
        <p className="text-muted-foreground text-sm">تتبّع تقدّمك وحلّل أداءك</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "المعدل العام", value: "82%", icon: Target, color: "text-primary bg-primary/10" },
          { label: "ساعات المذاكرة", value: "19.5h", icon: BarChart3, color: "text-info bg-info/10" },
          { label: "الاختبارات", value: "30", icon: BookOpen, color: "text-success bg-success/10" },
          { label: "التحسّن", value: "+6%", icon: TrendingUp, color: "text-accent bg-accent/10" },
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
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-semibold text-lg mb-5">أداء المواد</h2>
          <div className="space-y-4">
            {subjectPerformance.map((sub) => (
              <div key={sub.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{sub.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-success text-xs">{sub.trend}</span>
                    <span className="font-medium">{sub.score}%</span>
                  </div>
                </div>
                <Progress value={sub.score} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Study Hours */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-semibold text-lg mb-5">ساعات المذاكرة الأسبوعية</h2>
          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium">{d.hours}h</span>
                <motion.div
                  className="w-full rounded-t-lg gradient-primary min-h-[4px]"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.hours / maxHours) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Predicted Score */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">التوقع الأكاديمي</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-4">بناءً على أدائك الحالي ومعدل التحسّن، النتيجة المتوقعة:</p>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-gradient">88%</div>
          <div className="text-sm text-muted-foreground">
            <p>معدل متوقع في الاختبارات النهائية</p>
            <p className="text-success text-xs mt-1">↑ تحسّن بنسبة 6% عن الشهر السابق</p>
          </div>
        </div>
      </div>
    </div>
  );
}
