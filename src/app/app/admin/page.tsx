import { KeyRound, ShieldCheck, UserCog } from "lucide-react";
import { AdminInvitationForm } from "@/components/app/admin-invitation-form";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
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
        <PageHeader
          eyebrow="Administração"
          title="Acesso restrito"
          description="Esta área concentra usuários, papéis e convites da plataforma."
          action={<PillChip tone="warning">Bloqueado</PillChip>}
        />
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
      <PageHeader
        eyebrow="Administração"
        title="Acessos da plataforma"
        description="Acompanhe usuários, papéis e convites sem depender de dados demonstrativos."
        action={<PillChip><ShieldCheck size={14} /> Admin</PillChip>}
      />

      <section className={styles.stats} aria-label="Resumo administrativo">
        <StatCard label="Usuários" value={String(profilesResult.count ?? 0)} detail="Perfis provisionados no banco." icon={<UserCog size={19} />} />
        <StatCard label="Papéis" value={String(rolesResult.count ?? 0)} detail="Atribuições ativas de acesso." icon={<ShieldCheck size={19} />} />
        <StatCard label="Convites pendentes" value={String(invitationsResult.count ?? 0)} detail="Entradas ainda não aceitas ou expiradas." icon={<KeyRound size={19} />} />
      </section>

      <GlassPanel className={styles.panel}>
        <div>
          <PillChip>Novo acesso</PillChip>
          <h2>Criar convite privado</h2>
          <p>O link é gerado pelo banco e pode ser usado uma única vez pelo e-mail informado.</p>
        </div>
        <AdminInvitationForm />
      </GlassPanel>

      <GlassPanel className={styles.panel}>
        <div>
          <PillChip tone="muted">Dados reais</PillChip>
          <h2>Convites recentes</h2>
          <p>A lista respeita as políticas RLS e só é consultada depois da verificação do papel administrativo.</p>
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
          <p>Nenhum convite foi criado ainda.</p>
        )}
      </GlassPanel>
    </div>
  );
}
