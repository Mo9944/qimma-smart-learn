import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  FUTURE_SKILLS, COUNTRIES, NEWS_ITEMS,
  type FutureSkill, type CountryInsight, type NewsItem,
  getCountryByIso3, getSkillById,
} from "@/data/futureSkills";
import {
  Globe, TrendingUp, TrendingDown, Minus, Newspaper, Sparkles,
  MapPin, Briefcase, Wifi, DollarSign, Target, Loader2, Download, GitCompare, Brain,
  BarChart3, Trophy,
} from "lucide-react";
import jsPDF from "jspdf";

// Map RIASEC top types -> skill ids the user is likely strong in
function deriveUserSkillIds(riasec: any, habitsCount: number): string[] {
  const ids: string[] = [];
  if (riasec) {
    const scores: Record<string, number> = {
      R: riasec.score_r, I: riasec.score_i, A: riasec.score_a,
      S: riasec.score_s, E: riasec.score_e, C: riasec.score_c,
    };
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
    if (top.includes("I")) ids.push("python", "data_science", "critical_thinking", "ai_literacy");
    if (top.includes("R")) ids.push("devops", "robotic_automation", "problem_solving");
    if (top.includes("A")) ids.push("ux_design", "graphic_design", "creativity");
    if (top.includes("S")) ids.push("communication", "mentoring", "emotional_intel", "teamwork");
    if (top.includes("E")) ids.push("leadership", "negotiation", "entrepreneurship", "decision_making");
    if (top.includes("C")) ids.push("sql", "finance_analysis", "time_mgmt");
  }
  if (habitsCount >= 3) ids.push("self_management", "learning_agility", "adaptability");
  return Array.from(new Set(ids));
}

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const trendIcon = (t: FutureSkill["trend"]) =>
  t === "rising" ? <TrendingUp className="h-4 w-4 text-emerald-500" /> :
  t === "declining" ? <TrendingDown className="h-4 w-4 text-rose-500" /> :
  <Minus className="h-4 w-4 text-amber-500" />;

const difficultyColor = (d: FutureSkill["difficulty"]) =>
  d === "easy" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" :
  d === "medium" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" :
  "bg-rose-500/10 text-rose-700 dark:text-rose-300";

const difficultyLabel = (d: FutureSkill["difficulty"]) =>
  d === "easy" ? "سهل" : d === "medium" ? "متوسط" : "متقدم";

const heatColor = (demand: number): string => {
  if (demand >= 88) return "hsl(173, 80%, 30%)";
  if (demand >= 80) return "hsl(173, 70%, 42%)";
  if (demand >= 70) return "hsl(173, 55%, 58%)";
  if (demand >= 60) return "hsl(173, 40%, 72%)";
  return "hsl(173, 25%, 86%)";
};

// Map from world-atlas numeric IDs to ISO3
const NUMERIC_TO_ISO3: Record<string, string> = {
  "840": "USA", "276": "DEU", "826": "GBR", "124": "CAN", "036": "AUS",
  "784": "ARE", "682": "SAU", "818": "EGY", "356": "IND", "702": "SGP",
  "392": "JPN", "250": "FRA", "528": "NLD", "756": "CHE", "076": "BRA",
  "792": "TUR", "156": "CHN", "710": "ZAF", "410": "KOR", "724": "ESP",
};

