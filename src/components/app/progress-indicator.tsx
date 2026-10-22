import styles from "./progress-indicator.module.css";

type ProgressIndicatorProps = {
  value: number;
  label: string;
  compact?: boolean;
};

export function ProgressIndicator({ value, label, compact = false }: ProgressIndicatorProps) {
  const normalizedValue = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={[styles.root, compact ? styles.compact : ""].join(" ")}>
      <div className={styles.meta}>
        <span>{label}</span>
        <strong>{normalizedValue}%</strong>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalizedValue}
      >
        <span style={{ width: `${normalizedValue}%` }} />
      </div>
    </div>
  );
}
