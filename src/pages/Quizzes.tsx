import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileText, Clock, CheckCircle, XCircle, ArrowLeft, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

const sampleQuestions: Question[] = [
  { id: 1, text: "ما هي وحدة قياس القوة في النظام الدولي؟", options: ["نيوتن", "جول", "واط", "باسكال"], correct: 0 },
  { id: 2, text: "ما هو قانون نيوتن الثاني؟", options: ["F = ma", "E = mc²", "V = IR", "P = IV"], correct: 0 },
  { id: 3, text: "أي من التالي يُعد كمية قياسية؟", options: ["السرعة", "التسارع", "الكتلة", "القوة"], correct: 2 },
  { id: 4, text: "ما هي وحدة قياس الشغل؟", options: ["نيوتن", "جول", "هرتز", "أمبير"], correct: 1 },
  { id: 5, text: "إذا كانت القوة = 10 نيوتن والكتلة = 2 كجم، ما التسارع؟", options: ["2 م/ث²", "5 م/ث²", "10 م/ث²", "20 م/ث²"], correct: 1 },
];

type QuizState = "setup" | "active" | "result";

export default function Quizzes() {
  const { toast } = useToast();
  const [state, setState] = useState<QuizState>("setup");
  const [questions] = useState<Question[]>(sampleQuestions);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (state !== "active") return;
    if (timeLeft <= 0) { setState("result"); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [state, timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const score = Object.entries(answers).filter(([qId, ans]) => {
    const q = questions.find(q => q.id === Number(qId));
    return q && q.correct === ans;
  }).length;

  const handleGenerateQuiz = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1000));
    setGenerating(false);
    setState("active");
    setTimeLeft(300);
    setCurrentQ(0);
    setAnswers({});
  };

  if (state === "setup") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">الاختبارات</h1>
          <p className="text-muted-foreground text-sm">أنشئ اختبارًا من أي درس وقيّم مستواك</p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="rounded-xl border border-border bg-card p-8 shadow-card text-center space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">اختبار سريع</h2>
              <p className="text-sm text-muted-foreground">5 أسئلة • 5 دقائق • فيزياء</p>
            </div>
            <Button onClick={handleGenerateQuiz} variant="default" size="lg" className="w-full" disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جارِ إنشاء الاختبار...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  ابدأ الاختبار
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "result") {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">نتيجة الاختبار</h1>
        <div className="max-w-lg mx-auto">
          <motion.div
            className="rounded-xl border border-border bg-card p-8 shadow-card text-center space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={`inline-flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold ${
              percentage >= 70 ? "bg-success/10 text-success" : percentage >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
            }`}>
              {percentage}%
            </div>
            <div>
              <h2 className="text-xl font-bold">{percentage >= 70 ? "ممتاز! 🎉" : percentage >= 50 ? "جيد 👍" : "حاول مرة أخرى 💪"}</h2>
              <p className="text-muted-foreground text-sm">{score} من {questions.length} إجابة صحيحة</p>
            </div>

            <div className="space-y-3 text-right">
              {questions.map((q) => {
                const userAns = answers[q.id];
                const correct = userAns === q.correct;
                return (
                  <div key={q.id} className="flex items-start gap-3 text-sm rounded-lg border border-border p-3">
                    {correct ? <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-medium mb-1">{q.text}</p>
                      {!correct && <p className="text-xs text-success">الإجابة الصحيحة: {q.options[q.correct]}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button onClick={() => setState("setup")} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4" />
              اختبار جديد
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">السؤال {currentQ + 1} من {questions.length}</h1>
        <div className="flex items-center gap-2 text-sm font-mono">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={timeLeft < 60 ? "text-destructive" : ""}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <Progress value={((currentQ + 1) / questions.length) * 100} className="h-2" />

      <motion.div
        key={currentQ}
        className="rounded-xl border border-border bg-card p-6 shadow-card space-y-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h2 className="text-lg font-semibold">{q.text}</h2>

        <RadioGroup
          value={answers[q.id]?.toString()}
          onValueChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: Number(v) }))}
          className="space-y-3"
        >
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/30 transition-colors cursor-pointer">
              <RadioGroupItem value={i.toString()} id={`q${q.id}-${i}`} />
              <Label htmlFor={`q${q.id}-${i}`} className="cursor-pointer flex-1">{opt}</Label>
            </div>
          ))}
        </RadioGroup>
      </motion.div>

      <div className="flex justify-between">
        <Button variant="outline" disabled={currentQ === 0} onClick={() => setCurrentQ(p => p - 1)}>
          السابق
        </Button>
        {currentQ < questions.length - 1 ? (
          <Button onClick={() => setCurrentQ(p => p + 1)} disabled={answers[q.id] === undefined}>
            التالي
          </Button>
        ) : (
          <Button onClick={() => setState("result")} variant="default">
            إنهاء الاختبار
          </Button>
        )}
      </div>
    </div>
  );
}
