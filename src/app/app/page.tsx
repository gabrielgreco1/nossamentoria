import { Bell, BookOpenCheck, CalendarDays, Link2, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
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

  if (context.user) {
    const supabase = await createClient();
    const [relationships, plans, sessions, notifications] = await Promise.all([
      supabase.from("mentor_mentee_relationships").select("*", { count: "exact", head: true }),
      supabase.from("mentorship_plans").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("upcoming_sessions").select("*", { count: "exact", head: true }),
      supabase.from("notifications").select("*", { count: "exact", head: true }).is("read_at", null)
    ]);

    relationshipCount = relationships.count ?? 0;
    activePlanCount = plans.count ?? 0;
    upcomingSessionCount = sessions.count ?? 0;
    unreadNotificationCount = notifications.count ?? 0;
  }

  return (
    <div className={styles.dashboard}>
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

      <section className={styles.grid} aria-label="Resumo do workspace">
        <StatCard label="Relações" value={String(relationshipCount)} detail="Mentorias visíveis no seu contexto." icon={<UsersRound size={19} />} />
        <StatCard label="Planos ativos" value={String(activePlanCount)} detail="Planos em acompanhamento agora." icon={<BookOpenCheck size={19} />} />
        <StatCard label="Próximas sessões" value={String(upcomingSessionCount)} detail="Encontros propostos ou confirmados." icon={<CalendarDays size={19} />} />
      </section>

      <GlassPanel strong className={styles.attentionPanel}>
        <div>
          <span>Agora</span>
          <h2>{unreadNotificationCount > 0 ? `${unreadNotificationCount} notificações aguardando leitura` : "Nenhuma pendência nova"}</h2>
          <p>As contagens são carregadas do Supabase e respeitam o papel e as relações do usuário autenticado.</p>
        </div>
        <Bell size={26} aria-hidden="true" />
      </GlassPanel>

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
    </div>
  );
}
