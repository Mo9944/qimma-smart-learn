export type AssessmentQuestion = {
  id: number;
  text: string;
  options: { label: string; value: string; score: Record<string, number> }[];
};

export type AssessmentType = "personality" | "capabilities" | "strengths" | "thinking" | "learning";

export const assessmentMeta: Record<AssessmentType, { title: string; desc: string; icon: string; color: string }> = {
  personality: { title: "تحليل الشخصية", desc: "اكتشف نمط شخصيتك وسماتك الأساسية", icon: "🧠", color: "from-violet-500 to-purple-600" },
  capabilities: { title: "تحليل القدرات", desc: "قيّم قدراتك التقنية والناعمة والقيادية", icon: "💪", color: "from-blue-500 to-cyan-600" },
  strengths: { title: "نقاط القوة والضعف", desc: "تعرّف على نقاط قوتك وفرص التحسين", icon: "⚡", color: "from-amber-500 to-orange-600" },
  thinking: { title: "أسلوب التفكير", desc: "اكتشف طريقة تفكيرك وتحليلك للمواقف", icon: "🎯", color: "from-emerald-500 to-teal-600" },
  learning: { title: "أسلوب التعلم", desc: "حدد الطريقة الأفضل لتعلّمك", icon: "📚", color: "from-rose-500 to-pink-600" },
};

// ── Personality (Big Five simplified) ──
export const personalityQuestions: AssessmentQuestion[] = [
  { id: 1, text: "أستمتع بالتواصل مع أشخاص جدد", options: [
    { label: "أوافق بشدة", value: "a", score: { extroversion: 3 } },
    { label: "أوافق", value: "b", score: { extroversion: 2 } },
    { label: "محايد", value: "c", score: { extroversion: 1 } },
    { label: "لا أوافق", value: "d", score: { introversion: 2 } },
  ]},
  { id: 2, text: "أفضّل التخطيط المسبق قبل أي عمل", options: [
    { label: "أوافق بشدة", value: "a", score: { organized: 3 } },
    { label: "أوافق", value: "b", score: { organized: 2 } },
    { label: "محايد", value: "c", score: { organized: 1 } },
    { label: "لا أوافق", value: "d", score: { flexible: 2 } },
  ]},
  { id: 3, text: "أتعامل مع الضغوط بهدوء", options: [
    { label: "أوافق بشدة", value: "a", score: { stable: 3 } },
    { label: "أوافق", value: "b", score: { stable: 2 } },
    { label: "محايد", value: "c", score: { stable: 1 } },
    { label: "لا أوافق", value: "d", score: { sensitive: 2 } },
  ]},
  { id: 4, text: "أحب تجربة أشياء جديدة ومختلفة", options: [
    { label: "أوافق بشدة", value: "a", score: { openness: 3 } },
    { label: "أوافق", value: "b", score: { openness: 2 } },
    { label: "محايد", value: "c", score: { openness: 1 } },
    { label: "لا أوافق", value: "d", score: { traditional: 2 } },
  ]},
  { id: 5, text: "أهتم بمشاعر الآخرين واحتياجاتهم", options: [
    { label: "أوافق بشدة", value: "a", score: { agreeable: 3 } },
    { label: "أوافق", value: "b", score: { agreeable: 2 } },
    { label: "محايد", value: "c", score: { agreeable: 1 } },
    { label: "لا أوافق", value: "d", score: { independent: 2 } },
  ]},
  { id: 6, text: "أفضّل العمل الفردي على الجماعي", options: [
    { label: "أوافق بشدة", value: "a", score: { introversion: 3 } },
    { label: "أوافق", value: "b", score: { introversion: 2 } },
    { label: "محايد", value: "c", score: { introversion: 1 } },
    { label: "لا أوافق", value: "d", score: { extroversion: 2 } },
  ]},
  { id: 7, text: "أتخذ قراراتي بناءً على المنطق أكثر من المشاعر", options: [
    { label: "أوافق بشدة", value: "a", score: { analytical: 3 } },
    { label: "أوافق", value: "b", score: { analytical: 2 } },
    { label: "محايد", value: "c", score: { analytical: 1 } },
    { label: "لا أوافق", value: "d", score: { emotional: 2 } },
  ]},
  { id: 8, text: "أشعر بالطاقة بعد قضاء وقت مع الناس", options: [
    { label: "أوافق بشدة", value: "a", score: { extroversion: 3 } },
    { label: "أوافق", value: "b", score: { extroversion: 2 } },
    { label: "محايد", value: "c", score: { extroversion: 1 } },
    { label: "لا أوافق", value: "d", score: { introversion: 2 } },
  ]},
  { id: 9, text: "أحب الالتزام بروتين يومي ثابت", options: [
    { label: "أوافق بشدة", value: "a", score: { organized: 3 } },
    { label: "أوافق", value: "b", score: { organized: 2 } },
    { label: "محايد", value: "c", score: { organized: 1 } },
    { label: "لا أوافق", value: "d", score: { flexible: 2 } },
  ]},
  { id: 10, text: "أميل للإبداع والابتكار في حل المشكلات", options: [
    { label: "أوافق بشدة", value: "a", score: { openness: 3, creative: 2 } },
    { label: "أوافق", value: "b", score: { openness: 2, creative: 1 } },
    { label: "محايد", value: "c", score: { openness: 1 } },
    { label: "لا أوافق", value: "d", score: { traditional: 2 } },
  ]},
];

