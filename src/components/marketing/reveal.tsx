"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "public" | "app";
};

export function Reveal({ children, delay = 0, className, variant = "public" }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const initial = variant === "app"
    ? { opacity: 0, y: 10 }
    : { filter: "blur(10px)", opacity: 0, y: 20 };
  const visible = variant === "app"
    ? { opacity: 1, y: 0 }
    : { filter: "blur(0px)", opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : initial}
      animate={reduceMotion ? visible : undefined}
      whileInView={reduceMotion ? undefined : visible}
      viewport={{ once: true, amount: 0.25 }}
      transition={reduceMotion ? undefined : { duration: variant === "app" ? 0.35 : 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
