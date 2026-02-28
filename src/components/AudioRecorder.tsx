import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioRecorderProps {
  onTranscriptReady: (text: string) => void;
}

export default function AudioRecorder({ onTranscriptReady }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
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
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  }, []);

  const sendToSummarize = () => {
    if (transcript.trim()) {
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
        <Mic className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">تحويل الصوت إلى نص</h3>
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
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/30 p-4 max-h-48 overflow-y-auto">
            <p className="text-sm leading-relaxed whitespace-pre-wrap" dir="rtl">{transcript}</p>
          </div>
          <Button onClick={sendToSummarize} variant="outline" className="w-full gap-2">
            <FileText className="h-4 w-4" />
            أرسل للتلخيص بالذكاء الاصطناعي
          </Button>
        </div>
      )}
    </div>
  );
}
