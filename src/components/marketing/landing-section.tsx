import type { ReactNode } from "react";
import styles from "./landing-section.module.css";

type LandingSectionProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
};

export function LandingSection({ eyebrow, title, children, className }: LandingSectionProps) {
  return (
    <section className={[styles.section, className ?? ""].join(" ")}>
      <div className={styles.header}>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
