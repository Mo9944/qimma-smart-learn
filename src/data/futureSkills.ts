// Future Skills & Global Insights - Static dataset

export type SkillType = "hard" | "soft";
export type Trend = "rising" | "stable" | "declining";
export type Difficulty = "easy" | "medium" | "advanced";

export interface FutureSkill {
  id: string;
  name: string;
  nameAr: string;
  type: SkillType;
  category: string;
  demand: number; // % global demand
  growth: number; // annual % growth
  trend: Trend;
  difficulty: Difficulty;
  avgSalaryUsd: number; // global avg
  description: string;
}

export const FUTURE_SKILLS: FutureSkill[] = [
  // Hard Skills - Tech
  { id: "ai_ml", name: "AI & Machine Learning", nameAr: "الذكاء الاصطناعي وتعلم الآلة", type: "hard", category: "AI", demand: 94, growth: 35, trend: "rising", difficulty: "advanced", avgSalaryUsd: 130000, description: "بناء نماذج ذكاء اصطناعي وتعلم الآلة" },
  { id: "data_science", name: "Data Science", nameAr: "علم البيانات", type: "hard", category: "Data", demand: 89, growth: 28, trend: "rising", difficulty: "advanced", avgSalaryUsd: 115000, description: "تحليل البيانات الضخمة" },
  { id: "python", name: "Python", nameAr: "بايثون", type: "hard", category: "Programming", demand: 88, growth: 18, trend: "rising", difficulty: "medium", avgSalaryUsd: 95000, description: "لغة برمجة شاملة" },
  { id: "cloud", name: "Cloud Computing (AWS/Azure)", nameAr: "الحوسبة السحابية", type: "hard", category: "Cloud", demand: 87, growth: 22, trend: "rising", difficulty: "advanced", avgSalaryUsd: 120000, description: "إدارة البنية التحتية السحابية" },
  { id: "cybersecurity", name: "Cybersecurity", nameAr: "الأمن السيبراني", type: "hard", category: "Security", demand: 86, growth: 32, trend: "rising", difficulty: "advanced", avgSalaryUsd: 110000, description: "حماية الأنظمة والبيانات" },
  { id: "devops", name: "DevOps", nameAr: "ديف أوبس", type: "hard", category: "Engineering", demand: 82, growth: 20, trend: "rising", difficulty: "advanced", avgSalaryUsd: 118000, description: "أتمتة التطوير والنشر" },
  { id: "react", name: "React.js", nameAr: "ريأكت", type: "hard", category: "Web", demand: 81, growth: 14, trend: "rising", difficulty: "medium", avgSalaryUsd: 92000, description: "تطوير واجهات تفاعلية" },
  { id: "mobile_dev", name: "Mobile Development", nameAr: "تطوير الموبايل", type: "hard", category: "Mobile", demand: 78, growth: 15, trend: "rising", difficulty: "medium", avgSalaryUsd: 98000, description: "تطبيقات iOS وAndroid" },
  { id: "blockchain", name: "Blockchain", nameAr: "البلوك تشين", type: "hard", category: "Web3", demand: 65, growth: 12, trend: "stable", difficulty: "advanced", avgSalaryUsd: 125000, description: "تقنيات البلوك تشين والعقود الذكية" },
  { id: "sql", name: "SQL & Databases", nameAr: "قواعد البيانات SQL", type: "hard", category: "Data", demand: 84, growth: 10, trend: "stable", difficulty: "easy", avgSalaryUsd: 88000, description: "إدارة قواعد البيانات" },
  { id: "powerbi", name: "Power BI / Tableau", nameAr: "تحليل البيانات (Power BI)", type: "hard", category: "Analytics", demand: 79, growth: 17, trend: "rising", difficulty: "medium", avgSalaryUsd: 92000, description: "أدوات ذكاء الأعمال" },
  { id: "ux_design", name: "UX/UI Design", nameAr: "تصميم تجربة المستخدم", type: "hard", category: "Design", demand: 77, growth: 16, trend: "rising", difficulty: "medium", avgSalaryUsd: 95000, description: "تصميم تجارب رقمية" },
  { id: "digital_marketing", name: "Digital Marketing", nameAr: "التسويق الرقمي", type: "hard", category: "Marketing", demand: 80, growth: 14, trend: "rising", difficulty: "medium", avgSalaryUsd: 75000, description: "استراتيجيات التسويق الرقمي" },
  { id: "seo", name: "SEO & Content Strategy", nameAr: "تحسين محركات البحث", type: "hard", category: "Marketing", demand: 72, growth: 9, trend: "stable", difficulty: "medium", avgSalaryUsd: 68000, description: "تحسين الظهور في محركات البحث" },
  { id: "product_mgmt", name: "Product Management", nameAr: "إدارة المنتجات", type: "hard", category: "Business", demand: 83, growth: 19, trend: "rising", difficulty: "advanced", avgSalaryUsd: 130000, description: "إدارة دورة حياة المنتجات" },
  { id: "project_mgmt", name: "Project Management", nameAr: "إدارة المشاريع", type: "hard", category: "Business", demand: 81, growth: 11, trend: "stable", difficulty: "medium", avgSalaryUsd: 95000, description: "تخطيط وتنفيذ المشاريع" },
  { id: "finance_analysis", name: "Financial Analysis", nameAr: "التحليل المالي", type: "hard", category: "Finance", demand: 75, growth: 8, trend: "stable", difficulty: "advanced", avgSalaryUsd: 92000, description: "تحليل البيانات المالية" },
  { id: "video_editing", name: "Video Editing", nameAr: "مونتاج الفيديو", type: "hard", category: "Creative", demand: 70, growth: 21, trend: "rising", difficulty: "medium", avgSalaryUsd: 62000, description: "تحرير ومونتاج الفيديو" },
  { id: "graphic_design", name: "Graphic Design", nameAr: "التصميم الجرافيكي", type: "hard", category: "Design", demand: 68, growth: 7, trend: "stable", difficulty: "medium", avgSalaryUsd: 58000, description: "التصميم البصري والهوية" },
  { id: "writing_copywriting", name: "Copywriting", nameAr: "كتابة المحتوى الإعلاني", type: "hard", category: "Writing", demand: 66, growth: 10, trend: "stable", difficulty: "medium", avgSalaryUsd: 65000, description: "كتابة محتوى تسويقي مؤثر" },
  { id: "prompt_engineering", name: "Prompt Engineering", nameAr: "هندسة الأوامر للذكاء الاصطناعي", type: "hard", category: "AI", demand: 85, growth: 45, trend: "rising", difficulty: "medium", avgSalaryUsd: 105000, description: "كتابة أوامر فعالة للذكاء الاصطناعي" },
  { id: "no_code", name: "No-Code Development", nameAr: "التطوير بدون كود", type: "hard", category: "Tools", demand: 73, growth: 26, trend: "rising", difficulty: "easy", avgSalaryUsd: 70000, description: "بناء تطبيقات بدون برمجة" },
  { id: "translation", name: "Translation", nameAr: "الترجمة المتخصصة", type: "hard", category: "Languages", demand: 55, growth: -3, trend: "declining", difficulty: "medium", avgSalaryUsd: 52000, description: "الترجمة المتخصصة" },
  { id: "manual_data_entry", name: "Manual Data Entry", nameAr: "إدخال البيانات اليدوي", type: "hard", category: "Admin", demand: 35, growth: -12, trend: "declining", difficulty: "easy", avgSalaryUsd: 30000, description: "مهام إدارية أساسية" },
  { id: "robotic_automation", name: "Robotics & Automation", nameAr: "الروبوتات والأتمتة", type: "hard", category: "Engineering", demand: 76, growth: 24, trend: "rising", difficulty: "advanced", avgSalaryUsd: 115000, description: "تصميم أنظمة آلية" },
  { id: "biotech", name: "Biotechnology", nameAr: "التكنولوجيا الحيوية", type: "hard", category: "Science", demand: 71, growth: 18, trend: "rising", difficulty: "advanced", avgSalaryUsd: 105000, description: "علوم وتقنيات حيوية" },
  { id: "renewable_energy", name: "Renewable Energy", nameAr: "الطاقة المتجددة", type: "hard", category: "Energy", demand: 74, growth: 23, trend: "rising", difficulty: "advanced", avgSalaryUsd: 95000, description: "هندسة الطاقة النظيفة" },

  // Soft Skills
  { id: "communication", name: "Communication", nameAr: "التواصل الفعّال", type: "soft", category: "Interpersonal", demand: 92, growth: 9, trend: "stable", difficulty: "easy", avgSalaryUsd: 0, description: "مهارات التواصل اللفظي والكتابي" },
  { id: "critical_thinking", name: "Critical Thinking", nameAr: "التفكير النقدي", type: "soft", category: "Cognitive", demand: 90, growth: 15, trend: "rising", difficulty: "medium", avgSalaryUsd: 0, description: "تحليل المعلومات واتخاذ قرارات منطقية" },
  { id: "problem_solving", name: "Complex Problem Solving", nameAr: "حل المشكلات المعقدة", type: "soft", category: "Cognitive", demand: 91, growth: 17, trend: "rising", difficulty: "medium", avgSalaryUsd: 0, description: "حل التحديات المعقدة بإبداع" },
  { id: "creativity", name: "Creativity & Innovation", nameAr: "الإبداع والابتكار", type: "soft", category: "Cognitive", demand: 88, growth: 18, trend: "rising", difficulty: "medium", avgSalaryUsd: 0, description: "توليد أفكار جديدة" },
  { id: "leadership", name: "Leadership", nameAr: "القيادة", type: "soft", category: "Management", demand: 87, growth: 12, trend: "rising", difficulty: "advanced", avgSalaryUsd: 0, description: "قيادة الفرق وإلهامها" },
  { id: "emotional_intel", name: "Emotional Intelligence", nameAr: "الذكاء العاطفي", type: "soft", category: "Interpersonal", demand: 85, growth: 16, trend: "rising", difficulty: "medium", avgSalaryUsd: 0, description: "فهم وإدارة المشاعر" },
  { id: "adaptability", name: "Adaptability", nameAr: "التكيّف والمرونة", type: "soft", category: "Personal", demand: 89, growth: 20, trend: "rising", difficulty: "medium", avgSalaryUsd: 0, description: "التكيف مع التغيير" },
  { id: "learning_agility", name: "Active Learning", nameAr: "التعلم الذاتي المستمر", type: "soft", category: "Personal", demand: 86, growth: 22, trend: "rising", difficulty: "easy", avgSalaryUsd: 0, description: "اكتساب معرفة ومهارات بسرعة" },
  { id: "teamwork", name: "Collaboration", nameAr: "العمل الجماعي", type: "soft", category: "Interpersonal", demand: 84, growth: 8, trend: "stable", difficulty: "easy", avgSalaryUsd: 0, description: "العمل الفعّال ضمن فريق" },
  { id: "time_mgmt", name: "Time Management", nameAr: "إدارة الوقت", type: "soft", category: "Personal", demand: 82, growth: 10, trend: "stable", difficulty: "easy", avgSalaryUsd: 0, description: "تنظيم الوقت والأولويات" },
  { id: "negotiation", name: "Negotiation", nameAr: "التفاوض", type: "soft", category: "Business", demand: 75, growth: 7, trend: "stable", difficulty: "advanced", avgSalaryUsd: 0, description: "إدارة التفاوض والإقناع" },
  { id: "presentation", name: "Public Speaking", nameAr: "التحدث أمام الجمهور", type: "soft", category: "Communication", demand: 73, growth: 9, trend: "stable", difficulty: "medium", avgSalaryUsd: 0, description: "تقديم العروض بثقة" },
  { id: "decision_making", name: "Decision Making", nameAr: "اتخاذ القرار", type: "soft", category: "Cognitive", demand: 81, growth: 11, trend: "rising", difficulty: "medium", avgSalaryUsd: 0, description: "اتخاذ قرارات صائبة تحت الضغط" },
  { id: "resilience", name: "Resilience & Stress Tolerance", nameAr: "المرونة النفسية", type: "soft", category: "Personal", demand: 83, growth: 19, trend: "rising", difficulty: "medium", avgSalaryUsd: 0, description: "تحمّل الضغوط والتعافي" },
  { id: "cultural_intel", name: "Cultural Intelligence", nameAr: "الذكاء الثقافي", type: "soft", category: "Interpersonal", demand: 70, growth: 14, trend: "rising", difficulty: "medium", avgSalaryUsd: 0, description: "العمل ضمن بيئات متعددة الثقافات" },
  { id: "entrepreneurship", name: "Entrepreneurial Mindset", nameAr: "العقلية الريادية", type: "soft", category: "Business", demand: 76, growth: 17, trend: "rising", difficulty: "advanced", avgSalaryUsd: 0, description: "التفكير الريادي والمبادرة" },
  { id: "self_management", name: "Self-Management", nameAr: "إدارة الذات", type: "soft", category: "Personal", demand: 80, growth: 13, trend: "rising", difficulty: "medium", avgSalaryUsd: 0, description: "تنظيم الذات والانضباط" },
  { id: "mentoring", name: "Mentoring & Coaching", nameAr: "التوجيه والإرشاد", type: "soft", category: "Management", demand: 68, growth: 10, trend: "stable", difficulty: "medium", avgSalaryUsd: 0, description: "تدريب وتطوير الآخرين" },
  { id: "ethics", name: "Ethics & Integrity", nameAr: "النزاهة الأخلاقية", type: "soft", category: "Personal", demand: 78, growth: 12, trend: "rising", difficulty: "easy", avgSalaryUsd: 0, description: "اتخاذ قرارات أخلاقية" },
  { id: "ai_literacy", name: "AI Literacy", nameAr: "الإلمام بالذكاء الاصطناعي", type: "soft", category: "Cognitive", demand: 88, growth: 38, trend: "rising", difficulty: "easy", avgSalaryUsd: 0, description: "فهم استخدامات وحدود الذكاء الاصطناعي" },
];

