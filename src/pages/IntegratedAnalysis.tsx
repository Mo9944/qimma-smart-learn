import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Brain, Heart, Target, Download, Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { AMIRI_FONT_BASE64 } from "@/lib/amiri-font";
import { FUTURE_SKILLS } from "@/data/futureSkills";

const RIASEC_NAMES: Record<string, string> = { R: "واقعي", I: "بحثي", A: "فني", S: "اجتماعي", E: "مبادر", C: "تقليدي" };
const RIASEC_CAREERS: Record<string, string[]> = {
  R: ["هندسة ميكانيكية", "تقنية معلومات", "صيانة"],
  I: ["علم البيانات", "أبحاث AI", "طب"],
  A: ["تصميم UX", "إخراج", "تصميم جرافيكي"],
  S: ["تعليم", "موارد بشرية", "إرشاد نفسي"],
  E: ["ريادة أعمال", "إدارة منتجات", "مبيعات"],
  C: ["محاسبة", "تحليل مالي", "إدارة عمليات"],
};

function recommendSkills(topRiasec: string[]) {
  const map: Record<string, string[]> = {
    I: ["ai_ml", "data_science", "python", "critical_thinking"],
    R: ["devops", "robotic_automation", "cloud"],
    A: ["ux_design", "graphic_design", "creativity"],
    S: ["communication", "emotional_intel", "mentoring"],
    E: ["leadership", "negotiation", "product_mgmt"],
    C: ["sql", "finance_analysis", "project_mgmt"],
  };
  const ids = new Set<string>();
  topRiasec.forEach(t => (map[t] || []).forEach(x => ids.add(x)));
  return FUTURE_SKILLS.filter(s => ids.has(s.id));
}

