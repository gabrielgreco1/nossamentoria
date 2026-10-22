import type { ReactNode } from "react";
import styles from "./session-card.module.css";

type SessionCardProps = {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function SessionCard({ icon, eyebrow, title, description, action }: SessionCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.copy}>
        <span>{eyebrow}</span>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </article>
  );
}
