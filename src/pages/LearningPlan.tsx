import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Check, BookOpen, Plus, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

interface Plan {
  id: string;
  user_goal: string;
  daily_time: number;
  duration: string;
  plan_content: string | null;
  created_at: string;
}

interface Task {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  week_number: number | null;
  day_number: number | null;
  status: string;
}

export default function LearningPlan() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const [goal, setGoal] = useState("");
  const [dailyTime, setDailyTime] = useState("30");
  const [duration, setDuration] = useState("4 أسابيع");

  useEffect(() => { loadPlans(); }, []);

  async function loadPlans() {
    setLoading(true);
    const [p, t] = await Promise.all([
      supabase.from("learning_plans").select("*").order("created_at", { ascending: false }),
      supabase.from("learning_tasks").select("*").order("week_number").order("day_number"),
    ]);
    if (p.data) setPlans(p.data);
    if (t.data) setTasks(t.data);
    setLoading(false);
  }

  async function generatePlan() {
    if (!goal.trim()) { toast({ title: "أدخل المهارة المطلوبة", variant: "destructive" }); return; }
    setGenerating(true);

    const prompt = `المهارة: ${goal}\nالوقت المتاح يومياً: ${dailyTime} دقيقة\nمدة التعلم: ${duration}`;

    try {
      // Stream AI response
      const resp = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ tool: "learning_plan", text: prompt }),
      });

      if (!resp.ok) throw new Error("فشل في إنشاء الخطة");

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let content = "";
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) content += c;
          } catch { buf = line + "\n" + buf; break; }
        }
      }

      // Save plan
      const { data: planData } = await supabase.from("learning_plans").insert({
        user_goal: goal,
        daily_time: parseInt(dailyTime),
        duration,
        plan_content: content,
      }).select().single();

      if (planData) {
        // Extract tasks from content
        const lines = content.split("\n").filter(l => l.match(/^[\-\*\d]/) || l.match(/^\s*[\-\*]/));
        const taskInserts = lines.slice(0, 20).map((line, i) => ({
          plan_id: planData.id,
          title: line.replace(/^[\s\-\*\d.]+/, "").trim().slice(0, 200),
          week_number: Math.floor(i / 5) + 1,
          day_number: (i % 5) + 1,
        })).filter(t => t.title.length > 3);

        if (taskInserts.length > 0) {
          await supabase.from("learning_tasks").insert(taskInserts);
        }

        setExpandedPlan(planData.id);
      }

      toast({ title: "تم إنشاء خطة التعلم ✨" });
      setGoal("");
      loadPlans();
    } catch (err: any) {
      toast({ title: err.message || "حدث خطأ", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function toggleTask(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await supabase.from("learning_tasks").update({ status: newStatus }).eq("id", taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  }

  async function deletePlan(planId: string) {
    await supabase.from("learning_plans").delete().eq("id", planId);
    toast({ title: "تم حذف الخطة 🗑️" });
    loadPlans();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">خطة التعلم الذكية</h1>
        <p className="text-muted-foreground text-sm">أنشئ خطة تعلم مخصصة بالذكاء الاصطناعي</p>
      </div>

      {/* Generator */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> إنشاء خطة جديدة</h3>
        <Input placeholder="ما المهارة التي تريد تعلمها؟ (مثال: البرمجة بلغة Python)" value={goal} onChange={e => setGoal(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">الوقت المتاح يومياً</label>
            <Select value={dailyTime} onValueChange={setDailyTime}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 دقيقة</SelectItem>
                <SelectItem value="30">30 دقيقة</SelectItem>
                <SelectItem value="60">ساعة</SelectItem>
                <SelectItem value="120">ساعتان</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">مدة التعلم</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="أسبوع">أسبوع</SelectItem>
                <SelectItem value="أسبوعان">أسبوعان</SelectItem>
                <SelectItem value="4 أسابيع">شهر</SelectItem>
                <SelectItem value="8 أسابيع">شهران</SelectItem>
                <SelectItem value="12 أسبوع">3 أشهر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={generatePlan} disabled={generating} className="w-full" size="lg">
          {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> جارِ إنشاء الخطة...</> : <><Sparkles className="h-4 w-4" /> إنشاء خطة التعلم</>}
        </Button>
      </div>

      {/* Plans */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جارِ التحميل...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد خطط بعد. أنشئ خطتك الأولى!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map(plan => {
            const planTasks = tasks.filter(t => t.plan_id === plan.id);
            const completed = planTasks.filter(t => t.status === "completed").length;
            const isExpanded = expandedPlan === plan.id;

            return (
              <div key={plan.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                  className="w-full p-4 flex items-center justify-between text-right hover:bg-secondary/30 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold">{plan.user_goal}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{plan.daily_time} دقيقة/يوم</span>
                      <span>{plan.duration}</span>
                      {planTasks.length > 0 && <span className="text-primary font-medium">{completed}/{planTasks.length} مهمة</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={e => { e.stopPropagation(); deletePlan(plan.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* Tasks */}
                    {planTasks.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">المهام</h4>
                        {planTasks.map(task => (
                          <button key={task.id} onClick={() => toggleTask(task.id, task.status)}
                            className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-secondary/30 transition-colors text-right">
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              task.status === "completed" ? "bg-primary border-primary" : "border-muted-foreground/30"
                            }`}>
                              {task.status === "completed" && <Check className="h-3 w-3 text-primary-foreground" />}
                            </div>
                            <span className={`text-sm flex-1 ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </span>
                            {task.week_number && <span className="text-xs text-muted-foreground">أسبوع {task.week_number}</span>}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Full plan content */}
                    {plan.plan_content && (
                      <div className="prose prose-sm max-w-none text-sm leading-relaxed border-t border-border pt-4">
                        <ReactMarkdown>{plan.plan_content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
