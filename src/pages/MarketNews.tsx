import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, RefreshCw, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

type NewsItem = {
  id: string; title: string; link: string; summary: string;
  date: string; source: string; field: string;
};

const RISING_KEYWORDS = ["AI", "agent", "machine learning", "prompt", "cyber", "data", "green", "robot", "automation", "remote", "skill"];

export default function MarketNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-news`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } });
      const json = await r.json();
      setItems(json.items || []);
      setFetchedAt(json.fetchedAt || "");
    } catch {
      toast.error("تعذر تحميل الأخبار");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const sources = Array.from(new Set(items.map(i => i.source)));
  const trending = items.filter(i =>
    RISING_KEYWORDS.some(k => (i.title + i.summary).toLowerCase().includes(k.toLowerCase()))
  ).slice(0, 8);

  const renderItem = (n: NewsItem) => (
    <motion.a
      key={n.id} href={n.link} target="_blank" rel="noreferrer"
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="block"
    >
      <Card className="p-4 hover:border-primary/40 transition-colors h-full">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-[10px]">{n.source}</Badge>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>
        <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2">{n.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{n.summary}</p>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{n.field}</span>
          <span>{n.date ? new Date(n.date).toLocaleDateString("ar") : ""}</span>
        </div>
      </Card>
    </motion.a>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-2">
            <Newspaper className="h-7 w-7 text-primary" /> أخبار سوق العمل الذكية
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مصادر حقيقية: WEF · HBR · MIT Tech Review · TechCrunch
            {fetchedAt && ` · آخر تحديث ${new Date(fetchedAt).toLocaleTimeString("ar")}`}
          </p>
        </div>
        <Button onClick={load} disabled={loading} variant="outline" className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          تحديث
        </Button>
      </div>

      {!loading && items.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          تعذر تحميل الأخبار حالياً. حاول مرة أخرى.
        </Card>
      )}

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">الكل ({items.length})</TabsTrigger>
          <TabsTrigger value="trending" className="gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> صاعدة ({trending.length})
          </TabsTrigger>
          {sources.map(s => <TabsTrigger key={s} value={s}>{s}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {loading ? (
            <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(renderItem)}</div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="mt-4">
          <Card className="p-4 mb-4 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">مهارات صاعدة بسرعة</span>
            </div>
            <p className="text-xs text-muted-foreground">
              مهارات تظهر بشكل متكرر في الأخبار الحالية: AI Agents, Prompt Engineering, Cybersecurity, Green Skills, Remote Work, Data Analytics.
            </p>
          </Card>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{trending.map(renderItem)}</div>
        </TabsContent>

        {sources.map(s => (
          <TabsContent key={s} value={s} className="mt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.filter(i => i.source === s).map(renderItem)}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
