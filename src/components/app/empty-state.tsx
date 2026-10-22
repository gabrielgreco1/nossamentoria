import type { ReactNode } from "react";
import { Reveal } from "@/components/marketing/reveal";
import { GlassPanel } from "@/components/ui/glass-panel";
import styles from "./empty-state.module.css";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Reveal variant="app" className={styles.reveal}>
      <GlassPanel className={styles.empty}>
        <h2>{title}</h2>
        <p>{description}</p>
        {action ? <div>{action}</div> : null}
      </GlassPanel>
    </Reveal>
  );
}
