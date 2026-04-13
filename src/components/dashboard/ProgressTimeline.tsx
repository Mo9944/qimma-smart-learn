import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Milestone {
  label: string;
  done: boolean;
  icon: string;
}

interface ProgressTimelineProps {
  milestones: Milestone[];
  overallProgress: number;
}

export default function ProgressTimeline({ milestones, overallProgress }: ProgressTimelineProps) {
  const completed = milestones.filter(m => m.done).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">رحلة التقدم</h2>
        </div>
        <span className="text-xs text-muted-foreground">{completed}/{milestones.length} مكتمل</span>
      </div>

      <Progress value={overallProgress} className="h-2 mb-4" />

      <div className="space-y-2">
        {milestones.map((m, i) => (
          <motion.div
            key={m.label}
            className={`flex items-center gap-2.5 rounded-lg p-2 text-sm ${m.done ? "bg-success/10" : "bg-secondary/50"}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <span className="text-lg">{m.icon}</span>
            <span className={m.done ? "line-through text-muted-foreground" : ""}>{m.label}</span>
            {m.done && <span className="mr-auto text-success text-xs">✓</span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
