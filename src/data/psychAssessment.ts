export type PsychQuestion = {
  id: number;
  text: string;
  dimension: "confidence" | "anxiety" | "decision" | "stress" | "thinking";
  options: { label: string; value: number; thinking?: string }[];
};

// Likert scale: 1 (low) - 5 (high). For "anxiety" higher = more anxiety.
const likert = (positive = true) => [
  { label: "أوافق بشدة", value: positive ? 5 : 1 },
  { label: "أوافق", value: positive ? 4 : 2 },
  { label: "محايد", value: 3 },
  { label: "لا أوافق", value: positive ? 2 : 4 },
  { label: "لا أوافق إطلاقاً", value: positive ? 1 : 5 },
];

export const psychQuestions: PsychQuestion[] = [
  // Confidence (positive items → higher = more confidence)
  { id: 1, text: "أشعر بثقة عند مواجهة تحديات جديدة", dimension: "confidence", options: likert(true) },
  { id: 2, text: "أؤمن بقدرتي على تحقيق أهدافي", dimension: "confidence", options: likert(true) },
  { id: 3, text: "أتقبّل نقد الآخرين دون أن يهز ثقتي", dimension: "confidence", options: likert(true) },

  // Anxiety (positive wording about anxiety → higher = more anxious)
  { id: 4, text: "أقلق كثيراً بشأن مستقبلي المهني", dimension: "anxiety", options: likert(true) },
  { id: 5, text: "أفكر في السيناريوهات السلبية قبل اتخاذ القرار", dimension: "anxiety", options: likert(true) },
  { id: 6, text: "أشعر بضيق عند التفكير في الفشل", dimension: "anxiety", options: likert(true) },

  // Decision ability
  { id: 7, text: "أتخذ قراراتي بسرعة وثقة", dimension: "decision", options: likert(true) },
  { id: 8, text: "أحدد الخيارات المتاحة قبل أن أحسم أمري", dimension: "decision", options: likert(true) },
  { id: 9, text: "نادراً ما أتراجع عن قرار اتخذته", dimension: "decision", options: likert(true) },

  // Stress tolerance
  { id: 10, text: "أحافظ على هدوئي تحت الضغط", dimension: "stress", options: likert(true) },
  { id: 11, text: "أستطيع العمل في بيئة سريعة الإيقاع", dimension: "stress", options: likert(true) },
  { id: 12, text: "أتعافى بسرعة من المواقف الصعبة", dimension: "stress", options: likert(true) },

  // Thinking style (single-select per question, weighted)
  {
    id: 13, text: "عند مواجهة مشكلة، أميل إلى:", dimension: "thinking",
    options: [
      { label: "تحليل الأرقام والبيانات", value: 0, thinking: "analytical" },
      { label: "الاستماع لمشاعري ومشاعر الآخرين", value: 0, thinking: "emotional" },
      { label: "البحث عن حل عملي وسريع", value: 0, thinking: "practical" },
      { label: "أتردد وأحتاج وقتاً للتفكير", value: 0, thinking: "hesitant" },
    ],
  },
  {
    id: 14, text: "أكثر ما يقنعني عند اتخاذ قرار:", dimension: "thinking",
    options: [
      { label: "الأدلة المنطقية والإحصائيات", value: 0, thinking: "analytical" },
      { label: "الإحساس الداخلي والحدس", value: 0, thinking: "emotional" },
      { label: "التجربة الفعلية والنتائج", value: 0, thinking: "practical" },
      { label: "آراء الآخرين وتأييدهم", value: 0, thinking: "hesitant" },
    ],
  },
  {
    id: 15, text: "في فريق عمل، دوري الطبيعي هو:", dimension: "thinking",
    options: [
      { label: "المحلل الذي يدرس البيانات", value: 0, thinking: "analytical" },
      { label: "المتعاطف الذي يحفّز الفريق", value: 0, thinking: "emotional" },
      { label: "المنفّذ الذي ينجز المهام", value: 0, thinking: "practical" },
      { label: "المراقب الذي يحتاج توجيهاً", value: 0, thinking: "hesitant" },
    ],
  },
];

export type PsychResult = {
  confidence: number;      // 0-100
  anxiety: number;         // 0-100
  decision: number;        // 0-100
  stress: number;          // 0-100
  burnoutRisk: number;     // 0-100
  thinkingStyle: "analytical" | "emotional" | "practical" | "hesitant";
};

