import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, FileText, Lightbulb, Map, CreditCard, Loader2, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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

    // Simulated AI response - will be connected to real AI API
    await new Promise(r => setTimeout(r, 1500));
    
    const responses: Record<string, string> = {
      explain: `📖 شرح مبسّط:\n\n${input.slice(0, 100)}...\n\nالفكرة الرئيسية: هذا المفهوم يعتمد على فهم العلاقة بين العناصر المختلفة.\n\n✅ النقاط الأساسية:\n1. الفهم العميق للمبادئ الأساسية\n2. الربط بين المفاهيم المختلفة\n3. التطبيق العملي للمعرفة`,
      quiz: `📝 أسئلة تلقائية:\n\n1. ما هو المفهوم الرئيسي في هذا الدرس؟\n2. اشرح العلاقة بين العناصر المذكورة.\n3. ما هي الخطوات الأساسية؟\n4. قارن بين المفهومين الرئيسيين.\n5. أعطِ مثالاً عملياً.\n6. ما هي أهمية هذا الموضوع؟\n7. كيف يمكن تطبيق هذا المفهوم؟\n8. ما هي النتائج المتوقعة؟\n9. اذكر ثلاث فوائد.\n10. لخّص الفكرة الرئيسية في جملة واحدة.`,
      summary: `📋 الملخص:\n\n${input.slice(0, 50)}...\n\nالنقاط الرئيسية:\n• النقطة الأولى: المبادئ الأساسية\n• النقطة الثانية: التطبيقات العملية\n• النقطة الثالثة: النتائج والخلاصة`,
      mindmap: `🗺️ خريطة ذهنية:\n\n📌 الموضوع الرئيسي\n├── 🔹 الفرع الأول\n│   ├── النقطة 1.1\n│   └── النقطة 1.2\n├── 🔹 الفرع الثاني\n│   ├── النقطة 2.1\n│   └── النقطة 2.2\n└── 🔹 الفرع الثالث\n    ├── النقطة 3.1\n    └── النقطة 3.2`,
      flashcards: `🎴 فلاش كارد:\n\n━━━━━━━━━━━━━━━\nالبطاقة 1\nالسؤال: ما هو المفهوم الأساسي؟\nالإجابة: هو العلاقة بين العناصر المختلفة\n━━━━━━━━━━━━━━━\nالبطاقة 2\nالسؤال: كيف يتم التطبيق؟\nالإجابة: عبر اتباع الخطوات المنهجية\n━━━━━━━━━━━━━━━\nالبطاقة 3\nالسؤال: ما هي النتيجة؟\nالإجابة: تحقيق الفهم العميق والتطبيق العملي`,
    };

    setOutput(responses[activeTool] || "");
    setLoading(false);
    toast({ title: "تم التوليد بنجاح ✨" });
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
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

        {/* Output */}
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
