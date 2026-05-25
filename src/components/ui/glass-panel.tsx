import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import styles from "./glass-panel.module.css";

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  strong?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function GlassPanel<T extends ElementType = "div">({
  as,
  children,
  strong = false,
  className,
  ...props
}: GlassPanelProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={[styles.panel, strong ? styles.strong : "", className ?? ""].join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}
