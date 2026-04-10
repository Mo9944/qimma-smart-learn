import { motion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssessmentType, personalityResults, thinkingResults, learningResults, getTopTraits } from "@/data/careerAssessments";

interface Props {
  type: AssessmentType;
  scores: Record<string, number>;
  onBack: () => void;
  onRetake: () => void;
}

function getMaxScore(type: AssessmentType): number {
  // rough max per trait based on question count
  switch (type) {
    case "personality": return 9;
    case "capabilities": return 3;
    case "strengths": return 6;
    case "thinking": return 24;
    case "learning": return 24;
  }
}

function getLabel(type: AssessmentType, key: string): { name: string; desc: string } {
  if (type === "personality") return personalityResults[key] || { name: key, desc: "" };
  if (type === "thinking") return thinkingResults[key] || { name: key, desc: "" };
  if (type === "learning") {
    const r = learningResults[key];
    return r ? { name: r.name, desc: r.desc } : { name: key, desc: "" };
  }
  // capabilities & strengths - arabic labels
  const labels: Record<string, string> = {
    technical: "مهارات تقنية", communication: "تواصل", leadership: "قيادة",
    analytical: "تحليل", problemSolving: "حل مشكلات", timeManagement: "إدارة وقت",
    adaptability: "تكيّف", teamwork: "عمل جماعي", negotiation: "تفاوض",
    selfLearning: "تعلم ذاتي", discipline: "انضباط", focus: "تركيز",
    growth: "نمو وتطوير", resilience: "مرونة نفسية", initiative: "مبادرة",
    selfAwareness: "وعي ذاتي", reliability: "موثوقية", goalSetting: "تحديد أهداف",
    balance: "توازن",
  };
  return { name: labels[key] || key, desc: "" };
}

export default function AssessmentResults({ type, scores, onBack, onRetake }: Props) {
  const top = getTopTraits(scores, 5);
  const maxScore = getMaxScore(type);
  const allEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  // For strengths type: split into strengths and weaknesses
  const isStrengths = type === "strengths";
  const strengths = isStrengths ? allEntries.filter(([, v]) => v >= 4) : [];
  const weaknesses = isStrengths ? allEntries.filter(([, v]) => v < 4) : [];

  // Learning tips
  const isLearning = type === "learning";
  const topLearning = isLearning ? top[0]?.[0] : null;
  const tips = topLearning ? learningResults[topLearning]?.tips || [] : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
        <ArrowRight className="h-4 w-4" />
        رجوع للقائمة
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold mb-1">نتائج التحليل</h2>
        <p className="text-muted-foreground text-sm mb-6">بناءً على إجاباتك، إليك تحليلك:</p>

        {/* Top trait highlight */}
        {top[0] && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 mb-6 text-center">
            <div className="text-3xl mb-2">{type === "learning" ? "📚" : type === "thinking" ? "🎯" : "⭐"}</div>
            <h3 className="text-lg font-bold text-primary">{getLabel(type, top[0][0]).name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{getLabel(type, top[0][0]).desc}</p>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        {isStrengths ? (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 p-4">
              <h4 className="font-bold text-green-700 dark:text-green-400 mb-3">💪 نقاط القوة</h4>
              {strengths.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد نقاط واضحة بعد</p> : strengths.map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-1.5 text-sm">
                  <span>{getLabel(type, k).name}</span>
                  <span className="font-bold text-green-600">{Math.round((v / 6) * 100)}%</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
              <h4 className="font-bold text-red-700 dark:text-red-400 mb-3">🔧 فرص التحسين</h4>
              {weaknesses.length === 0 ? <p className="text-sm text-muted-foreground">أداء متوازن!</p> : weaknesses.map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-1.5 text-sm">
                  <span>{getLabel(type, k).name}</span>
                  <span className="font-bold text-red-600">{Math.round((v / 6) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Score bars */
          <div className="space-y-3 mb-6">
            {allEntries.map(([key, value]) => {
              const pct = Math.min(100, Math.round((value / maxScore) * 100));
              const label = getLabel(type, key);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{label.name}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full rounded-full bg-gradient-to-l from-primary to-primary/60"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Learning tips */}
        {isLearning && tips.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 mb-6">
            <h4 className="font-bold mb-3">💡 نصائح تعلم مخصصة لك:</h4>
            <ul className="space-y-2">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onRetake} className="flex-1 gap-1.5">
            <RotateCcw className="h-4 w-4" />
            إعادة الاختبار
          </Button>
          <Button onClick={onBack} className="flex-1">
            العودة للتحليلات
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
