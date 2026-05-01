import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Heart, Sparkles, RotateCcw, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { psychQuestions, scorePsych, buildInsights, thinkingStyleInfo, PsychResult } from "@/data/psychAssessment";

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

export default function PsychInsight() {
  const { toast } = useToast();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [result, setResult] = useState<PsychResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    loadLatest();
  }, []);

  const loadLatest = async () => {
    const { data } = await supabase
      .from("psych_assessments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      setHasExisting(true);
      setResult({
        confidence: data.confidence,
        anxiety: data.anxiety,
        decision: data.decision_ability,
        stress: data.stress_tolerance,
        burnoutRisk: data.burnout_risk,
        thinkingStyle: data.thinking_style as PsychResult["thinkingStyle"],
      });
    }
  };

  const q = psychQuestions[current];
  const progress = (Object.keys(answers).length / psychQuestions.length) * 100;

  const handleSelect = (value: number | string) => {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    if (current < psychQuestions.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 250);
    } else {
      finalize(newAnswers);
    }
  };

  const finalize = async (final: Record<number, number | string>) => {
    setLoading(true);
    const r = scorePsych(final);
    setResult(r);
    try {
      await supabase.from("psych_assessments").insert({
        user_id: ZERO_UUID,
        confidence: r.confidence,
        anxiety: r.anxiety,
        thinking_style: r.thinkingStyle,
        decision_ability: r.decision,
        stress_tolerance: r.stress,
        burnout_risk: r.burnoutRisk,
        raw_answers: final,
      });
      toast({ title: "تم حفظ تحليلك النفسي ✅" });
    } catch (e: any) {
      toast({ title: "خطأ في الحفظ", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setCurrent(0);
    setResult(null);
  };

  if (result) {
    const insights = buildInsights(result);
    const style = thinkingStyleInfo[result.thinkingStyle];

    const metrics = [
      { label: "الثقة بالنفس", value: result.confidence, color: "from-emerald-500 to-teal-500", positive: true },
      { label: "القلق", value: result.anxiety, color: "from-rose-500 to-pink-500", positive: false },
      { label: "اتخاذ القرار", value: result.decision, color: "from-blue-500 to-cyan-500", positive: true },
      { label: "تحمّل الضغط", value: result.stress, color: "from-amber-500 to-orange-500", positive: true },
    ];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mb-2">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">تحليلك النفسي</h1>
          <p className="text-muted-foreground">صورة شاملة عن حالتك النفسية الحالية</p>
        </div>

        {/* Metrics grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{m.label}</span>
                <span className="text-2xl font-bold font-display">{m.value}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ delay: i * 0.08 + 0.2, duration: 0.8 }}
                  className={`h-full bg-gradient-to-r ${m.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Burnout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-xl border p-5 ${result.burnoutRisk >= 60 ? "border-rose-500/40 bg-rose-500/5" : "border-emerald-500/40 bg-emerald-500/5"}`}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold mb-1">مؤشر الاحتراق الوظيفي</h3>
              <p className="text-sm text-muted-foreground">
                {result.burnoutRisk >= 60 ? "احتمال مرتفع — انتبه لصحتك النفسية" : result.burnoutRisk >= 40 ? "متوسط — توازن جيد لكن راقب نفسك" : "منخفض — أنت في حالة جيدة"}
              </p>
            </div>
            <span className="text-3xl font-bold font-display">{result.burnoutRisk}%</span>
          </div>
        </motion.div>

        {/* Thinking style */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            نمط التفكير
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{style.icon}</div>
            <div>
              <div className="text-xl font-bold">{style.name}</div>
              <p className="text-sm text-muted-foreground">{style.desc}</p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <h3 className="font-bold mb-3 text-emerald-600 dark:text-emerald-400">💪 نقاط القوة</h3>
            <ul className="space-y-2 text-sm">
              {insights.strengths.length > 0 ? insights.strengths.map((s, i) => (
                <li key={i} className="flex gap-2"><span>•</span><span>{s}</span></li>
              )) : <li className="text-muted-foreground">أكمل المزيد من التقييمات</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <h3 className="font-bold mb-3 text-amber-600 dark:text-amber-400">⚠️ العوائق</h3>
            <ul className="space-y-2 text-sm">
              {insights.obstacles.length > 0 ? insights.obstacles.map((s, i) => (
                <li key={i} className="flex gap-2"><span>•</span><span>{s}</span></li>
              )) : <li className="text-muted-foreground">لا توجد عوائق واضحة</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <h3 className="font-bold mb-3 text-primary">💡 نصائح عملية</h3>
            <ul className="space-y-2 text-sm">
              {insights.tips.map((s, i) => (
                <li key={i} className="flex gap-2"><span>•</span><span>{s}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            إعادة الاختبار
          </Button>
          <Link to="/dashboard/balance-map">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              خريطة التوازن النفسي والمهني
            </Button>
          </Link>
          <Link to="/dashboard/ai-mentor">
            <Button variant="secondary" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              اسأل المرشد الذكي
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Quiz UI
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
          <Heart className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">التحليل النفسي المبسّط</h1>
        <p className="text-muted-foreground text-sm">{psychQuestions.length} أسئلة قصيرة لفهم حالتك النفسية</p>
        {hasExisting && (
          <Button variant="link" size="sm" onClick={loadLatest}>عرض آخر نتيجة</Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{current + 1} / {psychQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <motion.div
        key={q.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-lg font-medium leading-relaxed">{q.text}</p>
        </div>

        <div className="grid gap-2">
          {q.options.map((opt, i) => {
            const value = q.dimension === "thinking" ? opt.thinking! : opt.value;
            const selected = answers[q.id] === value;
            return (
              <button
                key={i}
                onClick={() => handleSelect(value)}
                disabled={loading}
                className={`w-full rounded-xl border p-4 text-right transition-all ${
                  selected ? "border-primary bg-primary/10 font-medium" : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="flex gap-2 justify-center">
        <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>
          السابق
        </Button>
        <Button variant="outline" size="sm" disabled={current === psychQuestions.length - 1} onClick={() => setCurrent(c => c + 1)}>
          التالي
        </Button>
      </div>
    </div>
  );
}
