import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "سارة أحمد",
    role: "طالبة جامعية",
    text: "ساعدتني منصة أثر في اكتشاف أن شخصيتي تناسب مجال التصميم. الآن أدرس التصميم الجرافيكي وأحب ما أفعل!",
    rating: 5,
  },
  {
    name: "محمد خالد",
    role: "خريج ثانوية",
    text: "كنت حائرًا في اختيار تخصصي الجامعي. التحليلات الخمسة وضّحت لي نقاط قوتي وساعدتني في اتخاذ القرار.",
    rating: 5,
  },
  {
    name: "نورة العلي",
    role: "موظفة تبحث عن تطوير",
    text: "أدوات تنظيم الوقت والعادات غيّرت حياتي. أصبحت أكثر إنتاجية وأفهم نفسي بشكل أعمق.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <motion.span
            className="inline-block text-sm font-medium text-primary mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            قصص نجاح
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold font-display mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            ماذا يقول مستخدمونا
          </motion.h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Quote className="h-8 w-8 text-primary/20 mb-3" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t.text}</p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
