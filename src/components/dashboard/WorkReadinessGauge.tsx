import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

interface WorkReadinessGaugeProps {
  score: number; // 0-100
}

export default function WorkReadinessGauge({ score }: WorkReadinessGaugeProps) {
  const getColor = () => {
    if (score >= 75) return "text-success";
    if (score >= 50) return "text-warning";
    if (score >= 25) return "text-info";
    return "text-destructive";
  };

  const getLabel = () => {
    if (score >= 75) return "جاهز لسوق العمل 🚀";
    if (score >= 50) return "في طريقك للجاهزية 💪";
    if (score >= 25) return "بداية جيدة 📈";
    return "ابدأ رحلتك الآن 🌱";
  };

  const circumference = 2 * Math.PI * 58;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4 w-full">
        <Briefcase className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-sm">مؤشر الجاهزية لسوق العمل</h2>
      </div>

      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="58" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
          <motion.circle
            cx="64" cy="64" r="58" fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-3xl font-bold ${getColor()}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}%
          </motion.span>
        </div>
      </div>

      <p className="text-sm font-medium mt-3">{getLabel()}</p>
    </div>
  );
}
