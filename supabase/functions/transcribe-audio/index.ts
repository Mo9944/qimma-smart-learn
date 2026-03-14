import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "لم يتم رفع ملف صوتي" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Max 20MB
    if (audioFile.size > 20 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "حجم الملف كبير جداً (الحد الأقصى 20MB)" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binary);

    // Determine MIME type
    const fileName = audioFile.name.toLowerCase();
    let mimeType = "audio/mpeg";
    if (fileName.endsWith(".wav")) mimeType = "audio/wav";
    else if (fileName.endsWith(".m4a")) mimeType = "audio/mp4";
    else if (fileName.endsWith(".ogg")) mimeType = "audio/ogg";
    else if (fileName.endsWith(".webm")) mimeType = "audio/webm";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `أنت خبير تفريغ صوتي. قم بتفريغ المحتوى الصوتي التالي إلى نص مكتوب باللغة العربية.
قواعد مهمة:
- اكتب النص كما هو بدون تعديل أو تلخيص
- حافظ على ترتيب الكلام كما ورد
- إذا كان هناك أكثر من متحدث، حاول التمييز بينهم
- تجاهل الأصوات غير المفهومة
- اكتب النص في فقرات منظمة
ابدأ مباشرة بالنص المفرّغ بدون مقدمة.`,
          },
          {
            role: "user",
            content: [
              {
                type: "input_audio",
                input_audio: {
                  data: base64Audio,
                  format: mimeType === "audio/wav" ? "wav" : "mp3",
                },
              },
              {
                type: "text",
                text: "قم بتفريغ هذا الملف الصوتي إلى نص مكتوب باللغة العربية.",
              },
            ],
          },
        ],
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
      return new Response(JSON.stringify({ error: "خطأ في خدمة تفريغ الصوت" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const transcript = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ transcript }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("transcribe-audio error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير متوقع" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
