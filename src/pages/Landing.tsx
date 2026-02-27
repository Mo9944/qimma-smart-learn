import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, Brain, BarChart3, Trophy, Clock, Users, 
  Sparkles, ArrowLeft, ChevronDown, Star, Zap, Shield
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
  { icon: BookOpen, title: "إدارة المواد", desc: "نظّم موادك ودروسك وملفاتك في مكان واحد", color: "text-primary" },
  { icon: Brain, title: "ذكاء اصطناعي", desc: "شرح مبسّط، أسئلة تلقائية، ملخصات وخرائط ذهنية", color: "text-info" },
  { icon: BarChart3, title: "تحليل الأداء", desc: "تقارير مفصّلة ورسوم بيانية لتتبّع تقدّمك", color: "text-success" },
  { icon: Trophy, title: "نظام تحفيز", desc: "نقاط XP، مستويات، أوسمة وتحديات يومية", color: "text-accent" },
  { icon: Clock, title: "إدارة الوقت", desc: "جدول مذاكرة، مؤقت بومودورو، وتحليل الوقت", color: "text-warning" },
  { icon: Users, title: "مجتمع طلابي", desc: "شارك ملخصاتك وتنافس مع زملائك", color: "text-destructive" },
];

const stats = [
  { value: "50K+", label: "طالب نشط" },
  { value: "95%", label: "نسبة النجاح" },
  { value: "1M+", label: "اختبار مُكتمل" },
  { value: "4.9", label: "تقييم المستخدمين" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">قِمّة</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">المميزات</a>
            <a href="#stats" className="hover:text-foreground transition-colors">الإحصائيات</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">الأسعار</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">تسجيل الدخول</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button variant="default" size="sm">ابدأ مجانًا</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero py-24 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-10 left-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="container relative z-10">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
          >
            <motion.div custom={0} variants={fadeIn} className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground/80">
              <Zap className="h-4 w-4" />
              <span>نظام تشغيل متكامل للطالب</span>
            </motion.div>
            <motion.h1 custom={1} variants={fadeIn} className="mb-6 text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
              ارتقِ بمذاكرتك إلى{" "}
              <span className="text-gradient-accent">القِمّة</span>
            </motion.h1>
            <motion.p custom={2} variants={fadeIn} className="mb-10 text-lg text-primary-foreground/70 md:text-xl leading-relaxed">
              الفهم + المذاكرة + الاختبار + التحليل + التحفيز + التنظيم
              <br />
              كل ما تحتاجه في منصة واحدة مدعومة بالذكاء الاصطناعي
            </motion.p>
            <motion.div custom={3} variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?tab=signup">
                <Button variant="hero" size="xl">
                  ابدأ رحلتك مجانًا
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="hero-outline" size="xl">
                  اكتشف المميزات
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-b border-border bg-card py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl font-bold text-gradient mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">كل ما يحتاجه الطالب</h2>
            <p className="text-muted-foreground text-lg">منصة متكاملة صُمّمت لتحويل طريقة مذاكرتك بالكامل</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-secondary/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">خطط بسيطة وشفافة</h2>
            <p className="text-muted-foreground text-lg">ابدأ مجانًا وطوّر حسابك متى شئت</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="rounded-xl border border-border bg-card p-8 shadow-card">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">مجاني</h3>
                <p className="text-muted-foreground text-sm">للبدء والتجربة</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold">0</span>
                <span className="text-muted-foreground mr-1">ر.س / شهريًا</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                {["3 مواد", "5 اختبارات شهريًا", "10 طلبات AI", "جدول مذاكرة"].map(t => (
                  <li key={t} className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-success" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth?tab=signup">
                <Button variant="outline" className="w-full">ابدأ مجانًا</Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-xl border-2 border-primary bg-card p-8 shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                الأكثر شعبية
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">بريميوم</h3>
                <p className="text-muted-foreground text-sm">للطالب الجاد</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold">49</span>
                <span className="text-muted-foreground mr-1">ر.س / شهريًا</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                {["مواد غير محدودة", "اختبارات غير محدودة", "AI غير محدود", "تحليل متقدم", "مجتمع طلابي", "أولوية الدعم"].map(t => (
                  <li key={t} className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth?tab=signup">
                <Button variant="hero" className="w-full">اشترك الآن</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">قِمّة</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 قِمّة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
