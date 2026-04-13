import { motion } from "framer-motion";
import { Zap, AlertTriangle } from "lucide-react";

interface Skill {
  name: string;
  level: number; // 0-100
  acquired: boolean;
}

interface SkillsRadarProps {
  skills: Skill[];
}

export default function SkillsRadar({ skills }: SkillsRadarProps) {
  const acquired = skills.filter(s => s.acquired);
  const missing = skills.filter(s => !s.acquired);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-sm">المهارات المكتسبة والناقصة</h2>
      </div>

      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">أكمل التحليلات لعرض مهاراتك</p>
      ) : (
        <div className="space-y-4">
          {/* Acquired */}
          {acquired.length > 0 && (
            <div>
              <p className="text-xs font-medium text-success mb-2 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success" /> مهارات مكتسبة ({acquired.length})
              </p>
              <div className="space-y-2">
                {acquired.map((s, i) => (
                  <motion.div key={s.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>{s.name}</span>
                      <span className="text-success font-medium">{s.level}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div className="h-full rounded-full bg-success" initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Missing */}
          {missing.length > 0 && (
            <div>
              <p className="text-xs font-medium text-warning mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> مهارات ناقصة ({missing.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((s) => (
                  <span key={s.name} className="text-xs px-2 py-1 rounded-md bg-warning/10 text-warning border border-warning/20">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