// Country dataset (ISO-3 codes for react-simple-maps)
export interface CountryInsight {
  iso3: string;
  iso2: string;
  name: string;
  nameAr: string;
  region: string;
  demandIndex: number; // 0-100 overall job market heat
  remotePct: number;
  growthPct: number;
  avgSalaryUsd: number;
  topHardSkills: string[]; // ids
  topSoftSkills: string[];
  topGrowingFields: string[];
}

export const COUNTRIES: CountryInsight[] = [
  { iso3: "USA", iso2: "US", name: "United States", nameAr: "الولايات المتحدة", region: "أمريكا الشمالية", demandIndex: 95, remotePct: 42, growthPct: 12, avgSalaryUsd: 110000,
    topHardSkills: ["ai_ml", "data_science", "cloud", "cybersecurity", "python", "devops", "product_mgmt", "react", "powerbi", "prompt_engineering"],
    topSoftSkills: ["leadership", "critical_thinking", "communication", "creativity", "problem_solving", "adaptability", "decision_making", "emotional_intel", "ai_literacy", "entrepreneurship"],
    topGrowingFields: ["الذكاء الاصطناعي", "FinTech", "Cybersecurity", "Cloud", "Biotech"] },
  { iso3: "DEU", iso2: "DE", name: "Germany", nameAr: "ألمانيا", region: "أوروبا", demandIndex: 88, remotePct: 35, growthPct: 9, avgSalaryUsd: 75000,
    topHardSkills: ["python", "cloud", "cybersecurity", "data_science", "devops", "robotic_automation", "renewable_energy", "ai_ml", "sql", "project_mgmt"],
    topSoftSkills: ["critical_thinking", "communication", "teamwork", "leadership", "problem_solving", "adaptability", "time_mgmt", "decision_making", "ethics", "cultural_intel"],
    topGrowingFields: ["الهندسة", "الطاقة المتجددة", "الصناعة 4.0", "السيارات الكهربائية", "AI"] },
  { iso3: "GBR", iso2: "GB", name: "United Kingdom", nameAr: "المملكة المتحدة", region: "أوروبا", demandIndex: 87, remotePct: 40, growthPct: 10, avgSalaryUsd: 80000,
    topHardSkills: ["ai_ml", "data_science", "cloud", "finance_analysis", "cybersecurity", "python", "product_mgmt", "ux_design", "powerbi", "digital_marketing"],
    topSoftSkills: ["communication", "critical_thinking", "leadership", "creativity", "problem_solving", "negotiation", "emotional_intel", "decision_making", "presentation", "cultural_intel"],
    topGrowingFields: ["FinTech", "AI", "الصحة الرقمية", "الإعلام", "Green Tech"] },
  { iso3: "CAN", iso2: "CA", name: "Canada", nameAr: "كندا", region: "أمريكا الشمالية", demandIndex: 86, remotePct: 48, growthPct: 11, avgSalaryUsd: 85000,
    topHardSkills: ["ai_ml", "data_science", "python", "cloud", "cybersecurity", "ux_design", "react", "product_mgmt", "powerbi", "prompt_engineering"],
    topSoftSkills: ["communication", "adaptability", "teamwork", "critical_thinking", "creativity", "leadership", "cultural_intel", "ai_literacy", "problem_solving", "emotional_intel"],
    topGrowingFields: ["AI", "Clean Energy", "Healthcare Tech", "FinTech", "Gaming"] },
  { iso3: "AUS", iso2: "AU", name: "Australia", nameAr: "أستراليا", region: "أوقيانوسيا", demandIndex: 84, remotePct: 38, growthPct: 9, avgSalaryUsd: 88000,
    topHardSkills: ["cloud", "cybersecurity", "data_science", "python", "ai_ml", "devops", "ux_design", "digital_marketing", "renewable_energy", "powerbi"],
    topSoftSkills: ["communication", "teamwork", "adaptability", "leadership", "critical_thinking", "problem_solving", "creativity", "time_mgmt", "decision_making", "resilience"],
    topGrowingFields: ["التعدين الذكي", "AgriTech", "FinTech", "Cybersecurity", "Renewable Energy"] },
  { iso3: "ARE", iso2: "AE", name: "United Arab Emirates", nameAr: "الإمارات", region: "الشرق الأوسط", demandIndex: 89, remotePct: 32, growthPct: 18, avgSalaryUsd: 70000,
    topHardSkills: ["ai_ml", "cybersecurity", "cloud", "blockchain", "data_science", "digital_marketing", "product_mgmt", "ux_design", "fintech" as any, "prompt_engineering"].filter(s => s !== "fintech" as any),
    topSoftSkills: ["leadership", "communication", "adaptability", "cultural_intel", "ai_literacy", "entrepreneurship", "creativity", "decision_making", "emotional_intel", "negotiation"],
    topGrowingFields: ["AI", "السياحة الذكية", "FinTech", "Smart Cities", "الطاقة النظيفة"] },
  { iso3: "SAU", iso2: "SA", name: "Saudi Arabia", nameAr: "السعودية", region: "الشرق الأوسط", demandIndex: 85, remotePct: 25, growthPct: 22, avgSalaryUsd: 65000,
    topHardSkills: ["ai_ml", "cybersecurity", "cloud", "data_science", "renewable_energy", "project_mgmt", "digital_marketing", "ux_design", "blockchain", "python"],
    topSoftSkills: ["leadership", "communication", "adaptability", "cultural_intel", "entrepreneurship", "ai_literacy", "decision_making", "creativity", "emotional_intel", "problem_solving"],
    topGrowingFields: ["NEOM & Smart Cities", "AI", "السياحة", "الترفيه", "الطاقة المتجددة"] },
  { iso3: "EGY", iso2: "EG", name: "Egypt", nameAr: "مصر", region: "الشرق الأوسط", demandIndex: 68, remotePct: 28, growthPct: 14, avgSalaryUsd: 18000,
    topHardSkills: ["digital_marketing", "react", "python", "ux_design", "mobile_dev", "graphic_design", "no_code", "video_editing", "powerbi", "seo"],
    topSoftSkills: ["communication", "adaptability", "teamwork", "creativity", "problem_solving", "time_mgmt", "ai_literacy", "learning_agility", "resilience", "self_management"],
    topGrowingFields: ["Outsourcing", "FinTech", "E-commerce", "Gaming", "Content Creation"] },
  { iso3: "IND", iso2: "IN", name: "India", nameAr: "الهند", region: "آسيا", demandIndex: 82, remotePct: 36, growthPct: 16, avgSalaryUsd: 22000,
    topHardSkills: ["python", "ai_ml", "cloud", "react", "devops", "data_science", "mobile_dev", "cybersecurity", "sql", "prompt_engineering"],
    topSoftSkills: ["communication", "teamwork", "adaptability", "ai_literacy", "learning_agility", "problem_solving", "time_mgmt", "creativity", "cultural_intel", "self_management"],
    topGrowingFields: ["IT Services", "AI", "FinTech", "EdTech", "SaaS"] },
  { iso3: "SGP", iso2: "SG", name: "Singapore", nameAr: "سنغافورة", region: "آسيا", demandIndex: 90, remotePct: 33, growthPct: 13, avgSalaryUsd: 95000,
    topHardSkills: ["ai_ml", "cybersecurity", "cloud", "data_science", "blockchain", "finance_analysis", "product_mgmt", "python", "fintech" as any, "ux_design"].filter(s => s !== "fintech" as any),
    topSoftSkills: ["communication", "leadership", "critical_thinking", "adaptability", "cultural_intel", "decision_making", "ai_literacy", "creativity", "problem_solving", "emotional_intel"],
    topGrowingFields: ["FinTech", "AI", "Biotech", "Smart Nation", "Cybersecurity"] },
  { iso3: "JPN", iso2: "JP", name: "Japan", nameAr: "اليابان", region: "آسيا", demandIndex: 80, remotePct: 22, growthPct: 7, avgSalaryUsd: 70000,
    topHardSkills: ["ai_ml", "robotic_automation", "cloud", "cybersecurity", "data_science", "python", "mobile_dev", "ux_design", "devops", "biotech"],
    topSoftSkills: ["teamwork", "ethics", "self_management", "communication", "adaptability", "critical_thinking", "decision_making", "problem_solving", "time_mgmt", "creativity"],
    topGrowingFields: ["الروبوتات", "AI", "Gaming", "Biotech", "Green Mobility"] },
  { iso3: "FRA", iso2: "FR", name: "France", nameAr: "فرنسا", region: "أوروبا", demandIndex: 81, remotePct: 34, growthPct: 8, avgSalaryUsd: 65000,
    topHardSkills: ["ai_ml", "data_science", "cloud", "cybersecurity", "python", "ux_design", "digital_marketing", "renewable_energy", "react", "powerbi"],
    topSoftSkills: ["communication", "creativity", "critical_thinking", "leadership", "cultural_intel", "negotiation", "presentation", "emotional_intel", "ethics", "adaptability"],
    topGrowingFields: ["AI", "الفاخر", "الموضة", "Aerospace", "Green Tech"] },
  { iso3: "NLD", iso2: "NL", name: "Netherlands", nameAr: "هولندا", region: "أوروبا", demandIndex: 85, remotePct: 45, growthPct: 11, avgSalaryUsd: 78000,
    topHardSkills: ["ai_ml", "data_science", "cloud", "cybersecurity", "python", "react", "ux_design", "devops", "product_mgmt", "powerbi"],
    topSoftSkills: ["communication", "critical_thinking", "creativity", "adaptability", "leadership", "teamwork", "cultural_intel", "ai_literacy", "problem_solving", "decision_making"],
    topGrowingFields: ["AI", "AgriTech", "FinTech", "Logistics", "Sustainability"] },
  { iso3: "CHE", iso2: "CH", name: "Switzerland", nameAr: "سويسرا", region: "أوروبا", demandIndex: 83, remotePct: 30, growthPct: 7, avgSalaryUsd: 105000,
    topHardSkills: ["finance_analysis", "ai_ml", "data_science", "cybersecurity", "cloud", "python", "biotech", "blockchain", "product_mgmt", "powerbi"],
    topSoftSkills: ["ethics", "communication", "critical_thinking", "leadership", "decision_making", "problem_solving", "negotiation", "cultural_intel", "self_management", "presentation"],
    topGrowingFields: ["FinTech", "Pharma", "Biotech", "AI", "Watchmaking 2.0"] },
  { iso3: "BRA", iso2: "BR", name: "Brazil", nameAr: "البرازيل", region: "أمريكا الجنوبية", demandIndex: 70, remotePct: 30, growthPct: 12, avgSalaryUsd: 25000,
    topHardSkills: ["digital_marketing", "react", "python", "mobile_dev", "ux_design", "data_science", "cybersecurity", "no_code", "powerbi", "video_editing"],
    topSoftSkills: ["communication", "creativity", "adaptability", "teamwork", "resilience", "problem_solving", "time_mgmt", "ai_literacy", "self_management", "emotional_intel"],
    topGrowingFields: ["FinTech", "AgriTech", "E-commerce", "Gaming", "Renewable Energy"] },
  { iso3: "TUR", iso2: "TR", name: "Turkey", nameAr: "تركيا", region: "أوروبا", demandIndex: 72, remotePct: 26, growthPct: 13, avgSalaryUsd: 28000,
    topHardSkills: ["digital_marketing", "react", "python", "mobile_dev", "ux_design", "no_code", "data_science", "cybersecurity", "graphic_design", "ai_ml"],
    topSoftSkills: ["communication", "adaptability", "creativity", "teamwork", "negotiation", "problem_solving", "time_mgmt", "ai_literacy", "resilience", "leadership"],
    topGrowingFields: ["E-commerce", "Tourism Tech", "Gaming", "Defense Tech", "FinTech"] },
  { iso3: "CHN", iso2: "CN", name: "China", nameAr: "الصين", region: "آسيا", demandIndex: 87, remotePct: 24, growthPct: 14, avgSalaryUsd: 35000,
    topHardSkills: ["ai_ml", "robotic_automation", "cloud", "cybersecurity", "data_science", "mobile_dev", "renewable_energy", "biotech", "blockchain", "python"],
    topSoftSkills: ["adaptability", "learning_agility", "problem_solving", "teamwork", "communication", "self_management", "ai_literacy", "decision_making", "critical_thinking", "leadership"],
    topGrowingFields: ["AI", "EVs", "Robotics", "Green Energy", "Semiconductors"] },
  { iso3: "ZAF", iso2: "ZA", name: "South Africa", nameAr: "جنوب إفريقيا", region: "إفريقيا", demandIndex: 65, remotePct: 31, growthPct: 9, avgSalaryUsd: 30000,
    topHardSkills: ["digital_marketing", "react", "python", "data_science", "cybersecurity", "ux_design", "powerbi", "cloud", "mobile_dev", "no_code"],
    topSoftSkills: ["communication", "adaptability", "resilience", "teamwork", "problem_solving", "creativity", "leadership", "ai_literacy", "decision_making", "cultural_intel"],
    topGrowingFields: ["FinTech", "Mining Tech", "Renewable Energy", "Tourism", "Agritech"] },
  { iso3: "KOR", iso2: "KR", name: "South Korea", nameAr: "كوريا الجنوبية", region: "آسيا", demandIndex: 84, remotePct: 20, growthPct: 11, avgSalaryUsd: 60000,
    topHardSkills: ["ai_ml", "robotic_automation", "mobile_dev", "cybersecurity", "cloud", "data_science", "python", "ux_design", "biotech", "blockchain"],
    topSoftSkills: ["teamwork", "self_management", "adaptability", "learning_agility", "communication", "problem_solving", "creativity", "ai_literacy", "decision_making", "ethics"],
    topGrowingFields: ["AI", "K-Content", "Gaming", "Semiconductors", "EVs"] },
  { iso3: "ESP", iso2: "ES", name: "Spain", nameAr: "إسبانيا", region: "أوروبا", demandIndex: 76, remotePct: 36, growthPct: 9, avgSalaryUsd: 50000,
    topHardSkills: ["digital_marketing", "react", "python", "ux_design", "data_science", "cloud", "mobile_dev", "cybersecurity", "renewable_energy", "powerbi"],
    topSoftSkills: ["communication", "creativity", "teamwork", "adaptability", "cultural_intel", "emotional_intel", "problem_solving", "presentation", "leadership", "ai_literacy"],
    topGrowingFields: ["السياحة الذكية", "Renewable Energy", "Gaming", "FinTech", "AgriTech"] },
];

