import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { format, subDays } from "date-fns";

interface DayData {
  date: string;
  label: string;
  active: boolean;
  score: number; // 0-100
}

interface WeeklyCommitmentProps {
  days: DayData[];
  weeklyRate: number;
}

export default function WeeklyCommitment({ days, weeklyRate }: WeeklyCommitmentProps) {
  const dayLabels = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">نسبة الالتزام الأسبوعية</h2>
        </div>
        <span className={`text-lg font-bold ${weeklyRate >= 70 ? "text-success" : weeklyRate >= 40 ? "text-warning" : "text-destructive"}`}>
          {weeklyRate}%
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => (
          <motion.div
            key={d.date}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
            <div
              className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                d.active
                  ? d.score >= 70 ? "bg-success/20 text-success" : d.score >= 40 ? "bg-warning/20 text-warning" : "bg-primary/10 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {d.active ? `${d.score}%` : "—"}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
        <span>🔥 {days.filter(d => d.active).length}/7 أيام نشطة</span>
        <span>{weeklyRate >= 70 ? "ممتاز!" : weeklyRate >= 40 ? "جيد" : "حاول أكثر"}</span>
      </div>
    </div>
  );
}
