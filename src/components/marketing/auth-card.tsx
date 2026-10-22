import type { ReactNode } from "react";
import { Reveal } from "@/components/marketing/reveal";
import { BrandLogo } from "@/components/ui/brand-logo";
import { GlassPanel } from "@/components/ui/glass-panel";
import styles from "./auth-card.module.css";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ eyebrow, title, description, children }: AuthCardProps) {
  return (
    <main className={styles.wrap}>
      <a className={styles.brand} href="/" aria-label="NossaMentoria — início">
        <BrandLogo compact priority />
      </a>
      <Reveal className={styles.reveal}>
        <GlassPanel strong className={styles.card}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          {children}
        </GlassPanel>
      </Reveal>
    </main>
  );
}
