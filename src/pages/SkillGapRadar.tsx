import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Radar, Target, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft, BookOpen, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { careerPaths, getTopCareerPaths } from "@/data/careerPaths";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface SkillData {
  name: string;
  userLevel: number;   // 0-100
  marketLevel: number; // 0-100
  gap: number;         // marketLevel - userLevel
  category: string;
}

// Market demand data (simulated real market requirements)
const marketDemand: Record<string, { skills: { name: string; demand: number; category: string }[] }> = {
  "software-engineering": {
    skills: [
      { name: "البرمجة", demand: 95, category: "تقنية" },
      { name: "حل المشكلات", demand: 90, category: "تفكير" },
      { name: "التفكير المنطقي", demand: 85, category: "تفكير" },
      { name: "العمل الجماعي", demand: 75, category: "ناعمة" },
      { name: "التعلم الذاتي", demand: 80, category: "شخصية" },
      { name: "Git والتحكم بالإصدارات", demand: 90, category: "تقنية" },
      { name: "قواعد البيانات", demand: 85, category: "تقنية" },
      { name: "التواصل التقني", demand: 70, category: "ناعمة" },
    ],
  },
  "data-science": {
    skills: [
      { name: "Python", demand: 95, category: "تقنية" },
      { name: "الإحصاء والرياضيات", demand: 90, category: "تقنية" },
      { name: "التعلم الآلي", demand: 85, category: "تقنية" },
      { name: "التصور البياني", demand: 80, category: "تقنية" },
      { name: "التفكير التحليلي", demand: 90, category: "تفكير" },
      { name: "SQL", demand: 85, category: "تقنية" },
      { name: "التعلم الذاتي", demand: 75, category: "شخصية" },
      { name: "عرض النتائج", demand: 70, category: "ناعمة" },
    ],
  },
  "ux-design": {
    skills: [
      { name: "التصميم البصري", demand: 90, category: "تقنية" },
      { name: "بحث المستخدم", demand: 85, category: "تقنية" },
      { name: "النماذج الأولية", demand: 85, category: "تقنية" },
      { name: "التفكير الإبداعي", demand: 90, category: "تفكير" },
      { name: "التواصل", demand: 80, category: "ناعمة" },
      { name: "Figma", demand: 95, category: "تقنية" },
      { name: "التعاطف مع المستخدم", demand: 85, category: "ناعمة" },
      { name: "HTML/CSS", demand: 60, category: "تقنية" },
    ],
  },
  "project-management": {
    skills: [
      { name: "القيادة", demand: 90, category: "ناعمة" },
      { name: "التخطيط", demand: 95, category: "تفكير" },
      { name: "التواصل", demand: 90, category: "ناعمة" },
      { name: "إدارة المخاطر", demand: 80, category: "تفكير" },
      { name: "إدارة الوقت", demand: 85, category: "شخصية" },
      { name: "Agile/Scrum", demand: 85, category: "تقنية" },
      { name: "التفاوض", demand: 75, category: "ناعمة" },
      { name: "حل النزاعات", demand: 70, category: "ناعمة" },
    ],
  },
  "digital-marketing": {
    skills: [
      { name: "التسويق الرقمي", demand: 90, category: "تقنية" },
      { name: "تحليل البيانات", demand: 85, category: "تفكير" },
      { name: "كتابة المحتوى", demand: 85, category: "تقنية" },
      { name: "SEO", demand: 80, category: "تقنية" },
      { name: "إدارة الحملات", demand: 85, category: "تقنية" },
      { name: "التفكير الإبداعي", demand: 80, category: "تفكير" },
      { name: "فهم الجمهور", demand: 75, category: "ناعمة" },
      { name: "Google Analytics", demand: 80, category: "تقنية" },
    ],
  },
  "cybersecurity": {
    skills: [
      { name: "الشبكات", demand: 95, category: "تقنية" },
      { name: "أنظمة التشغيل", demand: 90, category: "تقنية" },
      { name: "تحليل الثغرات", demand: 85, category: "تقنية" },
      { name: "التفكير التحليلي", demand: 90, category: "تفكير" },
      { name: "الاهتمام بالتفاصيل", demand: 85, category: "شخصية" },
      { name: "التعلم المستمر", demand: 80, category: "شخصية" },
      { name: "البرمجة", demand: 75, category: "تقنية" },
      { name: "التقارير الأمنية", demand: 70, category: "ناعمة" },
    ],
  },
  "entrepreneurship": {
    skills: [
      { name: "القيادة", demand: 90, category: "ناعمة" },
      { name: "التفاوض", demand: 85, category: "ناعمة" },
      { name: "التفكير الاستراتيجي", demand: 90, category: "تفكير" },
      { name: "إدارة المخاطر", demand: 80, category: "تفكير" },
      { name: "المرونة", demand: 85, category: "شخصية" },
      { name: "بناء الفريق", demand: 80, category: "ناعمة" },
      { name: "التسويق", demand: 75, category: "تقنية" },
      { name: "الإدارة المالية", demand: 80, category: "تقنية" },
    ],
  },
  "content-creation": {
    skills: [
      { name: "الكتابة الإبداعية", demand: 90, category: "تقنية" },
      { name: "التصوير والمونتاج", demand: 85, category: "تقنية" },
      { name: "فهم الجمهور", demand: 80, category: "ناعمة" },
      { name: "التسويق الذاتي", demand: 80, category: "ناعمة" },
      { name: "الإبداع", demand: 95, category: "تفكير" },
      { name: "الاستمرارية", demand: 85, category: "شخصية" },
      { name: "أدوات الإنتاج", demand: 75, category: "تقنية" },
      { name: "SEO للمحتوى", demand: 70, category: "تقنية" },
    ],
  },
};

