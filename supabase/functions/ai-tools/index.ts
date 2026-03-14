import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const toolPrompts: Record<string, string> = {
  explain: `أنت معلم عربي محترف. حوّل النص التالي إلى شرح مبسّط وواضح باللغة العربية مع أمثلة عملية.
استخدم:
- شرح مبسّط للفكرة الرئيسية
- شرح مفصّل مع التفاصيل
- أمثلة توضيحية
- نقاط مرقّمة وعناوين فرعية
ابدأ بـ "📖 شرح مبسّط:" ثم "📚 شرح مفصّل:" ثم "💡 أمثلة:"`,

  quiz: `أنت معلم عربي. أنشئ 10 أسئلة متنوعة (اختيار من متعدد، صح/خطأ، أكمل) من النص التالي. رقّم الأسئلة واكتب الإجابة الصحيحة بعد كل سؤال. ابدأ بـ "📝 أسئلة تلقائية:"`,

  summary: `أنت خبير تلخيص محترف. لخّص النص التالي بشكل شامل:
1. ابدأ بـ "📋 الملخص:" مع فقرة موجزة
2. ثم "🔑 النقاط الرئيسية:" مع قائمة بأهم النقاط
3. ثم "💎 الخلاصة:" مع جملة واحدة تلخّص الموضوع
حافظ على الدقة والوضوح.`,

  mindmap: `أنت خبير خرائط ذهنية. حوّل النص التالي إلى خريطة ذهنية نصية باستخدام رموز الشجرة (├── └──). ابدأ بـ "🗺️ خريطة ذهنية:" ثم الموضوع الرئيسي والفروع.`,

  flashcards: `أنت معلم. أنشئ 5-8 بطاقات فلاش كارد من النص التالي. كل بطاقة تحتوي على سؤال وإجابة. افصل بين البطاقات بخط (━━━). ابدأ بـ "🎴 فلاش كارد:"`,

  lecture_summary: `أنت خبير أكاديمي في تلخيص المحاضرات. النص التالي هو تفريغ صوتي لمحاضرة. قم بما يلي:
1. "📋 ملخص المحاضرة:" - اكتب ملخصاً شاملاً ومنظماً للمحاضرة
2. "🔑 النقاط الرئيسية:" - استخرج أهم النقاط والأفكار الرئيسية مرقّمة
3. "📊 المفاهيم المهمة:" - حدد المفاهيم والمصطلحات الأساسية مع تعريف مختصر لكل منها
4. "💎 الخلاصة:" - اكتب خلاصة في 2-3 جمل
حافظ على الدقة والوضوح وتجاهل الكلمات غير المفهومة أو المكررة من التفريغ الصوتي.`,

  lecture_explain: `أنت معلم جامعي محترف. النص التالي هو تفريغ صوتي لمحاضرة. قم بما يلي:
1. "💡 شرح مبسّط:" - اشرح محتوى المحاضرة بأسلوب بسيط وسهل الفهم
2. "📚 شرح مفصّل:" - قدّم شرحاً تفصيلياً لكل فكرة رئيسية في المحاضرة
3. "🔍 أمثلة توضيحية:" - أضف أمثلة عملية تساعد على فهم المحتوى
4. "❓ أسئلة للمراجعة:" - اقترح 3-5 أسئلة يمكن للطالب مراجعة فهمه بها
تجاهل التكرار والأخطاء الناتجة عن التفريغ الصوتي.`,

  lecture_notes: `أنت مساعد أكاديمي متخصص في تدوين الملاحظات. النص التالي هو تفريغ صوتي لمحاضرة. قم بما يلي:
1. "📌 الملاحظات المنظّمة:" - نظّم محتوى المحاضرة في ملاحظات واضحة ومرتبة حسب الموضوع
2. "📝 نقاط مهمة للحفظ:" - حدد النقاط التي يجب على الطالب حفظها
3. "🔗 الروابط بين الأفكار:" - وضّح العلاقات بين المفاهيم المختلفة
4. "✅ خطة للمراجعة:" - اقترح خطة مراجعة فعّالة لمحتوى المحاضرة
تجاهل الأخطاء والتكرار الناتج عن التفريغ الصوتي.`,

  search: `أنت مساعد ذكي متعدد المعارف. أجب عن السؤال التالي بشكل واضح ومفصّل باللغة العربية.
قدّم:
- إجابة مباشرة وواضحة
- معلومات إضافية مفيدة
- أمثلة إن أمكن
كن دقيقاً ومفيداً.`,

  notes: `أنت خبير تنظيم ملاحظات. خذ الأفكار والملاحظات التالية وقم بـ:
1. "📌 الملاحظات المنظّمة:" - رتّبها في فئات واضحة
2. "📋 ملخص:" - لخّصها في نقاط مركّزة
3. "✅ خطوات عملية:" - حوّلها إلى خطوات قابلة للتنفيذ
اجعل النتيجة واضحة ومنظمة.`,

  generate_quiz: `أنت معلم عربي محترف. من النص التالي، أنشئ اختباراً يتكون من 5-10 أسئلة اختيار من متعدد. كل سؤال له 4 خيارات وإجابة صحيحة واحدة. يجب أن تُرجع النتيجة بتنسيق JSON فقط بدون أي نص إضافي. التنسيق المطلوب:
[{"text":"نص السؤال","options":["خيار1","خيار2","خيار3","خيار4"],"correct":0}]
حيث correct هو رقم الخيار الصحيح (0-3). أرجع JSON فقط بدون أي شيء آخر.`,
};

const MAX_TEXT_BYTES = 50_000;

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

    if (new TextEncoder().encode(text).length > MAX_TEXT_BYTES) {
      return new Response(JSON.stringify({ error: "النص طويل جداً، الحد الأقصى 50KB" }), {
        status: 413,
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