// ── Capabilities ──
export const capabilitiesQuestions: AssessmentQuestion[] = [
  { id: 1, text: "أستطيع استخدام الحاسوب والبرامج بكفاءة", options: [
    { label: "ممتاز", value: "a", score: { technical: 3 } },
    { label: "جيد", value: "b", score: { technical: 2 } },
    { label: "متوسط", value: "c", score: { technical: 1 } },
    { label: "ضعيف", value: "d", score: { technical: 0 } },
  ]},
  { id: 2, text: "أجيد التواصل والعرض أمام الآخرين", options: [
    { label: "ممتاز", value: "a", score: { communication: 3 } },
    { label: "جيد", value: "b", score: { communication: 2 } },
    { label: "متوسط", value: "c", score: { communication: 1 } },
    { label: "ضعيف", value: "d", score: { communication: 0 } },
  ]},
  { id: 3, text: "أستطيع قيادة فريق وتوجيهه نحو هدف", options: [
    { label: "ممتاز", value: "a", score: { leadership: 3 } },
    { label: "جيد", value: "b", score: { leadership: 2 } },
    { label: "متوسط", value: "c", score: { leadership: 1 } },
    { label: "ضعيف", value: "d", score: { leadership: 0 } },
  ]},
  { id: 4, text: "أجيد تحليل البيانات واستخلاص النتائج", options: [
    { label: "ممتاز", value: "a", score: { analytical: 3 } },
    { label: "جيد", value: "b", score: { analytical: 2 } },
    { label: "متوسط", value: "c", score: { analytical: 1 } },
    { label: "ضعيف", value: "d", score: { analytical: 0 } },
  ]},
  { id: 5, text: "أستطيع حل المشكلات المعقدة بطرق مبتكرة", options: [
    { label: "ممتاز", value: "a", score: { problemSolving: 3 } },
    { label: "جيد", value: "b", score: { problemSolving: 2 } },
    { label: "متوسط", value: "c", score: { problemSolving: 1 } },
    { label: "ضعيف", value: "d", score: { problemSolving: 0 } },
  ]},
  { id: 6, text: "أجيد إدارة وقتي وتنظيم أولوياتي", options: [
    { label: "ممتاز", value: "a", score: { timeManagement: 3 } },
    { label: "جيد", value: "b", score: { timeManagement: 2 } },
    { label: "متوسط", value: "c", score: { timeManagement: 1 } },
    { label: "ضعيف", value: "d", score: { timeManagement: 0 } },
  ]},
  { id: 7, text: "أستطيع التكيف مع التغييرات المفاجئة", options: [
    { label: "ممتاز", value: "a", score: { adaptability: 3 } },
    { label: "جيد", value: "b", score: { adaptability: 2 } },
    { label: "متوسط", value: "c", score: { adaptability: 1 } },
    { label: "ضعيف", value: "d", score: { adaptability: 0 } },
  ]},
  { id: 8, text: "أجيد العمل ضمن فريق والتعاون مع الآخرين", options: [
    { label: "ممتاز", value: "a", score: { teamwork: 3 } },
    { label: "جيد", value: "b", score: { teamwork: 2 } },
    { label: "متوسط", value: "c", score: { teamwork: 1 } },
    { label: "ضعيف", value: "d", score: { teamwork: 0 } },
  ]},
  { id: 9, text: "أستطيع التفاوض والإقناع بفعالية", options: [
    { label: "ممتاز", value: "a", score: { negotiation: 3 } },
    { label: "جيد", value: "b", score: { negotiation: 2 } },
    { label: "متوسط", value: "c", score: { negotiation: 1 } },
    { label: "ضعيف", value: "d", score: { negotiation: 0 } },
  ]},
  { id: 10, text: "أجيد البحث والتعلم الذاتي", options: [
    { label: "ممتاز", value: "a", score: { selfLearning: 3 } },
    { label: "جيد", value: "b", score: { selfLearning: 2 } },
    { label: "متوسط", value: "c", score: { selfLearning: 1 } },
    { label: "ضعيف", value: "d", score: { selfLearning: 0 } },
  ]},
];

