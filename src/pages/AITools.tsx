import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Brain, FileText, Lightbulb, Map, CreditCard, Loader2, Sparkles,
  Search, StickyNote, Mic, Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AudioRecorder from "@/components/AudioRecorder";
import PdfUploader from "@/components/PdfUploader";
import ReactMarkdown from "react-markdown";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

const tools = [
  { id: "summary", icon: Brain, label: "تلخيص", desc: "تلخيص النص واستخراج النقاط الرئيسية" },
  { id: "explain", icon: Lightbulb, label: "شرح", desc: "شرح مبسّط ومفصّل مع أمثلة" },
  { id: "quiz", icon: FileText, label: "أسئلة", desc: "توليد أسئلة تلقائية من النص" },
  { id: "mindmap", icon: Map, label: "خريطة ذهنية", desc: "تحويل النص إلى خريطة ذهنية" },
  { id: "flashcards", icon: CreditCard, label: "فلاش كارد", desc: "إنشاء بطاقات مراجعة" },
];

async function streamAI(
  tool: string,
  text: string,
  onDelta: (t: string) => void,
  onDone: () => void,
) {
  const resp = await fetch(AI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ tool, text }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "خطأ غير متوقع" }));
    throw new Error(err.error || `Error ${resp.status}`);
  }
  if (!resp.body) throw new Error("No body");

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
      if (json === "[DONE]") { onDone(); return; }
      try {
        const c = JSON.parse(json).choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

export default function AITools() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("tools");

  // Tools state
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState("summary");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Notes state
  const [noteInput, setNoteInput] = useState("");
  const [noteResult, setNoteResult] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) { toast({ title: "أدخل نصًا أولاً", variant: "destructive" }); return; }
    setLoading(true);
    setOutput("");
    let result = "";
    try {
      await streamAI(activeTool, input, (chunk) => { result += chunk; setOutput(result); }, () => {});
      toast({ title: "تم بنجاح ✨" });
    } catch (err: any) {
      toast({ title: err.message || "حدث خطأ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { toast({ title: "اكتب سؤالك أولاً", variant: "destructive" }); return; }
    setSearchLoading(true);
    setSearchResult("");
    let result = "";
    try {
      await streamAI("search", searchQuery, (chunk) => { result += chunk; setSearchResult(result); }, () => {});
    } catch (err: any) {
      toast({ title: err.message || "حدث خطأ", variant: "destructive" });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleNotes = async () => {
    if (!noteInput.trim()) { toast({ title: "اكتب ملاحظاتك أولاً", variant: "destructive" }); return; }
    setNoteLoading(true);
    setNoteResult("");
    let result = "";
    try {
      await streamAI("notes", noteInput, (chunk) => { result += chunk; setNoteResult(result); }, () => {});
    } catch (err: any) {
      toast({ title: err.message || "حدث خطأ", variant: "destructive" });
    } finally {
      setNoteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">أدوات الذكاء الاصطناعي</h1>
        <p className="text-muted-foreground text-sm">تلخيص، شرح، بحث ذكي، وتنظيم ملاحظات</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="tools" className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">الأدوات</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-1.5">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">بحث ذكي</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5">
            <StickyNote className="h-4 w-4" />
            <span className="hidden sm:inline">ملاحظات</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Tools Tab */}
        <TabsContent value="tools" className="space-y-5 mt-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {tools.map((tool) => (
              <button key={tool.id} onClick={() => setActiveTool(tool.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all text-center ${
                  activeTool === tool.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/30"
                }`}>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  activeTool === tool.id ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  <tool.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">{tool.label}</span>
              </button>
            ))}
          </div>

          <AudioRecorder onTranscriptReady={(text) => { setInput(text); setActiveTool("summary"); }} />

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium text-sm">النص المدخل</h3>
              <Textarea value={input} onChange={e => setInput(e.target.value)}
                placeholder="ألصق أو اكتب النص هنا..." className="min-h-[250px] resize-none" />
              <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جارِ المعالجة...</>
                  : <><Sparkles className="h-4 w-4" /> معالجة</>}
              </Button>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-sm">النتيجة</h3>
              <div className="min-h-[250px] rounded-xl border border-border bg-card p-4 overflow-auto text-sm leading-relaxed prose prose-sm max-w-none">
                {output ? <ReactMarkdown>{output}</ReactMarkdown>
                  : <span className="text-muted-foreground">ستظهر النتيجة هنا...</span>}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Smart Search Tab */}
        <TabsContent value="search" className="space-y-5 mt-5">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex gap-3">
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="اكتب سؤالك هنا..." className="flex-1"
                onKeyDown={e => e.key === "Enter" && handleSearch()} />
              <Button onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="min-h-[200px] rounded-lg border border-border bg-secondary/30 p-4 text-sm leading-relaxed prose prose-sm max-w-none">
              {searchResult ? <ReactMarkdown>{searchResult}</ReactMarkdown>
                : <span className="text-muted-foreground">اكتب سؤالك وسيجيبك الذكاء الاصطناعي...</span>}
            </div>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-5 mt-5">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium text-sm">اكتب أفكارك وملاحظاتك</h3>
              <Textarea value={noteInput} onChange={e => setNoteInput(e.target.value)}
                placeholder="اكتب ملاحظاتك وأفكارك هنا..." className="min-h-[250px] resize-none" />
              <Button onClick={handleNotes} disabled={noteLoading} className="w-full" size="lg">
                {noteLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> جارِ التنظيم...</>
                  : <><StickyNote className="h-4 w-4" /> نظّم الملاحظات</>}
              </Button>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-sm">الملاحظات المنظّمة</h3>
              <div className="min-h-[250px] rounded-xl border border-border bg-card p-4 overflow-auto text-sm leading-relaxed prose prose-sm max-w-none">
                {noteResult ? <ReactMarkdown>{noteResult}</ReactMarkdown>
                  : <span className="text-muted-foreground">ستظهر الملاحظات المنظّمة هنا...</span>}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
