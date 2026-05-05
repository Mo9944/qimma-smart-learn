import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Brain, FileText, BarChart3,
  Trophy, Clock, Sparkles, ChevronLeft, Menu, Target, Compass, Route,
  Repeat, GraduationCap, Search, Radar, Map, Heart, Scale, MessageCircle, Globe,
  ChevronDown, User, Briefcase, Wrench, TrendingUp, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { icon: any; label: string; path: string; highlight?: boolean };
type NavGroup = { id: string; label: string; icon: any; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    id: "home", label: "الرئيسية", icon: LayoutDashboard,
    items: [
      { icon: LayoutDashboard, label: "نظرة عامة", path: "/dashboard" },
    ],
  },
  {
    id: "discover", label: "اكتشف نفسك", icon: User,
    items: [
      { icon: Compass, label: "اختبار الشخصية / RIASEC", path: "/dashboard/riasec" },
      { icon: Heart, label: "التحليل النفسي", path: "/dashboard/psych-insight" },
      { icon: Scale, label: "خريطة التوازن", path: "/dashboard/balance-map" },
    ],
  },
  {
    id: "career", label: "المسار المهني", icon: Briefcase,
    items: [
      { icon: Target, label: "البوصلة المهنية", path: "/dashboard/career-compass" },
      { icon: Route, label: "المسارات المهنية", path: "/dashboard/career-paths" },
      { icon: Target, label: "تطابقك مع المهارات", path: "/dashboard/skills-match" },
      { icon: Radar, label: "فجوة المهارات", path: "/dashboard/skill-gap" },
      { icon: Map, label: "خريطة تطور المسار", path: "/dashboard/future-map" },
    ],
  },
  {
    id: "future", label: "خريطة المستقبل", icon: Globe,
    items: [
      { icon: Globe, label: "مهارات المستقبل العالمية", path: "/dashboard/future-skills" },
    ],
  },
  {
    id: "ai", label: "أدوات الذكاء الاصطناعي", icon: Brain,
    items: [
      { icon: MessageCircle, label: "AI Mentor", path: "/dashboard/ai-mentor", highlight: true },
      { icon: Brain, label: "أدوات AI", path: "/dashboard/ai" },
      { icon: Search, label: "البحث الذكي", path: "/dashboard/smart-search" },
    ],
  },
  {
    id: "learning", label: "التعلم والتطوير", icon: GraduationCap,
    items: [
      { icon: GraduationCap, label: "خطة التعلم", path: "/dashboard/learning-plan" },
      { icon: BookOpen, label: "المواد", path: "/dashboard/subjects" },
      { icon: FileText, label: "الاختبارات", path: "/dashboard/quizzes" },
    ],
  },
  {
    id: "productivity", label: "الإنتاجية والعادات", icon: Zap,
    items: [
      { icon: Clock, label: "تنظيم الوقت", path: "/dashboard/time" },
      { icon: Repeat, label: "العادات", path: "/dashboard/habits" },
      { icon: Trophy, label: "الإنجازات / XP", path: "/dashboard/achievements" },
    ],
  },
  {
    id: "reports", label: "التحليل والتقارير", icon: TrendingUp,
    items: [
      { icon: BarChart3, label: "لوحة التحليل", path: "/dashboard/analytics" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Open the group containing the active route by default; allow user toggle.
  const activeGroupId = navGroups.find(g => g.items.some(i => i.path === location.pathname))?.id ?? "home";
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({
    [activeGroupId]: true,
  }));

  const toggleGroup = (id: string) =>
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  const NavContent = () => (
    <>
      <div className={cn("flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border shrink-0", collapsed && "justify-center px-2")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="text-lg font-bold font-display text-sidebar-foreground">أثر</span>}
      </div>
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navGroups.map((group) => {
          const isOpen = !!openGroups[group.id];
          const hasActive = group.items.some(i => i.path === location.pathname);

          // Collapsed sidebar: show flat icons only
          if (collapsed) {
            return (
              <div key={group.id} className="space-y-0.5">
                {group.items.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={cn(
                        "flex items-center justify-center rounded-lg px-2 py-2 text-sm transition-all",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                    </Link>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={group.id}>
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                  hasActive ? "text-sidebar-foreground" : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <group.icon className="h-3.5 w-3.5" />
                  {group.label}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="mt-0.5 mb-1 space-y-0.5">
                  {group.items.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg pr-8 pl-3 py-2 text-sm transition-all duration-150",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          item.highlight && !active && "ring-1 ring-primary/30 bg-primary/5"
                        )}
                      >
                        <item.icon className="h-[16px] w-[16px] shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.highlight && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">AI</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      <aside className={cn(
        "hidden md:flex flex-col bg-sidebar border-l border-sidebar-border transition-all duration-300 relative shrink-0",
        collapsed ? "w-[56px]" : "w-60"
      )}>
        <NavContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 -left-3 z-10 hidden md:flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-colors"
        >
          <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col shadow-xl">
            <NavContent />
          </aside>
        </div>
      )}

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