// ── Strengths & Weaknesses ──
export const strengthsQuestions: AssessmentQuestion[] = [
  { id: 1, text: "أنجز المهام في الوقت المحدد دائماً", options: [
    { label: "دائماً", value: "a", score: { discipline: 3 } },
    { label: "غالباً", value: "b", score: { discipline: 2 } },
    { label: "أحياناً", value: "c", score: { discipline: 1 } },
    { label: "نادراً", value: "d", score: { discipline: 0 } },
  ]},
  { id: 2, text: "أستطيع التركيز لفترات طويلة دون تشتت", options: [
    { label: "دائماً", value: "a", score: { focus: 3 } },
    { label: "غالباً", value: "b", score: { focus: 2 } },
    { label: "أحياناً", value: "c", score: { focus: 1 } },
    { label: "نادراً", value: "d", score: { focus: 0 } },
  ]},
  { id: 3, text: "أتعلم من أخطائي وأطور أدائي", options: [
    { label: "دائماً", value: "a", score: { growth: 3 } },
    { label: "غالباً", value: "b", score: { growth: 2 } },
    { label: "أحياناً", value: "c", score: { growth: 1 } },
    { label: "نادراً", value: "d", score: { growth: 0 } },
  ]},
  { id: 4, text: "أحافظ على هدوئي تحت الضغط", options: [
    { label: "دائماً", value: "a", score: { resilience: 3 } },
    { label: "غالباً", value: "b", score: { resilience: 2 } },
    { label: "أحياناً", value: "c", score: { resilience: 1 } },
    { label: "نادراً", value: "d", score: { resilience: 0 } },
  ]},
  { id: 5, text: "أبادر بأفكار جديدة في العمل أو الدراسة", options: [
    { label: "دائماً", value: "a", score: { initiative: 3 } },
    { label: "غالباً", value: "b", score: { initiative: 2 } },
    { label: "أحياناً", value: "c", score: { initiative: 1 } },
    { label: "نادراً", value: "d", score: { initiative: 0 } },
  ]},
  { id: 6, text: "أطلب المساعدة عندما أحتاجها", options: [
    { label: "دائماً", value: "a", score: { selfAwareness: 3 } },
    { label: "غالباً", value: "b", score: { selfAwareness: 2 } },
    { label: "أحياناً", value: "c", score: { selfAwareness: 1 } },
    { label: "نادراً", value: "d", score: { selfAwareness: 0 } },
  ]},
  { id: 7, text: "ألتزم بالوعود والمواعيد", options: [
    { label: "دائماً", value: "a", score: { reliability: 3 } },
    { label: "غالباً", value: "b", score: { reliability: 2 } },
    { label: "أحياناً", value: "c", score: { reliability: 1 } },
    { label: "نادراً", value: "d", score: { reliability: 0 } },
  ]},
  { id: 8, text: "أتقبل النقد البنّاء وأعمل به", options: [
    { label: "دائماً", value: "a", score: { growth: 3 } },
    { label: "غالباً", value: "b", score: { growth: 2 } },
    { label: "أحياناً", value: "c", score: { growth: 1 } },
    { label: "نادراً", value: "d", score: { growth: 0 } },
  ]},
  { id: 9, text: "أضع أهدافاً واضحة وأسعى لتحقيقها", options: [
    { label: "دائماً", value: "a", score: { goalSetting: 3 } },
    { label: "غالباً", value: "b", score: { goalSetting: 2 } },
    { label: "أحياناً", value: "c", score: { goalSetting: 1 } },
    { label: "نادراً", value: "d", score: { goalSetting: 0 } },
  ]},
  { id: 10, text: "أحافظ على توازن بين العمل والراحة", options: [
    { label: "دائماً", value: "a", score: { balance: 3 } },
    { label: "غالباً", value: "b", score: { balance: 2 } },
    { label: "أحياناً", value: "c", score: { balance: 1 } },
    { label: "نادراً", value: "d", score: { balance: 0 } },
  ]},
];

