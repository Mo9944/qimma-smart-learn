export interface CareerPath {
  id: string;
  name: string;
  icon: string;
  description: string;
  advantages: string[];
  challenges: string[];
  requiredSkills: string[];
  roadmap: {
    months3: string[];
    months6: string[];
    months12: string[];
  };
  tools: string[];
  projects: string[];
  // Trait weights for matching
  weights: Record<string, number>;
}

export const careerPaths: CareerPath[] = [
  {
    id: "software-engineering",
    name: "هندسة البرمجيات",
    icon: "💻",
    description: "تطوير البرمجيات والتطبيقات وحل المشكلات التقنية المعقدة",
    advantages: ["طلب مرتفع في سوق العمل", "رواتب ممتازة", "إمكانية العمل عن بعد", "تعلم مستمر"],
    challenges: ["تحديث مستمر للمهارات", "ضغط المواعيد النهائية", "الجلوس لساعات طويلة"],
    requiredSkills: ["البرمجة", "حل المشكلات", "التفكير المنطقي", "العمل الجماعي", "التعلم الذاتي"],
    roadmap: {
      months3: ["تعلم أساسيات البرمجة (Python أو JavaScript)", "فهم هياكل البيانات الأساسية", "بناء مشروع بسيط (موقع ويب أو تطبيق)"],
      months6: ["إتقان إطار عمل (React أو Django)", "تعلم قواعد البيانات وSQL", "بناء 2-3 مشاريع متوسطة", "المشاركة في مجتمعات برمجية"],
      months12: ["التخصص في مجال (Frontend/Backend/Mobile)", "بناء مشروع كامل قابل للنشر", "المساهمة في مشاريع مفتوحة المصدر", "التحضير لمقابلات العمل"],
    },
    tools: ["VS Code", "Git & GitHub", "Figma", "Docker", "AWS/GCP"],
    projects: ["تطبيق إدارة مهام", "متجر إلكتروني", "تطبيق دردشة", "لوحة تحكم بيانات"],
    weights: { technical: 5, analytical: 4, problemSolving: 4, selfLearning: 3, creative: 2, introversion: 2, organized: 2, focus: 3 },
  },
  {
    id: "data-science",
    name: "علم البيانات والذكاء الاصطناعي",
    icon: "📊",
    description: "تحليل البيانات واستخلاص الرؤى وبناء نماذج الذكاء الاصطناعي",
    advantages: ["مجال سريع النمو", "تأثير كبير على القرارات", "رواتب عالية جداً", "تنوع الصناعات"],
    challenges: ["يتطلب خلفية رياضية", "بيانات فوضوية أحياناً", "منحنى تعلم حاد"],
    requiredSkills: ["الرياضيات والإحصاء", "البرمجة (Python/R)", "التفكير التحليلي", "التصور البياني", "التعلم الآلي"],
    roadmap: {
      months3: ["تعلم Python وأساسيات الإحصاء", "فهم مكتبات Pandas و NumPy", "تحليل مجموعات بيانات بسيطة"],
      months6: ["تعلم التعلم الآلي مع Scikit-learn", "إتقان التصور البياني (Matplotlib/Plotly)", "بناء 2-3 مشاريع تحليلية", "فهم SQL وقواعد البيانات"],
      months12: ["التعمق في Deep Learning (TensorFlow/PyTorch)", "بناء نموذج AI كامل", "المشاركة في مسابقات Kaggle", "بناء محفظة أعمال قوية"],
    },
    tools: ["Jupyter Notebook", "Python", "TensorFlow", "Tableau", "SQL"],
    projects: ["تحليل مبيعات شركة", "نظام توصيات", "تصنيف صور", "توقع أسعار"],
    weights: { analytical: 5, technical: 4, problemSolving: 3, organized: 3, focus: 3, selfLearning: 3, introversion: 1 },
  },
  {
    id: "ux-design",
    name: "تصميم تجربة المستخدم (UX/UI)",
    icon: "🎨",
    description: "تصميم واجهات وتجارب مستخدم سلسة وجذابة",
    advantages: ["إبداع يومي", "تأثير مباشر على المنتج", "طلب متزايد", "عمل متنوع"],
    challenges: ["إقناع الفرق بالتصاميم", "تغييرات متكررة", "مواكبة الاتجاهات"],
    requiredSkills: ["التصميم البصري", "فهم المستخدم", "النماذج الأولية", "التفكير الإبداعي", "التواصل"],
    roadmap: {
      months3: ["تعلم أساسيات التصميم (اللون، الخط، التخطيط)", "إتقان Figma", "دراسة مبادئ UX الأساسية"],
      months6: ["تعلم بحث المستخدم واختبار القابلية", "بناء 3-4 مشاريع تصميم", "تعلم التصميم التفاعلي (Prototyping)", "دراسة Design Systems"],
      months12: ["بناء محفظة أعمال احترافية", "التخصص (Mobile/Web/Product)", "تعلم أساسيات HTML/CSS", "العمل على مشروع حقيقي مع فريق"],
    },
    tools: ["Figma", "Adobe XD", "Sketch", "InVision", "Maze"],
    projects: ["إعادة تصميم تطبيق موجود", "تصميم تطبيق صحي", "تصميم موقع تجاري", "نظام تصميم متكامل"],
    weights: { creative: 5, communication: 4, openness: 3, agreeable: 3, collaborative: 3, visual: 2, extroversion: 1 },
  },
  {
    id: "project-management",
    name: "إدارة المشاريع",
    icon: "📋",
    description: "قيادة الفرق وإدارة المشاريع لتحقيق الأهداف بكفاءة",
    advantages: ["مسار قيادي واضح", "رواتب ممتازة", "تنوع الصناعات", "تأثير استراتيجي"],
    challenges: ["مسؤولية عالية", "إدارة توقعات متعددة", "ضغط المواعيد"],
    requiredSkills: ["القيادة", "التخطيط", "التواصل", "حل المشكلات", "إدارة الوقت"],
    roadmap: {
      months3: ["تعلم منهجيات إدارة المشاريع (Agile/Scrum)", "فهم أدوات إدارة المشاريع", "قراءة كتب القيادة الأساسية"],
      months6: ["الحصول على شهادة PSM أو CAPM", "قيادة مشروع تطوعي", "تعلم إدارة المخاطر والميزانيات", "تطوير مهارات التفاوض"],
      months12: ["التحضير لشهادة PMP", "قيادة فريق حقيقي", "بناء سجل مشاريع ناجحة", "التخصص في صناعة محددة"],
    },
    tools: ["Jira", "Trello", "MS Project", "Slack", "Notion"],
    projects: ["إدارة حدث مجتمعي", "قيادة مشروع تطوعي", "تنظيم هاكاثون", "إدارة إطلاق منتج"],
    weights: { leadership: 5, communication: 4, organized: 4, timeManagement: 3, teamwork: 3, extroversion: 2, collaborative: 3, resilience: 2 },
  },
  {
    id: "digital-marketing",
    name: "التسويق الرقمي",
    icon: "📱",
    description: "بناء استراتيجيات تسويق رقمية وإدارة الحملات الإعلانية",
    advantages: ["إبداع مع تحليل", "نتائج قابلة للقياس", "مرونة العمل", "تنوع المهام"],
    challenges: ["تغيرات خوارزميات مستمرة", "منافسة عالية", "ضغط تحقيق الأهداف"],
    requiredSkills: ["التفكير الإبداعي", "تحليل البيانات", "كتابة المحتوى", "فهم السوق", "التواصل"],
    roadmap: {
      months3: ["تعلم أساسيات التسويق الرقمي", "فهم SEO وGoogle Ads", "إنشاء محتوى على منصات التواصل"],
      months6: ["إتقان أدوات التحليل (Google Analytics)", "تعلم إدارة الحملات الإعلانية", "بناء حملة تسويقية كاملة", "تعلم التسويق بالمحتوى"],
      months12: ["الحصول على شهادات Google/Meta", "إدارة حسابات حقيقية", "التخصص (SEO/SEM/Social)", "بناء محفظة نتائج مثبتة"],
    },
    tools: ["Google Analytics", "Meta Business", "Canva", "HubSpot", "Mailchimp"],
    projects: ["إدارة حساب تواصل اجتماعي", "حملة إعلانية على Google", "خطة تسويق محتوى", "تحسين SEO لموقع"],
    weights: { creative: 4, communication: 4, analytical: 3, extroversion: 3, adaptability: 3, negotiation: 2, openness: 2 },
  },
  {
    id: "cybersecurity",
    name: "الأمن السيبراني",
    icon: "🔒",
    description: "حماية الأنظمة والشبكات من التهديدات الأمنية",
    advantages: ["طلب عالي جداً", "رواتب ممتازة", "عمل مثير ومتنوع", "أهمية استراتيجية"],
    challenges: ["تعلم مستمر ومكثف", "ضغط عالي", "مسؤولية كبيرة"],
    requiredSkills: ["الشبكات", "أنظمة التشغيل", "التفكير التحليلي", "الاهتمام بالتفاصيل", "التعلم المستمر"],
    roadmap: {
      months3: ["تعلم أساسيات الشبكات (CompTIA Network+)", "فهم أنظمة التشغيل (Linux/Windows)", "تعلم أساسيات الأمن المعلوماتي"],
      months6: ["التحضير لشهادة CompTIA Security+", "تعلم أدوات الاختراق الأخلاقي", "المشاركة في تحديات CTF", "فهم تحليل الثغرات"],
      months12: ["التخصص (Pentesting/SOC/Forensics)", "الحصول على شهادة CEH أو OSCP", "بناء مختبر أمني شخصي", "المساهمة في برامج Bug Bounty"],
    },
    tools: ["Kali Linux", "Wireshark", "Burp Suite", "Nmap", "Metasploit"],
    projects: ["اختبار اختراق شبكة", "تحليل ثغرات تطبيق ويب", "بناء نظام كشف تسلل", "تقرير أمني شامل"],
    weights: { analytical: 5, technical: 5, focus: 4, discipline: 3, selfLearning: 3, problemSolving: 3, introversion: 2 },
  },
  {
    id: "entrepreneurship",
    name: "ريادة الأعمال",
    icon: "🚀",
    description: "بناء مشاريع تجارية وتحويل الأفكار إلى واقع",
    advantages: ["حرية واستقلالية", "إمكانية تأثير كبير", "نمو شخصي سريع", "دخل غير محدود"],
    challenges: ["مخاطر مالية", "عدم استقرار", "ساعات عمل طويلة", "مسؤولية شاملة"],
    requiredSkills: ["القيادة", "التفاوض", "إدارة المخاطر", "التفكير الاستراتيجي", "المرونة"],
    roadmap: {
      months3: ["دراسة أساسيات ريادة الأعمال", "تحديد فكرة مشروع وتقييمها", "بناء نموذج عمل (Business Model Canvas)"],
      months6: ["بناء MVP (منتج أولي)", "اختبار السوق والحصول على تغذية راجعة", "تعلم أساسيات المالية والمحاسبة", "بناء شبكة علاقات"],
      months12: ["إطلاق المشروع رسمياً", "تطوير استراتيجية نمو", "البحث عن تمويل أو شراكات", "بناء فريق العمل"],
    },
    tools: ["Lean Canvas", "Notion", "Google Workspace", "Stripe", "Shopify"],
    projects: ["خطة عمل كاملة", "نموذج أولي لمنتج", "دراسة جدوى", "عرض تقديمي للمستثمرين"],
    weights: { leadership: 4, initiative: 4, resilience: 4, negotiation: 3, creative: 3, extroversion: 3, adaptability: 3, goalSetting: 3 },
  },
  {
    id: "content-creation",
    name: "صناعة المحتوى والإعلام",
    icon: "🎬",
    description: "إنتاج محتوى إبداعي ورقمي يصل للجمهور ويؤثر فيه",
    advantages: ["تعبير إبداعي", "بناء جمهور", "مرونة العمل", "فرص متنوعة"],
    challenges: ["دخل غير مستقر بالبداية", "منافسة شديدة", "ضغط الإنتاج المستمر"],
    requiredSkills: ["الكتابة الإبداعية", "التصوير والمونتاج", "التسويق الذاتي", "فهم الجمهور", "الإبداع"],
    roadmap: {
      months3: ["تحديد المنصة والتخصص", "تعلم أدوات الإنتاج الأساسية", "نشر محتوى منتظم (3 مرات أسبوعياً)"],
      months6: ["تطوير أسلوب مميز", "بناء جمهور أولي", "تعلم المونتاج الاحترافي", "التعاون مع صناع محتوى آخرين"],
      months12: ["تحقيق الدخل من المحتوى", "بناء علامة شخصية قوية", "التوسع لمنصات متعددة", "إنشاء منتجات رقمية"],
    },
    tools: ["Adobe Premiere", "Canva", "CapCut", "OBS Studio", "WordPress"],
    projects: ["قناة يوتيوب متخصصة", "بودكاست", "مدونة", "سلسلة محتوى تعليمي"],
    weights: { creative: 5, communication: 4, openness: 3, extroversion: 3, initiative: 2, visual: 2, auditory: 2 },
  },
];

