import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Check, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
          <Smartphone className="h-12 w-12 text-primary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold">ثبّت تطبيق أثر</h1>
          <p className="text-muted-foreground text-lg">
            احصل على تجربة أسرع وأفضل بتثبيت التطبيق على جهازك
          </p>
        </div>

        <div className="space-y-4 text-right bg-card rounded-2xl p-6 border">
          {[
            "وصول سريع من الشاشة الرئيسية",
            "يعمل بدون إنترنت",
            "إشعارات وتنبيهات",
            "تجربة تطبيق كاملة",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {installed ? (
          <div className="bg-primary/10 rounded-2xl p-6 space-y-2">
            <Check className="h-10 w-10 text-primary mx-auto" />
            <p className="font-semibold text-primary">تم التثبيت بنجاح! 🎉</p>
            <p className="text-sm text-muted-foreground">افتح التطبيق من الشاشة الرئيسية</p>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full gap-2 text-lg h-14">
            <Download className="h-5 w-5" />
            تثبيت التطبيق
          </Button>
        ) : isIOS ? (
          <div className="bg-card rounded-2xl p-6 border space-y-3 text-right">
            <p className="font-semibold">للتثبيت على iPhone/iPad:</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold text-primary shrink-0">1</span>
                اضغط على زر المشاركة <Share className="h-4 w-4 inline" />
              </p>
              <p className="flex items-center gap-2">
                <span className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold text-primary shrink-0">2</span>
                اختر "إضافة إلى الشاشة الرئيسية"
              </p>
              <p className="flex items-center gap-2">
                <span className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold text-primary shrink-0">3</span>
                اضغط "إضافة"
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-6 border space-y-3 text-right">
            <p className="font-semibold">للتثبيت:</p>
            <p className="text-sm text-muted-foreground">
              افتح القائمة في المتصفح واختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
