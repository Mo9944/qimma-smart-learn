import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scale, Heart, Briefcase, AlertTriangle, CheckCircle2, ArrowLeft, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PsychResult, thinkingStyleInfo } from "@/data/psychAssessment";

type CareerSummary = {
  hasRiasec: boolean;
  riasecCode?: string;
  topCareers: string[];
  marketReadiness: number;
};

const careerByCode: Record<string, string[]> = {
  R: ["هندسة", "تقنية", "صيانة"],
  I: ["بحث علمي", "تحليل بيانات", "طب"],
  A: ["تصميم", "كتابة", "إعلام"],
  S: ["تعليم", "إرشاد", "موارد بشرية"],
  E: ["ريادة أعمال", "مبيعات", "إدارة"],
  C: ["محاسبة", "إدارة بيانات", "تنظيم"],
};

export default function BalanceMap() {
  const [psych, setPsych] = useState<PsychResult | null>(null);
  const [career, setCareer] = useState<CareerSummary>({ hasRiasec: false, topCareers: [], marketReadiness: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const [pRes, rRes, aRes] = await Promise.all([
      supabase.from("psych_assessments").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("riasec_results").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("career_assessments").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

    if (pRes.data) {
      setPsych({
        confidence: pRes.data.confidence,
        anxiety: pRes.data.anxiety,
        decision: pRes.data.decision_ability,
        stress: pRes.data.stress_tolerance,
        burnoutRisk: pRes.data.burnout_risk,
        thinkingStyle: pRes.data.thinking_style as PsychResult["thinkingStyle"],
      });
    }

    const rData = rRes.data;
    const careersList: string[] = [];
    if (rData?.code) {
      const codes = String(rData.code).split("");
      codes.forEach(c => {
        (careerByCode[c] || []).forEach(x => { if (!careersList.includes(x)) careersList.push(x); });
      });
    }

    const assessmentCount = (aRes.data?.length || 0) + (rData ? 1 : 0);
    const marketReadiness = Math.min(100, assessmentCount * 18);

    setCareer({
      hasRiasec: !!rData,
      riasecCode: rData?.code,
      topCareers: careersList.slice(0, 3),
      marketReadiness,
    });
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">جارٍ تحميل خريطتك...</div>;
  }

  const missing: string[] = [];
  if (!psych) missing.push("التحليل النفسي");
  if (!career.hasRiasec) missing.push("اختبار الشخصية المهنية (RIASEC)");

  if (missing.length > 0 && !psych) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 space-y-4">
        <Scale className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-bold">أكمل التحليلات أولاً</h2>
        <p className="text-muted-foreground">لرؤية خريطة التوازن، نحتاج إلى:</p>
        <ul className="text-sm space-y-1">
          {missing.map(m => <li key={m}>• {m}</li>)}
        </ul>
        <div className="flex gap-2 justify-center pt-4">
          {!psych && <Link to="/dashboard/psych-insight"><Button>ابدأ التحليل النفسي</Button></Link>}
          {!career.hasRiasec && <Link to="/dashboard/riasec"><Button variant="outline">ابدأ اختبار RIASEC</Button></Link>}
        </div>
      </div>
    );
  }

  // Generate balance insights
  const balanceInsights: { type: "warning" | "good" | "info"; text: string }[] = [];

  if (psych!.burnoutRisk >= 60) {
    balanceInsights.push({ type: "warning", text: "احتراق وظيفي محتمل — قد يؤثر على أدائك في أي مسار تختاره" });
  }
  if (psych!.anxiety >= 65 && psych!.decision < 60) {
    balanceInsights.push({ type: "warning", text: "القلق المرتفع يمنعك من اتخاذ قرارات مهنية حاسمة" });
  }
  if (psych!.confidence >= 65 && psych!.decision >= 65) {
    balanceInsights.push({ type: "good", text: "ثقتك وقدرتك على القرار تجعلانك مرشحاً قوياً للأدوار القيادية" });
  }
  if (psych!.stress < 50 && career.topCareers.some(c => ["مبيعات", "ريادة أعمال", "إدارة"].includes(c))) {
    balanceInsights.push({ type: "warning", text: "بعض المسارات المقترحة عالية الضغط — قد لا تناسب تحملك الحالي" });
  }
  if (psych!.thinkingStyle === "analytical" && career.topCareers.some(c => ["تحليل بيانات", "بحث علمي", "محاسبة"].includes(c))) {
    balanceInsights.push({ type: "good", text: "نمط تفكيرك التحليلي يتوافق تماماً مع المسارات المقترحة" });
  }
  if (balanceInsights.length === 0) {
    balanceInsights.push({ type: "info", text: "حالتك النفسية والمهنية متوازنة — استمر في التطوير المستمر" });
  }

  // 30-day plan combining both sides
  const psychPlan = [
    psych!.anxiety > 60 ? "تأمل أو تنفس عميق 10 دقائق يومياً" : "حافظ على روتين الراحة الحالي",
    psych!.confidence < 60 ? "سجّل 3 إنجازات يومياً في دفتر" : "شارك خبراتك مع الآخرين",
    psych!.burnoutRisk >= 60 ? "خصّص يوماً كاملاً للراحة أسبوعياً" : "حافظ على حدود واضحة بين العمل والراحة",
  ];
  const careerPlan = [
    career.hasRiasec ? `طوّر مهارات ${career.topCareers[0] || "تخصصك"} لمدة 30 دقيقة يومياً` : "أكمل اختبار RIASEC",
    "اقرأ مقالاً أو شاهد فيديو في مجالك يومياً",
    "اعمل على مشروع تطبيقي صغير هذا الشهر",
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mb-2">
          <Scale className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">خريطة التوازن النفسي والمهني</h1>
        <p className="text-muted-foreground">رؤية متكاملة لكيفية تأثير حالتك النفسية على مسارك المهني</p>
      </div>

      {/* Two-side overview */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-rose-500" />
            <h3 className="font-bold">الجانب النفسي</h3>
          </div>
          <div className="space-y-3 text-sm">
            <Row label="الثقة بالنفس" value={psych!.confidence} />
            <Row label="القلق" value={psych!.anxiety} invert />
            <Row label="اتخاذ القرار" value={psych!.decision} />
            <Row label="تحمّل الضغط" value={psych!.stress} />
            <div className="pt-2 border-t border-border flex justify-between">
              <span>نمط التفكير</span>
              <span className="font-medium">{thinkingStyleInfo[psych!.thinkingStyle].icon} {thinkingStyleInfo[psych!.thinkingStyle].name}</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-primary" />
            <h3 className="font-bold">الجانب المهني</h3>
          </div>
          <div className="space-y-3 text-sm">
            <Row label="الجاهزية للسوق" value={career.marketReadiness} />
            {career.riasecCode && (
              <div className="flex justify-between">
                <span>رمز الشخصية</span>
                <span className="font-bold">{career.riasecCode}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border">
              <div className="text-muted-foreground mb-2">أفضل المسارات:</div>
              <div className="flex flex-wrap gap-1.5">
                {career.topCareers.length > 0 ? career.topCareers.map(c => (
                  <span key={c} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{c}</span>
                )) : <span className="text-muted-foreground text-xs">أكمل اختبار RIASEC</span>}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Balance insights */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          كيف يؤثر النفسي على المهني؟
        </h3>
        <div className="space-y-3">
          {balanceInsights.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex gap-3 p-3 rounded-lg ${
                ins.type === "warning" ? "bg-amber-500/10 border border-amber-500/30" :
                ins.type === "good" ? "bg-emerald-500/10 border border-emerald-500/30" :
                "bg-muted/50 border border-border"
              }`}
            >
              {ins.type === "warning" ? <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" /> :
               ins.type === "good" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> :
               <Scale className="h-5 w-5 shrink-0 text-muted-foreground" />}
              <p className="text-sm">{ins.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Combined 30-day plan */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-bold mb-3 text-rose-600 dark:text-rose-400">خطة نفسية (30 يوم)</h3>
          <ul className="space-y-2 text-sm">
            {psychPlan.map((p, i) => (
              <li key={i} className="flex gap-2"><span className="text-primary">✓</span><span>{p}</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-bold mb-3 text-primary">خطة مهنية (30 يوم)</h3>
          <ul className="space-y-2 text-sm">
            {careerPlan.map((p, i) => (
              <li key={i} className="flex gap-2"><span className="text-primary">✓</span><span>{p}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link to="/dashboard/ai-mentor">
          <Button className="gap-2">
            <MessageCircle className="h-4 w-4" />
            اسأل المرشد الذكي
          </Button>
        </Link>
        <Link to="/dashboard/psych-insight">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            عودة للتحليل النفسي
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  const good = invert ? value < 50 : value >= 60;
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span>{label}</span>
        <span className={`font-bold ${good ? "text-emerald-600 dark:text-emerald-400" : value < 40 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${good ? "bg-emerald-500" : value < 40 ? "bg-rose-500" : "bg-amber-500"}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