export default function IntegratedAnalysis() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [riasec, setRiasec] = useState<any>(null);
  const [psych, setPsych] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [r, p, a] = await Promise.all([
        supabase.from("riasec_results").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("psych_assessments").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("career_assessments").select("*").order("created_at", { ascending: false }),
      ]);
      setRiasec(r.data); setPsych(p.data); setAssessments(a.data || []);
      setLoading(false);
    })();
  }, []);

  const topRiasec: string[] = riasec ? riasec.code.split("").slice(0, 3) : [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const careers: string[] = [];

  if (riasec) {
    topRiasec.forEach(t => {
      strengths.push(`قوة في النمط ${RIASEC_NAMES[t]}`);
      careers.push(...(RIASEC_CAREERS[t] || []));
    });
    const bottom = ["R", "I", "A", "S", "E", "C"].filter(c => !topRiasec.includes(c));
    bottom.slice(0, 2).forEach(t => weaknesses.push(`ضعف نسبي في النمط ${RIASEC_NAMES[t]}`));
  }
  if (psych) {
    if (psych.confidence < 50) weaknesses.push("ثقة بالنفس منخفضة — تحتاج تدريب");
    else strengths.push(`ثقة بالنفس عالية (${psych.confidence}%)`);
    if (psych.anxiety > 60) weaknesses.push(`قلق مرتفع (${psych.anxiety}%) — تمارين تنظيم`);
    if (psych.burnout_risk > 60) weaknesses.push(`خطر احتراق وظيفي (${psych.burnout_risk}%)`);
    if (psych.decision_ability >= 60) strengths.push("قدرة جيدة على اتخاذ القرار");
    if (psych.stress_tolerance >= 60) strengths.push("تحمّل ضغط جيد");
  }

  const recommended = recommendSkills(topRiasec);
  const completedTypes = new Set(assessments.map(a => a.test_type));
  const completion = riasec && psych
    ? Math.round((((riasec ? 1 : 0) + (psych ? 1 : 0) + completedTypes.size) / (2 + 5)) * 100)
    : 0;

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.addFileToVFS("Amiri-Regular.ttf", AMIRI_FONT_BASE64);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri", "normal");

      const pageW = 210, margin = 20, contentW = pageW - margin * 2;
      let y = 0;
      const next = (n: number) => { if (y + n > 275) { doc.addPage(); y = 25; } };
      const title = (t: string, s = 15) => {
        next(14); doc.setFontSize(s); doc.setTextColor(32, 128, 108);
        doc.text(t, pageW - margin, y, { align: "right" });
        y += 3; doc.setDrawColor(32, 128, 108); doc.line(margin, y, pageW - margin, y); y += 8;
        doc.setTextColor(30, 30, 30);
      };
      const txt = (t: string, s = 11) => {
        doc.setFontSize(s);
        doc.splitTextToSize(t, contentW).forEach((l: string) => { next(7); doc.text(l, pageW - margin, y, { align: "right" }); y += 6; });
      };
      const bul = (t: string) => { next(7); doc.setFontSize(11); doc.text(`• ${t}`, pageW - margin - 4, y, { align: "right" }); y += 6; };
      const bar = (label: string, val: number) => {
        next(13); doc.setFontSize(10); doc.text(`${label}: ${val}%`, pageW - margin, y, { align: "right" }); y += 5;
        doc.setFillColor(230, 230, 230); doc.roundedRect(margin, y, contentW, 4, 2, 2, "F");
        const w = (contentW * Math.min(val, 100)) / 100;
        doc.setFillColor(32, 128, 108); doc.roundedRect(margin + contentW - w, y, w, 4, 2, 2, "F"); y += 9;
      };

      // Cover
      doc.setFillColor(32, 128, 108); doc.rect(0, 0, pageW, 95, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(26);
      doc.text("التحليل المتكامل", pageW / 2, 42, { align: "center" });
      doc.setFontSize(13); doc.text("نفسي · مهني · مهارات", pageW / 2, 55, { align: "center" });
      doc.setFontSize(10);
      doc.text(new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }), pageW / 2, 70, { align: "center" });
      doc.setTextColor(30, 30, 30); y = 110;

      title("ملخص اكتمال التحليل");
      bar("اكتمال البيانات", completion);

      title("التحليل النفسي");
      if (psych) {
        bar("الثقة بالنفس", psych.confidence);
        bar("القلق", psych.anxiety);
        bar("اتخاذ القرار", psych.decision_ability);
        bar("تحمّل الضغط", psych.stress_tolerance);
        bar("خطر الاحتراق الوظيفي", psych.burnout_risk);
        txt(`نمط التفكير: ${psych.thinking_style}`);
      } else txt("لم يُكمل التحليل النفسي بعد.");

      title("تحليل الشخصية (RIASEC)");
      if (riasec) {
        txt(`الكود: ${riasec.code} — ${topRiasec.map(t => RIASEC_NAMES[t]).join(" / ")}`);
        bar("واقعي R", riasec.score_r * 10); bar("بحثي I", riasec.score_i * 10);
        bar("فني A", riasec.score_a * 10); bar("اجتماعي S", riasec.score_s * 10);
        bar("مبادر E", riasec.score_e * 10); bar("تقليدي C", riasec.score_c * 10);
      } else txt("لم يُكمل اختبار RIASEC.");

      title("نقاط القوة");
      strengths.forEach(bul);
      title("نقاط الضعف وخطة المعالجة");
      weaknesses.forEach(bul);

      title("المسارات المهنية المقترحة");
      Array.from(new Set(careers)).forEach(bul);

      title("فجوة المهارات — مهارات يجب تطويرها");
      recommended.slice(0, 10).forEach(s => bul(`${s.nameAr} (طلب ${s.demand}% · نمو ${s.growth}%)`));

      title("خطة 30 يوم");
      txt("الأسبوع 1: مراجعة نتائج التقييمات وتحديد 3 أولويات.");
      txt("الأسبوع 2: البدء بكورس واحد في أعلى مهارة مقترحة.");
      txt("الأسبوع 3: تطبيق عملي + معالجة نقطة ضعف نفسية واحدة.");
      txt("الأسبوع 4: مراجعة + تحديث الخطة الشهرية القادمة.");

      const total = doc.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
        doc.text(`أثر · التحليل المتكامل · ${i}/${total}`, pageW / 2, 290, { align: "center" });
      }
      doc.save("أثر-التحليل-المتكامل.pdf");
      toast.success("تم تحميل التقرير المتكامل");
    } catch (e) {
      console.error(e); toast.error("تعذر إنشاء التقرير");
    } finally { setGenerating(false); }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" /> التحليل المتكامل
        </h1>
        <p className="text-sm text-muted-foreground mt-1">يجمع نتائج جميع تحليلاتك في تقرير واحد + خطة 30 يوم</p>
      </div>

      <Card className="p-5 bg-gradient-to-br from-primary/10 to-card border-primary/30">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">اكتمال التحليل</div>
            <div className="text-3xl font-bold text-primary">{completion}%</div>
          </div>
          <Button onClick={generatePDF} disabled={generating} size="lg" className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            تحميل التقرير الشامل PDF
          </Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-rose-500" /><h3 className="font-semibold text-sm">التحليل النفسي</h3>
          </div>
          {psych ? (
            <div className="space-y-1 text-sm">
              <div>الثقة: <b>{psych.confidence}%</b></div>
              <div>القلق: <b>{psych.anxiety}%</b></div>
              <div>القرار: <b>{psych.decision_ability}%</b></div>
              <div>تحمّل الضغط: <b>{psych.stress_tolerance}%</b></div>
              <div>الاحتراق: <b>{psych.burnout_risk}%</b></div>
            </div>
          ) : <Link to="/dashboard/psych-insight"><Button variant="outline" size="sm" className="w-full">ابدأ الاختبار</Button></Link>}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-primary" /><h3 className="font-semibold text-sm">RIASEC</h3>
          </div>
          {riasec ? (
            <div>
              <div className="text-2xl font-bold text-primary mb-2">{riasec.code}</div>
              <div className="flex flex-wrap gap-1">
                {topRiasec.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{RIASEC_NAMES[t]}</Badge>)}
              </div>
            </div>
          ) : <Link to="/dashboard/riasec"><Button variant="outline" size="sm" className="w-full">ابدأ الاختبار</Button></Link>}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-success" /><h3 className="font-semibold text-sm">تقييمات مكتملة</h3>
          </div>
          <div className="text-2xl font-bold text-success">{completedTypes.size}/5</div>
          <Link to="/dashboard/career-compass"><Button variant="outline" size="sm" className="w-full mt-2">إكمال البوصلة</Button></Link>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-success" /><h3 className="font-semibold text-sm">نقاط القوة</h3>
          </div>
          {strengths.length ? (
            <ul className="space-y-1.5 text-sm">{strengths.map((s, i) => <li key={i}>✓ {s}</li>)}</ul>
          ) : <p className="text-xs text-muted-foreground">أكمل التقييمات لعرض نقاط القوة</p>}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning" /><h3 className="font-semibold text-sm">نقاط الضعف</h3>
          </div>
          {weaknesses.length ? (
            <ul className="space-y-1.5 text-sm">{weaknesses.map((w, i) => <li key={i}>! {w}</li>)}</ul>
          ) : <p className="text-xs text-muted-foreground">لم تُحدد نقاط ضعف بعد</p>}
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">المهارات المقترحة لك (فجوة المهارات)</h3>
        {recommended.length ? (
          <div className="grid sm:grid-cols-2 gap-2">
            {recommended.slice(0, 8).map(s => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-sm">
                <span>{s.nameAr}</span>
                <Badge variant="outline" className="text-[10px]">{s.demand}%</Badge>
              </motion.div>
            ))}
          </div>
        ) : <p className="text-xs text-muted-foreground">أكمل اختبار RIASEC لاقتراح مهارات مخصصة</p>}
        <Link to="/dashboard/skills-match" className="inline-block mt-3">
          <Button variant="outline" size="sm" className="gap-2">عرض كامل التطابق <ArrowLeft className="h-3 w-3" /></Button>
        </Link>
      </Card>
    </div>
  );
}
