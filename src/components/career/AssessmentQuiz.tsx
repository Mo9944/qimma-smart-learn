import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AssessmentQuestion } from "@/data/careerAssessments";

interface Props {
  title: string;
  questions: AssessmentQuestion[];
  onComplete: (answers: Record<number, string>) => void;
  onBack: () => void;
}

export default function AssessmentQuiz({ title, questions, onComplete, onBack }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const q = questions[current];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;
  const allDone = Object.keys(answers).length === questions.length;

  const handleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [q.id]: value }));
    if (current < questions.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 300);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowRight className="h-4 w-4" />
          رجوع
        </Button>
        <span className="text-sm text-muted-foreground">{current + 1} / {questions.length}</span>
      </div>

      <h2 className="text-xl font-bold text-center">{title}</h2>
      <Progress value={progress} className="h-2" />

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-4"
        >
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-lg font-medium leading-relaxed">{q.text}</p>
          </div>

          <div className="grid gap-2">
            {q.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full rounded-xl border p-4 text-right transition-all ${
                  answers[q.id] === opt.value
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          disabled={current === 0}
          onClick={() => setCurrent(c => c - 1)}
        >
          <ArrowRight className="h-4 w-4" />
          السابق
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={current === questions.length - 1}
          onClick={() => setCurrent(c => c + 1)}
        >
          التالي
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {allDone && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={() => onComplete(answers)} className="w-full" size="lg">
            <CheckCircle2 className="h-5 w-5 ml-2" />
            عرض النتائج
          </Button>
        </motion.div>
      )}
    </div>
  );
}