// ── Thinking Style ──
export const thinkingQuestions: AssessmentQuestion[] = [
  { id: 1, text: "عندما أواجه مشكلة، أميل إلى:", options: [
    { label: "تحليلها منطقياً خطوة بخطوة", value: "a", score: { analytical: 3 } },
    { label: "البحث عن حل إبداعي غير تقليدي", value: "b", score: { creative: 3 } },
    { label: "مناقشتها مع الآخرين", value: "c", score: { collaborative: 3 } },
    { label: "اتخاذ قرار سريع بناءً على حدسي", value: "d", score: { intuitive: 3 } },
  ]},
  { id: 2, text: "عند اتخاذ قرار مهم:", options: [
    { label: "أجمع كل البيانات والحقائق أولاً", value: "a", score: { analytical: 3 } },
    { label: "أفكر في كل الاحتمالات الممكنة", value: "b", score: { creative: 3 } },
    { label: "أستشير أشخاص أثق بهم", value: "c", score: { collaborative: 3 } },
    { label: "أتبع شعوري الداخلي", value: "d", score: { intuitive: 3 } },
  ]},
  { id: 3, text: "أفضل العمل في بيئة:", options: [
    { label: "منظمة وواضحة القواعد", value: "a", score: { analytical: 3 } },
    { label: "مرنة تسمح بالتجريب", value: "b", score: { creative: 3 } },
    { label: "تعاونية وجماعية", value: "c", score: { collaborative: 3 } },
    { label: "حرة وبدون قيود", value: "d", score: { intuitive: 3 } },
  ]},
  { id: 4, text: "عند تعلم شيء جديد:", options: [
    { label: "أقرأ التعليمات والوثائق أولاً", value: "a", score: { analytical: 3 } },
    { label: "أجرب بنفسي مباشرة", value: "b", score: { creative: 3 } },
    { label: "أتعلم من شخص خبير", value: "c", score: { collaborative: 3 } },
    { label: "أتبع حدسي وأكتشف الطريق", value: "d", score: { intuitive: 3 } },
  ]},
  { id: 5, text: "الطريقة التي أشرح بها الأفكار:", options: [
    { label: "بالأرقام والبيانات", value: "a", score: { analytical: 3 } },
    { label: "بالرسوم والقصص", value: "b", score: { creative: 3 } },
    { label: "بالحوار والنقاش", value: "c", score: { collaborative: 3 } },
    { label: "بأمثلة من تجربتي", value: "d", score: { intuitive: 3 } },
  ]},
  { id: 6, text: "ما يحفزني أكثر هو:", options: [
    { label: "فهم كيف تعمل الأشياء", value: "a", score: { analytical: 3 } },
    { label: "صنع شيء جديد ومبتكر", value: "b", score: { creative: 3 } },
    { label: "مساعدة الآخرين والتأثير فيهم", value: "c", score: { collaborative: 3 } },
    { label: "تحقيق رؤيتي الخاصة", value: "d", score: { intuitive: 3 } },
  ]},
  { id: 7, text: "عند مواجهة خلاف:", options: [
    { label: "أعتمد على الحقائق والمنطق", value: "a", score: { analytical: 3 } },
    { label: "أبحث عن حل وسط مبتكر", value: "b", score: { creative: 3 } },
    { label: "أستمع لكل الأطراف", value: "c", score: { collaborative: 3 } },
    { label: "أتبع ما أشعر أنه صحيح", value: "d", score: { intuitive: 3 } },
  ]},
  { id: 8, text: "أستمتع أكثر بـ:", options: [
    { label: "حل الألغاز والمسائل", value: "a", score: { analytical: 3 } },
    { label: "الفنون والتصميم", value: "b", score: { creative: 3 } },
    { label: "الأنشطة الجماعية", value: "c", score: { collaborative: 3 } },
    { label: "التأمل والتفكير العميق", value: "d", score: { intuitive: 3 } },
  ]},
];

