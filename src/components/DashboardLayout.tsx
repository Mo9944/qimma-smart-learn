import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, BookOpen, Brain, FileText, BarChart3, 
  Trophy, Clock, Users, Settings, LogOut, Sparkles, 
  ChevronLeft, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/dashboard" },
  { icon: BookOpen, label: "المواد", path: "/dashboard/subjects" },
  { icon: Brain, label: "أدوات الذكاء", path: "/dashboard/ai" },
  { icon: FileText, label: "الاختبارات", path: "/dashboard/quizzes" },
  { icon: BarChart3, label: "التحليل", path: "/dashboard/analytics" },
  { icon: Trophy, label: "الإنجازات", path: "/dashboard/achievements" },
  { icon: Clock, label: "إدارة الوقت", path: "/dashboard/time" },
  { icon: Users, label: "المجتمع", path: "/dashboard/community" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "طالب";

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && <span className="text-lg font-bold text-sidebar-foreground">قِمّة</span>}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:flex flex-col bg-sidebar border-l border-sidebar-border transition-all duration-300 relative", collapsed ? "w-[68px]" : "w-64")}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -left-3 z-10 hidden md:flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-colors"
        >
          <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {displayName.charAt(0)}
              </div>
              <span className="hidden sm:inline font-medium">{displayName}</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
