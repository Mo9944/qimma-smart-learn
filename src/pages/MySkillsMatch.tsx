import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Sparkles, Loader2, ExternalLink, BookOpen, Video, Wrench, FileText,
  CheckCircle2, AlertTriangle, TrendingUp, Brain, Rocket, Award, RefreshCw, MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { computeMatch, buildPath, SKILL_RESOURCES, type MatchSummary, type SkillMatchScore, type UserProfile } from "@/data/skillsMatch";
import type { FutureSkill } from "@/data/futureSkills";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

const resourceIcon = (t: string) =>
  t === "course" ? <BookOpen className="h-3.5 w-3.5" /> :
  t === "video" ? <Video className="h-3.5 w-3.5" /> :
  t === "book" ? <FileText className="h-3.5 w-3.5" /> :
  t === "practice" ? <Wrench className="h-3.5 w-3.5" /> :
  <FileText className="h-3.5 w-3.5" />;

export default function MySkillsMatch() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [match, setMatch] = useState<MatchSummary | null>(null);

  const [activeSkill, setActiveSkill] = useState<FutureSkill | null>(null);

  const [planStreaming, setPlanStreaming] = useState(false);
  const [plan, setPlan] = useState("");

  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const [riasecRes, careerRes, psychRes, habitsRes, plansRes] = await Promise.all([
        supabase.from("riasec_results").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("career_assessments").select("test_type, result_code").order("created_at", { ascending: false }).limit(10),
        supabase.from("psych_assessments").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("habits").select("name").limit(20),
        supabase.from("learning_plans").select("user_goal").limit(10),
      ]);
      const p: UserProfile = {
        riasec: riasecRes.data,
        careerAssessments: careerRes.data || [],
        psych: psychRes.data,
        habits: habitsRes.data || [],
        learningGoals: plansRes.data || [],
      };
      setProfile(p);
      setMatch(computeMatch(p));
    } catch (e: any) {
      toast.error("تعذّر تحميل بياناتك: " + (e.message || ""));
    } finally {
      setLoading(false);
    }
  }

  const path = useMemo(() => match ? buildPath(match.recommendedSkills) : [], [match]);

  async function generatePlan() {
    if (!match) return;
    setPlanStreaming(true);
    setPlan("");
    const summary = `نسبة التطابق: ${match.overallMatchPct}%
أهم 3 ميول RIASEC: ${match.topRiasec.join("-") || "غير متوفر"}
المهارات المقترحة (مرتّبة): ${match.recommendedSkills.slice(0, 6).map(r => r.skill.nameAr).join("، ")}
المهارات المكتسبة: ${match.acquiredSkills.map(r => r.skill.nameAr).join("، ") || "لم نرصد بعد"}
فجوات عالية الطلب: ${match.gapSkills.map(r => r.skill.nameAr).join("، ") || "—"}
إشارات شخصية: ${match.signals.join(" | ") || "—"}
${profile?.psych ? `نفسي: ثقة ${profile.psych.confidence}% | قلق ${profile.psych.anxiety}% | احتراق ${profile.psych.burnout_risk}%` : ""}`;

    try {
      const resp = await fetch(AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ tool: "skills_plan_90", text: summary }),
      });

      if (resp.status === 429) { toast.error("تم تجاوز حد الطلبات، حاول لاحقاً"); setPlanStreaming(false); return; }
      if (resp.status === 402) { toast.error("يلزم شحن رصيد AI"); setPlanStreaming(false); return; }
      if (!resp.ok || !resp.body) throw new Error("فشل في توليد الخطة");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try {
            const c = JSON.parse(j).choices?.[0]?.delta?.content;
            if (c) { acc += c; setPlan(acc); }
          } catch { buf = line + "\n" + buf; break; }
        }
      }

      // Save to learning_plans for persistence
      await supabase.from("learning_plans").insert({
        user_goal: `خطة 90 يوم — مهارات المستقبل (تطابق ${match.overallMatchPct}%)`,
        daily_time: 60,
        duration: "12 أسبوع",
        plan_content: acc,
      });
      toast.success("تم توليد الخطة وحفظها ✨");
    } catch (e: any) {
      toast.error(e.message || "تعذّر التوليد");
    } finally {
      setPlanStreaming(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!match) return null;

  const noData = !profile?.riasec && !profile?.psych && !(profile?.careerAssessments?.length);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">تطابقك مع مهارات المستقبل</h1>
            <p className="text-sm text-muted-foreground">حساب فعلي مبني على تحليلاتك داخل أثر</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadProfile}>
          <RefreshCw className="h-4 w-4 ml-1" /> تحديث
        </Button>
      </motion.div>

      {noData && (
        <Card className="p-4 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">لتحسين دقة التطابق، أكمل أولاً:</p>
              <ul className="list-disc pr-5 space-y-1 text-muted-foreground">
                <li>اختبار الشخصية المهنية (RIASEC)</li>
                <li>التحليل النفسي</li>
                <li>أو أضف عاداتك وأهدافك</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Match Score Hero */}
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="p-6 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-cyan-950/40 border-teal-200 dark:border-teal-800">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 flex flex-col items-center text-center">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                  <motion.circle
                    cx="50" cy="50" r="44"
                    stroke="url(#gradMatch)" strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - match.overallMatchPct / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradMatch" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(173 80% 40%)" />
                      <stop offset="100%" stopColor="hsl(160 70% 45%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-teal-700 dark:text-teal-300">{match.overallMatchPct}%</span>
                  <span className="text-xs text-muted-foreground">تطابق</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 max-w-xs">
                مبني على RIASEC + تحليلك النفسي + عاداتك + أهدافك
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white/70 dark:bg-card/60 p-3 text-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{match.acquiredSkills.length}</div>
                  <div className="text-xs text-muted-foreground">مكتسبة</div>
                </div>
                <div className="rounded-lg bg-white/70 dark:bg-card/60 p-3 text-center">
                  <Sparkles className="h-5 w-5 text-teal-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{match.recommendedSkills.length}</div>
                  <div className="text-xs text-muted-foreground">موصى بها</div>
                </div>
                <div className="rounded-lg bg-white/70 dark:bg-card/60 p-3 text-center">
                  <AlertTriangle className="h-5 w-5 text-rose-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{match.gapSkills.length}</div>
                  <div className="text-xs text-muted-foreground">فجوات</div>
                </div>
              </div>

              {match.signals.length > 0 && (
                <div className="space-y-1.5">
                  {match.signals.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-teal-600 mt-0.5">•</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="recommended" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="recommended"><Sparkles className="h-4 w-4 ml-1" /> الموصى بها</TabsTrigger>
          <TabsTrigger value="gaps"><AlertTriangle className="h-4 w-4 ml-1" /> الفجوات</TabsTrigger>
          <TabsTrigger value="path"><MapPin className="h-4 w-4 ml-1" /> المسار التفاعلي</TabsTrigger>
          <TabsTrigger value="plan"><Rocket className="h-4 w-4 ml-1" /> خطة 90 يوم</TabsTrigger>
        </TabsList>

        {/* RECOMMENDED */}
        <TabsContent value="recommended" className="space-y-3">
          {match.recommendedSkills.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">لا توجد توصيات بعد — أكمل تحليلاتك</Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {match.recommendedSkills.map((s, i) => (
                <SkillCard key={s.skill.id} entry={s} idx={i} onOpen={() => setActiveSkill(s.skill)} />
              ))}
            </div>
          )}
          {match.acquiredSkills.length > 0 && (
            <div className="pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> مهاراتك المكتسبة (مرصودة من بياناتك)
              </h3>
              <div className="flex flex-wrap gap-2">
                {match.acquiredSkills.map(s => (
                  <Badge key={s.skill.id} variant="secondary" className="cursor-pointer" onClick={() => setActiveSkill(s.skill)}>
                    ✓ {s.skill.nameAr}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* GAPS */}
        <TabsContent value="gaps" className="space-y-3">
          {match.gapSkills.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">لا توجد فجوات حرجة 🎉</Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">مهارات عالية الطلب عالمياً (≥80%) لا تظهر بعد في عاداتك أو خططك:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {match.gapSkills.map((s, i) => (
                  <motion.div key={s.skill.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="p-4 border-r-4 border-r-rose-400 hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveSkill(s.skill)}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-sm">{s.skill.nameAr}</h4>
                          <p className="text-xs text-muted-foreground">{s.skill.name}</p>
                        </div>
                        <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-100">فجوة</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">طلب عالمي: <span className="font-bold text-teal-600">{s.skill.demand}%</span></span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />+{s.skill.growth}%
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* INTERACTIVE PATH */}
        <TabsContent value="path" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-teal-600" /> مسارك التفاعلي للـ 90 يوم</h3>
              <div className="flex gap-2">
                {[1, 2, 3].map(m => (
                  <button key={m} onClick={() => setActiveStage(m as 1 | 2 | 3)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeStage === m
                        ? "bg-teal-600 text-white shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}>
                    شهر {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual timeline */}
            <div className="relative mb-6">
              <div className="absolute top-4 right-0 left-0 h-1 bg-muted rounded-full" />
              <div className="absolute top-4 right-0 h-1 bg-gradient-to-l from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(activeStage / 3) * 100}%` }} />
              <div className="relative grid grid-cols-3 gap-2">
                {path.map(stage => (
                  <button key={stage.month} onClick={() => setActiveStage(stage.month)}
                    className="flex flex-col items-center gap-2">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      activeStage >= stage.month
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "bg-card border-muted text-muted-foreground"
                    }`}>
                      {stage.month}
                    </div>
                    <span className={`text-xs text-center ${activeStage === stage.month ? "font-bold text-teal-700 dark:text-teal-300" : "text-muted-foreground"}`}>
                      {stage.month === 1 ? "الأساسيات" : stage.month === 2 ? "التعمّق" : "الإطلاق"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {path.filter(s => s.month === activeStage).map(stage => (
                <motion.div key={stage.month} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div>
                    <h4 className="font-bold text-lg">{stage.title}</h4>
                    <p className="text-sm text-muted-foreground">{stage.goal}</p>
                  </div>

                  {stage.skills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">المهارات المستهدفة:</p>
                      <div className="flex flex-wrap gap-2">
                        {stage.skills.map(sk => (
                          <Badge key={sk.id} className="cursor-pointer bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900/40 dark:text-teal-200" onClick={() => setActiveSkill(sk)}>
                            {sk.nameAr}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">المعالم (انقر لإكمال):</p>
                    <div className="space-y-2">
                      {stage.milestones.map((m, i) => {
                        const key = `m${stage.month}-${i}`;
                        const done = !!completedMilestones[key];
                        return (
                          <button key={key} onClick={() => setCompletedMilestones(p => ({ ...p, [key]: !done }))}
                            className={`w-full flex items-center gap-3 rounded-lg border p-3 text-right transition-all ${
                              done ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300" : "border-border hover:bg-muted/40"
                            }`}>
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border-2 ${
                              done ? "bg-emerald-600 border-emerald-600" : "border-muted-foreground/30"
                            }`}>
                              {done && <CheckCircle2 className="h-4 w-4 text-white" />}
                            </div>
                            <span className={`text-sm flex-1 ${done ? "line-through text-muted-foreground" : ""}`}>{m}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </Card>
        </TabsContent>

        {/* AI 90-DAY PLAN */}
        <TabsContent value="plan" className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="font-bold flex items-center gap-2"><Rocket className="h-5 w-5 text-teal-600" /> خطة 90 يوم بالذكاء الاصطناعي</h3>
                <p className="text-xs text-muted-foreground mt-1">مولّدة بناءً على تحليلاتك الفعلية وتُحفظ تلقائياً في خططك</p>
              </div>
              <Button onClick={generatePlan} disabled={planStreaming} size="sm">
                {planStreaming ? <><Loader2 className="h-4 w-4 ml-1 animate-spin" /> جاري التوليد...</> : <><Sparkles className="h-4 w-4 ml-1" /> {plan ? "إعادة التوليد" : "توليد الخطة"}</>}
              </Button>
            </div>

            {plan ? (
              <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">اضغط "توليد الخطة" لإنشاء خطة 90 يوم مخصصة لك</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Skill Detail Dialog */}
      <Dialog open={!!activeSkill} onOpenChange={() => setActiveSkill(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh]" dir="rtl">
          {activeSkill && (
            <>
              <DialogHeader>
                <DialogTitle className="text-right flex items-center gap-2">
                  <Brain className="h-5 w-5 text-teal-600" />
                  {activeSkill.nameAr}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[65vh] pr-2">
                <div className="space-y-4 text-right">
                  <p className="text-sm text-muted-foreground">{activeSkill.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-teal-50 dark:bg-teal-950/30 p-2">
                      <div className="font-bold text-teal-700 dark:text-teal-300 text-lg">{activeSkill.demand}%</div>
                      <div className="text-muted-foreground">طلب عالمي</div>
                    </div>
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2">
                      <div className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">{activeSkill.growth > 0 ? "+" : ""}{activeSkill.growth}%</div>
                      <div className="text-muted-foreground">نمو سنوي</div>
                    </div>
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2">
                      <div className="font-bold text-amber-700 dark:text-amber-300 text-lg">
                        {activeSkill.avgSalaryUsd ? `$${(activeSkill.avgSalaryUsd / 1000).toFixed(0)}k` : "—"}
                      </div>
                      <div className="text-muted-foreground">متوسط راتب</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-teal-600" /> مصادر تعلّم موصى بها
                    </h4>
                    {(SKILL_RESOURCES[activeSkill.id] || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">سيتم إضافة مصادر قريباً.</p>
                    ) : (
                      <div className="space-y-2">
                        {SKILL_RESOURCES[activeSkill.id].map((r, i) => (
                          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="text-teal-600">{resourceIcon(r.type)}</span>
                              <span className="text-sm">{r.title}</span>
                              {r.free && <Badge variant="secondary" className="text-[10px]">مجاني</Badge>}
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SkillCard({ entry, idx, onOpen }: { entry: SkillMatchScore; idx: number; onOpen: () => void }) {
  const { skill, fit, reason } = entry;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
      <Card className="p-4 cursor-pointer hover:shadow-md transition-all h-full" onClick={onOpen}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-bold text-sm">{skill.nameAr}</h4>
            <p className="text-xs text-muted-foreground">{skill.name}</p>
          </div>
          <Badge variant={skill.type === "hard" ? "default" : "secondary"} className="text-[10px]">
            {skill.type === "hard" ? "تقنية" : "ناعمة"}
          </Badge>
        </div>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">ملاءمتك الشخصية</span>
              <span className="font-bold text-teal-600">{fit}%</span>
            </div>
            <Progress value={fit} className="h-1.5" />
          </div>
          <p className="text-[11px] text-muted-foreground italic">💡 {reason}</p>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border">
            <span className="text-muted-foreground">طلب عالمي: <span className="font-bold text-foreground">{skill.demand}%</span></span>
            <span className={`font-bold flex items-center gap-0.5 ${skill.growth > 0 ? "text-emerald-600" : "text-rose-600"}`}>
              <TrendingUp className="h-2.5 w-2.5" />{skill.growth > 0 ? "+" : ""}{skill.growth}%
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
