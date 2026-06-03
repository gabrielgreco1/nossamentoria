import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import { getCurrentUserAccess, hasUserRole, type UserRole } from "@/lib/auth";
import { getEnvStatus } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
};

type RoleRow = {
  user_id: string;
  role: UserRole;
};

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const envStatus = getEnvStatus();
  const access = await getCurrentUserAccess();

  if (envStatus.configured && !access.user) {
    redirect("/login?next=/app/users");
  }

  if (!envStatus.configured) {
    return (
      <AppShell>
        <PageHeader
          eyebrow="Usuários"
          title="Configuração necessária"
          description="Configure Supabase Auth e rode as migrations antes de consultar usuários e papéis."
          action={<PillChip tone="warning">Setup</PillChip>}
        />
      </AppShell>
    );
  }

  if (!hasUserRole(access, "admin")) {
    return (
      <AppShell>
        <PageHeader
          eyebrow="Usuários"
          title="Acesso bloqueado"
          description="Somente admins podem visualizar perfis e atribuições de papéis."
          action={<PillChip tone="warning">Sem permissão</PillChip>}
        />
        <EmptyState
          title="Você não tem papel de admin"
          description="Peça a um administrador para atribuir o papel correto se você precisa gerenciar usuários da plataforma."
        />
      </AppShell>
    );
  }

  const supabase = await createClient();
  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,display_name,created_at")
      .order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id,role")
  ]);

  const roleMap = new Map<string, UserRole[]>();

  for (const row of (roles ?? []) as RoleRow[]) {
    roleMap.set(row.user_id, [...(roleMap.get(row.user_id) ?? []), row.role]);
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Admin"
        title="Usuários e papéis"
        description="Perfis vêm do Supabase Auth. Papéis controlam os contextos de admin, mentor, mentorado e usuários mistos."
        action={<PillChip>Admin</PillChip>}
      />

      <GlassPanel className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Email</th>
              <th>Papéis</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody>
            {((profiles ?? []) as ProfileRow[]).map((profile) => (
              <tr key={profile.id}>
                <td>{profile.display_name ?? "Sem nome"}</td>
                <td>{profile.email}</td>
                <td>
                  <div className={styles.roles}>
                    {(roleMap.get(profile.id) ?? []).map((role) => (
                      <PillChip key={role}>{role}</PillChip>
                    ))}
                    {(roleMap.get(profile.id) ?? []).length === 0 ? (
                      <span className={styles.muted}>Sem papel</span>
                    ) : null}
                  </div>
                </td>
                <td>{new Date(profile.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassPanel>
    </AppShell>
  );
}
