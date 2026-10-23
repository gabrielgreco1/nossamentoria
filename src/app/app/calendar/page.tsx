import { LiveCalendarWorkspace } from "@/components/app/live-workspaces";
import { PageHeader } from "@/components/app/page-header";
import { getCalendarWorkspaceData } from "@/lib/workspace-data";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const context = await getWorkspaceContext();
  const isMentee = context.activeRole === "mentee";
  const data = await getCalendarWorkspaceData(context);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Agenda"
        title="Calendário"
        description={isMentee
          ? "Veja seus próximos encontros, confirme propostas e acompanhe o histórico da mentoria."
          : "Veja a semana, filtre por mentorado e gerencie cada sessão sem perder o contexto do plano."}
      />
      <LiveCalendarWorkspace data={data} role={context.activeRole} />
    </div>
  );
}
