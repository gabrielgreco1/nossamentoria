import { CalendarDays } from "lucide-react";
import { CalendarAndCommunication } from "@/components/app/calendar-and-communication";
import { PageHeader } from "@/components/app/page-header";
import { PillChip } from "@/components/ui/pill-chip";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default function CalendarPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Agenda"
        title="Sessões e comunicação"
        description="Acompanhe próximos encontros, confirmações, histórico, notas e ações combinadas."
        action={<PillChip tone="warning"><CalendarDays size={14} /> Editor local</PillChip>}
      />
      <CalendarAndCommunication />
    </div>
  );
}
