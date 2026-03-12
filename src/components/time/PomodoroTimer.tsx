import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { motion } from "framer-motion";

export default function PomodoroTimer() {
  const [mode, setMode] = useState<"work" | "break">("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!running || timeLeft <= 0) {
      if (timeLeft <= 0 && running) {
        setRunning(false);
        if (mode === "work") {
          setSessions(p => p + 1);
          setMode("break");
          setTimeLeft(5 * 60);
        } else {
          setMode("work");
          setTimeLeft(25 * 60);
        }
      }
      return;
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [running, timeLeft, mode]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const totalTime = mode === "work" ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const reset = () => {
    setRunning(false);
    setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="max-w-sm mx-auto">
      <motion.div
        className="rounded-xl border border-border bg-card p-6 shadow-sm text-center space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex gap-2 justify-center">
          <Button variant={mode === "work" ? "default" : "outline"} size="sm"
            onClick={() => { setMode("work"); setTimeLeft(25 * 60); setRunning(false); }}>
            <Clock className="h-4 w-4" /> مذاكرة
          </Button>
          <Button variant={mode === "break" ? "default" : "outline"} size="sm"
            onClick={() => { setMode("break"); setTimeLeft(5 * 60); setRunning(false); }}>
            <Coffee className="h-4 w-4" /> استراحة
          </Button>
        </div>

        <div className="relative inline-flex items-center justify-center">
          <svg className="w-52 h-52 -rotate-90" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="100" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle cx="110" cy="110" r="100" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute">
            <div className="text-4xl font-bold font-mono tracking-wider">{formatTime(timeLeft)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {mode === "work" ? "وقت المذاكرة" : "وقت الاستراحة"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="default" size="lg" onClick={() => setRunning(!running)} className="w-28">
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {running ? "إيقاف" : "ابدأ"}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          الجلسات: <span className="font-bold text-foreground">{sessions}</span>
        </div>
      </motion.div>
    </div>
  );
}