// ── Learning Style (VARK) ──
export const learningQuestions: AssessmentQuestion[] = [
  { id: 1, text: "أفضل طريقة لتعلم مفهوم جديد:", options: [
    { label: "مشاهدة فيديو أو رسم توضيحي", value: "a", score: { visual: 3 } },
    { label: "الاستماع لشرح صوتي", value: "b", score: { auditory: 3 } },
    { label: "القراءة والكتابة عنه", value: "c", score: { reading: 3 } },
    { label: "تجربته عملياً", value: "d", score: { kinesthetic: 3 } },
  ]},
  { id: 2, text: "عند مراجعة الدروس أفضل:", options: [
    { label: "خرائط ذهنية ورسوم بيانية", value: "a", score: { visual: 3 } },
    { label: "تسجيلات صوتية للمحاضرات", value: "b", score: { auditory: 3 } },
    { label: "ملخصات مكتوبة", value: "c", score: { reading: 3 } },
    { label: "تمارين وتطبيقات عملية", value: "d", score: { kinesthetic: 3 } },
  ]},
  { id: 3, text: "أتذكر المعلومات بشكل أفضل عندما:", options: [
    { label: "أراها في صور أو مخططات", value: "a", score: { visual: 3 } },
    { label: "أسمعها من شخص يشرحها", value: "b", score: { auditory: 3 } },
    { label: "أدوّنها بخط يدي", value: "c", score: { reading: 3 } },
    { label: "أطبقها بنفسي", value: "d", score: { kinesthetic: 3 } },
  ]},
  { id: 4, text: "في الاجتماعات أفضل:", options: [
    { label: "عروض تقديمية مرئية", value: "a", score: { visual: 3 } },
    { label: "المناقشة الشفهية", value: "b", score: { auditory: 3 } },
    { label: "وثائق ومحاضر مكتوبة", value: "c", score: { reading: 3 } },
    { label: "ورش عمل تفاعلية", value: "d", score: { kinesthetic: 3 } },
  ]},
  { id: 5, text: "لفهم جهاز جديد:", options: [
    { label: "أنظر للصور والرسومات التوضيحية", value: "a", score: { visual: 3 } },
    { label: "أطلب من شخص أن يشرح لي", value: "b", score: { auditory: 3 } },
    { label: "أقرأ دليل الاستخدام", value: "c", score: { reading: 3 } },
    { label: "أبدأ بتجربته مباشرة", value: "d", score: { kinesthetic: 3 } },
  ]},
  { id: 6, text: "عند التحضير لاختبار:", options: [
    { label: "أرسم مخططات وألوّن النقاط المهمة", value: "a", score: { visual: 3 } },
    { label: "أشرح المادة بصوت عالي لنفسي", value: "b", score: { auditory: 3 } },
    { label: "أعيد كتابة الملاحظات", value: "c", score: { reading: 3 } },
    { label: "أحل تمارين وأمثلة", value: "d", score: { kinesthetic: 3 } },
  ]},
  { id: 7, text: "أفضل المعلم الذي:", options: [
    { label: "يستخدم الصور والشرائح", value: "a", score: { visual: 3 } },
    { label: "يشرح بأسلوب سردي ممتع", value: "b", score: { auditory: 3 } },
    { label: "يوزع مذكرات وملخصات", value: "c", score: { reading: 3 } },
    { label: "يعطي أنشطة تطبيقية", value: "d", score: { kinesthetic: 3 } },
  ]},
  { id: 8, text: "عند تذكر موقف سابق أتذكر:", options: [
    { label: "المشاهد والصور", value: "a", score: { visual: 3 } },
    { label: "الأصوات والكلمات", value: "b", score: { auditory: 3 } },
    { label: "ما كتبته أو قرأته حينها", value: "c", score: { reading: 3 } },
    { label: "ما فعلته وشعرت به", value: "d", score: { kinesthetic: 3 } },
  ]},
];

