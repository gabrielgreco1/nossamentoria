import { LivePlansWorkspace } from "@/components/app/live-workspaces";
import { PlanManager } from "@/components/app/plan-manager";
import { PageHeader } from "@/components/app/page-header";
import { getPlansWorkspaceData } from "@/lib/workspace-data";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default async function PlansPage({
  searchParams
}: {
  searchParams: Promise<{ relationship?: string }>;
}) {
  const context = await getWorkspaceContext();
  const isMentee = context.activeRole === "mentee";
  const { relationship } = await searchParams;
  const data = await getPlansWorkspaceData(context);

  return (
    <div className={styles.page}>
      <PageHeader title={isMentee ? "Meu plano" : "Planos por mentorado"} />
      {isMentee
        ? <LivePlansWorkspace data={data} role={context.activeRole} />
        : <PlanManager data={data} selectedRelationshipId={relationship} />}
    </div>
  );
}