export default function FutureSkillsHub() {
  // Filters
  const [skillSearch, setSkillSearch] = useState("");
  const [skillTypeFilter, setSkillTypeFilter] = useState<"all" | "hard" | "soft">("all");
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>("all");

  const [newsCategory, setNewsCategory] = useState<string>("all");
  const [newsCountry, setNewsCountry] = useState<string>("all");

  // Map
  const [selectedCountry, setSelectedCountry] = useState<CountryInsight | null>(null);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);

  // News dialog
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [newsAnalysis, setNewsAnalysis] = useState("");
  const [loadingNews, setLoadingNews] = useState(false);

  // Compare
  const [compareA, setCompareA] = useState<string>("EGY");
  const [compareB, setCompareB] = useState<string>("DEU");
  const [compareAI, setCompareAI] = useState("");
  const [loadingCompare, setLoadingCompare] = useState(false);

  // AI Match
  const [matchTarget, setMatchTarget] = useState<string>("");
  const [matchAI, setMatchAI] = useState("");
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return FUTURE_SKILLS.filter(s => {
      if (skillTypeFilter !== "all" && s.type !== skillTypeFilter) return false;
      if (skillCategoryFilter !== "all" && s.category !== skillCategoryFilter) return false;
      if (skillSearch.trim()) {
        const q = skillSearch.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.nameAr.includes(skillSearch)) return false;
      }
      return true;
    }).sort((a, b) => b.demand - a.demand);
  }, [skillSearch, skillTypeFilter, skillCategoryFilter]);

  const categories = useMemo(() => Array.from(new Set(FUTURE_SKILLS.map(s => s.category))), []);

  const filteredNews = useMemo(() => {
    return NEWS_ITEMS.filter(n => {
      if (newsCategory !== "all" && n.category !== newsCategory) return false;
      if (newsCountry !== "all" && n.country !== newsCountry) return false;
      return true;
    });
  }, [newsCategory, newsCountry]);

  const handleNewsImpact = async (n: NewsItem) => {
    setActiveNews(n);
    setNewsAnalysis("");
    setLoadingNews(true);
    try {
      // Pull simple user context
      const [{ data: riasec }, { data: assess }] = await Promise.all([
        supabase.from("riasec_results").select("code").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("career_assessments").select("test_type, result_code").order("created_at", { ascending: false }).limit(3),
      ]);
      const ctx = [
        riasec?.code ? `كود RIASEC: ${riasec.code}` : "",
        assess?.length ? `تقييمات سابقة: ${assess.map(a => `${a.test_type}=${a.result_code || "?"}`).join(", ")}` : "",
      ].filter(Boolean).join(" | ");

      const { data, error } = await supabase.functions.invoke("future-insights", {
        body: { mode: "news_impact", payload: { title: n.titleAr, summary: n.summaryAr, userContext: ctx } },
      });
      if (error) throw error;
      setNewsAnalysis(data.content || "");
    } catch (e: any) {
      toast.error(e.message || "تعذّر التحليل");
    } finally {
      setLoadingNews(false);
    }
  };

  const handleCountryClick = (iso3: string) => {
    const c = getCountryByIso3(iso3);
    if (c) {
      setSelectedCountry(c);
      setCountryDialogOpen(true);
      setMatchTarget(iso3);
      setMatchAI("");
    }
  };

  const computeMatch = async () => {
    if (!matchTarget) return;
    const country = getCountryByIso3(matchTarget);
    if (!country) return;
    setLoadingMatch(true);
    setMatchAI("");
    try {
      // Get user's strong skills heuristically from RIASEC + career assessments
      const { data: riasec } = await supabase.from("riasec_results").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
      const userSkillIds: string[] = [];
      if (riasec) {
        const scores = { R: riasec.score_r, I: riasec.score_i, A: riasec.score_a, S: riasec.score_s, E: riasec.score_e, C: riasec.score_c };
        const top = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
        if (top.includes("I")) userSkillIds.push("python", "data_science", "critical_thinking");
        if (top.includes("R")) userSkillIds.push("devops", "robotic_automation", "problem_solving");
        if (top.includes("A")) userSkillIds.push("ux_design", "graphic_design", "creativity");
        if (top.includes("S")) userSkillIds.push("communication", "mentoring", "emotional_intel");
        if (top.includes("E")) userSkillIds.push("leadership", "negotiation", "entrepreneurship");
        if (top.includes("C")) userSkillIds.push("sql", "finance_analysis", "time_mgmt");
      }
      const required = [...country.topHardSkills, ...country.topSoftSkills];
      const matched = required.filter(r => userSkillIds.includes(r));
      const matchPct = required.length ? Math.round((matched.length / required.length) * 100) : 30;
      const realMatchPct = Math.max(matchPct, userSkillIds.length ? 25 : 15);
      const gaps = required.filter(r => !userSkillIds.includes(r)).slice(0, 6).map(id => getSkillById(id)?.nameAr || id);
      const strengths = matched.map(id => getSkillById(id)?.nameAr || id);

      const { data, error } = await supabase.functions.invoke("future-insights", {
        body: {
          mode: "country_match",
          payload: { countryName: country.nameAr, matchPct: realMatchPct, userStrengths: strengths.length ? strengths : ["لا توجد بيانات كافية"], gaps },
        },
      });
      if (error) throw error;
      setMatchAI(`نسبة تطابقك: ${realMatchPct}%\nنقاط القوة: ${strengths.join("، ") || "—"}\nالمهارات الناقصة: ${gaps.join("، ")}\n\n${data.content || ""}`);
    } catch (e: any) {
      toast.error(e.message || "تعذّر الحساب");
    } finally {
      setLoadingMatch(false);
    }
  };

  const compareCountries = async () => {
    const a = getCountryByIso3(compareA);
    const b = getCountryByIso3(compareB);
    if (!a || !b) return;
    setLoadingCompare(true);
    setCompareAI("");
    try {
      const { data, error } = await supabase.functions.invoke("future-insights", {
        body: {
          mode: "country_compare",
          payload: {
            a: { name: a.nameAr, salary: a.avgSalaryUsd, demand: a.demandIndex, remote: a.remotePct },
            b: { name: b.nameAr, salary: b.avgSalaryUsd, demand: b.demandIndex, remote: b.remotePct },
          },
        },
      });
      if (error) throw error;
      setCompareAI(data.content || "");
    } catch (e: any) {
      toast.error(e.message || "تعذّرت المقارنة");
    } finally {
      setLoadingCompare(false);
    }
  };

  const exportPdf = () => {
    if (!selectedCountry || !matchAI) {
      toast.error("احسب التطابق أولاً");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Career Match Report - ${selectedCountry.name}`, 105, 20, { align: "center" });
    doc.setFontSize(11);
    doc.text(`Demand Index: ${selectedCountry.demandIndex}%`, 14, 35);
    doc.text(`Avg Salary: $${selectedCountry.avgSalaryUsd.toLocaleString()}`, 14, 43);
    doc.text(`Remote Jobs: ${selectedCountry.remotePct}%`, 14, 51);
    doc.text(`Market Growth: ${selectedCountry.growthPct}%`, 14, 59);
    doc.setFontSize(13);
    doc.text("Top Hard Skills:", 14, 72);
    doc.setFontSize(10);
    selectedCountry.topHardSkills.slice(0, 10).forEach((id, i) => {
      const sk = getSkillById(id);
      if (sk) doc.text(`${i + 1}. ${sk.name} (Demand ${sk.demand}%)`, 18, 80 + i * 6);
    });
    doc.setFontSize(13);
    doc.text("AI Analysis:", 14, 150);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(matchAI, 180);
    doc.text(lines, 14, 158);
    doc.save(`match-${selectedCountry.iso3}.pdf`);
    toast.success("تم تنزيل التقرير");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Future Skills & Global Insights</h1>
            <p className="text-sm text-muted-foreground">رؤية عالمية لسوق العمل ومهارات المستقبل</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="news" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="news"><Newspaper className="h-4 w-4 ml-1" /> الأخبار</TabsTrigger>
          <TabsTrigger value="skills"><Sparkles className="h-4 w-4 ml-1" /> مؤشر المهارات</TabsTrigger>
          <TabsTrigger value="map"><Globe className="h-4 w-4 ml-1" /> الخريطة العالمية</TabsTrigger>
          <TabsTrigger value="compare"><GitCompare className="h-4 w-4 ml-1" /> مقارنة الدول</TabsTrigger>
        </TabsList>

        {/* NEWS */}
        <TabsContent value="news" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={newsCategory} onValueChange={setNewsCategory}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="التصنيف" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                <SelectItem value="ai">ذكاء اصطناعي</SelectItem>
                <SelectItem value="tech">تقنية</SelectItem>
                <SelectItem value="soft_skills">مهارات ناعمة</SelectItem>
                <SelectItem value="remote">عمل عن بُعد</SelectItem>
                <SelectItem value="jobs">وظائف</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newsCountry} onValueChange={setNewsCountry}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="الدولة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الدول</SelectItem>
                {COUNTRIES.map(c => <SelectItem key={c.iso3} value={c.iso3}>{c.nameAr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredNews.map(n => (
              <motion.div key={n.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-4 h-full hover:shadow-lg transition-shadow border-r-4 border-r-teal-500">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{n.field}</Badge>
                    <span className="text-xs text-muted-foreground">{n.date}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1.5">{n.titleAr}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{n.summaryAr}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{n.source}</span>
                    <Button size="sm" variant="outline" onClick={() => handleNewsImpact(n)}>
                      <Brain className="h-3.5 w-3.5 ml-1" /> كيف يؤثر عليك؟
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* SKILLS INDEX */}
        <TabsContent value="skills" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input placeholder="ابحث عن مهارة..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)} className="max-w-xs" />
            <Select value={skillTypeFilter} onValueChange={(v: any) => setSkillTypeFilter(v)}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="hard">Hard Skills</SelectItem>
                <SelectItem value="soft">Soft Skills</SelectItem>
              </SelectContent>
            </Select>
            <Select value={skillCategoryFilter} onValueChange={setSkillCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSkills.map((s, idx) => (
              <motion.div key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.02 }}>
                <Card className="p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={s.type === "hard" ? "default" : "secondary"} className="text-xs">
                      {s.type === "hard" ? "تقنية" : "ناعمة"}
                    </Badge>
                    {trendIcon(s.trend)}
                  </div>
                  <h3 className="font-bold text-sm mb-1">{s.nameAr}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{s.name}</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">الطلب العالمي</span>
                        <span className="font-bold text-teal-600">{s.demand}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.demand}%` }} transition={{ duration: 0.8, delay: idx * 0.02 }} className="h-full bg-gradient-to-r from-teal-500 to-emerald-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded ${difficultyColor(s.difficulty)}`}>{difficultyLabel(s.difficulty)}</span>
                      <span className={`font-bold ${s.growth > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {s.growth > 0 ? "+" : ""}{s.growth}% سنوياً
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* MAP */}
        <TabsContent value="map" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-bold">خريطة الطلب العالمي على المهارات</h3>
                <p className="text-xs text-muted-foreground">انقر على دولة لرؤية تفاصيلها</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span>منخفض</span>
                <div className="flex h-3">
                  {[86, 72, 58, 42, 30].map(d => (
                    <div key={d} className="w-6 h-3" style={{ background: heatColor(d * 1.05) }} />
                  ))}
                </div>
                <span>عالي</span>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg overflow-hidden" style={{ minHeight: 360 }}>
              <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }} style={{ width: "100%", height: "auto" }}>
                <ZoomableGroup center={[20, 20]} zoom={1}>
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo: any) => {
                        const numId = String(geo.id).padStart(3, "0");
                        const iso3 = NUMERIC_TO_ISO3[numId];
                        const country = iso3 ? getCountryByIso3(iso3) : undefined;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={country ? heatColor(country.demandIndex) : "hsl(var(--muted))"}
                            stroke="hsl(var(--background))"
                            strokeWidth={0.4}
                            style={{
                              default: { outline: "none", cursor: country ? "pointer" : "default" },
                              hover: { outline: "none", fill: country ? "hsl(173, 90%, 25%)" : "hsl(var(--muted))" },
                              pressed: { outline: "none" },
                            }}
                            onClick={() => iso3 && handleCountryClick(iso3)}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
            </div>
          </Card>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {COUNTRIES.sort((a, b) => b.demandIndex - a.demandIndex).map(c => (
              <Card key={c.iso3} className="p-3 cursor-pointer hover:shadow-md transition" onClick={() => handleCountryClick(c.iso3)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{c.nameAr}</p>
                    <p className="text-xs text-muted-foreground">{c.region}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: heatColor(c.demandIndex) }}>
                    {c.demandIndex}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* COMPARE */}
        <TabsContent value="compare" className="space-y-4">
          <Card className="p-4">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">الدولة الأولى</label>
                <Select value={compareA} onValueChange={setCompareA}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c.iso3} value={c.iso3}>{c.nameAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">الدولة الثانية</label>
                <Select value={compareB} onValueChange={setCompareB}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c.iso3} value={c.iso3}>{c.nameAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(() => {
              const a = getCountryByIso3(compareA);
              const b = getCountryByIso3(compareB);
              if (!a || !b) return null;
              const rows = [
                { label: "مؤشر الطلب", a: `${a.demandIndex}%`, b: `${b.demandIndex}%`, icon: TrendingUp },
                { label: "متوسط الراتب", a: `$${a.avgSalaryUsd.toLocaleString()}`, b: `$${b.avgSalaryUsd.toLocaleString()}`, icon: DollarSign },
                { label: "نمو السوق", a: `+${a.growthPct}%`, b: `+${b.growthPct}%`, icon: TrendingUp },
                { label: "وظائف عن بُعد", a: `${a.remotePct}%`, b: `${b.remotePct}%`, icon: Wifi },
              ];
              return (
                <div className="space-y-2">
                  {rows.map(r => (
                    <div key={r.label} className="grid grid-cols-3 items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <div className="text-center font-bold text-teal-600">{r.a}</div>
                      <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <r.icon className="h-3.5 w-3.5" /> {r.label}
                      </div>
                      <div className="text-center font-bold text-emerald-600">{r.b}</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center text-sm font-bold p-2 bg-teal-500/10 rounded">{a.nameAr}</div>
                    <div></div>
                    <div className="text-center text-sm font-bold p-2 bg-emerald-500/10 rounded">{b.nameAr}</div>
                  </div>
                </div>
              );
            })()}
            <Button className="w-full mt-4 gradient-primary" onClick={compareCountries} disabled={loadingCompare}>
              {loadingCompare ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Brain className="h-4 w-4 ml-2" />}
              تحليل المقارنة بالذكاء الاصطناعي
            </Button>
            {compareAI && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-muted/40 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                {compareAI}
              </motion.div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* News dialog */}
      <Dialog open={!!activeNews} onOpenChange={(o) => !o && setActiveNews(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{activeNews?.titleAr}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-2">
            <p className="text-sm text-muted-foreground mb-3">{activeNews?.summaryAr}</p>
            <div className="border-t pt-3">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-1"><Sparkles className="h-4 w-4 text-teal-500" /> تأثيره على مسارك</h4>
              {loadingNews ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> جاري التحليل...</div>
              ) : (
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{newsAnalysis}</div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Country dialog */}
      <Dialog open={countryDialogOpen} onOpenChange={setCountryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[88vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-500" />
              {selectedCountry?.nameAr} — {selectedCountry?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCountry && (
            <ScrollArea className="max-h-[68vh] pr-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Card className="p-3 text-center">
                    <Briefcase className="h-4 w-4 mx-auto mb-1 text-teal-500" />
                    <p className="text-xs text-muted-foreground">مؤشر الطلب</p>
                    <p className="font-bold text-lg">{selectedCountry.demandIndex}%</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <DollarSign className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                    <p className="text-xs text-muted-foreground">متوسط الراتب</p>
                    <p className="font-bold text-lg">${(selectedCountry.avgSalaryUsd / 1000).toFixed(0)}K</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Wifi className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                    <p className="text-xs text-muted-foreground">عن بُعد</p>
                    <p className="font-bold text-lg">{selectedCountry.remotePct}%</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <TrendingUp className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                    <p className="text-xs text-muted-foreground">نمو السوق</p>
                    <p className="font-bold text-lg">+{selectedCountry.growthPct}%</p>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <Card className="p-3">
                    <h4 className="font-bold text-sm mb-2">أعلى 10 مهارات تقنية</h4>
                    <ol className="space-y-1 text-sm">
                      {selectedCountry.topHardSkills.slice(0, 10).map((id, i) => {
                        const sk = getSkillById(id);
                        return sk ? (
                          <li key={id} className="flex justify-between">
                            <span>{i + 1}. {sk.nameAr}</span>
                            <span className="text-teal-600 font-bold">{sk.demand}%</span>
                          </li>
                        ) : null;
                      })}
                    </ol>
                  </Card>
                  <Card className="p-3">
                    <h4 className="font-bold text-sm mb-2">أعلى 10 مهارات ناعمة</h4>
                    <ol className="space-y-1 text-sm">
                      {selectedCountry.topSoftSkills.slice(0, 10).map((id, i) => {
                        const sk = getSkillById(id);
                        return sk ? (
                          <li key={id} className="flex justify-between">
                            <span>{i + 1}. {sk.nameAr}</span>
                            <span className="text-emerald-600 font-bold">{sk.demand}%</span>
                          </li>
                        ) : null;
                      })}
                    </ol>
                  </Card>
                </div>

                <Card className="p-3">
                  <h4 className="font-bold text-sm mb-2">أكثر المجالات نمواً</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountry.topGrowingFields.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
                  </div>
                </Card>

                <Card className="p-3 border-teal-500/30 border-2">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-1"><Target className="h-4 w-4 text-teal-500" /> AI Personal Match</h4>
                  <p className="text-xs text-muted-foreground mb-2">نسبة تطابقك مع سوق هذه الدولة + خطة عملية</p>
                  <div className="flex gap-2">
                    <Button onClick={computeMatch} disabled={loadingMatch} className="flex-1 gradient-primary">
                      {loadingMatch ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Sparkles className="h-4 w-4 ml-2" />}
                      احسب نسبة التطابق
                    </Button>
                    {matchAI && (
                      <Button variant="outline" onClick={exportPdf}>
                        <Download className="h-4 w-4 ml-1" /> PDF
                      </Button>
                    )}
                  </div>
                  <AnimatePresence>
                    {matchAI && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 p-3 bg-muted/40 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                        {matchAI}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
