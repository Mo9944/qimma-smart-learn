import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, RotateCcw, Sparkles, Target, Star, AlertTriangle, Briefcase, Lightbulb, History, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type RiasecType = "R" | "I" | "A" | "S" | "E" | "C";

interface Question {
  text: string;
  type: RiasecType;
}

const questions: Question[] = [
  { text: "أحب العمل بالأدوات أو الأجهزة.", type: "R" },
  { text: "أستمتع بإصلاح الأشياء أو تركيبها.", type: "R" },
  { text: "أفضل العمل العملي أكثر من الجلوس أمام الكمبيوتر.", type: "R" },
  { text: "أحب الأنشطة البدنية أو التقنية.", type: "R" },
  { text: "أستمتع بالعمل في بيئة عملية مثل ورشة أو مختبر.", type: "R" },
  { text: "أحب تحليل المشكلات وإيجاد حلول لها.", type: "I" },
  { text: "أستمتع بالعلوم والتجارب.", type: "I" },
  { text: "أحب البحث عن معلومات جديدة.", type: "I" },
  { text: "أستمتع بحل الألغاز والمسائل المعقدة.", type: "I" },
  { text: "أحب التعلم واكتشاف أشياء جديدة باستمرار.", type: "I" },
  { text: "أحب الرسم أو التصميم أو الإبداع.", type: "A" },
  { text: "أستمتع بكتابة القصص أو التعبير الفني.", type: "A" },
  { text: "أحب الأفكار الجديدة غير التقليدية.", type: "A" },
  { text: "أفضل العمل الإبداعي الحر.", type: "A" },
  { text: "أستمتع بالموسيقى أو الفن.", type: "A" },
  { text: "أحب مساعدة الناس.", type: "S" },
  { text: "أستمتع بشرح الأشياء للآخرين.", type: "S" },
  { text: "أفضل العمل مع الناس أكثر من العمل مع الآلات.", type: "S" },
  { text: "أستمتع بالأنشطة الجماعية.", type: "S" },
  { text: "أحب تقديم النصائح والدعم للآخرين.", type: "S" },
  { text: "أحب قيادة فريق أو مشروع.", type: "E" },
  { text: "أستمتع بإقناع الناس بأفكاري.", type: "E" },
  { text: "أحب بدء مشاريع جديدة.", type: "E" },
  { text: "أستمتع بالمنافسة وتحقيق النجاح.", type: "E" },
  { text: "أحب الأعمال التجارية أو التسويق.", type: "E" },
  { text: "أحب التنظيم والترتيب.", type: "C" },
  { text: "أستمتع بالعمل مع الأرقام والبيانات.", type: "C" },
  { text: "أفضل العمل المنظم والواضح.", type: "C" },
  { text: "أحب التخطيط والجدولة.", type: "C" },
  { text: "أستمتع بالأعمال المكتبية أو الإدارية.", type: "C" },
];

