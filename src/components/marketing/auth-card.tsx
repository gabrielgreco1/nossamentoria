import type { ReactNode } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { GlassPanel } from "@/components/ui/glass-panel";
import styles from "./auth-card.module.css";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
};

export function AuthCard({ eyebrow, title, description, children, wide = false }: AuthCardProps) {
  return (
    <main className={[styles.wrap, wide ? styles.wideWrap : ""].join(" ")}>
      <a className={styles.brand} href="/" aria-label="NossaMentoria — início">
        <BrandLogo compact priority />
      </a>
      <div className={[styles.reveal, wide ? styles.wide : ""].join(" ")}>
        <GlassPanel strong className={styles.card}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          {children}
        </GlassPanel>
      </div>
    </main>
  );
}
