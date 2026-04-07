import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import { AMIRI_FONT_BASE64 } from "@/lib/amiri-font";

// RIASEC type descriptions
const typeInfo: Record<string, { name: string; strengths: string[]; weaknesses: string[]; careers: string[] }> = {
  R: { name: "واقعي", strengths: ["مهارات يدوية وتقنية", "حل المشكلات العملية", "العمل المستقل"], weaknesses: ["التواصل الاجتماعي", "التعبير عن المشاعر", "العمل المكتبي الروتيني"], careers: ["هندسة", "صيانة", "زراعة", "تقنية"] },
  I: { name: "بحثي", strengths: ["التفكير التحليلي", "البحث والاستقصاء", "حل المشكلات المعقدة"], weaknesses: ["القيادة المباشرة", "الأعمال الروتينية", "اتخاذ قرارات سريعة"], careers: ["علوم", "طب", "بحث علمي", "رياضيات"] },
  A: { name: "فني", strengths: ["الإبداع والابتكار", "التعبير الفني", "التفكير خارج الصندوق"], weaknesses: ["الالتزام بالقواعد", "العمل المنظم", "التفاصيل الدقيقة"], careers: ["تصميم", "فنون", "كتابة", "إعلام"] },
  S: { name: "اجتماعي", strengths: ["التواصل الفعّال", "مساعدة الآخرين", "العمل الجماعي"], weaknesses: ["العمل المنفرد", "المهام التقنية", "المنافسة الحادة"], careers: ["تعليم", "إرشاد", "خدمة اجتماعية", "صحة"] },
  E: { name: "مبادر", strengths: ["القيادة والإدارة", "الإقناع والتأثير", "المبادرة"], weaknesses: ["العمل الروتيني", "التفاصيل الدقيقة", "الصبر على المهام الطويلة"], careers: ["إدارة أعمال", "تسويق", "ريادة أعمال", "مبيعات"] },
  C: { name: "تقليدي", strengths: ["التنظيم والدقة", "إدارة البيانات", "الالتزام بالقواعد"], weaknesses: ["الإبداع الحر", "التغيير المفاجئ", "القيادة"], careers: ["محاسبة", "إدارة مكتبية", "برمجة", "مالية"] },
};

