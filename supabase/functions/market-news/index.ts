// Market News - fetches real RSS feeds and returns normalized items.
// No external API key required (uses public RSS endpoints).
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const FEEDS: { source: string; url: string; field: string }[] = [
  { source: "WEF Jobs", url: "https://www.weforum.org/agenda/feed/", field: "Workforce" },
  { source: "HBR", url: "https://hbr.org/feed", field: "Leadership" },
  { source: "MIT Tech Review", url: "https://www.technologyreview.com/feed/", field: "AI / Tech" },
  { source: "TechCrunch", url: "https://techcrunch.com/feed/", field: "Tech / Jobs" },
];

function stripHtml(s: string) {
  return s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? stripHtml(m[1]) : "";
}

async function parseFeed(url: string, source: string, field: string) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 AtharBot" } });
    if (!r.ok) return [];
    const xml = await r.text();
    const items = xml.split(/<item[\s>]/i).slice(1, 9);
    return items.map((raw, i) => {
      const block = "<item " + raw.split("</item>")[0] + "</item>";
      const title = pick(block, "title");
      const link = pick(block, "link");
      const desc = pick(block, "description").slice(0, 280);
      const date = pick(block, "pubDate") || pick(block, "dc:date");
      return {
        id: `${source}-${i}-${title.slice(0, 24)}`,
        title, link, summary: desc, date, source, field,
      };
    }).filter(x => x.title);
  } catch (e) {
    console.error("Feed error", source, e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const results = await Promise.all(FEEDS.map(f => parseFeed(f.url, f.source, f.field)));
    const items = results.flat()
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 30);
    return new Response(JSON.stringify({ items, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), items: [] }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