// Calculate match percentage for a career path based on all assessment results
export function calculateCareerMatch(
  path: CareerPath,
  allResults: Record<string, Record<string, number>>
): number {
  let totalWeight = 0;
  let totalScore = 0;

  // Merge all assessment scores into one flat map
  const merged: Record<string, number> = {};
  for (const results of Object.values(allResults)) {
    for (const [key, val] of Object.entries(results)) {
      merged[key] = Math.max(merged[key] || 0, val);
    }
  }

  for (const [trait, weight] of Object.entries(path.weights)) {
    totalWeight += weight;
    const userScore = merged[trait] || 0;
    // Normalize user score to 0-1 range (max possible is ~9 for personality, 3 for capabilities, etc.)
    const normalized = Math.min(1, userScore / 6);
    totalScore += normalized * weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round((totalScore / totalWeight) * 100);
}

export function getTopCareerPaths(
  allResults: Record<string, Record<string, number>>,
  count = 3
): { path: CareerPath; matchPct: number; reasons: string[] }[] {
  const scored = careerPaths.map(path => {
    const matchPct = calculateCareerMatch(path, allResults);
    const reasons = generateReasons(path, allResults);
    return { path, matchPct, reasons };
  });

  scored.sort((a, b) => b.matchPct - a.matchPct);
  return scored.slice(0, count);
}

function generateReasons(
  path: CareerPath,
  allResults: Record<string, Record<string, number>>
): string[] {
  const merged: Record<string, number> = {};
  for (const results of Object.values(allResults)) {
    for (const [key, val] of Object.entries(results)) {
      merged[key] = Math.max(merged[key] || 0, val);
    }
  }

  const reasons: string[] = [];
  const traitLabels: Record<string, string> = {
    technical: "مهاراتك التقنية القوية",
    analytical: "تفكيرك التحليلي المتميز",
    creative: "إبداعك وقدرتك على الابتكار",
    leadership: "مهاراتك القيادية",
    communication: "قدراتك في التواصل",
    problemSolving: "مهارتك في حل المشكلات",
    organized: "تنظيمك ومنهجيتك",
    extroversion: "شخصيتك الاجتماعية",
    introversion: "تركيزك وعمق تفكيرك",
    openness: "انفتاحك على التجارب الجديدة",
    collaborative: "قدرتك على العمل الجماعي",
    selfLearning: "مهارتك في التعلم الذاتي",
    focus: "قدرتك على التركيز",
    resilience: "مرونتك النفسية",
    initiative: "روح المبادرة لديك",
    adaptability: "قدرتك على التكيف",
    negotiation: "مهاراتك التفاوضية",
    discipline: "انضباطك والتزامك",
    teamwork: "قدرتك على العمل ضمن فريق",
    goalSetting: "مهارتك في تحديد الأهداف",
    visual: "أسلوب تعلمك البصري",
    auditory: "أسلوب تعلمك السمعي",
    timeManagement: "إدارتك الجيدة للوقت",
  };

  // Find top matching traits
  const sortedWeights = Object.entries(path.weights).sort((a, b) => b[1] - a[1]);
  for (const [trait] of sortedWeights.slice(0, 4)) {
    if ((merged[trait] || 0) >= 2 && traitLabels[trait]) {
      reasons.push(traitLabels[trait]);
    }
    if (reasons.length >= 3) break;
  }

  if (reasons.length === 0) {
    reasons.push("يتناسب مع مجموعة مهاراتك الحالية");
  }

  return reasons;
}
