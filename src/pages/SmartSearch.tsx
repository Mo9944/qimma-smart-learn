import { useState, useEffect } from "react";
import { Search, Send, Loader2, Clock, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

interface SearchEntry {
  id: string;
  query: string;
  response: string | null;
  created_at: string;
}

async function streamAI(text: string, onDelta: (t: string) => void, onDone: () => void) {
  const resp = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify({ tool: "search", text }),
  });
  if (!resp.ok) { const e = await resp.json().catch(() => ({ error: "خطأ" })); throw new Error(e.error || `Error ${resp.status}`); }
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
      } catch { buf = line + "\n" + buf; break; }
    }
  }
  onDone();
}

export default function SmartSearch() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SearchEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    const { data } = await supabase.from("search_history").select("*").order("created_at", { ascending: false }).limit(20);
    if (data) setHistory(data);
  }

  async function handleSearch() {
    if (!query.trim()) { toast({ title: "اكتب سؤالك أولاً", variant: "destructive" }); return; }
    setLoading(true);
    setResult("");
    setShowHistory(false);
    let full = "";

    try {
      await streamAI(query, chunk => { full += chunk; setResult(full); }, () => {});
      // Save to history
      await supabase.from("search_history").insert({ query: query.trim(), response: full });
      loadHistory();
    } catch (err: any) {
      toast({ title: err.message || "حدث خطأ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function deleteHistory(id: string) {
    await supabase.from("search_history").delete().eq("id", id);
    loadHistory();
  }

  async function clearAll() {
    await supabase.from("search_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setHistory([]);
    toast({ title: "تم مسح السجل" });
  }

  function loadFromHistory(entry: SearchEntry) {
    setQuery(entry.query);
    setResult(entry.response || "");
    setShowHistory(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">البحث الذكي</h1>
          <p className="text-muted-foreground text-sm">اسأل أي سؤال واحصل على إجابة ذكية ومنظمة</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)} className="gap-1">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">السجل</span>
        </Button>
      </div>

      {/* Search box */}
      <div className="rounded-xl border-2 border-primary/20 bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Search className="h-5 w-5" />
          <span className="font-semibold">اسأل سؤالك</span>
        </div>
        <div className="flex gap-3">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="مثال: ما هو التعلم العميق وكيف يختلف عن التعلم الآلي؟"
            className="flex-1 text-base h-12" onKeyDown={e => e.key === "Enter" && handleSearch()} />
          <Button onClick={handleSearch} disabled={loading} size="lg" className="h-12 px-6">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* History */}
      {showHistory && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">سجل البحث</h3>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={clearAll}>مسح الكل</Button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">لا يوجد سجل بحث</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map(entry => (
                <div key={entry.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                  <button onClick={() => loadFromHistory(entry)} className="flex-1 text-right text-sm truncate">
                    {entry.query}
                  </button>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(entry.created_at!).toLocaleDateString("ar-SA")}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteHistory(entry.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="prose prose-sm max-w-none text-sm leading-relaxed">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      ) : !loading && !showHistory && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">اكتب سؤالك وسيجيبك الذكاء الاصطناعي</p>
          <p className="text-sm mt-1">يمكنك السؤال عن أي موضوع دراسي أو علمي</p>
        </div>
      )}
    </div>
  );
}
