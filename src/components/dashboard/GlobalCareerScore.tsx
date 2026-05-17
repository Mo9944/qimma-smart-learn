import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, Trophy, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

// Computes a Global Career Score /100 + an estimated global rank %.
// Uses RIASEC (depth), career_assessments (breadth), psych (mental readiness),
// quizzes (knowledge), habits (consistency), learning_plans (direction).
export default function GlobalCareerScore() {
  const [score, setScore] = useState<number | null>(null);
  const [parts, setParts] = useState<{ label: string; pts: number; max: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [r, c, p, q, h, hp, lp] = await Promise.all([
        supabase.from("riasec_results").select("*").order("created_at", { ascending: false }).limit(1),
        supabase.from("career_assessments").select("test_type"),
        supabase.from("psych_assessments").select("*").order("created_at", { ascending: false }).limit(1),
        supabase.from("quizzes").select("score,total_questions"),
        supabase.from("habits").select("id"),
        supabase.from("habit_progress").select("habit_id,date").gte("date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]),
        supabase.from("learning_plans").select("id"),
      ]);

      const riasec = r.data?.[0];
      const psych = p.data?.[0];
      const quizzes = q.data || [];
      const habits = h.data || [];
      const progress = hp.data || [];
      const types = new Set((c.data || []).map(x => x.test_type));

      // Component scoring (sums to 100)
      const personality = riasec ? 15 : 0;                                              // /15
      const breadth = Math.min(types.size, 5) * 4;                                      // /20
      const mental = psych
        ? Math.round(((psych.confidence + (100 - psych.anxiety) + psych.decision_ability + psych.stress_tolerance) / 4) * 0.20)
        : 0;                                                                            // /20
      const knowledge = quizzes.length > 0
        ? Math.round(Math.min(
            (quizzes.reduce((s, x) => s + ((x.score || 0) / (x.total_questions || 1)) * 100, 0) / quizzes.length) * 0.20, 20))
        : 0;                                                                            // /20
      const consistency = habits.length > 0
        ? Math.round(Math.min(
            (habits.reduce((s, hh) => s + (progress.filter(pp => pp.habit_id === hh.id).length / 30) * 100, 0) / habits.length) * 0.15, 15))
        : 0;                                                                            // /15
      const direction = (lp.data || []).length > 0 ? 10 : 0;                            // /10

      const total = personality + breadth + mental + knowledge + consistency + direction;
      setScore(total);
      setParts([
        { label: "الشخصية", pts: personality, max: 15 },
        { label: "اتساع التقييم", pts: breadth, max: 20 },
        { label: "الجاهزية النفسية", pts: mental, max: 20 },
        { label: "المعرفة", pts: knowledge, max: 20 },
        { label: "الالتزام", pts: consistency, max: 15 },
        { label: "وضوح المسار", pts: direction, max: 10 },
      ]);
    };
    load();
  }, []);

  const rank = score == null ? 0 :
    score >= 85 ? 5 : score >= 70 ? 15 : score >= 55 ? 30 : score >= 40 ? 50 : 75;
  const tier = score == null ? "..." :
    score >= 85 ? "نخبة عالمية" : score >= 70 ? "متقدم" : score >= 55 ? "جيد جداً" : score >= 40 ? "في النمو" : "البداية";

  return (
    <Card className="p-5 md:p-6 bg-gradient-to-br from-primary/10 via-card to-card border-primary/30">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Global Career Score</span>
          </div>
          <p className="text-xs text-muted-foreground">جاهزيتك مقارنة بسوق العمل العالمي</p>
        </div>
        <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
          <Trophy className="h-3 w-3" /> أعلى {rank}% عالمياً
        </div>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-5xl md:text-6xl font-bold text-primary tabular-nums"
        >
          {score ?? "—"}
        </motion.div>
        <div className="pb-2">
          <div className="text-xs text-muted-foreground">/ 100</div>
          <div className="text-sm font-medium flex items-center gap-1 text-primary">
            <TrendingUp className="h-3.5 w-3.5" /> {tier}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {parts.map(p => (
          <div key={p.label} className="flex items-center gap-2 text-xs">
            <span className="w-24 text-muted-foreground shrink-0">{p.label}</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${(p.pts / p.max) * 100}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <span className="w-12 text-left tabular-nums">{p.pts}/{p.max}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