const typeInfo: Record<RiasecType, {
  name: string;
  emoji: string;
  color: string;
  talents: string[];
  strengths: string[];
  weaknesses: string[];
  fields: string[];
  skills: string[];
}> = {
  R: {
    name: "الواقعي",
    emoji: "🔧",
    color: "bg-orange-500",
    talents: ["المهارات اليدوية", "التعامل مع الأدوات والمعدات", "الحس العملي"],
    strengths: ["العمل العملي", "حل المشكلات التقنية", "القدرة البدنية", "الاستقلالية"],
    weaknesses: ["التواصل الاجتماعي", "التعبير عن المشاعر", "العمل المكتبي الروتيني"],
    fields: ["الهندسة", "الميكانيكا", "البناء", "الزراعة", "الرياضة", "التكنولوجيا"],
    skills: ["تعلم برمجة الأجهزة", "مهارات الصيانة", "التصميم الهندسي"],
  },
  I: {
    name: "الباحث",
    emoji: "🔬",
    color: "bg-blue-500",
    talents: ["التحليل والبحث", "التفكير النقدي", "حب الاستكشاف"],
    strengths: ["الذكاء التحليلي", "الفضول العلمي", "الدقة", "التفكير المنطقي"],
    weaknesses: ["القيادة المباشرة", "العمل تحت ضغط اجتماعي", "اتخاذ قرارات سريعة"],
    fields: ["الطب", "العلوم", "البحث العلمي", "الرياضيات", "تحليل البيانات", "الذكاء الاصطناعي"],
    skills: ["التحليل الإحصائي", "البرمجة", "مهارات البحث المتقدم"],
  },
  A: {
    name: "الفني",
    emoji: "🎨",
    color: "bg-pink-500",
    talents: ["الإبداع والابتكار", "الحس الفني", "التعبير الذاتي"],
    strengths: ["الخيال الواسع", "التفكير خارج الصندوق", "الحساسية الفنية", "المرونة"],
    weaknesses: ["الالتزام بالقواعد الصارمة", "العمل الروتيني", "التنظيم المنهجي"],
    fields: ["التصميم الجرافيكي", "الكتابة", "التصوير", "الموسيقى", "الإخراج", "العمارة"],
    skills: ["أدوات التصميم الرقمي", "الكتابة الإبداعية", "تطوير الحس الفني"],
  },
  S: {
    name: "الاجتماعي",
    emoji: "🤝",
    color: "bg-green-500",
    talents: ["التواصل مع الآخرين", "التعاطف", "القدرة على التعليم"],
    strengths: ["مهارات التواصل", "الصبر", "العمل الجماعي", "الاستماع الفعال"],
    weaknesses: ["العمل الفردي المطول", "المهام التقنية المعقدة", "المنافسة الشرسة"],
    fields: ["التعليم", "الطب", "الخدمة الاجتماعية", "الإرشاد النفسي", "الموارد البشرية"],
    skills: ["مهارات العرض والتقديم", "الذكاء العاطفي", "إدارة الصراعات"],
  },
  E: {
    name: "القيادي",
    emoji: "👔",
    color: "bg-amber-500",
    talents: ["القيادة والتأثير", "ريادة الأعمال", "الإقناع"],
    strengths: ["الثقة بالنفس", "اتخاذ القرارات", "التخطيط الاستراتيجي", "الطموح"],
    weaknesses: ["الصبر على التفاصيل", "قبول الأوامر", "العمل البحثي الطويل"],
    fields: ["إدارة الأعمال", "التسويق", "المبيعات", "ريادة الأعمال", "القانون", "السياسة"],
    skills: ["التفاوض", "إدارة المشاريع", "التسويق الرقمي"],
  },
  C: {
    name: "التنظيمي",
    emoji: "📋",
    color: "bg-teal-500",
    talents: ["التنظيم والدقة", "إدارة البيانات", "الانضباط"],
    strengths: ["الدقة والتفصيل", "الالتزام", "إدارة الوقت", "العمل المنهجي"],
    weaknesses: ["الإبداع الحر", "التعامل مع الغموض", "القيادة في بيئات فوضوية"],
    fields: ["المحاسبة", "إدارة المكاتب", "تحليل البيانات", "البنوك", "البرمجة المنظمة"],
    skills: ["Excel والأدوات المكتبية", "إدارة قواعد البيانات", "التخطيط المالي"],
  },
};

const answerOptions = [
  { label: "نعم", value: 2, color: "bg-primary hover:bg-primary/90 text-primary-foreground" },
  { label: "أحياناً", value: 1, color: "bg-warning/20 hover:bg-warning/30 text-warning-foreground border border-warning/30" },
  { label: "لا", value: 0, color: "bg-muted hover:bg-muted/80 text-muted-foreground border border-border" },
];

