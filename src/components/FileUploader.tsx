import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, File, Image, Music, FileText, Trash2, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";


const FILE_ICONS: Record<string, typeof File> = {
  "application/pdf": FileText,
  "image/": Image,
  "audio/": Music,
};

function getFileIcon(type: string) {
  for (const [key, Icon] of Object.entries(FILE_ICONS)) {
    if (type.startsWith(key)) return Icon;
  }
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

interface FileUploaderProps {
  subjectId?: string;
  lessonId?: string;
}

export default function FileUploader({ subjectId, lessonId }: FileUploaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  

  const queryKey = ["files", subjectId, lessonId];

  const { data: files = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from("files").select("*");
      if (subjectId) query = query.eq("subject_id", subjectId);
      if (lessonId) query = query.eq("lesson_id", lessonId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: globalThis.File) => {
      const ext = file.name.split(".").pop();
      const path = `anonymous/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("user-files").upload(path, file);
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("files").insert({
        user_id: "00000000-0000-0000-0000-000000000000",
        subject_id: subjectId || null,
        lesson_id: lessonId || null,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: path,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "تم رفع الملف بنجاح ✅" });
    },
    onError: (err: any) => {
      toast({ title: "فشل رفع الملف: " + err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (file: { id: string; storage_path: string }) => {
      await supabase.storage.from("user-files").remove([file.storage_path]);
      const { error } = await supabase.from("files").delete().eq("id", file.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "تم حذف الملف" });
    },
  });

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    setUploading(true);
    for (const file of Array.from(fileList)) {
      await uploadMutation.mutateAsync(file);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async (file: { storage_path: string; file_name: string }) => {
    const { data } = await supabase.storage.from("user-files").createSignedUrl(file.storage_path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 p-8 text-center transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.m4a,.txt,.doc,.docx"
          onChange={handleFiles}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">جارِ الرفع...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">اضغط لرفع ملف</span>
            <span className="text-xs text-muted-foreground">PDF، صور، صوت، نصوص</span>
          </div>
        )}
      </div>

      {/* Files List */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : files.length > 0 ? (
        <div className="space-y-2">
          {files.map((f, i) => {
            const Icon = getFileIcon(f.file_type);
            return (
              <motion.div
                key={f.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 group"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.file_name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(f.file_size || 0)}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(f)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(f)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-4">لا توجد ملفات بعد</p>
      )}
    </div>
  );
}
