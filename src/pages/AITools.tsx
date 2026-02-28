import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, FileText, Lightbulb, Map, CreditCard, Loader2, Sparkles, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AudioRecorder from "@/components/AudioRecorder";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

const aiTools = [
  { id: "explain", icon: Lightbulb, label: "شرح مبسّط", desc: "تحويل النص إلى شرح واضح ومبسّط" },
  { id: "quiz", icon: FileText, label: "إنشاء أسئلة", desc: "توليد 10 أسئلة تلقائية من النص" },
  { id: "summary", icon: Brain, label: "ملخص", desc: "إنشاء ملخص مركّز للنص" },
  { id: "mindmap", icon: Map, label: "خريطة ذهنية", desc: "تحويل النص إلى خريطة ذهنية نصية" },
  { id: "flashcards", icon: CreditCard, label: "فلاش كارد", desc: "إنشاء بطاقات مراجعة من النص" },
];

export default function AITools() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState("explain");

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast({ title: "أدخل نصًا أولاً", variant: "destructive" });
      return;
    }
    setLoading(true);
    setOutput("");

    try {
      const resp = await fetch(AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ tool: activeTool, text: input }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "خطأ غير متوقع" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              result += content;
              setOutput(result);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      toast({ title: "تم التوليد بنجاح ✨" });
    } catch (err: any) {
      console.error("AI error:", err);
      toast({ title: err.message || "حدث خطأ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">أدوات الذكاء الاصطناعي</h1>
        <p className="text-muted-foreground text-sm">أدخل نص الدرس واختر الأداة المناسبة</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-3">
        {aiTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`flex items-center gap-3 rounded-xl border p-4 transition-all text-right ${
              activeTool === tool.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${
              activeTool === tool.id ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              <tool.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">{tool.label}</div>
              <div className="text-xs text-muted-foreground truncate">{tool.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Audio Recorder */}
      <AudioRecorder onTranscriptReady={(text) => {
        setInput(text);
        setActiveTool("summary");
      }} />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-medium text-sm">النص المدخل</h3>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="ألصق نص الدرس هنا..."
            className="min-h-[300px] resize-none"
          />
          <Button onClick={handleGenerate} disabled={loading} className="w-full" variant="default" size="lg">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جارِ التوليد...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                توليد
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-sm">النتيجة</h3>
          <div className="min-h-[300px] rounded-xl border border-border bg-card p-5 whitespace-pre-wrap text-sm leading-relaxed">
            {output || (
              <span className="text-muted-foreground">ستظهر النتيجة هنا بعد التوليد...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
