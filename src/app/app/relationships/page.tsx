import { RelationshipManager } from "@/components/app/relationship-manager";
import { PageHeader } from "@/components/app/page-header";
import { getRelationshipPageData } from "@/lib/relationship-data";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default async function RelationshipsPage() {
  const context = await getWorkspaceContext();
  const isMentee = context.activeRole === "mentee";
  const data = await getRelationshipPageData(context);

  return (
    <div className={styles.page}>
      <PageHeader title={isMentee ? "Minha mentoria" : "Mentorados"} />
      <RelationshipManager data={data} role={context.activeRole} />
    </div>
  );
}
