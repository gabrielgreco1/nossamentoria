import { UsersRound } from "lucide-react";
import { MentorshipLifecycle } from "@/components/app/mentorship-lifecycle";
import { PageHeader } from "@/components/app/page-header";
import { PillChip } from "@/components/ui/pill-chip";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default async function RelationshipsPage() {
  const context = await getWorkspaceContext();

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Mentorias"
        title="Relações e acompanhamento"
        description="Conecte mentor e mentorado, organize o plano ativo e acompanhe a evolução sem misturar contextos."
        action={<PillChip tone="warning"><UsersRound size={14} /> Fluxo local</PillChip>}
      />
      <MentorshipLifecycle />
    </div>
  );
}
