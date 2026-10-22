import type { ReactNode } from "react";
import { BlurText } from "@/components/marketing/blur-text";
import { Reveal } from "@/components/marketing/reveal";
import { PillChip } from "@/components/ui/pill-chip";
import styles from "./landing-hero.module.css";

type LandingHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions: ReactNode;
  visual: ReactNode;
};

export function LandingHero({ eyebrow, title, description, actions, visual }: LandingHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="landing-hero-title">
      <div className={styles.motionBackdrop} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className={styles.copy}>
        <Reveal delay={0.1}>
          <PillChip>{eyebrow}</PillChip>
        </Reveal>
        <BlurText id="landing-hero-title" text={title} />
        <Reveal delay={0.35}>
          <p>{description}</p>
        </Reveal>
        <Reveal delay={0.5}>
          <div className={styles.actions}>{actions}</div>
        </Reveal>
      </div>

      <Reveal delay={0.55} className={styles.visual}>
        {visual}
      </Reveal>
    </section>
  );
}
