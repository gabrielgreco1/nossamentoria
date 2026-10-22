"use client";

import { motion, useReducedMotion } from "framer-motion";
import styles from "./blur-text.module.css";

type BlurTextProps = {
  text: string;
  className?: string;
  id?: string;
};

export function BlurText({ text, className, id }: BlurTextProps) {
  const reduceMotion = useReducedMotion();

  return (
    <h1 id={id} className={[styles.text, className ?? ""].join(" ")} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <motion.span
          aria-hidden="true"
          className={styles.word}
          initial={reduceMotion ? false : { filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={reduceMotion ? { filter: "blur(0px)", opacity: 1, y: 0 } : undefined}
          whileInView={reduceMotion ? undefined : {
            filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
            opacity: [0, 0.5, 1],
            y: [50, -5, 0]
          }}
          viewport={{ once: true, amount: 0.1 }}
          transition={reduceMotion ? undefined : {
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
