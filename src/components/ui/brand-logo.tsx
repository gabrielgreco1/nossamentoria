import Image from "next/image";
import styles from "./brand-logo.module.css";

type BrandLogoProps = {
  compact?: boolean;
  subtitle?: string;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ compact = false, subtitle, className, priority = false }: BrandLogoProps) {
  return (
    <span className={[styles.logo, compact ? styles.compact : "", className ?? ""].join(" ")}>
      <span className={styles.symbol} aria-hidden="true">
        <Image
          src="/brand/nossamentoria-symbol-v1.png"
          alt=""
          width={72}
          height={72}
          priority={priority}
        />
      </span>
      <span className={styles.copy}>
        <span className={styles.name}>NossaMentoria</span>
        {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
      </span>
    </span>
  );
}
