import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, BookOpen, Brain, FileText, BarChart3, 
  Trophy, Clock, Sparkles, ChevronLeft, Menu, Target, Compass,
  Repeat, GraduationCap, Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "الرئيسية", path: "/dashboard" },
  { icon: Compass, label: "اختبار الشخصية", path: "/dashboard/riasec" },
  { icon: Brain, label: "أدوات AI", path: "/dashboard/ai" },
  { icon: Search, label: "البحث الذكي", path: "/dashboard/smart-search" },
  { icon: GraduationCap, label: "خطة التعلم", path: "/dashboard/learning-plan" },
  { icon: Repeat, label: "العادات", path: "/dashboard/habits" },
  { icon: BookOpen, label: "المواد", path: "/dashboard/subjects" },
  { icon: FileText, label: "الاختبارات", path: "/dashboard/quizzes" },
  { icon: Clock, label: "تنظيم الوقت", path: "/dashboard/time" },
  { icon: BarChart3, label: "التحليل", path: "/dashboard/analytics" },
  { icon: Trophy, label: "الإنجازات", path: "/dashboard/achievements" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const NavContent = () => (
    <>
      <div className={cn("flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border shrink-0", collapsed && "justify-center px-2")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="text-lg font-bold font-display text-sidebar-foreground">أثر</span>}
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                collapsed && "justify-center px-2",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col bg-sidebar border-l border-sidebar-border transition-all duration-300 relative shrink-0",
        collapsed ? "w-[56px]" : "w-56"
      )}>
        <NavContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 -left-3 z-10 hidden md:flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-colors"
        >
          <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-56 bg-sidebar flex flex-col shadow-xl">
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-card/60 backdrop-blur-sm shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm mr-auto">
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              م
            </div>
            <span className="hidden sm:inline font-medium">مستخدم</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}