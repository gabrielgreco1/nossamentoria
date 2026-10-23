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
  UserPlus,
  UsersRound
} from "lucide-react";
import { redirect } from "next/navigation";
import { ProgressIndicator } from "@/components/app/progress-indicator";
import { LandingHero } from "@/components/marketing/landing-hero";
import { Reveal } from "@/components/marketing/reveal";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { BrandLogo } from "@/components/ui/brand-logo";
import { getCurrentUser } from "@/lib/auth";
import styles from "./page.module.css";

const workflow = [
  {
    title: "Cadastro",
    description: "Mentores e mentorados criam um perfil completo e confirmam o próprio e-mail.",
    icon: UserPlus
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
        <a className={styles.brand} href="/" aria-label="NossaMentoria — início">
          <BrandLogo compact priority />
        </a>
        <nav aria-label="Navegação pública">
          <a href="#trilha">Trilha</a>
          <a href="#acesso">Acesso</a>
          <GlassButton href="/login" icon={<ArrowRight size={16} />}>
            Entrar
          </GlassButton>
        </nav>
      </header>

      <LandingHero
        eyebrow="Para quem ensina e para quem aprende"
        title="Mentoria em tecnologia com trilha, contexto e progresso."
        description="A NossaMentoria ajuda mentores e mentorados a transformar links, chamadas, notas e aulas soltas em uma jornada organizada de aprendizado, com planos, materiais, encontros e progresso no mesmo lugar."
        actions={(
          <>
            <GlassButton href="/register">Criar meu perfil</GlassButton>
            <GlassButton href="#acesso" variant="secondary">Como funciona</GlassButton>
          </>
        )}
        visual={(
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
              <ProgressIndicator value={68} label="Progresso do plano" compact />
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
                Autenticação, permissões e segurança
              </li>
            </ol>
          </GlassPanel>
        )}
      />

      <section className={styles.capabilities} id="trilha">
        <Reveal className={styles.sectionHeader}>
          <span>// Trilha de aprendizado</span>
          <h2>Do cadastro ao avanço mensurável</h2>
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
              <h3>Cadastro completo e acesso protegido</h3>
              <p>
                Mentores e mentorados podem se cadastrar com e-mail e senha, informar formação e
                áreas de conhecimento e confirmar o endereço antes do primeiro acesso. Contas de
                administrador continuam restritas a convites emitidos por outro administrador.
              </p>
              <GlassButton href="/register" variant="secondary">
                Fazer cadastro
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