export function scorePsych(answers: Record<number, number | string>): PsychResult {
  const dims: Record<string, { sum: number; count: number; max: number }> = {
    confidence: { sum: 0, count: 0, max: 5 },
    anxiety: { sum: 0, count: 0, max: 5 },
    decision: { sum: 0, count: 0, max: 5 },
    stress: { sum: 0, count: 0, max: 5 },
  };
  const thinkingCounts: Record<string, number> = { analytical: 0, emotional: 0, practical: 0, hesitant: 0 };

  for (const q of psychQuestions) {
    const ans = answers[q.id];
    if (ans === undefined) continue;
    if (q.dimension === "thinking") {
      const opt = q.options.find(o => String(o.thinking) === String(ans));
      if (opt?.thinking) thinkingCounts[opt.thinking] = (thinkingCounts[opt.thinking] || 0) + 1;
    } else {
      const num = typeof ans === "number" ? ans : parseInt(String(ans));
      if (!isNaN(num)) {
        dims[q.dimension].sum += num;
        dims[q.dimension].count += 1;
      }
    }
  }

  const pct = (d: string) => {
    const { sum, count, max } = dims[d];
    if (count === 0) return 0;
    return Math.round((sum / (count * max)) * 100);
  };

  const confidence = pct("confidence");
  const anxiety = pct("anxiety");
  const decision = pct("decision");
  const stress = pct("stress");

  // Burnout risk = high anxiety + low stress tolerance + low confidence
  const burnoutRisk = Math.round((anxiety * 0.5 + (100 - stress) * 0.3 + (100 - confidence) * 0.2));

  const thinkingStyle = (Object.entries(thinkingCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "analytical") as PsychResult["thinkingStyle"];

  return { confidence, anxiety, decision, stress, burnoutRisk, thinkingStyle };
}

export const thinkingStyleInfo: Record<PsychResult["thinkingStyle"], { name: string; desc: string; icon: string }> = {
  analytical: { name: "تحليلي", desc: "تعتمد على المنطق والبيانات في قراراتك", icon: "🧮" },
  emotional: { name: "عاطفي", desc: "توازن بين العقل والمشاعر بحس عالٍ", icon: "💗" },
  practical: { name: "عملي", desc: "تركّز على النتائج والتنفيذ السريع", icon: "⚙️" },
  hesitant: { name: "متردد", desc: "تحتاج وقتاً ودعماً قبل الحسم", icon: "🤔" },
};

export function buildInsights(r: PsychResult) {
  const strengths: string[] = [];
  const obstacles: string[] = [];
  const tips: string[] = [];

  if (r.confidence >= 65) strengths.push("ثقة عالية بالنفس تساعدك على المبادرة");
  else obstacles.push("انخفاض الثقة بالنفس قد يعيق اتخاذ المبادرات");

  if (r.decision >= 65) strengths.push("قدرة جيدة على اتخاذ القرارات بحسم");
  else obstacles.push("التردد في اتخاذ القرارات");

  if (r.stress >= 65) strengths.push("تحمّل ممتاز للضغوط");
  else obstacles.push("حساسية مرتفعة تجاه الضغط");

  if (r.anxiety <= 40) strengths.push("مستوى قلق منخفض ومتزن");
  else if (r.anxiety >= 65) obstacles.push("قلق مرتفع بشأن المستقبل");

  if (r.burnoutRisk >= 60) obstacles.push("احتمال احتراق وظيفي مرتفع");

  // Tips
  if (r.confidence < 60) tips.push("سجّل إنجازاتك الصغيرة يومياً لرفع ثقتك");
  if (r.anxiety > 60) tips.push("جرّب تمارين التنفس العميق 5 دقائق يومياً");
  if (r.decision < 60) tips.push("استخدم قائمة إيجابيات/سلبيات قبل أي قرار مهم");
  if (r.stress < 60) tips.push("قسّم مهامك الكبيرة إلى خطوات صغيرة قابلة للإنجاز");
  if (r.burnoutRisk >= 60) tips.push("خصّص يوماً أسبوعياً للراحة الكاملة بعيداً عن الضغوط");
  if (tips.length === 0) tips.push("حافظ على روتينك الحالي فهو متوازن");

  return { strengths, obstacles, tips };
}
