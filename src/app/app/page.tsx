import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  CalendarDays,
  FileCheck2,
  Link2,
  ShieldCheck,
  Target,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Reveal } from "@/components/marketing/reveal";
import { GlassPanel } from "@/components/ui/glass-panel";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "./page.module.css";

const quickActions = [
  { href: "/app/relationships", title: "Mentorias", icon: UsersRound },
  { href: "/app/plans", title: "Planos", icon: BookOpenCheck },
  { href: "/app/materials", title: "Materiais", icon: Link2 },
  { href: "/app/calendar", title: "Agenda", icon: CalendarDays }
];

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const context = await getWorkspaceContext();
  const activeRole = context.activeRole;
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
        <PageHeader title={`Olá, ${displayName}`} />
      </Reveal>

      <Reveal variant="app" delay={0.05}>
        <section className={styles.grid} aria-label="Resumo">
          <StatCard label="Mentorias" value={String(relationshipCount)} icon={<UsersRound size={19} />} />
          <StatCard label="Planos ativos" value={String(activePlanCount)} icon={<BookOpenCheck size={19} />} />
          <StatCard label="Próximas sessões" value={String(upcomingSessionCount)} icon={<CalendarDays size={19} />} />
          <StatCard label="Notificações" value={String(unreadNotificationCount)} icon={<Bell size={19} />} />
        </section>
      </Reveal>

      {unreadNotificationCount > 0 ? (
        <Reveal variant="app" delay={0.1}>
          <GlassPanel strong className={styles.attentionPanel}>
            <div>
              <span>Atenção</span>
              <h2>{unreadNotificationCount} notificação(ões) aguardando leitura</h2>
            </div>
            <Bell size={24} aria-hidden="true" />
          </GlassPanel>
        </Reveal>
      ) : null}

      {activeRole === "mentor" || activeRole === "mentee" ? (
        <Reveal variant="app" delay={0.15}>
          <section className={styles.focusSection} aria-labelledby="role-focus-title">
            <div className={styles.sectionHeading}>
              <h2 id="role-focus-title">Sua mentoria</h2>
            </div>
            <div className={styles.focusGrid}>
              {activeRole === "mentor" ? (
                <GlassPanel className={styles.focusCard}>
                  <div className={styles.focusTitle}><Target size={20} /><div><h3>Acompanhamento</h3></div></div>
                  <ul>
                    <li><strong>{relationshipCount}</strong><span>mentorados</span></li>
                    <li><strong>{upcomingSessionCount}</strong><span>próximas sessões</span></li>
                    <li><strong>{progressNoteCount}</strong><span>notas de progresso</span></li>
                  </ul>
                  <Link href="/app/plans">Ver planos <ArrowRight size={15} /></Link>
                </GlassPanel>
              ) : null}
              {activeRole === "mentee" ? (
                <GlassPanel className={styles.focusCard}>
                  <div className={styles.focusTitle}><FileCheck2 size={20} /><div><h3>Meu progresso</h3></div></div>
                  <ul>
                    <li><strong>{activePlanCount}</strong><span>planos ativos</span></li>
                    <li><strong>{upcomingSessionCount}</strong><span>próximos encontros</span></li>
                    <li><strong>{sharedMaterialCount}</strong><span>materiais</span></li>
                  </ul>
                  <Link href="/app/relationships">Ver mentoria <ArrowRight size={15} /></Link>
                </GlassPanel>
              ) : null}
            </div>
          </section>
        </Reveal>
      ) : null}

      <Reveal variant="app" delay={0.2}>
        <section className={styles.quickSection} aria-labelledby="quick-actions-title">
          <div className={styles.sectionHeading}>
            <h2 id="quick-actions-title">Acesso rápido</h2>
          </div>
          <div className={styles.quickGrid}>
            {quickActions.map((action) => (
              <Link href={action.href} key={action.href}>
                <GlassPanel className={styles.quickCard}>
                  <action.icon size={20} aria-hidden="true" />
                  <h3>{action.title}</h3>
                  <ArrowRight className={styles.quickArrow} size={17} aria-hidden="true" />
                </GlassPanel>
              </Link>
            ))}
            {activeRole === "admin" && context.roles.includes("admin") ? (
              <Link href="/app/admin">
                <GlassPanel className={styles.quickCard}>
                  <ShieldCheck size={20} aria-hidden="true" />
                  <h3>Administração</h3>
                  <ArrowRight className={styles.quickArrow} size={17} aria-hidden="true" />
                </GlassPanel>
              </Link>
            ) : null}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
