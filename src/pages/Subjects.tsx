import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Trash2, Edit2, FolderOpen, ArrowRight, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FileUploader from "@/components/FileUploader";

export default function Subjects() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*, lessons(id), files(id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("missing");
      if (editId) {
        const { error } = await supabase.from("subjects").update({ name, description }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subjects").insert({ name, description, user_id: "anonymous" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast({ title: editId ? "تم تعديل المادة" : "تمت إضافة المادة ✅" });
      resetForm();
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast({ title: "تم حذف المادة" });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditId(null);
    setDialogOpen(false);
  };

  const handleEdit = (s: any) => {
    setEditId(s.id);
    setName(s.name);
    setDescription(s.description || "");
    setDialogOpen(true);
  };

  // Detail view for a subject
  if (selectedSubject) {
    const sub = subjects.find((s) => s.id === selectedSubject);
    if (!sub) { setSelectedSubject(null); return null; }
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedSubject(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowRight className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{sub.name}</h1>
            <p className="text-muted-foreground text-sm">{sub.description}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-semibold text-lg mb-4">ملفات المادة</h2>
          <FileUploader subjectId={selectedSubject} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المواد الدراسية</h1>
          <p className="text-muted-foreground text-sm">{subjects.length} مادة</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm"><Plus className="h-4 w-4" />إضافة مادة</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "تعديل المادة" : "إضافة مادة جديدة"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>اسم المادة</Label>
                <Input placeholder="مثال: الرياضيات" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Input placeholder="وصف مختصر" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button onClick={() => saveMutation.mutate()} className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editId ? "حفظ التعديل" : "إضافة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-1">لا توجد مواد بعد</h2>
          <p className="text-sm text-muted-foreground">أضف مادتك الأولى للبدء</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s, i) => (
            <motion.div
              key={s.id}
              className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-lg transition-all group cursor-pointer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedSubject(s.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-11 w-11 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold mb-1">{s.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{s.description || "بدون وصف"}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FolderOpen className="h-3.5 w-3.5" />
                  {(s as any).files?.length || 0} ملف
                </span>
                <span>{(s as any).lessons?.length || 0} درس</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
