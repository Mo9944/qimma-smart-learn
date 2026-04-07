import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfUploaderProps {
  onTextExtracted: (text: string, fileName: string) => void;
}

export default function PdfUploader({ onTextExtracted }: PdfUploaderProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);

  const extractText = async (file: File) => {
    setExtracting(true);
    setProgress(0);
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      let fullText = "";

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += `\n--- صفحة ${i} ---\n${pageText}`;
        setProgress(Math.round((i / totalPages) * 100));
      }

      const trimmed = fullText.trim();
      if (!trimmed || trimmed.length < 20) {
        toast({ title: "لم يتم العثور على نص كافٍ في الملف", description: "قد يكون الملف يحتوي على صور فقط", variant: "destructive" });
        resetState();
        return;
      }

      // Truncate if too long (50KB limit on edge function)
      const maxChars = 40000;
      const finalText = trimmed.length > maxChars
        ? trimmed.slice(0, maxChars) + "\n\n[... تم اقتطاع النص بسبب الطول]"
        : trimmed;

      onTextExtracted(finalText, file.name);
      toast({ title: `تم استخراج النص من ${totalPages} صفحة ✅` });
    } catch (err: any) {
      console.error("PDF extraction error:", err);
      toast({ title: "فشل قراءة ملف PDF", description: err.message, variant: "destructive" });
      resetState();
    } finally {
      setExtracting(false);
    }
  };

  const resetState = () => {
    setFileName("");
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "يرجى رفع ملف PDF فقط", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "حجم الملف يتجاوز 20MB", variant: "destructive" });
      return;
    }

    extractText(file);
  };

  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
      <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />

      {!fileName ? (
        <Button variant="outline" className="w-full gap-2" onClick={() => fileRef.current?.click()} disabled={extracting}>
          <Upload className="h-4 w-4" />
          رفع ملف PDF
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium truncate">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{fileName}</span>
            </div>
            {!extracting && (
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={resetState}>
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {extracting && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                جارِ استخراج النص... {progress}%
              </p>
            </div>
          )}

          {!extracting && progress === 100 && (
            <p className="text-xs text-green-600">✅ تم استخراج النص بنجاح</p>
          )}
        </div>
      )}
    </div>
  );
}
