import { motion } from "framer-motion";
import { Brain, Target, Sparkles, TrendingUp } from "lucide-react";

const stats = [
  { value: "5", label: "اختبارات تحليلية", icon: Brain },
  { value: "6", label: "أنماط شخصية", icon: Target },
  { value: "AI", label: "تحليل ذكي", icon: Sparkles },
  { value: "∞", label: "إمكانيات للنمو", icon: TrendingUp },
];

export default function StatsSection() {
  return (
    <section className="border-b border-border bg-card py-10">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center group"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform group-hover:scale-110">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold font-display text-gradient mb-0.5">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
