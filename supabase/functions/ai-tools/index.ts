import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const toolPrompts: Record<string, string> = {
  explain: `أنت معلم عربي محترف. حوّل النص التالي إلى شرح مبسّط وواضح باللغة العربية. استخدم نقاط مرقّمة وعناوين فرعية. ابدأ بـ "📖 شرح مبسّط:" ثم اشرح الفكرة الرئيسية والنقاط الأساسية.`,
  quiz: `أنت معلم عربي. أنشئ 10 أسئلة متنوعة (اختيار من متعدد، صح/خطأ، أكمل) من النص التالي. رقّم الأسئلة واكتب الإجابة الصحيحة بعد كل سؤال. ابدأ بـ "📝 أسئلة تلقائية:"`,
  summary: `أنت خبير تلخيص. لخّص النص التالي بشكل مركّز مع الحفاظ على النقاط الرئيسية. استخدم نقاط bullet points. ابدأ بـ "📋 الملخص:"`,
  mindmap: `أنت خبير خرائط ذهنية. حوّل النص التالي إلى خريطة ذهنية نصية باستخدام رموز الشجرة (├── └──). ابدأ بـ "🗺️ خريطة ذهنية:" ثم الموضوع الرئيسي والفروع.`,
  flashcards: `أنت معلم. أنشئ 5-8 بطاقات فلاش كارد من النص التالي. كل بطاقة تحتوي على سؤال وإجابة. افصل بين البطاقات بخط (━━━). ابدأ بـ "🎴 فلاش كارد:"`,
  generate_quiz: `أنت معلم عربي محترف. من النص التالي، أنشئ اختباراً يتكون من 5-10 أسئلة اختيار من متعدد. كل سؤال له 4 خيارات وإجابة صحيحة واحدة. يجب أن تُرجع النتيجة بتنسيق JSON فقط بدون أي نص إضافي. التنسيق المطلوب:
[{"text":"نص السؤال","options":["خيار1","خيار2","خيار3","خيار4"],"correct":0}]
حيث correct هو رقم الخيار الصحيح (0-3). أرجع JSON فقط بدون أي شيء آخر.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tool, text } = await req.json();

    if (!tool || !text) {
      return new Response(JSON.stringify({ error: "tool and text are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = toolPrompts[tool];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: "Invalid tool" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للمتابعة" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "خطأ في خدمة الذكاء الاصطناعي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-tools error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
