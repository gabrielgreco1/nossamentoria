"use client";

import { motion } from "framer-motion";
import styles from "./blur-text.module.css";

type BlurTextProps = {
  text: string;
  className?: string;
};

export function BlurText({ text, className }: BlurTextProps) {
  return (
    <h1 className={[styles.text, className ?? ""].join(" ")} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <motion.span
          aria-hidden="true"
          className={styles.word}
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          whileInView={{
            filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
            opacity: [0, 0.5, 1],
            y: [50, -5, 0]
          }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{
            duration: 0.7,
            delay: index * 0.1,
            times: [0, 0.5, 1],
            ease: "easeOut"
          }}
          key={`${word}-${index}`}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}
