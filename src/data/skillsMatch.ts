// Skills Match Engine - Links user's analyses (RIASEC + Career + Psych) with FUTURE_SKILLS
import { FUTURE_SKILLS, type FutureSkill, getSkillById } from "./futureSkills";

// Curated learning resources per skill (Arabic-friendly + global)
export interface LearningResource {
  title: string;
  url: string;
  type: "course" | "video" | "book" | "article" | "practice";
  free: boolean;
}

export const SKILL_RESOURCES: Record<string, LearningResource[]> = {
  ai_ml: [
    { title: "Machine Learning - Andrew Ng (Coursera)", url: "https://www.coursera.org/learn/machine-learning", type: "course", free: true },
    { title: "Fast.ai Practical Deep Learning", url: "https://course.fast.ai/", type: "course", free: true },
    { title: "Kaggle Learn", url: "https://www.kaggle.com/learn", type: "practice", free: true },
  ],
  data_science: [
    { title: "IBM Data Science Professional", url: "https://www.coursera.org/professional-certificates/ibm-data-science", type: "course", free: false },
    { title: "DataCamp - Data Scientist Track", url: "https://www.datacamp.com/tracks/data-scientist-with-python", type: "course", free: false },
    { title: "Kaggle Datasets & Notebooks", url: "https://www.kaggle.com/", type: "practice", free: true },
  ],
  python: [
    { title: "Python for Everybody (Coursera)", url: "https://www.coursera.org/specializations/python", type: "course", free: true },
    { title: "Real Python Tutorials", url: "https://realpython.com/", type: "article", free: true },
    { title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/", type: "book", free: true },
  ],
  cloud: [
    { title: "AWS Cloud Practitioner", url: "https://aws.amazon.com/training/learn-about/cloud-practitioner/", type: "course", free: true },
    { title: "Microsoft Learn - Azure", url: "https://learn.microsoft.com/azure/", type: "course", free: true },
  ],
  cybersecurity: [
    { title: "TryHackMe", url: "https://tryhackme.com/", type: "practice", free: true },
    { title: "Cybrary", url: "https://www.cybrary.it/", type: "course", free: true },
    { title: "Google Cybersecurity Certificate", url: "https://www.coursera.org/professional-certificates/google-cybersecurity", type: "course", free: false },
  ],
  devops: [
    { title: "DevOps with Docker (Helsinki)", url: "https://devopswithdocker.com/", type: "course", free: true },
    { title: "Linux Foundation - Intro to DevOps", url: "https://training.linuxfoundation.org/", type: "course", free: true },
  ],
  react: [
    { title: "React Official Docs", url: "https://react.dev/learn", type: "article", free: true },
    { title: "Scrimba React Course", url: "https://scrimba.com/learn/learnreact", type: "course", free: true },
    { title: "Frontend Masters - React", url: "https://frontendmasters.com/", type: "course", free: false },
  ],
  mobile_dev: [
    { title: "React Native Docs", url: "https://reactnative.dev/", type: "article", free: true },
    { title: "Flutter Codelabs", url: "https://flutter.dev/learn", type: "course", free: true },
  ],
  blockchain: [
    { title: "CryptoZombies", url: "https://cryptozombies.io/", type: "practice", free: true },
    { title: "Ethereum.org Developers", url: "https://ethereum.org/developers/", type: "article", free: true },
  ],
  sql: [
    { title: "SQLZoo Tutorial", url: "https://sqlzoo.net/", type: "practice", free: true },
    { title: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", type: "course", free: true },
  ],
  powerbi: [
    { title: "Microsoft Learn - Power BI", url: "https://learn.microsoft.com/power-bi/", type: "course", free: true },
    { title: "Tableau Free Training", url: "https://www.tableau.com/learn/training", type: "video", free: true },
  ],
  ux_design: [
    { title: "Google UX Design Certificate", url: "https://www.coursera.org/professional-certificates/google-ux-design", type: "course", free: false },
    { title: "Figma Academy", url: "https://www.figma.com/community", type: "practice", free: true },
    { title: "NN/g UX Articles", url: "https://www.nngroup.com/articles/", type: "article", free: true },
  ],
  digital_marketing: [
    { title: "Google Digital Garage", url: "https://learndigital.withgoogle.com/digitalgarage", type: "course", free: true },
    { title: "HubSpot Academy", url: "https://academy.hubspot.com/", type: "course", free: true },
    { title: "Meta Blueprint", url: "https://www.facebook.com/business/learn", type: "course", free: true },
  ],
  seo: [
    { title: "Ahrefs SEO Course", url: "https://ahrefs.com/academy", type: "course", free: true },
    { title: "Google SEO Starter Guide", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", type: "article", free: true },
  ],
  product_mgmt: [
    { title: "Reforge", url: "https://www.reforge.com/", type: "course", free: false },
    { title: "Lenny's Newsletter", url: "https://www.lennysnewsletter.com/", type: "article", free: true },
  ],
  project_mgmt: [
    { title: "Google Project Management Certificate", url: "https://www.coursera.org/professional-certificates/google-project-management", type: "course", free: false },
    { title: "PMI Resources", url: "https://www.pmi.org/learning", type: "article", free: true },
  ],
  finance_analysis: [
    { title: "CFI Free Courses", url: "https://corporatefinanceinstitute.com/", type: "course", free: true },
    { title: "Wall Street Prep", url: "https://www.wallstreetprep.com/", type: "course", free: false },
  ],
  video_editing: [
    { title: "DaVinci Resolve Training", url: "https://www.blackmagicdesign.com/products/davinciresolve/training", type: "video", free: true },
    { title: "Premiere Pro Tutorials", url: "https://helpx.adobe.com/premiere-pro/tutorials.html", type: "video", free: true },
  ],
  graphic_design: [
    { title: "Canva Design School", url: "https://www.canva.com/designschool/", type: "course", free: true },
    { title: "Adobe Illustrator Tutorials", url: "https://helpx.adobe.com/illustrator/tutorials.html", type: "video", free: true },
  ],
  writing_copywriting: [
    { title: "Copyhackers", url: "https://copyhackers.com/", type: "article", free: true },
    { title: "HubSpot Copywriting", url: "https://blog.hubspot.com/marketing/copywriting", type: "article", free: true },
  ],
  prompt_engineering: [
    { title: "DeepLearning.AI - ChatGPT Prompt Engineering", url: "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/", type: "course", free: true },
    { title: "Anthropic Prompt Library", url: "https://docs.anthropic.com/claude/prompt-library", type: "article", free: true },
    { title: "OpenAI Cookbook", url: "https://cookbook.openai.com/", type: "article", free: true },
  ],
  no_code: [
    { title: "Bubble Academy", url: "https://bubble.io/academy", type: "course", free: true },
    { title: "Lovable Docs", url: "https://docs.lovable.dev/", type: "article", free: true },
  ],
  robotic_automation: [
    { title: "ROS Tutorials", url: "https://docs.ros.org/", type: "article", free: true },
    { title: "UiPath Academy", url: "https://academy.uipath.com/", type: "course", free: true },
  ],
  biotech: [
    { title: "edX Biotechnology", url: "https://www.edx.org/learn/biotechnology", type: "course", free: true },
  ],
  renewable_energy: [
    { title: "Coursera Renewable Energy", url: "https://www.coursera.org/courses?query=renewable%20energy", type: "course", free: true },
  ],
  translation: [
    { title: "ProZ Translator Resources", url: "https://www.proz.com/translator-resources/", type: "article", free: true },
  ],
  manual_data_entry: [
    { title: "Excel Skills for Business", url: "https://www.coursera.org/specializations/excel", type: "course", free: true },
  ],

  // Soft Skills resources
  communication: [
    { title: "Improving Communication Skills (Wharton)", url: "https://www.coursera.org/learn/wharton-communication-skills", type: "course", free: true },
    { title: "TED Talks - Communication", url: "https://www.ted.com/topics/communication", type: "video", free: true },
  ],
  critical_thinking: [
    { title: "Critical Thinking (FutureLearn)", url: "https://www.futurelearn.com/courses/critical-thinking-at-university", type: "course", free: true },
    { title: "Farnam Street Mental Models", url: "https://fs.blog/mental-models/", type: "article", free: true },
  ],
  problem_solving: [
    { title: "McKinsey Problem Solving", url: "https://www.mckinsey.com/featured-insights", type: "article", free: true },
    { title: "Coursera - Creative Problem Solving", url: "https://www.coursera.org/learn/creative-problem-solving", type: "course", free: true },
  ],
  creativity: [
    { title: "IDEO Design Thinking", url: "https://www.ideou.com/", type: "course", free: false },
    { title: "Coursera - Creative Thinking", url: "https://www.coursera.org/learn/creative-thinking-techniques-and-tools-for-success", type: "course", free: true },
  ],
  leadership: [
    { title: "HBR Leadership Articles", url: "https://hbr.org/topic/leadership", type: "article", free: true },
    { title: "Coursera - Leading People & Teams", url: "https://www.coursera.org/specializations/leading-teams", type: "course", free: true },
  ],
  emotional_intel: [
    { title: "Yale - Science of Well-Being", url: "https://www.coursera.org/learn/the-science-of-well-being", type: "course", free: true },
    { title: "Six Seconds EQ Resources", url: "https://www.6seconds.org/", type: "article", free: true },
  ],
  adaptability: [
    { title: "Coursera - Adaptability & Resilience", url: "https://www.coursera.org/learn/adaptability-and-resiliency", type: "course", free: true },
  ],
  learning_agility: [
    { title: "Coursera - Learning How to Learn", url: "https://www.coursera.org/learn/learning-how-to-learn", type: "course", free: true },
  ],
  teamwork: [
    { title: "Coursera - Teamwork Skills", url: "https://www.coursera.org/learn/teamwork-skills-effective-communication", type: "course", free: true },
  ],
  time_mgmt: [
    { title: "Todoist Productivity Methods", url: "https://todoist.com/productivity-methods", type: "article", free: true },
    { title: "Coursera - Work Smarter, Not Harder", url: "https://www.coursera.org/learn/work-smarter-not-harder", type: "course", free: true },
  ],
  negotiation: [
    { title: "Yale - Successful Negotiation", url: "https://www.coursera.org/learn/negotiation-skills", type: "course", free: true },
  ],
  presentation: [
    { title: "TED Masterclass", url: "https://masterclass.ted.com/", type: "course", free: false },
    { title: "Toastmasters International", url: "https://www.toastmasters.org/", type: "practice", free: false },
  ],
  decision_making: [
    { title: "HBR Decision Making", url: "https://hbr.org/topic/decision-making", type: "article", free: true },
  ],
  resilience: [
    { title: "Penn Resilience Program", url: "https://ppc.sas.upenn.edu/resilience-programs", type: "article", free: true },
  ],
  cultural_intel: [
    { title: "Coursera - Cultural Intelligence", url: "https://www.coursera.org/learn/cultural-intelligence", type: "course", free: true },
  ],
  entrepreneurship: [
    { title: "Y Combinator Startup School", url: "https://www.startupschool.org/", type: "course", free: true },
    { title: "How to Start a Startup (Stanford)", url: "https://startupclass.samaltman.com/", type: "video", free: true },
  ],
  self_management: [
    { title: "Atomic Habits Summary", url: "https://jamesclear.com/atomic-habits", type: "book", free: true },
  ],
  mentoring: [
    { title: "ICF Coaching Resources", url: "https://coachingfederation.org/", type: "article", free: true },
  ],
  ethics: [
    { title: "Markkula Center Ethics", url: "https://www.scu.edu/ethics/", type: "article", free: true },
  ],
  ai_literacy: [
    { title: "Elements of AI", url: "https://www.elementsofai.com/", type: "course", free: true },
    { title: "Google AI Essentials", url: "https://grow.google/ai-essentials/", type: "course", free: true },
  ],
};

// Map RIASEC types to recommended skills (3 per type, ordered by relevance)
const RIASEC_TO_SKILLS: Record<string, string[]> = {
  R: ["devops", "robotic_automation", "renewable_energy", "cybersecurity", "problem_solving", "self_management"],
  I: ["python", "data_science", "ai_ml", "critical_thinking", "sql", "ai_literacy"],
  A: ["ux_design", "graphic_design", "video_editing", "creativity", "writing_copywriting", "presentation"],
  S: ["communication", "mentoring", "emotional_intel", "teamwork", "cultural_intel", "ethics"],
  E: ["leadership", "negotiation", "entrepreneurship", "product_mgmt", "digital_marketing", "decision_making"],
  C: ["sql", "finance_analysis", "powerbi", "time_mgmt", "project_mgmt", "self_management"],
};

// Universal future skills everyone should pursue (high demand)
const UNIVERSAL_FUTURE_SKILLS = ["ai_literacy", "prompt_engineering", "critical_thinking", "adaptability", "communication", "learning_agility"];

export interface UserProfile {
  riasec?: { score_r: number; score_i: number; score_a: number; score_s: number; score_e: number; score_c: number; code: string } | null;
  careerAssessments?: Array<{ test_type: string; result_code: string | null }>;
  psych?: { confidence: number; anxiety: number; decision_ability: number; stress_tolerance: number; burnout_risk: number; thinking_style: string } | null;
  habits?: Array<{ name: string }>;
  learningGoals?: Array<{ user_goal: string }>;
}

export interface SkillMatchScore {
  skill: FutureSkill;
  acquired: boolean; // does the user (loosely) already have it?
  fit: number; // 0-100 personal fit
  reason: string;
}

export interface MatchSummary {
  overallMatchPct: number;
  acquiredSkills: SkillMatchScore[]; // top inferred-acquired
  recommendedSkills: SkillMatchScore[]; // top to learn next
  gapSkills: SkillMatchScore[]; // missing high-demand skills
  topRiasec: string[]; // letters
  signals: string[]; // human-readable signals derived
}

const norm = (s: string) => s.toLowerCase().replace(/[\s_\-]/g, "");

function inferAcquiredFromText(text: string): Set<string> {
  const t = norm(text);
  const acquired = new Set<string>();
  for (const s of FUTURE_SKILLS) {
    const keys = [s.id, s.name, s.nameAr];
    if (keys.some(k => k && t.includes(norm(k)))) acquired.add(s.id);
  }
  return acquired;
}

export function computeMatch(profile: UserProfile): MatchSummary {
  const signals: string[] = [];
  const topRiasec: string[] = [];

  // 1) Build candidate target skills from RIASEC top-3
  const targetIds = new Set<string>();
  if (profile.riasec) {
    const scores: Array<[string, number]> = [
      ["R", profile.riasec.score_r], ["I", profile.riasec.score_i], ["A", profile.riasec.score_a],
      ["S", profile.riasec.score_s], ["E", profile.riasec.score_e], ["C", profile.riasec.score_c],
    ];
    scores.sort((a, b) => b[1] - a[1]);
    const top3 = scores.slice(0, 3).map(s => s[0]);
    topRiasec.push(...top3);
    for (const letter of top3) {
      RIASEC_TO_SKILLS[letter]?.forEach(id => targetIds.add(id));
    }
    signals.push(`أهم 3 ميول: ${top3.join("-")} (كود ${profile.riasec.code})`);
  }
  // 2) Always include universal future skills
  UNIVERSAL_FUTURE_SKILLS.forEach(id => targetIds.add(id));

  // 3) Soft signals from psychology
  if (profile.psych) {
    const p = profile.psych;
    if (p.burnout_risk >= 60) {
      targetIds.add("self_management"); targetIds.add("resilience"); targetIds.add("time_mgmt");
      signals.push(`خطر احتراق وظيفي مرتفع (${p.burnout_risk}%) → نوصي بمهارات إدارة الذات والمرونة`);
    }
    if (p.confidence < 50) {
      targetIds.add("presentation"); targetIds.add("communication");
      signals.push(`ثقة منخفضة (${p.confidence}%) → مهارات العرض والتواصل ستساعدك`);
    }
    if (p.decision_ability < 50) {
      targetIds.add("decision_making"); targetIds.add("critical_thinking");
      signals.push(`قدرة قرار تحت المتوسط → ركز على التفكير النقدي`);
    }
    if (p.anxiety >= 60) {
      targetIds.add("emotional_intel"); targetIds.add("resilience");
      signals.push(`قلق مرتفع (${p.anxiety}%) → الذكاء العاطفي والمرونة النفسية أولوية`);
    }
  }

  // 4) Inferred acquired skills (from habits + learning goals + assessment notes)
  const corpus = [
    ...(profile.habits || []).map(h => h.name),
    ...(profile.learningGoals || []).map(g => g.user_goal),
    ...(profile.careerAssessments || []).map(a => `${a.test_type} ${a.result_code || ""}`),
  ].join(" ");
  const acquiredIds = inferAcquiredFromText(corpus);
  if (acquiredIds.size) signals.push(`تم رصد ${acquiredIds.size} مهارة قائمة من عاداتك وأهدافك`);

  // 5) Score every target skill
  const scored: SkillMatchScore[] = Array.from(targetIds).map(id => {
    const skill = getSkillById(id);
    if (!skill) return null as any;
    const acquired = acquiredIds.has(id);

    // fit = 60% RIASEC alignment + 30% global demand + 10% growth
    let riasecAlign = 0;
    if (profile.riasec) {
      for (const letter of topRiasec) {
        if (RIASEC_TO_SKILLS[letter]?.includes(id)) riasecAlign += 35;
      }
      riasecAlign = Math.min(100, riasecAlign);
    } else {
      riasecAlign = 50;
    }
    const fit = Math.round(0.6 * riasecAlign + 0.3 * skill.demand + 0.1 * Math.max(0, skill.growth));

    let reason = "";
    if (acquired) reason = "مكتسبة بالفعل";
    else if (riasecAlign >= 35) reason = `تتوافق مع ميولك (${topRiasec.join("/")})`;
    else if (UNIVERSAL_FUTURE_SKILLS.includes(id)) reason = "مهارة مستقبل أساسية للجميع";
    else reason = "طلب عالمي عالٍ";

    return { skill, acquired, fit: Math.max(20, Math.min(100, fit)), reason };
  }).filter(Boolean);

  scored.sort((a, b) => b.fit - a.fit);

  const acquiredSkills = scored.filter(s => s.acquired).slice(0, 8);
  const recommendedSkills = scored.filter(s => !s.acquired).slice(0, 8);
  const gapSkills = scored.filter(s => !s.acquired && s.skill.demand >= 80).slice(0, 6);

  // Overall match: weighted ratio of acquired vs total target + signal bonus
  const totalTargets = scored.length || 1;
  const acquiredCount = acquiredSkills.length;
  const baseMatch = Math.round((acquiredCount / Math.min(totalTargets, 12)) * 100);
  const profileBonus = (profile.riasec ? 15 : 0) + (profile.psych ? 10 : 0) + (profile.habits?.length ? 5 : 0);
  const overallMatchPct = Math.min(100, Math.max(15, Math.round(baseMatch * 0.7 + profileBonus)));

  return { overallMatchPct, acquiredSkills, recommendedSkills, gapSkills, topRiasec, signals };
}

// Build interactive 90-day path stages from recommended skills
export interface PathStage {
  month: 1 | 2 | 3;
  title: string;
  goal: string;
  skills: FutureSkill[];
  milestones: string[];
}

export function buildPath(recommended: SkillMatchScore[]): PathStage[] {
  const top = recommended.slice(0, 6).map(r => r.skill);
  const m1 = top.slice(0, 2);
  const m2 = top.slice(2, 4);
  const m3 = top.slice(4, 6);
  return [
    {
      month: 1,
      title: "الشهر 1 — الأساسيات",
      goal: "بناء قاعدة معرفية صلبة في أهم مهارتين",
      skills: m1,
      milestones: [
        "إكمال مقدمة في كل مهارة (10-15 ساعة)",
        "تطبيق عملي صغير لكل مهارة",
        "كتابة ملخص أسبوعي لما تعلمته",
      ],
    },
    {
      month: 2,
      title: "الشهر 2 — التعمّق والممارسة",
      goal: "تطبيق المهارات في مشروع حقيقي + اكتساب مهارة جديدة",
      skills: m2.length ? m2 : m1,
      milestones: [
        "بناء مشروع متكامل صغير (Portfolio piece)",
        "نشر تجربتك (LinkedIn / GitHub / Behance)",
        "الحصول على تغذية راجعة من 3 خبراء",
      ],
    },
    {
      month: 3,
      title: "الشهر 3 — الاحتراف والإطلاق",
      goal: "تموقع مهني واضح + بدء البحث عن فرص",
      skills: m3.length ? m3 : top,
      milestones: [
        "تحديث CV وLinkedIn بالمهارات الجديدة",
        "تقديم على 5-10 فرص (وظيفة / فريلانس)",
        "إنجاز شهادة معتمدة في إحدى المهارات",
      ],
    },
  ];
}