export default function RiasecTest() {
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(30).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: history = [], refetch: refetchHistory } = useQuery({
    queryKey: ["riasec-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("riasec_results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const progress = Math.round(((answers.filter((a) => a !== null).length) / 30) * 100);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = value;
    setAnswers(newAnswers);
    if (currentQ < 29) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    }
  };

  const calculateScores = () => {
    const scores: Record<RiasecType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    questions.forEach((q, i) => {
      scores[q.type] += answers[i] || 0;
    });
    return scores;
  };

  const getTopTypes = () => {
    const scores = calculateScores();
    return (Object.entries(scores) as [RiasecType, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  const allAnswered = answers.every((a) => a !== null);

  const saveResult = async () => {
    const scores = calculateScores();
    const topTypes = getTopTypes();
    const code = topTypes.map(([t]) => t).join("");
    const { error } = await supabase.from("riasec_results").insert({
      code,
      user_id: user!.id,
      score_r: scores.R,
      score_i: scores.I,
      score_a: scores.A,
      score_s: scores.S,
      score_e: scores.E,
      score_c: scores.C,
    });
    if (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } else {
      toast.success("تم حفظ النتيجة بنجاح!");
      setSaved(true);
      refetchHistory();
    }
  };

  const handleFinish = () => {
    if (allAnswered) {
      setShowResults(true);
      setSaved(false);
    }
  };

  const handleRestart = () => {
    setAnswers(Array(30).fill(null));
    setCurrentQ(0);
    setShowResults(false);
  };

  if (showResults) {
    const topTypes = getTopTypes();
    const scores = calculateScores();
    const code = topTypes.map(([t]) => t).join("");
    const primary = topTypes[0][0];
    const primaryInfo = typeInfo[primary];

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{primaryInfo.emoji}</div>
            <h1 className="text-2xl font-bold mb-1">نتيجة اختبار RIASEC</h1>
            <p className="text-muted-foreground">رمزك المهني: <span className="font-bold text-primary text-lg">{code}</span></p>
          </div>
        </motion.div>

        {/* Score Bars */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold mb-2">توزيع النقاط</h3>
            {(Object.entries(scores) as [RiasecType, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([type, score]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-lg w-8">{typeInfo[type].emoji}</span>
                  <span className="text-sm w-20 font-medium">{typeInfo[type].name}</span>
                  <div className="flex-1">
                    <Progress value={(score / 10) * 100} className="h-2.5" />
                  </div>
                  <span className="text-sm font-bold w-10 text-left">{score}/10</span>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Primary Type Details */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">نوع شخصيتك المهنية</h3>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-lg font-bold">{primaryInfo.emoji} {primaryInfo.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  أنت شخص يتميز بـ {primaryInfo.talents.join("، ")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Talents */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">مواهبك المحتملة</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {topTypes.flatMap(([t]) => typeInfo[t].talents).map((talent, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">{talent}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-success" />
                  <h3 className="font-semibold">نقاط القوة</h3>
                </div>
                <ul className="space-y-1.5">
                  {primaryInfo.strengths.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <h3 className="font-semibold">نقاط الضعف</h3>
                </div>
                <ul className="space-y-1.5">
                  {primaryInfo.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Fields */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">المجالات المناسبة لك</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {topTypes.flatMap(([t]) => typeInfo[t].fields).map((field, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm">{field}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills to Develop */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                <h3 className="font-semibold">مهارات يجب تطويرها</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {topTypes.flatMap(([t]) => typeInfo[t].skills).map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning-foreground text-sm border border-warning/20">{skill}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex items-center justify-center gap-3 pb-4">
          {!saved && (
            <Button onClick={saveResult} variant="hero" className="gap-2">
              <Sparkles className="h-4 w-4" />
              حفظ النتيجة
            </Button>
          )}
          <Button onClick={handleRestart} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            إعادة الاختبار
          </Button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">سجل النتائج السابقة</h3>
                </div>
                <div className="space-y-2">
                  {history.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-lg">{r.code}</span>
                        <span className="text-sm text-muted-foreground">
                          {typeInfo[r.code[0] as RiasecType]?.emoji} {typeInfo[r.code[0] as RiasecType]?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(r.created_at).toLocaleDateString("ar-SA")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">اختبار تحديد الميول والمواهب 🎯</h1>
        <p className="text-muted-foreground text-sm mt-1">اكتشف شخصيتك المهنية باستخدام نموذج RIASEC</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">السؤال {currentQ + 1} من 30</span>
          <span className="font-medium text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  {currentQ + 1}
                </span>
                <p className="text-lg font-medium leading-relaxed pt-0.5">{questions[currentQ].text}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {answerOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(opt.value)}
                    className={`rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 ${
                      answers[currentQ] === opt.value
                        ? "ring-2 ring-primary scale-[1.03] " + opt.color
                        : opt.color
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="gap-1"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Button>

        {currentQ === 29 && allAnswered ? (
          <Button onClick={handleFinish} variant="hero" className="gap-1">
            عرض النتيجة
            <Sparkles className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={() => setCurrentQ(Math.min(29, currentQ + 1))}
            disabled={currentQ === 29}
            className="gap-1"
          >
            التالي
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Question dots */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              i === currentQ
                ? "bg-primary scale-125"
                : answers[i] !== null
                ? "bg-primary/40"
                : "bg-muted-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