// Derive user skill levels from assessment results
function deriveUserSkills(assessments: any[], riasec: any): Record<string, number> {
  const skills: Record<string, number> = {};
  const latestByType = new Map<string, any>();
  assessments.forEach(a => { if (!latestByType.has(a.test_type)) latestByType.set(a.test_type, a); });

  // From RIASEC
  if (riasec) {
    const maxScore = 10;
    skills["التفكير المنطقي"] = Math.round((riasec.score_i / maxScore) * 100);
    skills["التفكير الإبداعي"] = Math.round((riasec.score_a / maxScore) * 100);
    skills["القيادة"] = Math.round((riasec.score_e / maxScore) * 100);
    skills["التواصل"] = Math.round((riasec.score_s / maxScore) * 100);
    skills["التنظيم"] = Math.round((riasec.score_c / maxScore) * 100);
    skills["المهارات التقنية"] = Math.round((riasec.score_r / maxScore) * 100);
  }

  // From personality assessment
  const personality = latestByType.get("personality");
  if (personality?.results) {
    const r = typeof personality.results === 'string' ? JSON.parse(personality.results) : personality.results;
    const vals = Object.values(r) as number[];
    if (vals.length >= 5) {
      skills["الانفتاح"] = Math.round(vals[0] * 10);
      skills["الانضباط"] = Math.round(vals[1] * 10);
      skills["التواصل"] = Math.max(skills["التواصل"] || 0, Math.round(vals[2] * 10));
      skills["التعاون"] = Math.round(vals[3] * 10);
      skills["الاستقرار النفسي"] = Math.round(vals[4] * 10);
    }
  }

  // From capabilities
  const capabilities = latestByType.get("capabilities");
  if (capabilities?.results) {
    const r = typeof capabilities.results === 'string' ? JSON.parse(capabilities.results) : capabilities.results;
    const vals = Object.values(r) as number[];
    if (vals.length >= 5) {
      skills["القيادة"] = Math.max(skills["القيادة"] || 0, Math.round(vals[0] * 10));
      skills["البرمجة"] = Math.round(vals[1] * 10);
      skills["التواصل"] = Math.max(skills["التواصل"] || 0, Math.round(vals[2] * 10));
      skills["التفكير التحليلي"] = Math.round(vals[3] * 10);
      skills["الإبداع"] = Math.round(vals[4] * 10);
    }
  }

  // From thinking style
  const thinking = latestByType.get("thinking");
  if (thinking?.results) {
    const r = typeof thinking.results === 'string' ? JSON.parse(thinking.results) : thinking.results;
    const vals = Object.values(r) as number[];
    if (vals.length >= 3) {
      skills["التفكير التحليلي"] = Math.max(skills["التفكير التحليلي"] || 0, Math.round(vals[0] * 10));
      skills["التفكير الإبداعي"] = Math.max(skills["التفكير الإبداعي"] || 0, Math.round(vals[1] * 10));
      skills["العمل الجماعي"] = Math.round(vals[2] * 10);
    }
  }

  // From strengths
  const strengths = latestByType.get("strengths");
  if (strengths?.results) {
    const r = typeof strengths.results === 'string' ? JSON.parse(strengths.results) : strengths.results;
    const vals = Object.values(r) as number[];
    if (vals.length >= 3) {
      skills["الانضباط"] = Math.max(skills["الانضباط"] || 0, Math.round(vals[0] * 10));
      skills["التركيز"] = Math.round(vals[1] * 10);
      skills["التعلم الذاتي"] = Math.round(vals[2] * 10);
    }
  }

  return skills;
}

