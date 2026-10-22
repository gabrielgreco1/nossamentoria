import type { ReactNode } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import styles from "./material-card.module.css";

type MaterialCardProps = {
  icon: ReactNode;
  typeLabel: string;
  category: string;
  title: string;
  description: string;
  tags?: string[];
  status: string;
  statusTone?: "default" | "warning" | "muted";
  meta?: ReactNode;
  action?: ReactNode;
};

export function MaterialCard({
  icon,
  typeLabel,
  category,
  title,
  description,
  tags = [],
  status,
  statusTone = "muted",
  meta,
  action
}: MaterialCardProps) {
  return (
    <GlassPanel as="article" className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>{icon}</div>
        <div className={styles.heading}>
          <span>{typeLabel} · {category}</span>
          <h3>{title}</h3>
        </div>
        <PillChip tone={statusTone}>{status}</PillChip>
      </div>
      <p>{description}</p>
      {tags.length > 0 ? (
        <div className={styles.tags}>{tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
      ) : null}
      {meta || action ? (
        <div className={styles.footer}>
          <span>{meta}</span>
          {action}
        </div>
      ) : null}
    </GlassPanel>
  );
}
