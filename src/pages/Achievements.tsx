import { Trophy, Star, Flame, Target, Medal, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const badges = [
  { icon: Flame, label: "سلسلة 7 أيام", desc: "ذاكر 7 أيام متتالية", unlocked: true },
  { icon: Star, label: "نجم الأسبوع", desc: "أعلى تقييم هذا الأسبوع", unlocked: true },
  { icon: Target, label: "دقة 100%", desc: "اختبار بدرجة كاملة", unlocked: true },
  { icon: Medal, label: "المثابر", desc: "أكمل 50 درسًا", unlocked: false },
  { icon: Trophy, label: "البطل", desc: "وصل للمستوى 20", unlocked: false },
  { icon: Zap, label: "السريع", desc: "أنهِ اختبارًا في أقل من دقيقتين", unlocked: false },
];

export default function Achievements() {
  const currentXP = 1450;
  const nextLevelXP = 2000;
  const level = 12;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الإنجازات والتحفيز</h1>
        <p className="text-muted-foreground text-sm">تقدّمك ومكافآتك</p>
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
          <p className="text-primary-foreground/60 text-sm">{currentXP} / {nextLevelXP} XP</p>
        </div>
        <div className="max-w-xs mx-auto">
          <Progress value={(currentXP / nextLevelXP) * 100} className="h-3" />
        </div>
        <p className="text-xs text-primary-foreground/50">
          باقي {nextLevelXP - currentXP} XP للمستوى التالي
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "إجمالي XP", value: "1,450" },
          { label: "سلسلة الأيام", value: "7 🔥" },
          { label: "الأوسمة", value: "3/6" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div>
        <h2 className="font-semibold text-lg mb-4">الأوسمة</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((b, i) => (
            <motion.div
              key={b.label}
              className={`rounded-xl border p-5 text-center space-y-2 transition-all ${
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
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