// Map user skills to market skill names
function mapUserToMarket(userSkills: Record<string, number>, skillName: string): number {
  const mapping: Record<string, string[]> = {
    "البرمجة": ["البرمجة", "المهارات التقنية"],
    "حل المشكلات": ["التفكير التحليلي", "التفكير المنطقي"],
    "التفكير المنطقي": ["التفكير المنطقي", "التفكير التحليلي"],
    "العمل الجماعي": ["العمل الجماعي", "التعاون"],
    "التعلم الذاتي": ["التعلم الذاتي", "الانفتاح"],
    "التفكير التحليلي": ["التفكير التحليلي", "التفكير المنطقي"],
    "التفكير الإبداعي": ["التفكير الإبداعي", "الإبداع"],
    "القيادة": ["القيادة"],
    "التواصل": ["التواصل"],
    "التخطيط": ["التنظيم", "الانضباط"],
    "إدارة الوقت": ["الانضباط", "التنظيم"],
    "التفاوض": ["التواصل", "القيادة"],
    "المرونة": ["الاستقرار النفسي", "الانفتاح"],
    "الإبداع": ["التفكير الإبداعي", "الإبداع"],
    "التركيز": ["التركيز", "الانضباط"],
    "الانضباط": ["الانضباط"],
    "الاهتمام بالتفاصيل": ["الانضباط", "التركيز"],
    "التعلم المستمر": ["التعلم الذاتي", "الانفتاح"],
    "الاستمرارية": ["الانضباط", "التركيز"],
    "التصميم البصري": ["التفكير الإبداعي", "الإبداع"],
    "بحث المستخدم": ["التفكير التحليلي", "التواصل"],
    "النماذج الأولية": ["التفكير الإبداعي", "المهارات التقنية"],
    "التعاطف مع المستخدم": ["التواصل", "التعاون"],
    "كتابة المحتوى": ["التفكير الإبداعي", "التواصل"],
    "فهم الجمهور": ["التواصل", "التفكير التحليلي"],
    "إدارة المخاطر": ["التفكير التحليلي", "الانضباط"],
    "بناء الفريق": ["القيادة", "التواصل"],
    "التفكير الاستراتيجي": ["التفكير التحليلي", "القيادة"],
    "حل النزاعات": ["التواصل", "الاستقرار النفسي"],
    "الكتابة الإبداعية": ["التفكير الإبداعي", "الإبداع"],
    "التصوير والمونتاج": ["التفكير الإبداعي", "المهارات التقنية"],
    "التسويق الذاتي": ["التواصل", "القيادة"],
    "عرض النتائج": ["التواصل", "التفكير التحليلي"],
    "التواصل التقني": ["التواصل", "المهارات التقنية"],
    "التقارير الأمنية": ["التواصل", "الانضباط"],
  };

  const keys = mapping[skillName] || [skillName];
  let maxVal = 0;
  for (const k of keys) {
    maxVal = Math.max(maxVal, userSkills[k] || 0);
  }
  return Math.min(100, maxVal);
}

