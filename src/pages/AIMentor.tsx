import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "هل عليّ تغيير مجالي الحالي؟",
  "لماذا أفقد الحافز كثيراً؟",
  "كيف أتعامل مع ضغط الدراسة والعمل؟",
  "ما الخطوات العملية لتقليل قلقي المهني؟",
  "هل لديّ احتراق وظيفي؟ كيف أعالجه؟",
];

export default function AIMentor() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextSummary, setContextSummary] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    buildContext();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const buildContext = async () => {
    const [pRes, rRes, hRes, aRes] = await Promise.all([
      supabase.from("psych_assessments").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("riasec_results").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("habits").select("name").limit(5),
      supabase.from("career_assessments").select("type, results").order("created_at", { ascending: false }).limit(5),
    ]);

    let ctx = "بيانات المستخدم:\n";
    if (pRes.data) {
      const p = pRes.data;
      ctx += `\n[التحليل النفسي]\n- الثقة: ${p.confidence}% | القلق: ${p.anxiety}% | اتخاذ القرار: ${p.decision_ability}% | تحمّل الضغط: ${p.stress_tolerance}%\n- مؤشر الاحتراق: ${p.burnout_risk}% | نمط التفكير: ${p.thinking_style}\n`;
    } else {
      ctx += "\n[التحليل النفسي]: لم يُكمَل بعد\n";
    }
    if (rRes.data) {
      ctx += `\n[الشخصية المهنية RIASEC]: ${rRes.data.code}\n`;
    }
    if (hRes.data && hRes.data.length > 0) {
      ctx += `\n[العادات المتابعة]: ${hRes.data.map((h: any) => h.name).join(", ")}\n`;
    }
    if (aRes.data && aRes.data.length > 0) {
      ctx += `\n[تقييمات إضافية مكتملة]: ${aRes.data.length}\n`;
    }
    setContextSummary(ctx);
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMessage: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Add empty assistant message
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const fullPrompt = `${contextSummary}\n\nسؤال المستخدم: ${msg}\n\nسجل المحادثة السابق:\n${messages.map(m => `${m.role === "user" ? "المستخدم" : "المرشد"}: ${m.content}`).join("\n")}`;

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ tool: "guidance_mentor", text: fullPrompt }),
      });

      if (resp.status === 429) { toast({ title: "تم تجاوز الحد، حاول لاحقاً", variant: "destructive" }); throw new Error("rate"); }
      if (resp.status === 402) { toast({ title: "يرجى إضافة رصيد", variant: "destructive" }); throw new Error("payment"); }
      if (!resp.ok || !resp.body) throw new Error("Failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let done = false;

      while (!done) {
        const { done: rDone, value } = await reader.read();
        if (rDone) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(j);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) {
              assistantText += c;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e: any) {
      setMessages(prev => prev.slice(0, -1));
      if (!["rate", "payment"].includes(e?.message)) {
        toast({ title: "خطأ في المرشد الذكي", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
      <div className="text-center space-y-1 pb-4 border-b border-border">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold font-display">المرشد الذكي</h1>
        <p className="text-xs text-muted-foreground">يحلل حالتك ويجيب بناءً على بياناتك الفعلية</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center space-y-4 py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground">اسأل المرشد عن أي شيء يخص حياتك النفسية أو المهنية</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
              {SUGGESTED.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-sm px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
            }`}>
              {m.content || <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="gap-1">
            <RefreshCw className="h-3 w-3" /> محادثة جديدة
          </Button>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="اكتب سؤالك هنا..."
            disabled={loading}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button onClick={() => send()} disabled={loading || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
