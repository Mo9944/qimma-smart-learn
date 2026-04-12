import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6 }
  })
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero py-24 md:py-36">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-16 right-16 h-80 w-80 rounded-full bg-primary/20 blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-info/15 blur-[80px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/10 blur-[120px]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, delay: 4 }}
        />
      </div>

      <div className="container relative z-10">
        <motion.div className="mx-auto max-w-3xl text-center" initial="hidden" animate="visible">
          <motion.div
            custom={0}
            variants={fadeIn}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary-foreground/80 backdrop-blur-sm"
          >
            <Zap className="h-4 w-4 text-warning" />
            <span>منصة عربية ذكية لاكتشاف الذات وبناء المستقبل</span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeIn}
            className="mb-6 text-4xl font-bold font-display leading-[1.3] text-primary-foreground md:text-5xl lg:text-6xl"
          >
            اكتشف مواهبك{" "}
            <span className="relative inline-block">
              <span className="text-gradient">واصنع أثرك</span>
              <motion.span
                className="absolute -bottom-1 right-0 left-0 h-1 rounded-full gradient-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeIn}
            className="mb-10 text-lg text-primary-foreground/65 md:text-xl leading-relaxed max-w-2xl mx-auto"
          >
            منصة مدعومة بالذكاء الاصطناعي تساعدك على تحليل شخصيتك، 
            اكتشاف نقاط قوتك، ومعرفة المسار المهني والدراسي الأنسب لك
          </motion.p>

          <motion.div custom={3} variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard/career-compass">
              <Button variant="hero" size="xl" className="min-w-[220px]">
                <Sparkles className="h-5 w-5" />
                ابدأ رحلة الاكتشاف
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

          {/* Trust indicators */}
          <motion.div
            custom={4}
            variants={fadeIn}
            className="mt-12 flex items-center justify-center gap-6 text-primary-foreground/40 text-sm"
          >
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              مجاني بالكامل
            </span>
            <span className="hidden sm:inline">•</span>
            <span>5 اختبارات شاملة</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1">تحليل بالذكاء الاصطناعي</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
