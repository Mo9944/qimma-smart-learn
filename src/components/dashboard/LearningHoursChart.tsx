import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface HourData {
  label: string;
  minutes: number;
}

interface LearningHoursChartProps {
  data: HourData[];
  totalMinutes: number;
}

export default function LearningHoursChart({ data, totalMinutes }: LearningHoursChartProps) {
  const maxMinutes = Math.max(...data.map(d => d.minutes), 1);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">ساعات التعلم (أسبوعي)</h2>
        </div>
        <span className="text-sm font-bold text-primary">
          {totalHours > 0 ? `${totalHours}س ` : ""}{remainingMins}د
        </span>
      </div>

      <div className="flex items-end justify-between gap-1 h-28">
        {data.map((d, i) => {
          const height = maxMinutes > 0 ? (d.minutes / maxMinutes) * 100 : 0;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              {d.minutes > 0 && (
                <span className="text-[9px] text-muted-foreground">{d.minutes}د</span>
              )}
              <motion.div
                className="w-full rounded-t-md bg-primary/80 min-h-[2px]"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 2)}%` }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              />
              <span className="text-[9px] text-muted-foreground">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
