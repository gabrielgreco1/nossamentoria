import { ArrowRight } from "lucide-react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./glass-button.module.css";

type SharedProps = {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type AnchorProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export function GlassButton(props: ButtonProps | AnchorProps) {
  if ("href" in props) {
    const { children, icon, variant = "primary", className, ...rest } = props as AnchorProps;
    const classes = [styles.button, styles[variant], className ?? ""].join(" ");

    return (
      <a className={classes} {...rest}>
        <span>{children}</span>
        <span className={styles.icon}>{icon ?? <ArrowRight size={16} strokeWidth={1.8} />}</span>
      </a>
    );
  }

  const { children, icon, variant = "primary", className, ...rest } = props as ButtonProps;
  const classes = [styles.button, styles[variant], className ?? ""].join(" ");

  return (
    <button className={classes} type="button" {...rest}>
      <span>{children}</span>
      <span className={styles.icon}>{icon ?? <ArrowRight size={16} strokeWidth={1.8} />}</span>
    </button>
  );
}
