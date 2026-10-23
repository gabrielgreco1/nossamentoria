import { LiveMaterialsWorkspace } from "@/components/app/live-workspaces";
import { MaterialManager } from "@/components/app/material-manager";
import { PageHeader } from "@/components/app/page-header";
import { getMaterialsWorkspaceData } from "@/lib/workspace-data";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const context = await getWorkspaceContext();
  const isMentee = context.activeRole === "mentee";
  const data = await getMaterialsWorkspaceData(context);

  return (
    <div className={styles.page}>
      <PageHeader title={isMentee ? "Meus materiais" : "Materiais e templates"} />
      {isMentee
        ? <LiveMaterialsWorkspace data={data} role={context.activeRole} />
        : <MaterialManager data={data} />}
    </div>
  );
}
