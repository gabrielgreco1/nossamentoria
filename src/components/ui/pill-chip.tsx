import type { ReactNode } from "react";
import styles from "./pill-chip.module.css";

type PillChipProps = {
  children: ReactNode;
  tone?: "default" | "warning" | "muted";
};

export function PillChip({ children, tone = "default" }: PillChipProps) {
  return <span className={[styles.chip, styles[tone]].join(" ")}>{children}</span>;
}
