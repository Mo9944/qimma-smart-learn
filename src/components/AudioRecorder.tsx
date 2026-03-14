import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, FileText, Brain, Lightbulb, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

interface AudioRecorderProps {
  onTranscriptReady?: (text: string) => void;
}

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

const aiActions = [
  { id: "lecture_summary", icon: Brain, label: "تلخيص المحاضرة", color: "text-primary" },
  { id: "lecture_explain", icon: Lightbulb, label: "شرح المحاضرة", color: "text-amber-500" },
  { id: "lecture_notes", icon: BookOpen, label: "استخراج ملاحظات", color: "text-emerald-500" },
];

export default function AudioRecorder({ onTranscriptReady }: AudioRecorderProps) {
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAction, setActiveAction] = useState("");
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + " ";
        } else {
          interim = t;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
      if (finalTranscript.trim()) {
        setTranscript(finalTranscript.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setTranscript("");
    setAiResult("");
    setActiveAction("");
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  }, []);

  const handleAIAction = async (actionId: string) => {
    if (!transcript.trim()) return;
    setAiLoading(true);
    setAiResult("");
    setActiveAction(actionId);
    let result = "";
    try {
      await streamAI(actionId, transcript.trim(), (chunk) => {
        result += chunk;
        setAiResult(result);
      }, () => {});
      toast({ title: "تم بنجاح ✨" });
    } catch (err: any) {
      toast({ title: err.message || "حدث خطأ", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const sendToParent = () => {
    if (transcript.trim() && onTranscriptReady) {
      onTranscriptReady(transcript.trim());
    }
  };

  if (!supported) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <MicOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">المتصفح لا يدعم التعرف على الصوت. استخدم Chrome أو Edge.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Mic className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">تسجيل المحاضرات الصوتية</h3>
          <p className="text-xs text-muted-foreground">سجّل محاضرتك واحصل على تلخيص وشرح بالذكاء الاصطناعي</p>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <Button
          onClick={recording ? stopRecording : startRecording}
          variant={recording ? "destructive" : "default"}
          size="lg"
          className="gap-2"
        >
          {recording ? (
            <>
              <MicOff className="h-4 w-4" />
              إيقاف التسجيل
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              ابدأ التسجيل
            </>
          )}
        </Button>

        <AnimatePresence>
          {recording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
              </span>
              <span className="text-sm text-muted-foreground">جارِ التسجيل...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {transcript && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4 max-h-48 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2">📝 نص المحاضرة:</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" dir="rtl">{transcript}</p>
          </div>

          {/* AI Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {aiActions.map((action) => (
              <Button
                key={action.id}
                onClick={() => handleAIAction(action.id)}
                disabled={aiLoading}
                variant={activeAction === action.id ? "default" : "outline"}
                className="gap-2 text-xs h-10"
              >
                {aiLoading && activeAction === action.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <action.icon className={`h-4 w-4 ${activeAction !== action.id ? action.color : ""}`} />
                )}
                {action.label}
              </Button>
            ))}
          </div>

          {/* Send to tools */}
          {onTranscriptReady && (
            <Button onClick={sendToParent} variant="ghost" className="w-full gap-2 text-xs">
              <FileText className="h-4 w-4" />
              أرسل النص لأدوات الذكاء الاصطناعي
            </Button>
          )}

          {/* AI Result */}
          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-primary/20 bg-primary/5 p-4 max-h-96 overflow-y-auto"
              >
                <p className="text-xs font-medium text-primary mb-3">
                  {activeAction === "lecture_summary" && "📋 تلخيص المحاضرة:"}
                  {activeAction === "lecture_explain" && "💡 شرح المحاضرة:"}
                  {activeAction === "lecture_notes" && "📌 ملاحظات المحاضرة:"}
                </p>
                <div className="text-sm leading-relaxed prose prose-sm max-w-none" dir="rtl">
                  <ReactMarkdown>{aiResult}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
