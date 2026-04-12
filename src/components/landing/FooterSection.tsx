import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold font-display">أثر</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">لوحة التحكم</Link>
            <Link to="/dashboard/career-compass" className="hover:text-foreground transition-colors">البوصلة المهنية</Link>
            <Link to="/dashboard/ai" className="hover:text-foreground transition-colors">أدوات الذكاء</Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 أثر. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
