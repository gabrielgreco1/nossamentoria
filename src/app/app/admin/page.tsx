import { KeyRound, ShieldCheck, UserCog } from "lucide-react";
import { AdminInvitationForm } from "@/components/app/admin-invitation-form";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { canAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { revokeInvitationAction } from "./actions";
import styles from "../section-page.module.css";

type InvitationRow = {
  id: string;
  email: string;
  intended_role: string;
  status: string;
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const context = await getWorkspaceContext();
  const access = canAccess(context.roles, "manage_platform");

  if (!access.allowed) {
    return (
      <div className={styles.page}>
        <PageHeader title="Acesso restrito" />
        <EmptyState title="Permissão administrativa necessária" description={access.reason} />
      </div>
    );
  }

  const supabase = await createClient();
  const [profilesResult, rolesResult, invitationsResult, recentInvitationsResult] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("user_roles").select("*", { count: "exact", head: true }),
    supabase.from("invitations").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("invitations")
      .select("id,email,intended_role,status")
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  const recentInvitations = (recentInvitationsResult.data ?? []) as InvitationRow[];

  return (
    <div className={styles.page}>
      <PageHeader title="Administração" />

      <section className={styles.stats} aria-label="Resumo administrativo">
        <StatCard label="Usuários" value={String(profilesResult.count ?? 0)} icon={<UserCog size={19} />} />
        <StatCard label="Papéis ativos" value={String(rolesResult.count ?? 0)} icon={<ShieldCheck size={19} />} />
        <StatCard label="Convites pendentes" value={String(invitationsResult.count ?? 0)} icon={<KeyRound size={19} />} />
      </section>

      <div className={styles.adminGrid}>
        <GlassPanel className={styles.panel}>
          <div>
            <h2>Criar convite</h2>
            <p>Envie um acesso individual para um novo participante.</p>
          </div>
          <AdminInvitationForm />
        </GlassPanel>

        <GlassPanel className={styles.panel}>
          <div>
            <h2>Convites recentes</h2>
          </div>
          {recentInvitations.length > 0 ? (
            <ul className={styles.list}>
              {recentInvitations.map((invitation) => (
                <li key={invitation.id}>
                  <div>
                    <strong>{invitation.email}</strong>
                    <span>{invitation.intended_role} · {invitation.status}</span>
                  </div>
                  {invitation.status === "pending" ? (
                    <form action={revokeInvitationAction}>
                      <input type="hidden" name="invitationId" value={invitation.id} />
                      <button className={styles.dangerButton} type="submit">Revogar</button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum convite criado.</p>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
