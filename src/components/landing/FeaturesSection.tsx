import { motion } from "framer-motion";
import {
  Compass, Brain, Target, Lightbulb, Clock, BarChart3
} from "lucide-react";

const features = [
  { icon: Compass, title: "اكتشاف المواهب", desc: "اختبارات علمية تكشف مواهبك الحقيقية ونقاط قوتك الخفية", color: "from-primary/20 to-primary/5" },
  { icon: Brain, title: "تحليل الشخصية", desc: "تحليل ذكي لنمط شخصيتك بناءً على نماذج عالمية معتمدة", color: "from-info/20 to-info/5" },
  { icon: Target, title: "نقاط القوة والضعف", desc: "تقرير تفصيلي بنقاط قوتك وجوانب التحسين مع خطة تطوير", color: "from-success/20 to-success/5" },
  { icon: Lightbulb, title: "نصائح ذكية", desc: "الذكاء الاصطناعي يقدم نصائح مخصصة لتطوير مهاراتك", color: "from-warning/20 to-warning/5" },
  { icon: Clock, title: "تنظيم الوقت", desc: "أدوات ذكية لتنظيم وقتك وبناء عادات إنتاجية", color: "from-destructive/10 to-destructive/5" },
  { icon: BarChart3, title: "تتبع التقدم", desc: "رسوم بيانية توضح تطورك ومسيرة نموك الشخصي", color: "from-primary/15 to-info/10" },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <motion.span
            className="inline-block text-sm font-medium text-primary mb-3 tracking-wide"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            المميزات
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold font-display mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            كل ما تحتاجه لاكتشاف ذاتك
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            أدوات ذكية صُمّمت لمساعدتك في فهم نفسك وتطوير إمكاناتك
          </motion.p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="group relative rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              viewport={{ once: true }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground group-hover:shadow-glow transition-shadow">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
