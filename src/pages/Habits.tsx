import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Check, Flame, Target, TrendingUp, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, isSameDay, startOfDay } from "date-fns";
import { ar } from "date-fns/locale";

interface Habit {
  id: string;
  name: string;
  description: string | null;
  days_per_week: number;
  reminder_time: string | null;
  created_at: string;
}

interface HabitProgress {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

export default function Habits() {
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [progress, setProgress] = useState<HabitProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [form, setForm] = useState({ name: "", description: "", days_per_week: "7", reminder_time: "" });

  const today = format(new Date(), "yyyy-MM-dd");
  const last30Days = useMemo(() => Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i)), []);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [h, p] = await Promise.all([
      supabase.from("habits").select("*").order("created_at", { ascending: false }),
      supabase.from("habit_progress").select("*").gte("date", format(subDays(new Date(), 30), "yyyy-MM-dd")),
    ]);
    if (h.data) setHabits(h.data);
    if (p.data) setProgress(p.data);
    setLoading(false);
  }

  function openCreate() {
    setEditingHabit(null);
    setForm({ name: "", description: "", days_per_week: "7", reminder_time: "" });
    setDialogOpen(true);
  }

  function openEdit(habit: Habit) {
    setEditingHabit(habit);
    setForm({
      name: habit.name,
      description: habit.description || "",
      days_per_week: String(habit.days_per_week),
      reminder_time: habit.reminder_time || "",
    });
    setDialogOpen(true);
  }

  async function saveHabit() {
    if (!form.name.trim()) { toast({ title: "أدخل اسم العادة", variant: "destructive" }); return; }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      days_per_week: parseInt(form.days_per_week),
      reminder_time: form.reminder_time || null,
    };

    if (editingHabit) {
      await supabase.from("habits").update(payload).eq("id", editingHabit.id);
      toast({ title: "تم تحديث العادة ✅" });
    } else {
      await supabase.from("habits").insert(payload);
      toast({ title: "تم إنشاء العادة ✅" });
    }
    setDialogOpen(false);
    loadData();
  }

  async function deleteHabit(id: string) {
    await supabase.from("habits").delete().eq("id", id);
    toast({ title: "تم حذف العادة 🗑️" });
    loadData();
  }

  async function toggleToday(habitId: string) {
    const existing = progress.find(p => p.habit_id === habitId && p.date === today);
    if (existing) {
      await supabase.from("habit_progress").delete().eq("id", existing.id);
    } else {
      await supabase.from("habit_progress").insert({ habit_id: habitId, date: today });
    }
    loadData();
  }

  function getStreak(habitId: string) {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      if (progress.some(p => p.habit_id === habitId && p.date === d)) streak++;
      else break;
    }
    return streak;
  }

  function getCompletionRate(habitId: string) {
    const total = progress.filter(p => p.habit_id === habitId).length;
    return Math.round((total / 30) * 100);
  }

  const totalCompleted = habits.filter(h => progress.some(p => p.habit_id === h.id && p.date === today)).length;
  const avgRate = habits.length > 0 ? Math.round(habits.reduce((s, h) => s + getCompletionRate(h.id), 0) / habits.length) : 0;
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => getStreak(h.id)), 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">بناء العادات</h1>
          <p className="text-muted-foreground text-sm">تتبّع عاداتك اليومية وابنِ نمطاً ثابتاً</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" /> عادة جديدة</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHabit ? "تعديل العادة" : "إضافة عادة جديدة"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="اسم العادة" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Textarea placeholder="وصف (اختياري)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">أيام/أسبوع</label>
                  <Select value={form.days_per_week} onValueChange={v => setForm(f => ({ ...f, days_per_week: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7].map(n => <SelectItem key={n} value={String(n)}>{n} أيام</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">وقت التذكير</label>
                  <Input type="time" value={form.reminder_time} onChange={e => setForm(f => ({ ...f, reminder_time: e.target.value }))} />
                </div>
              </div>
              <Button onClick={saveHabit} className="w-full">{editingHabit ? "حفظ التعديلات" : "إضافة العادة"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold">{totalCompleted}/{habits.length}</div>
          <div className="text-xs text-muted-foreground">مكتمل اليوم</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
          <div className="text-2xl font-bold">{bestStreak}</div>
          <div className="text-xs text-muted-foreground">أفضل سلسلة</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
          <div className="text-2xl font-bold">{avgRate}%</div>
          <div className="text-xs text-muted-foreground">نسبة الالتزام</div>
        </div>
      </div>

      {/* Habits List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جارِ التحميل...</div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد عادات بعد. أنشئ عادتك الأولى!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map(habit => {
            const doneToday = progress.some(p => p.habit_id === habit.id && p.date === today);
            const streak = getStreak(habit.id);
            const rate = getCompletionRate(habit.id);

            return (
              <div key={habit.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{habit.name}</h3>
                    {habit.description && <p className="text-sm text-muted-foreground mt-0.5">{habit.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{habit.days_per_week} أيام/أسبوع</span>
                      {habit.reminder_time && <span>⏰ {habit.reminder_time}</span>}
                      <span className="text-orange-500 font-medium">🔥 {streak} يوم</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(habit)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteHabit(habit.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Mini calendar */}
                <div className="flex gap-[3px] flex-wrap">
                  {last30Days.map((day, i) => {
                    const d = format(day, "yyyy-MM-dd");
                    const done = progress.some(p => p.habit_id === habit.id && p.date === d);
                    const isToday = d === today;
                    return (
                      <div key={i} title={format(day, "dd MMM", { locale: ar })}
                        className={`h-5 w-5 rounded-sm text-[9px] flex items-center justify-center transition-colors ${
                          done ? "bg-primary text-primary-foreground" : isToday ? "border-2 border-primary bg-primary/10" : "bg-secondary"
                        }`}>
                        {done && "✓"}
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${rate}%` }} />
                  </div>
                  <span className="text-xs font-medium">{rate}%</span>
                  <Button size="sm" variant={doneToday ? "secondary" : "default"} onClick={() => toggleToday(habit.id)}
                    className="gap-1 text-xs">
                    <Check className="h-3.5 w-3.5" />
                    {doneToday ? "تم ✅" : "تم التنفيذ"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
