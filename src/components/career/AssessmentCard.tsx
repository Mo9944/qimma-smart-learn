import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AssessmentType, assessmentMeta } from "@/data/careerAssessments";

interface Props {
  type: AssessmentType;
  completed: boolean;
  onClick: () => void;
}

export default function AssessmentCard({ type, completed, onClick }: Props) {
  const meta = assessmentMeta[type];
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full rounded-2xl border p-5 text-right transition-all ${
        completed ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/30 hover:shadow-md"
      }`}
    >
      {completed && (
        <div className="absolute top-3 left-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${meta.color} text-2xl mb-3`}>
        {meta.icon}
      </div>
      <h3 className="font-bold text-base mb-1">{meta.title}</h3>
      <p className="text-muted-foreground text-xs leading-relaxed">{meta.desc}</p>
    </motion.button>
  );
}
