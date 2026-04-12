import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp, Sparkles, AlertTriangle, CheckCircle2, Clock, Wrench, FolderOpen, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AssessmentType } from "@/data/careerAssessments";
import { getTopCareerPaths, CareerPath } from "@/data/careerPaths";

export default function CareerPaths() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allResults, setAllResults] = useState<Record<string, Record<string, number>>>({});
  const [completedTypes, setCompletedTypes] = useState<Set<string>>(new Set());
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  const requiredTypes: AssessmentType[] = ["personality", "capabilities", "strengths", "thinking", "learning"];

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const { data } = await supabase
      .from("career_assessments")
      .select("test_type, results")
      .order("created_at", { ascending: false });

    if (data) {
      const results: Record<string, Record<string, number>> = {};
      const types = new Set<string>();
      for (const row of data) {
        if (!results[row.test_type]) {
          results[row.test_type] = row.results as Record<string, number>;
          types.add(row.test_type);
        }
      }
      setAllResults(results);
      setCompletedTypes(types);
    }
    setLoading(false);
  };

  const missingTests = requiredTypes.filter(t => !completedTypes.has(t));
  const hasEnoughData = missingTests.length <= 2;
  const topPaths = hasEnoughData ? getTopCareerPaths(allResults) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display">المسارات المهنية المقترحة</h1>
        <p className="text-muted-foreground text-sm">بناءً على تحليلاتك الشاملة، إليك أفضل المسارات المناسبة لك</p>
      </div>

      {/* Progress indicator */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">التحليلات المكتملة</span>
          <Badge variant={missingTests.length === 0 ? "default" : "secondary"}>
            {completedTypes.size}/{requiredTypes.length}
          </Badge>
        </div>
        <Progress value={(completedTypes.size / requiredTypes.length) * 100} className="h-2" />
        {missingTests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {missingTests.map(t => {
              const labels: Record<string, string> = {
                personality: "الشخصية", capabilities: "القدرات", strengths: "نقاط القوة",
                thinking: "التفكير", learning: "التعلم"
              };
              return (
                <Badge key={t} variant="outline" className="text-xs cursor-pointer hover:bg-secondary"
                  onClick={() => navigate("/dashboard/career-compass")}>
                  <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />
                  {labels[t]} - لم يكتمل
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {!hasEnoughData ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl border-2 border-dashed border-primary/30 p-8 text-center">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">أكمل التحليلات أولاً</h3>
          <p className="text-muted-foreground text-sm mb-4">
            تحتاج إلى إكمال 3 تحليلات على الأقل لعرض المسارات المقترحة
          </p>
          <Button onClick={() => navigate("/dashboard/career-compass")}>
            ابدأ التحليلات
            <ArrowRight className="h-4 w-4 mr-1" />
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {topPaths.map(({ path, matchPct, reasons }, i) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
                className="w-full p-4 flex items-center gap-3 text-right hover:bg-secondary/30 transition-colors"
              >
                <div className="text-3xl">{path.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base">{path.name}</h3>
                    {i === 0 && <Badge className="bg-amber-500/20 text-amber-700 border-amber-300 text-[10px]">الأنسب لك</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{path.description}</p>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`text-lg font-bold ${matchPct >= 70 ? "text-green-600" : matchPct >= 50 ? "text-amber-600" : "text-muted-foreground"}`}>
                    {matchPct}%
                  </div>
                  <span className="text-[10px] text-muted-foreground">توافق</span>
                </div>
                {expandedPath === path.id ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
              </button>

              {/* Match bar */}
              <div className="px-4 pb-2">
                <Progress value={matchPct} className="h-1.5" />
              </div>

              {/* Reasons */}
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                {reasons.map((r, j) => (
                  <Badge key={j} variant="secondary" className="text-[10px] font-normal">
                    <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
                    {r}
                  </Badge>
                ))}
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {expandedPath === path.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <PathDetails path={path} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function PathDetails({ path }: { path: CareerPath }) {
  return (
    <div className="border-t border-border p-4 space-y-4">
      {/* Advantages & Challenges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3">
          <h4 className="text-xs font-bold text-green-700 dark:text-green-400 mb-2">✅ المميزات</h4>
          <ul className="space-y-1">
            {path.advantages.map((a, i) => (
              <li key={i} className="text-xs text-green-800 dark:text-green-300">• {a}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">⚠️ التحديات</h4>
          <ul className="space-y-1">
            {path.challenges.map((c, i) => (
              <li key={i} className="text-xs text-amber-800 dark:text-amber-300">• {c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Required Skills */}
      <div>
        <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          المهارات المطلوبة
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {path.requiredSkills.map((s, i) => (
            <Badge key={i} variant="outline" className="text-[11px]">{s}</Badge>
          ))}
        </div>
      </div>

      {/* Roadmap Tabs */}
      <div>
        <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
          <Map className="h-3.5 w-3.5 text-primary" />
          خريطة الطريق
        </h4>
        <Tabs defaultValue="3" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-8">
            <TabsTrigger value="3" className="text-xs gap-1">
              <Clock className="h-3 w-3" /> 3 أشهر
            </TabsTrigger>
            <TabsTrigger value="6" className="text-xs gap-1">
              <Clock className="h-3 w-3" /> 6 أشهر
            </TabsTrigger>
            <TabsTrigger value="12" className="text-xs gap-1">
              <Clock className="h-3 w-3" /> 12 شهر
            </TabsTrigger>
          </TabsList>
          {(["3", "6", "12"] as const).map(period => {
            const key = `months${period}` as keyof typeof path.roadmap;
            return (
              <TabsContent key={period} value={period} className="mt-2">
                <ul className="space-y-2">
                  {path.roadmap[key].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Tools & Projects */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5 text-primary" />
            أدوات مقترحة
          </h4>
          <div className="flex flex-wrap gap-1">
            {path.tools.map((t, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">{t}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5 text-primary" />
            مشاريع تطبيقية
          </h4>
          <ul className="space-y-1">
            {path.projects.map((p, i) => (
              <li key={i} className="text-[11px] text-muted-foreground">• {p}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
