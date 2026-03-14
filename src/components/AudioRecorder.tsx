import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, FileText, Brain, Lightbulb, BookOpen, Upload, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { AMIRI_FONT_BASE64 } from "@/lib/amiri-font";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;
const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;

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
  { id: "lecture_summary", icon: Brain, label: "تلخيص المحاضرة" },
  { id: "lecture_explain", icon: Lightbulb, label: "شرح المحاضرة" },
  { id: "lecture_notes", icon: BookOpen, label: "استخراج ملاحظات" },
];

export default function AudioRecorder({ onTranscriptReady }: AudioRecorderProps) {
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAction, setActiveAction] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/ogg", "audio/webm", "audio/x-m4a"];
    const validExtensions = [".mp3", ".wav", ".m4a", ".ogg", ".webm"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      toast({ title: "صيغة الملف غير مدعومة. استخدم MP3, WAV, M4A, OGG", variant: "destructive" });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "حجم الملف كبير جداً (الحد الأقصى 20MB)", variant: "destructive" });
      return;
    }

    setUploading(true);
    setUploadedFileName(file.name);
    setTranscript("");
    setAiResult("");
    setActiveAction("");

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const resp = await fetch(TRANSCRIBE_URL, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: formData,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "خطأ في رفع الملف" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      const data = await resp.json();
      if (data.transcript) {
        setTranscript(data.transcript);
        toast({ title: "تم تفريغ الملف الصوتي بنجاح ✨" });
      } else {
        toast({ title: "لم يتم العثور على نص في الملف الصوتي", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: err.message || "حدث خطأ أثناء تفريغ الملف", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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

  const exportToPDF = () => {
    if (!aiResult && !transcript) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Load Arabic-compatible font workaround: use simple text rendering
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const titleLabel =
      activeAction === "lecture_summary" ? "Lecture Summary" :
      activeAction === "lecture_explain" ? "Lecture Explanation" :
      activeAction === "lecture_notes" ? "Lecture Notes" : "Transcript";
    doc.text(titleLabel, pageWidth / 2, y, { align: "center" });
    y += 15;

    // Content - strip markdown
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const content = aiResult || transcript;
    const cleanText = content
      .replace(/[#*_~`]/g, "")
      .replace(/\n{3,}/g, "\n\n");

    const lines = doc.splitTextToSize(cleanText, maxWidth);

    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 6;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} / ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
      doc.text("Athar Platform", margin, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`athar-${activeAction || "transcript"}-${Date.now()}.pdf`);
    toast({ title: "تم تصدير الملف بنجاح 📄" });
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
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Mic className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">تسجيل وتفريغ المحاضرات</h3>
          <p className="text-xs text-muted-foreground">سجّل مباشرة أو ارفع ملف صوتي (MP3, WAV, M4A)</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          onClick={recording ? stopRecording : startRecording}
          variant={recording ? "destructive" : "default"}
          size="sm"
          className="gap-2"
          disabled={uploading}
        >
          {recording ? (
            <><MicOff className="h-4 w-4" /> إيقاف</>
          ) : (
            <><Mic className="h-4 w-4" /> تسجيل مباشر</>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={uploading || recording}
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> جارِ التفريغ...</>
          ) : (
            <><Upload className="h-4 w-4" /> رفع ملف صوتي</>
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
              <span className="text-xs text-muted-foreground">جارِ التسجيل...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {uploadedFileName && !uploading && transcript && (
        <p className="text-xs text-muted-foreground">📁 {uploadedFileName}</p>
      )}

      {transcript && (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/30 p-4 max-h-40 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">📝 نص المحاضرة:</p>
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
                className="gap-2 text-xs h-9"
                size="sm"
              >
                {aiLoading && activeAction === action.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <action.icon className="h-3.5 w-3.5" />
                )}
                {action.label}
              </Button>
            ))}
          </div>

          {onTranscriptReady && (
            <Button onClick={sendToParent} variant="ghost" size="sm" className="w-full gap-2 text-xs">
              <FileText className="h-3.5 w-3.5" />
              أرسل النص لأدوات الذكاء الاصطناعي
            </Button>
          )}

          {/* AI Result */}
          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-primary/20 bg-primary/5 p-4 max-h-80 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-primary">
                    {activeAction === "lecture_summary" && "📋 تلخيص المحاضرة:"}
                    {activeAction === "lecture_explain" && "💡 شرح المحاضرة:"}
                    {activeAction === "lecture_notes" && "📌 ملاحظات المحاضرة:"}
                  </p>
                  <Button
                    onClick={exportToPDF}
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-7 text-primary hover:text-primary"
                  >
                    <Download className="h-3.5 w-3.5" />
                    تصدير PDF
                  </Button>
                </div>
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