export default function SkillGapRadar() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const { data: careerAssessments = [] } = useQuery({
    queryKey: ["career-assessments-gap"],
    queryFn: async () => {
      const { data, error } = await supabase.from("career_assessments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: riasecResults = [] } = useQuery({
    queryKey: ["riasec-gap"],
    queryFn: async () => {
      const { data, error } = await supabase.from("riasec_results").select("*").order("created_at", { ascending: false }).limit(1);
      if (error) throw error;
      return data;
    },
  });

  const lastRiasec = riasecResults[0];
  const userSkills = useMemo(() => deriveUserSkills(careerAssessments, lastRiasec), [careerAssessments, lastRiasec]);

  // Auto-select best path if none selected
  const allResults: Record<string, Record<string, number>> = {};
  careerAssessments.forEach(a => {
    const r = typeof a.results === 'string' ? JSON.parse(a.results) : a.results;
    allResults[a.test_type] = r;
  });

  const topPaths = useMemo(() => getTopCareerPaths(allResults, 3), [careerAssessments]);
  const activePath = selectedPath || topPaths[0]?.path.id || "software-engineering";
  const activeCareer = careerPaths.find(p => p.id === activePath)!;
  const activeMarket = marketDemand[activePath];

  const skillData: SkillData[] = useMemo(() => {
    if (!activeMarket) return [];
    return activeMarket.skills.map(ms => {
      const userLevel = mapUserToMarket(userSkills, ms.name);
      return {
        name: ms.name,
        userLevel,
        marketLevel: ms.demand,
        gap: Math.max(0, ms.demand - userLevel),
        category: ms.category,
      };
    }).sort((a, b) => b.gap - a.gap);
  }, [activePath, userSkills]);

  const hasData = Object.keys(userSkills).length > 0;
  const avgGap = skillData.length > 0 ? Math.round(skillData.reduce((s, d) => s + d.gap, 0) / skillData.length) : 0;
  const readiness = Math.max(0, 100 - avgGap);
  const strongSkills = skillData.filter(s => s.gap <= 15);
  const weakSkills = skillData.filter(s => s.gap > 30);

  if (!hasData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">🔍 رادار فجوة المهارات</h1>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-semibold text-lg mb-2">أكمل التحليلات أولاً</h2>
          <p className="text-muted-foreground text-sm mb-4">
            لتحليل فجوة مهاراتك، أكمل اختبار الشخصية والبوصلة المهنية
          </p>
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
        <h1 className="text-2xl font-bold">🔍 رادار فجوة المهارات</h1>
        <p className="text-muted-foreground text-sm">مقارنة مهاراتك بمتطلبات سوق العمل</p>
      </div>

      {/* Path Selector */}
      <div className="flex gap-2 flex-wrap">
        {careerPaths.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPath(p.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-all ${
              activePath === p.id
                ? "bg-primary text-primary-foreground font-medium"
                : "border border-border hover:bg-secondary"
            }`}
          >
            <span>{p.icon}</span>
            <span className="hidden sm:inline">{p.name}</span>
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "الجاهزية", value: `${readiness}%`, icon: Target, color: readiness >= 70 ? "text-success bg-success/10" : readiness >= 40 ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10" },
          { label: "متوسط الفجوة", value: `${avgGap}%`, icon: AlertTriangle, color: "text-warning bg-warning/10" },
          { label: "مهارات قوية", value: strongSkills.length.toString(), icon: CheckCircle, color: "text-success bg-success/10" },
          { label: "تحتاج تطوير", value: weakSkills.length.toString(), icon: Zap, color: "text-info bg-info/10" },
        ].map((s, i) => (
          <motion.div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-card"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color} mb-2`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Radar Chart (visual bars) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Radar className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">تحليل المهارات: {activeCareer.icon} {activeCareer.name}</h2>
        </div>
        <div className="mb-3 flex gap-4 text-xs">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> مستواك</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/30" /> مطلوب في السوق</span>
        </div>
        <div className="space-y-4">
          {skillData.map((skill, i) => (
            <motion.div key={skill.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    skill.category === "تقنية" ? "bg-info/10 text-info" :
                    skill.category === "تفكير" ? "bg-primary/10 text-primary" :
                    skill.category === "ناعمة" ? "bg-success/10 text-success" :
                    "bg-warning/10 text-warning"
                  }`}>{skill.category}</span>
                  <span className="font-medium">{skill.name}</span>
                </div>
                <span className={`text-xs font-medium ${skill.gap > 30 ? "text-destructive" : skill.gap > 15 ? "text-warning" : "text-success"}`}>
                  {skill.gap > 0 ? `فجوة ${skill.gap}%` : "✓ ممتاز"}
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-muted-foreground/10 overflow-hidden">
                {/* Market requirement */}
                <div className="absolute inset-0 h-full rounded-full bg-muted-foreground/20" style={{ width: `${skill.marketLevel}%` }} />
                {/* User level */}
                <motion.div
                  className={`absolute inset-y-0 left-0 rounded-full ${skill.gap > 30 ? "bg-destructive/70" : skill.gap > 15 ? "bg-warning" : "bg-success"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.userLevel}%` }}
                  transition={{ duration: 0.6, delay: i * 0.04 }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>مستواك: {skill.userLevel}%</span>
                <span>المطلوب: {skill.marketLevel}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gap Closing Plan */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Weak Skills - Action Plan */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">خطة سد الفجوة</h2>
          </div>
          {weakSkills.length > 0 ? (
            <div className="space-y-3">
              {weakSkills.map((skill, i) => (
                <motion.div key={skill.name} className="rounded-lg border border-border p-3"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{skill.name}</span>
                    <span className="text-xs text-destructive font-medium">فجوة {skill.gap}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>📌 هدف: الوصول لمستوى {skill.marketLevel}% خلال 3 أشهر</p>
                    <p>📚 خطوة 1: دراسة الأساسيات (أسبوعين)</p>
                    <p>🛠 خطوة 2: تطبيق عملي (شهر)</p>
                    <p>🎯 خطوة 3: مشروع تطبيقي (شهر)</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">مهاراتك متوافقة مع متطلبات السوق! 🎉</p>
            </div>
          )}
        </div>

        {/* Strong Skills */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-4 w-4 text-success" />
            <h2 className="font-semibold">نقاط قوتك</h2>
          </div>
          {strongSkills.length > 0 ? (
            <div className="space-y-2">
              {strongSkills.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between rounded-lg bg-success/5 border border-success/20 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-success">💪</span>
                    <span className="text-sm font-medium">{skill.name}</span>
                  </div>
                  <span className="text-xs text-success font-medium">{skill.userLevel}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">استمر في التطوير لبناء نقاط قوة</p>
          )}

          {/* Add to learning plan CTA */}
          {weakSkills.length > 0 && (
            <Link to="/dashboard/learning-plan"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground p-3 text-sm font-medium hover:opacity-90 transition-opacity">
              <BookOpen className="h-4 w-4" />
              أضف المهارات الناقصة لخطة التعلم
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
