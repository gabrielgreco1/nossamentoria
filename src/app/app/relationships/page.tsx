import { RelationshipManager } from "@/components/app/relationship-manager";
import { PageHeader } from "@/components/app/page-header";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default async function RelationshipsPage() {
  const context = await getWorkspaceContext();
  const isMentee = context.activeRole === "mentee";

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={isMentee ? "Minha jornada" : "Relacionamentos"}
        title={isMentee ? "Minha mentoria" : "Mentorados"}
        description={isMentee
          ? "Acompanhe sua conexão com o mentor, o estado do plano e as próximas ações combinadas."
          : "Encontre pessoas disponíveis, acompanhe convites e mantenha seu grupo de mentorados organizado."}
      />
      <RelationshipManager role={context.activeRole} />
    </div>
  );
}
