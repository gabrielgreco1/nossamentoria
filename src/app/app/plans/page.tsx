import { BookOpenCheck } from "lucide-react";
import { MentorshipLifecycle } from "@/components/app/mentorship-lifecycle";
import { PageHeader } from "@/components/app/page-header";
import { PillChip } from "@/components/ui/pill-chip";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default function PlansPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Planos"
        title="Planos de mentoria"
        description="Defina objetivo, duração, tópicos, aulas e próximos passos para cada relação ativa."
        action={<PillChip tone="warning"><BookOpenCheck size={14} /> Editor local</PillChip>}
      />
      <MentorshipLifecycle />
    </div>
  );
}
