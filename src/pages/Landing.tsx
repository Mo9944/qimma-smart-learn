import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Brain, BarChart3, Trophy, Clock, 
  Sparkles, ArrowLeft, ChevronDown, Zap,
  Lightbulb, Target, Users, Heart, Compass, Star
} from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
};

const features = [
  { icon: Compass, title: "اكتشاف المواهب", desc: "اختبارات علمية تكشف مواهبك الحقيقية ونقاط قوتك الخفية" },
  { icon: Brain, title: "تحليل الشخصية", desc: "تحليل ذكي لنمط شخصيتك بناءً على نموذج RIASEC العالمي" },
  { icon: Target, title: "نقاط القوة والضعف", desc: "تقرير تفصيلي بنقاط قوتك وجوانب التحسين مع خطة تطوير" },
  { icon: Lightbulb, title: "نصائح ذكية", desc: "الذكاء الاصطناعي يقدم نصائح مخصصة لتطوير مهاراتك" },
  { icon: Clock, title: "تنظيم الوقت", desc: "أدوات ذكية لتنظيم وقتك وبناء عادات إنتاجية" },
  { icon: BarChart3, title: "تتبع التقدم", desc: "رسوم بيانية توضح تطورك ومسيرة نموك الشخصي" },
];

const howItWorks = [
  { step: "01", icon: Compass, title: "أجب على الاختبار", desc: "اختبار شخصية بسيط من 30 سؤال لاكتشاف نمطك" },
  { step: "02", icon: Brain, title: "احصل على التحليل", desc: "الذكاء الاصطناعي يحلل نتائجك ويكشف مواهبك" },
  { step: "03", icon: Target, title: "اكتشف مسارك", desc: "تعرف على المجالات المهنية والدراسية المناسبة لك" },
  { step: "04", icon: Sparkles, title: "ابدأ التطوير", desc: "نصائح عملية وخطط مخصصة لتطوير نفسك" },
];

const stats = [
  { value: "30+", label: "سؤال تحليلي" },
  { value: "6", label: "أنماط شخصية" },
  { value: "AI", label: "تحليل ذكي" },
  { value: "∞", label: "إمكانيات للنمو" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display text-foreground">أثر</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">المميزات</a>
            <a href="#how" className="hover:text-foreground transition-colors">كيف يعمل</a>
          </div>
          <Link to="/dashboard">
            <Button variant="default" size="sm">ابدأ الآن</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute bottom-10 left-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="container relative z-10">
          <motion.div className="mx-auto max-w-3xl text-center" initial="hidden" animate="visible">
            <motion.div custom={0} variants={fadeIn} className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground/80">
              <Zap className="h-4 w-4" />
              <span>منصة عربية ذكية لاكتشاف الذات</span>
            </motion.div>
            <motion.h1 custom={1} variants={fadeIn} className="mb-6 text-4xl font-bold font-display leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
              اكتشف مواهبك{" "}
              <span className="text-gradient">واصنع أثرك</span>
            </motion.h1>
            <motion.p custom={2} variants={fadeIn} className="mb-10 text-lg text-primary-foreground/70 md:text-xl leading-relaxed max-w-2xl mx-auto">
              منصة مدعومة بالذكاء الاصطناعي تساعدك على تحليل شخصيتك، 
              اكتشاف نقاط قوتك، ومعرفة المسار المهني والدراسي الأنسب لك
            </motion.p>
            <motion.div custom={3} variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard/riasec">
                <Button variant="hero" size="xl">
                  ابدأ اختبار الشخصية
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#how">
                <Button variant="hero-outline" size="xl">
                  كيف يعمل؟
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl font-bold font-display text-gradient mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-3">كل ما تحتاجه لاكتشاف ذاتك</h2>
            <p className="text-muted-foreground text-lg">أدوات ذكية صُمّمت لمساعدتك في فهم نفسك وتطوير إمكاناتك</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
              >
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-16 md:py-24 bg-secondary/40">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-3">كيف تبدأ رحلتك؟</h2>
            <p className="text-muted-foreground text-lg">أربع خطوات بسيطة لاكتشاف إمكاناتك الحقيقية</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">الخطوة {item.step}</div>
                <h3 className="text-base font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl text-center rounded-2xl gradient-hero p-10 md:p-14"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold font-display text-primary-foreground mb-3">جاهز تكتشف نفسك؟</h2>
            <p className="text-primary-foreground/70 mb-8 text-lg">ابدأ الآن واكتشف مواهبك ونقاط قوتك</p>
            <Link to="/dashboard/riasec">
              <Button variant="hero" size="xl">
                ابدأ اختبار الشخصية مجانًا
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold font-display">أثر</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 أثر. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}