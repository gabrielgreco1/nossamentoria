import { LiveCalendarWorkspace } from "@/components/app/live-workspaces";
import { PageHeader } from "@/components/app/page-header";
import { getCalendarWorkspaceData } from "@/lib/workspace-data";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const context = await getWorkspaceContext();
  const data = await getCalendarWorkspaceData(context);

  return (
    <div className={styles.page}>
      <PageHeader title="Calendário" />
      <LiveCalendarWorkspace data={data} role={context.activeRole} />
    </div>
  );
}
