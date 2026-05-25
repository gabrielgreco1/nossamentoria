import type { ReactNode } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import styles from "./stat-card.module.css";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
};

export function StatCard({ label, value, detail, icon }: StatCardProps) {
  return (
    <GlassPanel className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </GlassPanel>
  );
}