// AI News - Static curated dataset
export type NewsCategory = "ai" | "tech" | "soft_skills" | "remote" | "jobs";

export interface NewsItem {
  id: string;
  title: string;
  titleAr: string;
  summaryAr: string;
  source: string;
  date: string;
  category: NewsCategory;
  country?: string;
  field: string;
  impactKeywords: string[];
}

export const NEWS_ITEMS: NewsItem[] = [
  { id: "n1", title: "AI agents reshape software jobs", titleAr: "وكلاء الذكاء الاصطناعي يعيدون تشكيل وظائف البرمجة", summaryAr: "تقرير من World Economic Forum يشير إلى أن وكلاء AI سيؤتمتون 40% من المهام الروتينية للمطورين خلال 3 سنوات، مع زيادة الطلب على مهندسي AI ومهندسي الأوامر.", source: "WEF Future of Jobs", date: "2026-04-15", category: "ai", field: "AI / Engineering", impactKeywords: ["ai_ml", "prompt_engineering", "python"] },
  { id: "n2", title: "Remote work stabilizes at 38% globally", titleAr: "العمل عن بُعد يستقر عند 38% عالمياً", summaryAr: "أحدث مسح من LinkedIn يكشف أن نسبة الوظائف الهجينة والبعيدة استقرت عند 38%، مع تفوّق هولندا وكندا والإمارات في تبني نموذج Remote-First.", source: "LinkedIn Workforce Report", date: "2026-04-10", category: "remote", field: "Workforce", impactKeywords: ["communication", "self_management", "ai_literacy"] },
  { id: "n3", title: "Soft skills demand surges 20%", titleAr: "ارتفاع الطلب على المهارات الناعمة بنسبة 20%", summaryAr: "أصحاب العمل يضعون التفكير النقدي والإبداع وحل المشكلات على رأس قائمة المهارات المطلوبة في 2026، متفوقة حتى على بعض المهارات التقنية.", source: "Harvard Business Review", date: "2026-03-28", category: "soft_skills", field: "Workforce", impactKeywords: ["critical_thinking", "creativity", "problem_solving"] },
  { id: "n4", title: "Saudi Arabia launches 50,000 AI jobs", titleAr: "السعودية تطلق 50,000 وظيفة في AI", summaryAr: "ضمن رؤية 2030، أعلنت SDAIA عن خطة لتوظيف 50 ألف متخصص في الذكاء الاصطناعي وعلم البيانات بحلول 2027 لدعم نيوم وSmart Cities.", source: "Reuters", date: "2026-04-20", category: "jobs", country: "SAU", field: "AI / GovTech", impactKeywords: ["ai_ml", "data_science", "cloud"] },
  { id: "n5", title: "Cybersecurity talent gap hits 4M globally", titleAr: "فجوة الأمن السيبراني تصل لـ 4 ملايين متخصص", summaryAr: "تقرير ISC2 يشير إلى نقص حاد في خبراء الأمن السيبراني عالمياً، مع زيادة المرتبات بنسبة 18% خلال العام الماضي.", source: "ISC2 Workforce Study", date: "2026-03-15", category: "tech", field: "Cybersecurity", impactKeywords: ["cybersecurity", "cloud", "python"] },
  { id: "n6", title: "Egypt becomes top outsourcing hub", titleAr: "مصر ضمن أعلى 5 مراكز Outsourcing عالمياً", summaryAr: "تقرير Kearney يضع مصر ضمن أفضل 5 وجهات عالمية لخدمات BPO وتطوير البرمجيات بفضل التكلفة التنافسية والمواهب الشابة.", source: "Kearney GSLI", date: "2026-04-05", category: "jobs", country: "EGY", field: "Outsourcing", impactKeywords: ["digital_marketing", "react", "python"] },
  { id: "n7", title: "Prompt Engineering tops fastest-growing skills", titleAr: "هندسة الأوامر تتصدر أسرع المهارات نمواً", summaryAr: "بمعدل نمو 45% سنوياً، أصبحت Prompt Engineering من أعلى المهارات طلباً، مع متوسط راتب 105 آلاف دولار للمتخصصين.", source: "LinkedIn Skills Report", date: "2026-04-01", category: "ai", field: "AI", impactKeywords: ["prompt_engineering", "ai_literacy", "ai_ml"] },
  { id: "n8", title: "EU passes new AI Act phase 2", titleAr: "الاتحاد الأوروبي يقر المرحلة الثانية من قانون AI", summaryAr: "اللوائح الجديدة تُلزم الشركات بالشفافية الكاملة في نماذج AI عالية المخاطر، مما يخلق طلباً على متخصصي AI Governance والامتثال.", source: "European Commission", date: "2026-03-22", category: "ai", field: "Policy / AI", impactKeywords: ["ai_ml", "ethics", "ai_literacy"] },
  { id: "n9", title: "Green jobs grow 23% in Europe", titleAr: "الوظائف الخضراء تنمو 23% في أوروبا", summaryAr: "ألمانيا وفرنسا وهولندا تقود الطلب على مهندسي الطاقة المتجددة ومتخصصي الاستدامة، بمعدلات نمو غير مسبوقة.", source: "Eurostat", date: "2026-03-10", category: "jobs", country: "DEU", field: "Green Tech", impactKeywords: ["renewable_energy", "project_mgmt", "data_science"] },
  { id: "n10", title: "AI literacy now a top hiring criterion", titleAr: "الإلمام بـ AI أصبح معياراً أساسياً للتوظيف", summaryAr: "76% من مديري التوظيف يفضلون المرشحين القادرين على استخدام أدوات AI بفعالية، حتى في الوظائف غير التقنية.", source: "McKinsey Global Survey", date: "2026-04-12", category: "soft_skills", field: "Workforce", impactKeywords: ["ai_literacy", "prompt_engineering", "adaptability"] },
  { id: "n11", title: "UAE invests $10B in AI ecosystem", titleAr: "الإمارات تستثمر 10 مليار دولار في منظومة AI", summaryAr: "صندوق MGX الإماراتي يضخ استثمارات ضخمة لجذب أفضل المواهب وبناء بنية تحتية للذكاء الاصطناعي في المنطقة.", source: "Bloomberg", date: "2026-04-18", category: "ai", country: "ARE", field: "AI / Investment", impactKeywords: ["ai_ml", "cloud", "leadership"] },
  { id: "n12", title: "Manual data entry jobs decline 12%", titleAr: "وظائف إدخال البيانات اليدوي تنخفض 12%", summaryAr: "تقرير ILO يحذر من تراجع سريع في الوظائف الإدارية الروتينية بسبب الأتمتة، مع توصية بإعادة تأهيل الموظفين نحو مهارات تحليلية.", source: "ILO Future of Work", date: "2026-03-05", category: "jobs", field: "Admin", impactKeywords: ["learning_agility", "ai_literacy", "adaptability"] },
];

export function getSkillById(id: string): FutureSkill | undefined {
  return FUTURE_SKILLS.find(s => s.id === id);
}

export function getCountryByIso3(iso3: string): CountryInsight | undefined {
  return COUNTRIES.find(c => c.iso3 === iso3);
}
