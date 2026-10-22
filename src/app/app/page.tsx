import { ArrowRight, Bell, BookOpenCheck, CalendarDays, FileCheck2, Link2, ShieldCheck, Target, UsersRound } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Reveal } from "@/components/marketing/reveal";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import { getRoleLabel } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "./page.module.css";

const quickActions = [
  {
    href: "/app/relationships",
    title: "Mentorias",
    description: "Conecte pessoas e acompanhe o ciclo de cada relação.",
    icon: UsersRound
  },
  {
    href: "/app/plans",
    title: "Planos",
    description: "Organize objetivos, tópicos, aulas e progresso.",
    icon: BookOpenCheck
  },
  {
    href: "/app/materials",
    title: "Materiais",
    description: "Mantenha a biblioteca e os anexos no contexto correto.",
    icon: Link2
  },
  {
    href: "/app/calendar",
    title: "Agenda",
    description: "Veja encontros futuros, histórico e próximas ações.",
    icon: CalendarDays
  }
];

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const context = await getWorkspaceContext();
  const displayName =
    context.user?.user_metadata?.full_name ?? context.user?.email?.split("@")[0] ?? "pessoa mentora";

  let relationshipCount = 0;
  let activePlanCount = 0;
  let upcomingSessionCount = 0;
  let unreadNotificationCount = 0;
  let progressNoteCount = 0;
  let sharedMaterialCount = 0;

  if (context.user) {
    const supabase = await createClient();
    const [relationships, plans, sessions, notifications, progressNotes, sharedMaterials] = await Promise.all([
      supabase.from("mentor_mentee_relationships").select("*", { count: "exact", head: true }),
      supabase.from("mentorship_plans").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("upcoming_sessions").select("*", { count: "exact", head: true }),
      supabase.from("notifications").select("*", { count: "exact", head: true }).is("read_at", null),
      supabase.from("progress_notes").select("*", { count: "exact", head: true }),
      supabase.from("shared_material_contexts").select("*", { count: "exact", head: true })
    ]);

    relationshipCount = relationships.count ?? 0;
    activePlanCount = plans.count ?? 0;
    upcomingSessionCount = sessions.count ?? 0;
    unreadNotificationCount = notifications.count ?? 0;
    progressNoteCount = progressNotes.count ?? 0;
    sharedMaterialCount = sharedMaterials.count ?? 0;
  }

  return (
    <div className={styles.dashboard}>
      <Reveal variant="app">
        <PageHeader
          eyebrow="Workspace privado"
          title={`Olá, ${displayName}`}
          description="Acompanhe o que precisa de atenção agora e abra cada área operacional em um clique."
          action={
            <div className={styles.roleSummary}>
              {context.roles.map((role) => <PillChip key={role}>{getRoleLabel(role)}</PillChip>)}
            </div>
          }
        />
      </Reveal>

      <Reveal variant="app" delay={0.05}>
        <section className={styles.grid} aria-label="Resumo do workspace">
          <StatCard label="Relações" value={String(relationshipCount)} detail="Mentorias visíveis no seu contexto." icon={<UsersRound size={19} />} />
          <StatCard label="Planos ativos" value={String(activePlanCount)} detail="Planos em acompanhamento agora." icon={<BookOpenCheck size={19} />} />
          <StatCard label="Próximas sessões" value={String(upcomingSessionCount)} detail="Encontros propostos ou confirmados." icon={<CalendarDays size={19} />} />
        </section>
      </Reveal>

      <Reveal variant="app" delay={0.1}>
        <GlassPanel strong className={styles.attentionPanel}>
          <div>
            <span>Agora</span>
            <h2>{unreadNotificationCount > 0 ? `${unreadNotificationCount} notificações aguardando leitura` : "Nenhuma pendência nova"}</h2>
            <p>As contagens são carregadas do Supabase e respeitam o papel e as relações do usuário autenticado.</p>
          </div>
          <Bell size={26} aria-hidden="true" />
        </GlassPanel>
      </Reveal>

      {context.roles.includes("mentor") || context.roles.includes("mentee") ? (
        <Reveal variant="app" delay={0.15}>
          <section className={styles.focusSection} aria-labelledby="role-focus-title">
            <div className={styles.sectionHeading}>
              <span>// Sua prioridade</span>
              <h2 id="role-focus-title">O próximo passo muda conforme seu papel</h2>
            </div>
            <div className={styles.focusGrid}>
              {context.roles.includes("mentor") ? (
                <GlassPanel className={styles.focusCard}>
                  <div className={styles.focusTitle}><Target size={20} /><div><span>Visão de mentor</span><h3>Conduzir e acompanhar</h3></div></div>
                  <ul>
                    <li><strong>{relationshipCount}</strong><span>mentorados e relações visíveis</span></li>
                    <li><strong>{upcomingSessionCount}</strong><span>sessões próximas para preparar</span></li>
                    <li><strong>{progressNoteCount}</strong><span>notas de progresso no seu contexto</span></li>
                  </ul>
                  <Link href="/app/plans">Revisar planos ativos <ArrowRight size={15} /></Link>
                </GlassPanel>
              ) : null}
              {context.roles.includes("mentee") ? (
                <GlassPanel className={styles.focusCard}>
                  <div className={styles.focusTitle}><FileCheck2 size={20} /><div><span>Visão de mentorado</span><h3>Aprender e avançar</h3></div></div>
                  <ul>
                    <li><strong>{activePlanCount}</strong><span>planos ativos no momento</span></li>
                    <li><strong>{upcomingSessionCount}</strong><span>próximas aulas ou encontros</span></li>
                    <li><strong>{sharedMaterialCount}</strong><span>materiais compartilhados no contexto</span></li>
                  </ul>
                  <Link href="/app/relationships">Ver minha mentoria <ArrowRight size={15} /></Link>
                </GlassPanel>
              ) : null}
            </div>
          </section>
        </Reveal>
      ) : null}

      <Reveal variant="app" delay={0.2}>
      <section className={styles.quickSection} aria-labelledby="quick-actions-title">
        <div className={styles.sectionHeading}>
          <span>// Atalhos</span>
          <h2 id="quick-actions-title">Abra a área certa sem percorrer um painel infinito</h2>
        </div>
        <div className={styles.quickGrid}>
          {quickActions.map((action) => (
            <Link href={action.href} key={action.href}>
              <GlassPanel className={styles.quickCard}>
                <action.icon size={20} aria-hidden="true" />
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </GlassPanel>
            </Link>
          ))}
          {context.roles.includes("admin") ? (
            <Link href="/app/admin">
              <GlassPanel className={styles.quickCard}>
                <ShieldCheck size={20} aria-hidden="true" />
                <h3>Administração</h3>
                <p>Consulte usuários, papéis e convites reais da plataforma.</p>
              </GlassPanel>
            </Link>
          ) : null}
        </div>
      </section>
      </Reveal>
    </div>
  );
}
