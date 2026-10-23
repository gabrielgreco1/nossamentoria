import { LivePlansWorkspace } from "@/components/app/live-workspaces";
import { PageHeader } from "@/components/app/page-header";
import { getPlansWorkspaceData } from "@/lib/workspace-data";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const context = await getWorkspaceContext();
  const isMentee = context.activeRole === "mentee";
  const data = await getPlansWorkspaceData(context);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Planos"
        title={isMentee ? "Meu plano" : "Planos por mentorado"}
        description={isMentee
          ? "Veja seus objetivos, a sequência de aulas, o progresso e as próximas ações compartilhadas."
          : "Selecione uma pessoa para criar a trilha inicial ou acompanhar aulas, agenda e progresso de um plano já ativo."}
      />
      <LivePlansWorkspace data={data} role={context.activeRole} />
    </div>
  );
}
