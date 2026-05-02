import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "news_impact") {
      systemPrompt = "أنت مرشد مهني عربي خبير. اكتب تحليلاً شخصياً مختصراً (3-4 فقرات) بالعربية الفصحى يوضح كيف يؤثر الخبر على مسار المستخدم المهني، مع توصيات عملية محددة.";
      userPrompt = `الخبر: ${payload.title}\nالملخص: ${payload.summary}\n\nمعلومات المستخدم: ${payload.userContext || "لا توجد بيانات شخصية بعد"}\n\nاكتب تحليلاً واضحاً يربط الخبر بمسار المستخدم.`;
    } else if (mode === "country_match") {
      systemPrompt = "أنت محلل سوق عمل عالمي. حلل تطابق المستخدم مع سوق عمل الدولة بصدق ومهنية. استخدم العربية الفصحى وكن محدداً.";
      userPrompt = `الدولة: ${payload.countryName}\nنسبة التطابق المحسوبة: ${payload.matchPct}%\nالمهارات القوية للمستخدم: ${payload.userStrengths.join(", ")}\nالمهارات المطلوبة في الدولة وغير المتوفرة: ${payload.gaps.join(", ")}\n\nاكتب:\n1) تحليل مختصر للوضع (فقرتين)\n2) أهم 3 خطوات عملية للتقدم\n3) توقعات النجاح خلال 12 شهر`;
    } else if (mode === "country_compare") {
      systemPrompt = "أنت مستشار هجرة مهنية. قارن بين دولتين بشكل عملي ومحايد بالعربية.";
      userPrompt = `الدولة الأولى: ${payload.a.name} - راتب: ${payload.a.salary}$ - طلب: ${payload.a.demand}% - عن بُعد: ${payload.a.remote}%\nالدولة الثانية: ${payload.b.name} - راتب: ${payload.b.salary}$ - طلب: ${payload.b.demand}% - عن بُعد: ${payload.b.remote}%\n\nاكتب مقارنة منظمة: نقاط قوة كل دولة، أيهما أنسب لشخص في بداية مسيرته، وأيهما أنسب لمن يبحث عن استقرار.`;
    } else {
      throw new Error("Unknown mode");
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول بعد دقيقة." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "يلزم شحن رصيد AI للاستمرار." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: `AI error: ${t}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("future-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
