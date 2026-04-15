import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Map, ChevronLeft, ChevronRight, Target, Zap, BookOpen, Trophy, Briefcase, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { careerPaths, getTopCareerPaths } from "@/data/careerPaths";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const timelineStages = [
  { key: "now", label: "الآن", icon: "📍", months: 0 },
  { key: "3m", label: "3 أشهر", icon: "🚀", months: 3 },
  { key: "6m", label: "6 أشهر", icon: "⭐", months: 6 },
  { key: "12m", label: "سنة", icon: "🏆", months: 12 },
];

interface StageData {
  title: string;
  level: string;
  readiness: number;
  skills: string[];
  projects: string[];
  milestones: string[];
  tip: string;
}

function buildStageData(
  career: typeof careerPaths[0],
  currentReadiness: number,
  completedAssessments: number,
  totalAssessments: number
): Record<string, StageData> {
  const assessmentBonus = Math.round((completedAssessments / Math.max(totalAssessments, 1)) * 15);

  return {
    now: {
      title: "وضعك الحالي",
      level: currentReadiness >= 60 ? "متوسط-متقدم" : currentReadiness >= 30 ? "مبتدئ-متوسط" : "مبتدئ",
      readiness: currentReadiness,
      skills: career.requiredSkills.slice(0, 2).map(s => `أساسيات ${s}`),
      projects: [],
      milestones: [
        completedAssessments > 0 ? `✅ أكملت ${completedAssessments} تحليل` : "❌ لم تبدأ التحليلات",
        currentReadiness > 0 ? `📊 جاهزيتك ${currentReadiness}%` : "📊 ابدأ رحلتك",
      ],
      tip: "ابدأ بإكمال جميع التحليلات لتحصل على صورة واضحة عن مهاراتك",
    },
    "3m": {
      title: "بعد 3 أشهر",
      level: "مبتدئ-متوسط",
      readiness: Math.min(100, currentReadiness + 20 + assessmentBonus),
      skills: career.roadmap.months3.slice(0, 3),
      projects: career.projects.slice(0, 1),
      milestones: [
        "🎯 إتقان الأساسيات",
        "📚 إكمال دورة تأسيسية",
        `🛠 مشروع أول: ${career.projects[0] || "مشروع تطبيقي"}`,
      ],
      tip: "ركز على بناء أساس قوي وتطبيق ما تتعلمه في مشاريع صغيرة",
    },
    "6m": {
      title: "بعد 6 أشهر",
      level: "متوسط",
      readiness: Math.min(100, currentReadiness + 40 + assessmentBonus),
      skills: career.roadmap.months6.slice(0, 3),
      projects: career.projects.slice(0, 2),
      milestones: [
        "⭐ إتقان أدوات احترافية",
        `🛠 ${career.projects.length >= 2 ? career.projects[1] : "مشروع متوسط"}`,
        "🤝 بناء شبكة مهنية",
      ],
      tip: "ابدأ ببناء محفظة أعمالك وشارك في مجتمعات مهنية",
    },
    "12m": {
      title: "بعد سنة",
      level: "متوسط-متقدم",
      readiness: Math.min(100, currentReadiness + 60 + assessmentBonus),
      skills: career.roadmap.months12.slice(0, 3),
      projects: career.projects.slice(0, 3),
      milestones: [
        "🏆 محفظة أعمال قوية",
        "💼 جاهز لسوق العمل",
        "🎓 شهادة أو تخصص معتمد",
      ],
      tip: "ركز على التخصص وبناء سمعة مهنية قوية",
    },
  };
}

