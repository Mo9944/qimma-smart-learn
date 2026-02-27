import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Trash2, Edit2, ChevronLeft, FolderPlus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  description: string;
  progress: number;
  lessonsCount: number;
  color: string;
}

const COLORS = [
  "bg-primary/10 text-primary",
  "bg-info/10 text-info",
  "bg-success/10 text-success",
  "bg-accent/10 text-accent",
  "bg-destructive/10 text-destructive",
  "bg-warning/10 text-warning",
];

export default function Subjects() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "1", name: "الرياضيات", description: "الجبر والهندسة والإحصاء", progress: 72, lessonsCount: 18, color: COLORS[0] },
    { id: "2", name: "الفيزياء", description: "الميكانيكا والكهرباء", progress: 45, lessonsCount: 12, color: COLORS[1] },
    { id: "3", name: "الكيمياء", description: "الكيمياء العضوية وغير العضوية", progress: 88, lessonsCount: 15, color: COLORS[2] },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    if (editId) {
      setSubjects(prev => prev.map(s => s.id === editId ? { ...s, name, description } : s));
      toast({ title: "تم تعديل المادة بنجاح" });
    } else {
      const newSubject: Subject = {
        id: Date.now().toString(),
        name,
        description,
        progress: 0,
        lessonsCount: 0,
        color: COLORS[subjects.length % COLORS.length],
      };
      setSubjects(prev => [...prev, newSubject]);
      toast({ title: "تمت إضافة المادة بنجاح" });
    }
    setName("");
    setDescription("");
    setEditId(null);
    setDialogOpen(false);
  };

  const handleEdit = (s: Subject) => {
    setEditId(s.id);
    setName(s.name);
    setDescription(s.description);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    toast({ title: "تم حذف المادة" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المواد الدراسية</h1>
          <p className="text-muted-foreground text-sm">{subjects.length} مادة</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setName(""); setDescription(""); } }}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4" />
              إضافة مادة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "تعديل المادة" : "إضافة مادة جديدة"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>اسم المادة</Label>
                <Input placeholder="مثال: الرياضيات" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Input placeholder="وصف مختصر للمادة" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <Button onClick={handleSave} className="w-full">{editId ? "حفظ التعديل" : "إضافة"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((s, i) => (
          <motion.div
            key={s.id}
            className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-lg transition-all group"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${s.color}`}>
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold mb-1">{s.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">{s.description}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{s.lessonsCount} درس</span>
              <span>{s.progress}%</span>
            </div>
            <Progress value={s.progress} className="h-2" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