export default function SmartPdfReport() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const [riasecRes, habitsRes, progressRes, quizzesRes, subjectsRes, plansRes] = await Promise.all([
        supabase.from("riasec_results").select("*").order("created_at", { ascending: false }).limit(1),
        supabase.from("habits").select("*"),
        supabase.from("habit_progress").select("*").gte("date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]),
        supabase.from("quizzes").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("subjects").select("*, lessons(id, completed)"),
        supabase.from("learning_plans").select("*").order("created_at", { ascending: false }).limit(3),
      ]);

      const riasec = riasecRes.data?.[0];
      const habits = habitsRes.data || [];
      const progress = progressRes.data || [];
      const quizzes = quizzesRes.data || [];
      const subjects = subjectsRes.data || [];
      const plans = plansRes.data || [];

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.addFileToVFS("Amiri-Regular.ttf", AMIRI_FONT_BASE64);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri", "normal");

      const pageW = 210;
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = 0;

      const checkPage = (needed: number) => {
        if (y + needed > 270) { doc.addPage(); y = 25; }
      };

      const drawTitle = (text: string, size = 16) => {
        checkPage(15);
        doc.setFontSize(size);
        doc.setTextColor(32, 128, 108);
        doc.text(text, pageW - margin, y, { align: "right" });
        y += 3;
        doc.setDrawColor(32, 128, 108);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageW - margin, y);
        y += 8;
        doc.setTextColor(30, 30, 30);
      };

      const drawText = (text: string, size = 11) => {
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, contentW);
        for (const line of lines) {
          checkPage(7);
          doc.text(line, pageW - margin, y, { align: "right" });
          y += 6;
        }
      };

      const drawBullet = (text: string) => {
        checkPage(7);
        doc.setFontSize(11);
        doc.text(`• ${text}`, pageW - margin - 5, y, { align: "right" });
        y += 6;
      };

      const drawProgressBar = (label: string, value: number) => {
        checkPage(14);
        doc.setFontSize(10);
        doc.text(`${label}: ${value}%`, pageW - margin, y, { align: "right" });
        y += 5;
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(margin, y, contentW, 4, 2, 2, "F");
        const barW = (contentW * Math.min(value, 100)) / 100;
        doc.setFillColor(32, 128, 108);
        doc.roundedRect(margin + contentW - barW, y, barW, 4, 2, 2, "F");
        y += 9;
      };

      // === Cover Page ===
      doc.setFillColor(32, 128, 108);
      doc.rect(0, 0, pageW, 100, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text("التقرير الذكي", pageW / 2, 45, { align: "center" });
      doc.setFontSize(14);
      doc.text("منصة أثر للتطوير الذاتي", pageW / 2, 58, { align: "center" });
      doc.setFontSize(11);
      doc.text(new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }), pageW / 2, 72, { align: "center" });
      doc.setTextColor(30, 30, 30);
      y = 115;

      // === Personality Section ===
      drawTitle("تحليل الشخصية (RIASEC)");
      if (riasec) {
        const codes = riasec.code.split("") as string[];
        drawText(`نوع الشخصية: ${codes.map(c => typeInfo[c]?.name || c).join(" - ")} (${riasec.code})`);
        y += 3;

        const scores = [
          { label: "واقعي", value: riasec.score_r * 10 },
          { label: "بحثي", value: riasec.score_i * 10 },
          { label: "فني", value: riasec.score_a * 10 },
          { label: "اجتماعي", value: riasec.score_s * 10 },
          { label: "مبادر", value: riasec.score_e * 10 },
          { label: "تقليدي", value: riasec.score_c * 10 },
        ];
        scores.forEach(s => drawProgressBar(s.label, s.value));

        y += 3;
        drawTitle("نقاط القوة", 13);
        codes.forEach(c => {
          typeInfo[c]?.strengths.forEach(s => drawBullet(s));
        });

        y += 3;
        drawTitle("نقاط الضعف وخطة العلاج", 13);
        codes.forEach(c => {
          typeInfo[c]?.weaknesses.forEach(w => drawBullet(`${w} ← تدرّب عليها تدريجيًا`));
        });

        y += 3;
        drawTitle("التخصصات المناسبة", 13);
        const allCareers = codes.flatMap(c => typeInfo[c]?.careers || []);
        allCareers.forEach(c => drawBullet(c));
      } else {
        drawText("لم يتم إجراء اختبار الشخصية بعد.");
      }

      // === Habits Section ===
      doc.addPage(); y = 25;
      drawTitle("تحليل العادات");
      if (habits.length > 0) {
        habits.forEach(h => {
          const completed = progress.filter(p => p.habit_id === h.id).length;
          const rate = Math.round((completed / 30) * 100);
          drawProgressBar(h.name, rate);
        });
        const avgRate = Math.round(habits.reduce((s, h) => {
          const c = progress.filter(p => p.habit_id === h.id).length;
          return s + (c / 30) * 100;
        }, 0) / habits.length);
        y += 3;
        drawText(`متوسط الالتزام بالعادات: ${avgRate}%`);
      } else {
        drawText("لا توجد عادات مسجلة.");
      }

      // === Quizzes Section ===
      y += 5;
      drawTitle("تحليل الاختبارات");
      if (quizzes.length > 0) {
        const avg = Math.round(quizzes.reduce((s, q) => s + ((q.score || 0) / (q.total_questions || 1)) * 100, 0) / quizzes.length);
        drawText(`عدد الاختبارات: ${quizzes.length}`);
        drawText(`المعدل العام: ${avg}%`);
        drawProgressBar("الأداء العام", avg);
      } else {
        drawText("لا توجد اختبارات مسجلة.");
      }

      // === Subjects ===
      y += 5;
      drawTitle("المواد والتقدم");
      if (subjects.length > 0) {
        subjects.forEach((s: any) => {
          const total = s.lessons?.length || 0;
          const done = s.lessons?.filter((l: any) => l.completed).length || 0;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          drawProgressBar(s.name, pct);
        });
      } else {
        drawText("لا توجد مواد مسجلة.");
      }

      // === 30-day Development Plan ===
      doc.addPage(); y = 25;
      drawTitle("خطة تطوير 30 يوم");
      if (riasec) {
        const codes = riasec.code.split("") as string[];
        const weaknesses = codes.flatMap(c => typeInfo[c]?.weaknesses || []);
        
        drawText("الأسبوع الأول: التقييم والوعي الذاتي");
        drawBullet("مراجعة نتائج اختبار الشخصية يوميًا");
        drawBullet("تحديد أهم 3 مهارات للتطوير");
        drawBullet("البدء بتسجيل يوميات التطوير");
        y += 3;
        
        drawText("الأسبوع الثاني: بناء العادات الأساسية");
        drawBullet("إضافة عادة يومية جديدة كل يومين");
        drawBullet("المذاكرة 30 دقيقة يوميًا");
        drawBullet("إكمال اختبار واحد يوميًا");
        y += 3;

        drawText("الأسبوع الثالث: معالجة نقاط الضعف");
        weaknesses.slice(0, 3).forEach(w => drawBullet(`تدريب على: ${w}`));
        y += 3;

        drawText("الأسبوع الرابع: التطبيق والمراجعة");
        drawBullet("مراجعة شاملة للتقدم");
        drawBullet("تحديث الأهداف للشهر القادم");
        drawBullet("مكافأة النفس على الإنجازات");
      } else {
        drawText("أكمل اختبار الشخصية للحصول على خطة تطوير مخصصة.");
      }

      // === Footer on all pages ===
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`منصة أثر - التقرير الذكي | صفحة ${i} من ${totalPages}`, pageW / 2, 290, { align: "center" });
      }

      doc.save("أثر-التقرير-الذكي.pdf");
      toast({ title: "تم تحميل التقرير بنجاح ✅" });
    } catch (err: any) {
      console.error("PDF generation error:", err);
      toast({ title: "حدث خطأ أثناء إنشاء التقرير", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button onClick={generate} disabled={generating} variant="outline" className="gap-2">
      {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {generating ? "جارِ الإنشاء..." : "تحميل التقرير الذكي"}
    </Button>
  );
}
