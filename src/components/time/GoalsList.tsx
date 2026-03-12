import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Target, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

export default function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("athar-goals");
    return saved ? JSON.parse(saved) : [];
  });
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newUnit, setNewUnit] = useState("مهمة");

  const save = (g: Goal[]) => {
    setGoals(g);
    localStorage.setItem("athar-goals", JSON.stringify(g));
  };

  const addGoal = () => {
    if (!newTitle.trim() || !newTarget) return;
    save([...goals, {
      id: Date.now().toString(),
      title: newTitle.trim(),
      target: parseInt(newTarget),
      current: 0,
      unit: newUnit,
    }]);
    setNewTitle("");
    setNewTarget("");
  };

  const increment = (id: string) => save(goals.map(g =>
    g.id === id ? { ...g, current: Math.min(g.current + 1, g.target) } : g
  ));

  const deleteGoal = (id: string) => save(goals.filter(g => g.id !== id));

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input placeholder="عنوان الهدف..." value={newTitle} onChange={e => setNewTitle(e.target.value)}
            className="sm:col-span-2" />
          <Input type="number" placeholder="العدد المطلوب" value={newTarget} onChange={e => setNewTarget(e.target.value)} />
          <Input placeholder="الوحدة (مهمة، ساعة...)" value={newUnit} onChange={e => setNewUnit(e.target.value)} />
        </div>
        <Button onClick={addGoal} className="w-full sm:w-auto"><Plus className="h-4 w-4" /> أضف هدف</Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {goals.map(goal => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <motion.div key={goal.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      pct >= 100 ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                    }`}>
                      {pct >= 100 ? <TrendingUp className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">{goal.current} / {goal.target} {goal.unit}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => increment(goal.id)}
                      disabled={goal.current >= goal.target}>+1</Button>
                    <button onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
                <Progress value={pct} className="h-2" />
                <p className="text-xs text-muted-foreground text-left">{pct}%</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {goals.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">أضف أهدافك وتابع تقدمك</p>
          </div>
        )}
      </div>
    </div>
  );
}
