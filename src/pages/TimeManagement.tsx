import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Play, Pause, RotateCcw, Coffee, Plus, Trash2, CalendarDays, BookOpen, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudySubject {
  id: string;
  name: string;
  lessons: number;
  examDate: string;
}

interface ScheduleDay {
  date: string;
  dayName: string;
  tasks: { subject: string; lessons: number }[];
}

export default function TimeManagement() {
  // Pomodoro
  const [mode, setMode] = useState<"work" | "break">("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  // Study planner
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [newName, setNewName] = useState("");
  const [newLessons, setNewLessons] = useState("");
  const [newExamDate, setNewExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("4");
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);

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

  const addSubject = () => {
    if (!newName.trim() || !newLessons || !newExamDate) return;
    setSubjects(prev => [...prev, {
      id: Date.now().toString(),
      name: newName.trim(),
      lessons: parseInt(newLessons),
      examDate: newExamDate,
    }]);
    setNewName(""); setNewLessons(""); setNewExamDate("");
  };

  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const generateSchedule = () => {
    if (subjects.length === 0 || !hoursPerDay) return;
    const hrs = parseInt(hoursPerDay);
    const lessonsPerDay = Math.max(1, Math.floor(hrs * 2)); // ~2 lessons per hour

    const today = new Date();
    const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

    // Calculate total days needed
    const totalLessons = subjects.reduce((sum, s) => sum + s.lessons, 0);
    const daysNeeded = Math.ceil(totalLessons / lessonsPerDay);

    // Distribute lessons across days
    const days: ScheduleDay[] = [];
    let remaining = subjects.map(s => ({ ...s, left: s.lessons }));

    for (let d = 0; d < daysNeeded; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const dayTasks: { subject: string; lessons: number }[] = [];
      let slotsLeft = lessonsPerDay;

      for (const sub of remaining) {
        if (slotsLeft <= 0 || sub.left <= 0) continue;
        const take = Math.min(sub.left, slotsLeft);
        dayTasks.push({ subject: sub.name, lessons: take });
        sub.left -= take;
        slotsLeft -= take;
      }

      if (dayTasks.length > 0) {
        days.push({
          date: date.toLocaleDateString("ar-SA", { month: "short", day: "numeric" }),
          dayName: dayNames[date.getDay()],
          tasks: dayTasks,
        });
      }
    }
    setSchedule(days);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تنظيم الوقت والمذاكرة</h1>
        <p className="text-muted-foreground text-sm">خطّط جدولك واستخدم مؤقت بومودورو للتركيز</p>
      </div>

      <Tabs defaultValue="planner" className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="planner" className="flex-1 gap-1.5">
            <CalendarDays className="h-4 w-4" />
            جدول المذاكرة
          </TabsTrigger>
          <TabsTrigger value="pomodoro" className="flex-1 gap-1.5">
            <Clock className="h-4 w-4" />
            بومودورو
          </TabsTrigger>
        </TabsList>

        {/* Study Planner */}
        <TabsContent value="planner" className="space-y-5 mt-5">
          {/* Add Subject */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              أضف مادة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">اسم المادة</Label>
                <Input placeholder="الرياضيات" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">عدد الدروس</Label>
                <Input type="number" placeholder="15" value={newLessons} onChange={e => setNewLessons(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">تاريخ الامتحان</Label>
                <Input type="date" value={newExamDate} onChange={e => setNewExamDate(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button onClick={addSubject} size="sm" className="w-full">
                  <Plus className="h-4 w-4" />
                  أضف
                </Button>
              </div>
            </div>
          </div>

          {/* Subjects List */}
          {subjects.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-3">
              <h2 className="font-semibold text-sm">المواد المضافة ({subjects.length})</h2>
              <div className="space-y-2">
                {subjects.map(sub => {
                  const daysLeft = Math.max(0, Math.ceil((new Date(sub.examDate).getTime() - Date.now()) / 86400000));
                  return (
                    <div key={sub.id} className="flex items-center justify-between rounded-lg border border-border p-3 bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">{sub.lessons} درس · باقي {daysLeft} يوم</p>
                        </div>
                      </div>
                      <button onClick={() => removeSubject(sub.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-end gap-3 pt-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">ساعات المذاكرة يومياً</Label>
                  <Input type="number" value={hoursPerDay} onChange={e => setHoursPerDay(e.target.value)} min="1" max="12" />
                </div>
                <Button onClick={generateSchedule} className="gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  أنشئ الجدول
                </Button>
              </div>
            </div>
          )}

          {/* Generated Schedule */}
          <AnimatePresence>
            {schedule.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    جدول المذاكرة ({schedule.length} يوم)
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => setSchedule([])}>مسح</Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {schedule.map((day, i) => (
                    <motion.div
                      key={i}
                      className="rounded-lg border border-border p-3 bg-secondary/20"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{day.dayName}</span>
                        <span className="text-xs text-muted-foreground">{day.date}</span>
                      </div>
                      <div className="space-y-1">
                        {day.tasks.map((t, j) => (
                          <div key={j} className="flex items-center justify-between text-xs rounded bg-card px-2 py-1.5 border border-border">
                            <span>{t.subject}</span>
                            <span className="text-muted-foreground">{t.lessons} درس</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {subjects.length === 0 && schedule.length === 0 && (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">أنشئ جدول مذاكرتك</h3>
              <p className="text-sm text-muted-foreground">أضف موادك وسيتم توزيع الدروس تلقائياً</p>
            </div>
          )}
        </TabsContent>

        {/* Pomodoro */}
        <TabsContent value="pomodoro" className="mt-5">
          <div className="max-w-sm mx-auto">
            <motion.div
              className="rounded-xl border border-border bg-card p-6 shadow-card text-center space-y-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex gap-2 justify-center">
                <Button
                  variant={mode === "work" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setMode("work"); setTimeLeft(25 * 60); setRunning(false); }}
                >
                  <Clock className="h-4 w-4" />
                  مذاكرة
                </Button>
                <Button
                  variant={mode === "break" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setMode("break"); setTimeLeft(5 * 60); setRunning(false); }}
                >
                  <Coffee className="h-4 w-4" />
                  استراحة
                </Button>
              </div>

              <div className="relative inline-flex items-center justify-center">
                <svg className="w-52 h-52 -rotate-90" viewBox="0 0 220 220">
                  <circle cx="110" cy="110" r="100" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                  <circle
                    cx="110" cy="110" r="100" fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000"
                  />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
