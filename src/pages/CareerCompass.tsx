import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentType, assessmentMeta, getQuestions, calculateScores } from "@/data/careerAssessments";
import AssessmentCard from "@/components/career/AssessmentCard";
import AssessmentQuiz from "@/components/career/AssessmentQuiz";
import AssessmentResults from "@/components/career/AssessmentResults";

type View = "list" | "quiz" | "results";

export default function CareerCompass() {
  const { toast } = useToast();
  const [view, setView] = useState<View>("list");
  const [activeType, setActiveType] = useState<AssessmentType>("personality");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [completedTests, setCompletedTests] = useState<Set<AssessmentType>>(new Set());

  useEffect(() => {
    loadCompleted();
  }, []);

  const loadCompleted = async () => {
    const { data } = await supabase
      .from("career_assessments")
      .select("test_type")
      .order("created_at", { ascending: false });
    if (data) {
      const types = new Set(data.map(d => d.test_type as AssessmentType));
      setCompletedTests(types);
    }
  };

  const startTest = (type: AssessmentType) => {
    setActiveType(type);
    setView("quiz");
  };

  const handleComplete = async (answers: Record<number, string>) => {
    const questions = getQuestions(activeType);
    const result = calculateScores(answers, questions);
    setScores(result);

    const topTrait = Object.entries(result).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    await supabase.from("career_assessments").insert({
      test_type: activeType,
      results: result,
      result_code: topTrait,
    });

    setCompletedTests(prev => new Set(prev).add(activeType));
    setView("results");
    toast({ title: "تم حفظ النتيجة ✨" });
  };

  const types: AssessmentType[] = ["personality", "capabilities", "strengths", "thinking", "learning"];
  const completedCount = types.filter(t => completedTests.has(t)).length;

  if (view === "quiz") {
    return (
      <div className="space-y-6">
        <AssessmentQuiz
          title={assessmentMeta[activeType].title}
          questions={getQuestions(activeType)}
          onComplete={handleComplete}
          onBack={() => setView("list")}
        />
      </div>
    );
  }

  if (view === "results") {
    return (
      <div className="space-y-6">
        <AssessmentResults
          type={activeType}
          scores={scores}
          onBack={() => setView("list")}
          onRetake={() => setView("quiz")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">البوصلة المهنية</h1>
        <p className="text-muted-foreground text-sm">اكتشف نفسك من خلال 5 تحليلات شاملة</p>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg">
          {completedCount}/{types.length}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">تقدمك في التحليلات</p>
          <div className="h-2 rounded-full bg-secondary mt-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / types.length) * 100}%` }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>
      </div>

      {/* Assessment cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {types.map((type, i) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <AssessmentCard
              type={type}
              completed={completedTests.has(type)}
              onClick={() => startTest(type)}
            />
          </motion.div>
        ))}
      </div>

      {completedCount === types.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center"
        >
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-bold">أكملت جميع التحليلات!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            يمكنك الآن مراجعة نتائجك أو إعادة أي اختبار
          </p>
        </motion.div>
      )}
    </div>
  );
}
