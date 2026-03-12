import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit2, Check, X, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  time?: string;
  category: "daily" | "weekly";
}

const priorityColors = {
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  medium: "bg-amber-500/10 text-amber-600 border-amber-200",
  high: "bg-red-500/10 text-red-600 border-red-200",
};
const priorityLabels = { low: "منخفض", medium: "متوسط", high: "مرتفع" };

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("athar-tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [newTime, setNewTime] = useState("");
  const [newCategory, setNewCategory] = useState<Task["category"]>("daily");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "daily" | "weekly">("all");

  const save = (t: Task[]) => {
    setTasks(t);
    localStorage.setItem("athar-tasks", JSON.stringify(t));
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    save([...tasks, {
      id: Date.now().toString(),
      title: newTitle.trim(),
      done: false,
      priority: newPriority,
      time: newTime || undefined,
      category: newCategory,
    }]);
    setNewTitle("");
    setNewTime("");
  };

  const toggleTask = (id: string) => save(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id: string) => save(tasks.filter(t => t.id !== id));
  const startEdit = (t: Task) => { setEditingId(t.id); setEditTitle(t.title); };
  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    save(tasks.map(t => t.id === id ? { ...t, title: editTitle.trim() } : t));
    setEditingId(null);
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.category === filter);
  const doneCount = filtered.filter(t => t.done).length;
  const progress = filtered.length ? Math.round((doneCount / filtered.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Add Task */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input placeholder="عنوان المهمة..." value={newTitle} onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()} className="sm:col-span-2" />
          <Select value={newPriority} onValueChange={v => setNewPriority(v as Task["priority"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">أولوية منخفضة</SelectItem>
              <SelectItem value="medium">أولوية متوسطة</SelectItem>
              <SelectItem value="high">أولوية عالية</SelectItem>
            </SelectContent>
          </Select>
          <Select value={newCategory} onValueChange={v => setNewCategory(v as Task["category"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">يومية</SelectItem>
              <SelectItem value="weekly">أسبوعية</SelectItem>
            </SelectContent>
          </Select>
          <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />
          <Button onClick={addTask} className="sm:col-start-2"><Plus className="h-4 w-4" /> أضف مهمة</Button>
        </div>
      </div>

      {/* Filter & Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "daily", "weekly"] as const).map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
              onClick={() => setFilter(f)}>
              {f === "all" ? "الكل" : f === "daily" ? "يومية" : "أسبوعية"}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span>{doneCount}/{filtered.length}</span>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map(task => (
            <motion.div key={task.id}
              layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
              className={`flex items-center gap-3 rounded-xl border border-border p-3 bg-card transition-colors ${task.done ? "opacity-60" : ""}`}>
              <Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} />
              <div className="flex-1 min-w-0">
                {editingId === task.id ? (
                  <div className="flex gap-2">
                    <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="h-8 text-sm"
                      onKeyDown={e => e.key === "Enter" && saveEdit(task.id)} autoFocus />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => saveEdit(task.id)}><Check className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${task.done ? "line-through" : ""}`}>{task.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                    {task.time && <span className="text-[10px] text-muted-foreground">{task.time}</span>}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(task)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">لا توجد مهام بعد، أضف أول مهمة!</p>
          </div>
        )}
      </div>
    </div>
  );
}