export default function FutureMap() {
  const [activeStage, setActiveStage] = useState(0);

  const { data: careerAssessments = [] } = useQuery({
    queryKey: ["career-assessments-map"],
    queryFn: async () => {
      const { data, error } = await supabase.from("career_assessments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: riasecResults = [] } = useQuery({
    queryKey: ["riasec-map"],
    queryFn: async () => {
      const { data, error } = await supabase.from("riasec_results").select("*").order("created_at", { ascending: false }).limit(1);
      if (error) throw error;
      return data;
    },
  });

  const { data: habits = [] } = useQuery({
    queryKey: ["habits-map"],
    queryFn: async () => {
      const { data, error } = await supabase.from("habits").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["quizzes-map"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quizzes").select("*").limit(50);
      if (error) throw error;
      return data;
    },
  });

  const lastRiasec = riasecResults[0];
  const completedTypes = new Set(careerAssessments.map(a => a.test_type));
  const totalAssessments = 5;

  // Build merged results for career matching
  const allResults: Record<string, Record<string, number>> = {};
  careerAssessments.forEach(a => {
    const r = typeof a.results === 'string' ? JSON.parse(a.results) : a.results;
    allResults[a.test_type] = r;
  });

  const topPaths = useMemo(() => getTopCareerPaths(allResults, 3), [careerAssessments]);
  const bestPath = topPaths[0]?.path || careerPaths[0];
  const matchPct = topPaths[0]?.matchPct || 0;

  // Current readiness
  const avgScore = quizzes.length > 0
    ? Math.round(quizzes.reduce((s, q) => s + ((q.score || 0) / (q.total_questions || 1)) * 100, 0) / quizzes.length) : 0;

  const currentReadiness = Math.round(
    (lastRiasec ? 15 : 0) +
    (completedTypes.size / totalAssessments) * 25 +
    (avgScore > 0 ? Math.min(avgScore * 0.2, 20) : 0) +
    (habits.length >= 3 ? 15 : habits.length * 5) +
    (quizzes.length >= 5 ? 15 : quizzes.length * 3)
  );

  const stages = useMemo(
    () => buildStageData(bestPath, currentReadiness, completedTypes.size, totalAssessments),
    [bestPath, currentReadiness, completedTypes.size]
  );

  const currentStageKey = timelineStages[activeStage].key;
  const stage = stages[currentStageKey];

  const hasData = lastRiasec || completedTypes.size > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">🗺 خريطة المستقبل</h1>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-semibold text-lg mb-2">أكمل التحليلات لرسم خريطتك</h2>
          <p className="text-muted-foreground text-sm mb-4">نحتاج لمعرفة مهاراتك وشخصيتك أولاً</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/dashboard/riasec" className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium">اختبار الشخصية</Link>
            <Link to="/dashboard/career-compass" className="border border-border rounded-lg px-4 py-2 text-sm font-medium hover:bg-secondary">البوصلة المهنية</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🗺 خريطة المستقبل</h1>
        <p className="text-muted-foreground text-sm">
          مسارك: {bestPath.icon} {bestPath.name} — توافق {matchPct}%
        </p>
      </div>

      {/* Timeline Navigation */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        {/* Progress line */}
        <div className="relative flex items-center justify-between mb-2 px-2">
          <div className="absolute inset-x-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-secondary" />
          <motion.div
            className="absolute left-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(activeStage / 3) * (100 - 12)}%` }}
            transition={{ duration: 0.4 }}
          />
          {timelineStages.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setActiveStage(i)}
              className={`relative z-10 flex flex-col items-center gap-1 transition-all ${
                i === activeStage ? "scale-110" : ""
              }`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                i <= activeStage
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-border"
              }`}>
                {s.icon}
              </div>
              <span className={`text-[10px] font-medium ${i === activeStage ? "text-primary" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="flex justify-between mt-2">
          <button
            onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
            disabled={activeStage === 0}
            className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveStage(Math.min(3, activeStage + 1))}
            disabled={activeStage === 3}
            className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stage Detail */}
      <motion.div
        key={currentStageKey}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Stage Header */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-lg">{stage.title}</h2>
              <span className="text-xs text-muted-foreground">المستوى: {stage.level}</span>
            </div>
            <div className="text-left">
              <div className={`text-2xl font-bold ${stage.readiness >= 70 ? "text-success" : stage.readiness >= 40 ? "text-warning" : "text-primary"}`}>
                {stage.readiness}%
              </div>
              <span className="text-[10px] text-muted-foreground">جاهزية</span>
            </div>
          </div>
          <Progress value={stage.readiness} className="h-2.5" />
          <p className="text-sm text-muted-foreground mt-3 bg-secondary/50 rounded-lg p-3">💡 {stage.tip}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Skills */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-info" />
              <h3 className="font-semibold text-sm">المهارات المستهدفة</h3>
            </div>
            <div className="space-y-2">
              {stage.skills.map((s, i) => (
                <motion.div
                  key={s}
                  className="flex items-start gap-2 text-sm"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <span className="text-info mt-0.5">▸</span>
                  <span>{s}</span>
                </motion.div>
              ))}
              {stage.skills.length === 0 && (
                <p className="text-xs text-muted-foreground">ابدأ رحلتك لتحديد المهارات</p>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-warning" />
              <h3 className="font-semibold text-sm">المشاريع</h3>
            </div>
            <div className="space-y-2">
              {stage.projects.length > 0 ? stage.projects.map((p, i) => (
                <motion.div
                  key={p}
                  className="flex items-start gap-2 text-sm"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <span className="text-warning mt-0.5">🛠</span>
                  <span>{p}</span>
                </motion.div>
              )) : (
                <p className="text-xs text-muted-foreground">ستبدأ المشاريع في المرحلة القادمة</p>
              )}
            </div>
          </div>

          {/* Milestones */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-success" />
              <h3 className="font-semibold text-sm">الإنجازات المتوقعة</h3>
            </div>
            <div className="space-y-2">
              {stage.milestones.map((m, i) => (
                <motion.div
                  key={m}
                  className="text-sm"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {m}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comparison Overview */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">نظرة عامة على رحلتك</h2>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {timelineStages.map((s, i) => {
            const stageData = stages[s.key];
            return (
              <motion.div
                key={s.key}
                className={`rounded-lg p-3 cursor-pointer transition-all ${
                  i === activeStage ? "bg-primary/10 border border-primary/30" : "bg-secondary/50"
                }`}
                onClick={() => setActiveStage(i)}
                whileHover={{ scale: 1.03 }}
              >
                <span className="text-lg block mb-1">{s.icon}</span>
                <span className="text-[10px] text-muted-foreground block">{s.label}</span>
                <span className={`text-lg font-bold block mt-1 ${
                  stageData.readiness >= 70 ? "text-success" : stageData.readiness >= 40 ? "text-warning" : "text-primary"
                }`}>
                  {stageData.readiness}%
                </span>
                <span className="text-[9px] text-muted-foreground">{stageData.skills.length} مهارة</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/dashboard/skill-gap"
          className="flex items-center gap-2 rounded-xl border border-border bg-card p-3.5 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <Target className="h-5 w-5 text-info" />
          <span className="text-sm font-medium">رادار المهارات</span>
        </Link>
        <Link to="/dashboard/learning-plan"
          className="flex items-center gap-2 rounded-xl border border-border bg-card p-3.5 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <BookOpen className="h-5 w-5 text-success" />
          <span className="text-sm font-medium">خطة التعلم</span>
        </Link>
      </div>
    </div>
  );
}