// Result descriptions
export const personalityResults: Record<string, { name: string; desc: string }> = {
  extroversion: { name: "اجتماعي منفتح", desc: "تستمد طاقتك من التفاعل مع الآخرين وتستمتع بالعمل الجماعي" },
  introversion: { name: "متأمل ومركّز", desc: "تفضل العمل الهادئ والتفكير العميق وتبدع في البيئات الهادئة" },
  organized: { name: "منظم ومنهجي", desc: "تحب التخطيط والترتيب وتعمل بكفاءة مع الهياكل الواضحة" },
  flexible: { name: "مرن وعفوي", desc: "تتكيف بسرعة مع التغييرات وتفضل الحرية في العمل" },
  openness: { name: "منفتح على التجارب", desc: "تحب الاستكشاف والابتكار وتبحث دائماً عن الجديد" },
  stable: { name: "مستقر عاطفياً", desc: "تتعامل مع الضغوط بهدوء وتحافظ على توازنك" },
  agreeable: { name: "متعاون ولطيف", desc: "تهتم بالآخرين وتسعى لبناء علاقات إيجابية" },
  analytical: { name: "تحليلي ومنطقي", desc: "تعتمد على البيانات والحقائق في اتخاذ قراراتك" },
};

export const thinkingResults: Record<string, { name: string; desc: string }> = {
  analytical: { name: "تفكير تحليلي", desc: "تتميز بالدقة والمنطق في تحليل المشكلات والوصول لحلول مبنية على البيانات" },
  creative: { name: "تفكير إبداعي", desc: "تبتكر حلولاً غير تقليدية وترى الأشياء من زوايا مختلفة" },
  collaborative: { name: "تفكير تعاوني", desc: "تؤمن بقوة الجماعة وتبني الأفكار من خلال الحوار والتفاعل" },
  intuitive: { name: "تفكير حدسي", desc: "تعتمد على خبرتك وحدسك في اتخاذ القرارات بسرعة وثقة" },
};

export const learningResults: Record<string, { name: string; desc: string; tips: string[] }> = {
  visual: { name: "بصري", desc: "تتعلم بشكل أفضل من خلال الصور والرسوم والمخططات", tips: ["استخدم الخرائط الذهنية", "شاهد فيديوهات تعليمية", "لوّن ملاحظاتك", "ارسم المفاهيم"] },
  auditory: { name: "سمعي", desc: "تتعلم بشكل أفضل من خلال الاستماع والمناقشة", tips: ["استمع لبودكاست تعليمي", "سجل ملاحظاتك صوتياً", "ناقش المواضيع مع آخرين", "اشرح لنفسك بصوت عالي"] },
  reading: { name: "قرائي/كتابي", desc: "تتعلم بشكل أفضل من خلال القراءة والكتابة", tips: ["اكتب ملخصات بخطك", "اقرأ من مصادر متعددة", "دوّن ملاحظات أثناء الدروس", "أعد كتابة المفاهيم الصعبة"] },
  kinesthetic: { name: "حركي/عملي", desc: "تتعلم بشكل أفضل من خلال التطبيق والممارسة", tips: ["نفذ مشاريع تطبيقية", "تعلم بالتجربة والخطأ", "استخدم أدوات تفاعلية", "حرّك جسمك أثناء المراجعة"] },
};

export function getQuestions(type: AssessmentType): AssessmentQuestion[] {
  switch (type) {
    case "personality": return personalityQuestions;
    case "capabilities": return capabilitiesQuestions;
    case "strengths": return strengthsQuestions;
    case "thinking": return thinkingQuestions;
    case "learning": return learningQuestions;
  }
}

export function calculateScores(answers: Record<number, string>, questions: AssessmentQuestion[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const opt = q.options.find(o => o.value === answer);
    if (!opt) continue;
    for (const [key, val] of Object.entries(opt.score)) {
      scores[key] = (scores[key] || 0) + val;
    }
  }
  return scores;
}

export function getTopTraits(scores: Record<string, number>, count = 3): [string, number][] {
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, count);
}
