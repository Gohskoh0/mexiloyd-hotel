import { motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
} & MotionProps;

export function Reveal({ children, delay = 0, y = 24, className, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type BrandPanelProps = {
  className?: string;
  label?: string;
};

/** Editorial brand-tile used where a real photograph isn't available yet. */
export function BrandPanel({ className, label }: BrandPanelProps) {
  return (
    <div
      className={`relative overflow-hidden bg-primary text-primary-foreground ${className ?? ""}`}
    >
      <div className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--color-brass) 0, transparent 40%), radial-gradient(circle at 80% 80%, var(--color-brass) 0, transparent 40%)",
        }}
      />
      <div className="absolute inset-6 border border-white/15 rounded-xl" />
      <div className="relative h-full w-full grid place-items-center">
        <div className="text-center">
          <div className="font-display italic text-brass text-7xl md:text-8xl leading-none">M</div>
          {label ? (
            <div className="mt-3 text-[10px] tracking-[0.24em] uppercase text-white/70">{label}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
