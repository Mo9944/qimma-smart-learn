import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Send, Loader2, User, Bot, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UserData {
  riasec: any;
  habits: any[];
  habitProgress: any[];
  quizzes: any[];
  subjects: any[];
  learningPlans: any[];
}

async function loadUserData(): Promise<UserData> {
  const [riasec, habits, habitProgress, quizzes, subjects, plans] = await Promise.all([
    supabase.from("riasec_results").select("*").order("created_at", { ascending: false }).limit(1),
    supabase.from("habits").select("*"),
    supabase.from("habit_progress").select("*").gte("date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]),
    supabase.from("quizzes").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("subjects").select("*, lessons(id, completed)"),
    supabase.from("learning_plans").select("*").order("created_at", { ascending: false }).limit(3),
  ]);
  return {
    riasec: riasec.data?.[0] || null,
    habits: habits.data || [],
    habitProgress: habitProgress.data || [],
    quizzes: quizzes.data || [],
    subjects: subjects.data || [],
    learningPlans: plans.data || [],
  };
}

function buildContext(data: UserData): string {
  const typeNames: Record<string, string> = {
    R: "واقعي", I: "بحثي", A: "فني", S: "اجتماعي", E: "مبادر", C: "تقليدي"
  };

  const riasecInfo = data.riasec
    ? `نوع الشخصية: ${data.riasec.code} (${data.riasec.code.split("").map((c: string) => typeNames[c] || c).join(" - ")})
النقاط: واقعي=${data.riasec.score_r}, بحثي=${data.riasec.score_i}, فني=${data.riasec.score_a}, اجتماعي=${data.riasec.score_s}, مبادر=${data.riasec.score_e}, تقليدي=${data.riasec.score_c}`
    : "لم يتم إجراء اختبار الشخصية بعد";

  const habitsInfo = data.habits.length > 0
    ? data.habits.map(h => {
        const completed = data.habitProgress.filter(p => p.habit_id === h.id).length;
        return `- ${h.name}: ${completed}/30 يوم (${Math.round((completed / 30) * 100)}% التزام)`;
      }).join("\n")
    : "لا توجد عادات مسجلة";

  const quizAvg = data.quizzes.length > 0
    ? Math.round(data.quizzes.reduce((s, q) => s + ((q.score || 0) / (q.total_questions || 1)) * 100, 0) / data.quizzes.length)
    : 0;

  const subjectsInfo = data.subjects.map((s: any) => {
    const total = s.lessons?.length || 0;
    const done = s.lessons?.filter((l: any) => l.completed).length || 0;
    return `- ${s.name}: ${done}/${total} درس مكتمل`;
  }).join("\n") || "لا توجد مواد";

  const goalsInfo = data.learningPlans.map(p => `- ${p.user_goal} (${p.duration}, ${p.daily_time} دقيقة/يوم)`).join("\n") || "لا توجد أهداف";

  return `بيانات المستخدم:

📊 اختبار الشخصية (RIASEC):
${riasecInfo}

🔄 العادات (آخر 30 يوم):
${habitsInfo}

📝 الاختبارات:
عدد الاختبارات: ${data.quizzes.length}
المعدل العام: ${quizAvg}%

📚 المواد والدروس:
${subjectsInfo}

🎯 الأهداف:
${goalsInfo}`;
}

export default function AskAboutMe() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !userData) {
      setLoadingData(true);
      loadUserData().then(d => {
        setUserData(d);
        setLoadingData(false);
      });
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || !userData) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const context = buildContext(userData);
    const fullPrompt = messages.length === 0
      ? `${context}\n\nسؤال المستخدم: ${msg}`
      : msg;

    try {
      const resp = await fetch(AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ tool: "ask_about_me", text: fullPrompt }),
      });

      if (!resp.ok) throw new Error("خطأ في الاتصال");
      if (!resp.body) throw new Error("No body");

      let result = "";
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
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
            if (c) {
              result += c;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: result } : m);
                }
                return [...prev, { role: "assistant", content: result }];
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "عذرًا، حدث خطأ. حاول مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "حلل شخصيتي وأعطني نصائح",
    "ما هي نقاط قوتي؟",
    "اقترح خطة تطوير لي",
    "كيف أحسّن عاداتي؟",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-primary text-primary-foreground shadow-lg">
          <MessageCircle className="h-4 w-4" />
          اسأل عني
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 pb-3 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            مستشارك الذكي
          </DialogTitle>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">جارِ تحميل بياناتك...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="space-y-4 pt-4">
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto">
                  <Bot className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-semibold">مرحبًا! أنا مستشارك الذكي</h3>
                <p className="text-sm text-muted-foreground">سأحلل بياناتك وأقدم لك نصائح مخصصة</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="text-right text-sm rounded-xl border border-primary/20 bg-primary/5 p-3 hover:bg-primary/10 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}>
                  {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-md"
                    : "bg-secondary rounded-tl-md"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-2">
              <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-md px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border shrink-0">
          <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)}
              placeholder="اكتب سؤالك..." disabled={loading || loadingData} className="flex-1" />
            <Button type="submit" size="icon" disabled={loading || loadingData || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
