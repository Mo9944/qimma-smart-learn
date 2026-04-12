import { motion } from "framer-motion";
import { Compass, Brain, Target, Sparkles } from "lucide-react";

const steps = [
  { step: "01", icon: Compass, title: "أجب على الاختبارات", desc: "5 اختبارات شاملة لاكتشاف شخصيتك وقدراتك ونقاط قوتك" },
  { step: "02", icon: Brain, title: "احصل على التحليل", desc: "الذكاء الاصطناعي يحلل نتائجك ويكشف مواهبك الحقيقية" },
  { step: "03", icon: Target, title: "اكتشف مسارك", desc: "تعرف على المجالات المهنية والدراسية المناسبة لك" },
  { step: "04", icon: Sparkles, title: "ابدأ التطوير", desc: "نصائح عملية وخطط مخصصة لتطوير نفسك خطوة بخطوة" },
];

export default function HowItWorksSection() {
  return (
    <section id="how" className="py-20 md:py-28 bg-secondary/40">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <motion.span
            className="inline-block text-sm font-medium text-primary mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            كيف يعمل
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold font-display mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            كيف تبدأ رحلتك؟
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            أربع خطوات بسيطة لاكتشاف إمكاناتك الحقيقية
          </motion.p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              className="relative text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              viewport={{ once: true }}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -left-4 w-8 h-0.5 bg-border" />
              )}
              <div className="mb-5 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
                <item.icon className="h-7 w-7" />
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-primary mb-2 bg-accent rounded-full px-3 py-1">
                الخطوة {item.step}
              </div>
              <h3 className="text-base font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
