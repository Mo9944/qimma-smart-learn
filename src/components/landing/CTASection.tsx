import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <motion.div
          className="mx-auto max-w-3xl text-center rounded-3xl gradient-hero p-10 md:p-16 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/15 blur-[60px]" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-info/10 blur-[50px]" />
          </div>
          <div className="relative z-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold font-display text-primary-foreground mb-4">
              جاهز تكتشف نفسك؟
            </h2>
            <p className="text-primary-foreground/60 mb-8 text-lg max-w-md mx-auto">
              ابدأ الآن واكتشف مواهبك ونقاط قوتك وابنِ مستقبلك المهني بثقة
            </p>
            <Link to="/dashboard/career-compass">
              <Button variant="hero" size="xl" className="min-w-[240px]">
                <Sparkles className="h-5 w-5" />
                ابدأ مجانًا الآن
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
