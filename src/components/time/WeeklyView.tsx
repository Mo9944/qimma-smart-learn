import { useMemo } from "react";
import { CalendarDays } from "lucide-react";

interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  time?: string;
  category: "daily" | "weekly";
}

const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function WeeklyView() {
  const tasks: Task[] = useMemo(() => {
    const saved = localStorage.getItem("athar-tasks");
    return saved ? JSON.parse(saved) : [];
  }, []);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth();

  // Distribute tasks across the week for display
  const dailyTasks = tasks.filter(t => t.category === "daily");
  const weeklyTasks = tasks.filter(t => t.category === "weekly");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {weekDays.map((day, i) => (
          <div key={i} className={`rounded-xl border p-3 space-y-2 ${
            isToday(day) ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}>
            <div className="text-center">
              <p className="text-xs font-semibold">{dayNames[day.getDay()]}</p>
              <p className="text-lg font-bold">{day.getDate()}</p>
              {isToday(day) && <span className="text-[10px] text-primary font-medium">اليوم</span>}
            </div>
            <div className="space-y-1">
              {dailyTasks.slice(0, 3).map(t => (
                <div key={t.id} className={`text-[10px] px-2 py-1 rounded border border-border truncate ${t.done ? "line-through opacity-50" : ""}`}>
                  {t.title}
                </div>
              ))}
              {i === 0 && weeklyTasks.slice(0, 2).map(t => (
                <div key={t.id} className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary truncate">
                  {t.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">أضف مهام من تبويب "المهام" لرؤيتها هنا</p>
        </div>
      )}
    </div>
  );
}
