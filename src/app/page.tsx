import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  LockKeyhole,
  Route,
  Sparkles,
  UsersRound
} from "lucide-react";
import { redirect } from "next/navigation";
import { BlurText } from "@/components/marketing/blur-text";
import { Reveal } from "@/components/marketing/reveal";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import { getCurrentUser } from "@/lib/auth";
import styles from "./page.module.css";

const workflow = [
  {
    title: "Convite",
    description: "O acesso começa por um convite de mentor ou administrador.",
    icon: LockKeyhole
  },
  {
    title: "Plano",
    description: "Mentor e mentorado alinham objetivos, tópicos, duração e próximos resultados.",
    icon: ClipboardList
  },
  {
    title: "Evolução",
    description: "Aulas, materiais, encontros e progresso ficam conectados em uma trilha clara.",
    icon: BookOpenCheck
  }
];

const productAreas = [
  { label: "Planos de mentoria", icon: Route },
  { label: "Agenda de aulas", icon: CalendarDays },
  { label: "Notas de progresso", icon: CheckCircle2 },
  { label: "Materiais compartilhados", icon: FileText }
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app");
  }

  return (
    <main className={styles.page}>
      <header className={styles.nav}>
        <a className={styles.brand} href="/">
          <span>NM</span>
          NossaMentoria
        </a>
        <nav aria-label="Navegação pública">
          <a href="#trilha">Trilha</a>
          <a href="#acesso">Acesso</a>
          <GlassButton href="/login" icon={<ArrowRight size={16} />}>
            Entrar
          </GlassButton>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.motionBackdrop} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className={styles.heroCopy}>
          <Reveal delay={0.15}>
            <PillChip>Plataforma de mentoria por convite</PillChip>
          </Reveal>
          <BlurText text="Mentoria em tecnologia com trilha, contexto e progresso." />
          <Reveal delay={0.75}>
            <p>
              A NossaMentoria ajuda mentores e mentorados a transformar links, chamadas, notas e
              aulas soltas em uma jornada organizada de aprendizado.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <div className={styles.actions}>
              <GlassButton href="/login">Tenho um convite</GlassButton>
              <GlassButton href="#acesso" variant="secondary">
                Como funciona
              </GlassButton>
            </div>
          </Reveal>
        </div>

        <Reveal delay={1.15} className={styles.visualReveal}>
          <GlassPanel strong className={styles.heroVisual} aria-label="Prévia de trilha de mentoria">
            <div className={styles.visualHeader}>
              <Sparkles size={18} />
              <span>Prévia da trilha</span>
            </div>
            <div className={styles.progressCard}>
              <div>
                <span>Foco atual</span>
                <strong>Fundamentos de backend</strong>
              </div>
              <span className={styles.progressValue}>68%</span>
            </div>
            <ol className={styles.lessonList}>
              <li>
                <span />
                HTTP, APIs e ciclo de uma requisição
              </li>
              <li>
                <span />
                Modelagem de dados e fundamentos de SQL
              </li>
              <li>
                <span />
                Autenticação, permissões e deploy
              </li>
            </ol>
          </GlassPanel>
        </Reveal>
      </section>

      <section className={styles.capabilities} id="trilha">
        <Reveal className={styles.sectionHeader}>
          <span>// Trilha de aprendizado</span>
          <h2>Do convite ao avanço mensurável</h2>
        </Reveal>

        <div className={styles.workflowGrid}>
          {workflow.map((item, index) => (
            <Reveal delay={0.12 * index} key={item.title}>
              <GlassPanel className={styles.workflowCard}>
                <item.icon size={22} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </GlassPanel>
            </Reveal>
          ))}
        </div>

        <div className={styles.accessGrid} id="acesso">
          <Reveal delay={0.15}>
            <GlassPanel strong className={styles.accessCard}>
              <LockKeyhole size={24} />
              <h3>Acesso privado desde o começo</h3>
              <p>
                Não existe cadastro público aberto. Novas contas só nascem de convites válidos,
                e convites expirados, revogados ou já usados são bloqueados antes da criação da
                conta.
              </p>
              <GlassButton href="/login" variant="secondary">
                Entrar com email
              </GlassButton>
            </GlassPanel>
          </Reveal>

          <div className={styles.areaGrid}>
            {productAreas.map((area, index) => (
              <Reveal delay={0.08 * index} key={area.label}>
                <GlassPanel className={styles.areaCard}>
                  <area.icon size={19} />
                  <span>{area.label}</span>
                </GlassPanel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
