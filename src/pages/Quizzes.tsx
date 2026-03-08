import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileText, Clock, CheckCircle, XCircle, RotateCcw, Sparkles, Loader2, ArrowRight, Mic, MicOff, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

type QuizState = "setup" | "active" | "result";

export default function Quizzes() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [state, setState] = useState<QuizState>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [startTime, setStartTime] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const recognitionRef = useState<any>(null);

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*, lessons(id, title, content)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (state !== "active") return;
    if (timeLeft <= 0) { setState("result"); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [state, timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const score = Object.entries(answers).filter(([qId]) => {
    const q = questions.find(q => q.id === Number(qId));
    return q && q.correct === answers[Number(qId)];
  }).length;

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    const sub = subjects.find((s: any) => s.id === subjectId);
    if (sub && (sub as any).lessons?.length > 0) {
      const lessonsText = (sub as any).lessons
        .filter((l: any) => l.content)
        .map((l: any) => `${l.title}:\n${l.content}`)
        .join("\n\n");
      if (lessonsText.trim()) setInputText(lessonsText);
    }
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "المتصفح لا يدعم التعرف على الصوت", variant: "destructive" });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalTranscript = inputText ? inputText + "\n" : "";
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
        else interim = event.results[i][0].transcript;
      }
      setInputText(finalTranscript + interim);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    (recognitionRef as any)[1](recognition);
    recognition.start();
    setRecording(true);
  };

  const stopRecording = () => {
    const rec = (recognitionRef as any)[0];
    if (rec) rec.stop();
    setRecording(false);
  };

  const handleGenerateQuiz = async () => {
    if (!inputText.trim()) {
      toast({ title: "أدخل نص الدرس أولاً", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setSaved(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("يرجى تسجيل الدخول أولاً");

      const resp = await fetch(AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tool: "generate_quiz", text: inputText }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "خطأ" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }
      if (!resp.body) throw new Error("No body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) result += content;
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("لم يتم توليد أسئلة صالحة");

      const parsed: any[] = JSON.parse(jsonMatch[0]);
      const generatedQuestions: Question[] = parsed.map((q, i) => ({
        id: i + 1, text: q.text, options: q.options, correct: q.correct,
      }));

      if (generatedQuestions.length === 0) throw new Error("لم يتم توليد أسئلة");

      setQuestions(generatedQuestions);
      setState("active");
      setTimeLeft(generatedQuestions.length * 60);
      setStartTime(Date.now());
      setCurrentQ(0);
      setAnswers({});
      toast({ title: `تم توليد ${generatedQuestions.length} سؤال ✨` });
    } catch (err: any) {
      console.error("Quiz generation error:", err);
      toast({ title: err.message || "حدث خطأ في توليد الأسئلة", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const saveResult = async () => {
    setSaving(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const subName = subjects.find((s: any) => s.id === selectedSubject)?.name || "اختبار ذكي";
      const { error } = await supabase.from("quizzes").insert({
        title: subName,
        score,
        total_questions: questions.length,
        time_taken: timeTaken,
        subject_id: selectedSubject || null,
        user_id: user!.id,
      });
      if (error) throw error;
      setSaved(true);
      toast({ title: "تم حفظ النتيجة ✅" });
    } catch (err: any) {
      console.error("Save error:", err);
      toast({ title: "خطأ في حفظ النتيجة", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (state === "setup") {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">الاختبارات الذكية</h1>
          <p className="text-muted-foreground text-sm">أدخل نص الدرس وسيولّد الذكاء الاصطناعي أسئلة تلقائية</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {subjects.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">اختر مادة (اختياري)</Label>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s: any) => (
                  <button
                    key={s.id}
                    onClick={() => handleSubjectSelect(s.id)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                      selectedSubject === s.id
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">نص الدرس أو المحاضرة</Label>
              <Button
                variant={recording ? "destructive" : "outline"}
                size="sm"
                onClick={recording ? stopRecording : startRecording}
                className="gap-1.5"
              >
                {recording ? <><MicOff className="h-3.5 w-3.5" />إيقاف</> : <><Mic className="h-3.5 w-3.5" />تسجيل صوتي</>}
              </Button>
            </div>
            <AnimatePresence>
              {recording && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 text-sm text-destructive">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
                  </span>
                  جارِ التسجيل...
                </motion.div>
              )}
            </AnimatePresence>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="ألصق نص الدرس هنا أو اضغط تسجيل صوتي..."
              className="min-h-[180px] resize-none"
            />
          </div>

          <Button onClick={handleGenerateQuiz} size="lg" className="w-full" disabled={generating || !inputText.trim()}>
            {generating ? <><Loader2 className="h-4 w-4 animate-spin" />جارِ التوليد...</> : <><Sparkles className="h-4 w-4" />توليد اختبار ذكي</>}
          </Button>
        </div>
      </div>
    );
  }

  if (state === "result") {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">نتيجة الاختبار</h1>
        <div className="max-w-lg mx-auto">
          <motion.div className="rounded-xl border border-border bg-card p-6 shadow-card text-center space-y-5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={`inline-flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold ${
              percentage >= 70 ? "bg-success/10 text-success" : percentage >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
            }`}>
              {percentage}%
            </div>
            <div>
              <h2 className="text-xl font-bold">{percentage >= 70 ? "ممتاز! 🎉" : percentage >= 50 ? "جيد 👍" : "حاول مرة أخرى 💪"}</h2>
              <p className="text-muted-foreground text-sm">{score} من {questions.length} إجابة صحيحة</p>
            </div>

            {/* Save Result */}
            {!saved && (
              <Button onClick={saveResult} variant="outline" className="gap-1.5" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ النتيجة
              </Button>
            )}
            {saved && <p className="text-sm text-success font-medium">✅ تم حفظ النتيجة</p>}

            <div className="space-y-2 text-right">
              {questions.map((q) => {
                const userAns = answers[q.id];
                const correct = userAns === q.correct;
                return (
                  <div key={q.id} className="flex items-start gap-2.5 text-sm rounded-lg border border-border p-3">
                    {correct ? <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-medium text-sm mb-0.5">{q.text}</p>
                      {!correct && <p className="text-xs text-success">الصحيحة: {q.options[q.correct]}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button onClick={() => { setState("setup"); setSaved(false); }} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4" />
                اختبار جديد
              </Button>
              <Button onClick={() => {
                setCurrentQ(0); setAnswers({}); setTimeLeft(questions.length * 60); setStartTime(Date.now()); setState("active"); setSaved(false);
              }} className="flex-1">
                <ArrowRight className="h-4 w-4" />
                أعد المحاولة
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">السؤال {currentQ + 1} من {questions.length}</h1>
        <div className="flex items-center gap-2 text-sm font-mono">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={timeLeft < 60 ? "text-destructive" : ""}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <Progress value={((currentQ + 1) / questions.length) * 100} className="h-2" />

      <motion.div key={currentQ} className="rounded-xl border border-border bg-card p-5 shadow-card space-y-5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-base font-semibold">{q.text}</h2>
        <RadioGroup value={answers[q.id]?.toString()} onValueChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: Number(v) }))} className="space-y-2">
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/30 transition-colors cursor-pointer">
              <RadioGroupItem value={i.toString()} id={`q${q.id}-${i}`} />
              <Label htmlFor={`q${q.id}-${i}`} className="cursor-pointer flex-1 text-sm">{opt}</Label>
            </div>
          ))}
        </RadioGroup>
      </motion.div>

      <div className="flex justify-between">
        <Button variant="outline" disabled={currentQ === 0} onClick={() => setCurrentQ(p => p - 1)}>السابق</Button>
        {currentQ < questions.length - 1 ? (
          <Button onClick={() => setCurrentQ(p => p + 1)} disabled={answers[q.id] === undefined}>التالي</Button>
        ) : (
          <Button onClick={() => setState("result")}>إنهاء الاختبار</Button>
        )}
      </div>
    </div>
  );
}
