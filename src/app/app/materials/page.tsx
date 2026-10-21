import { Files } from "lucide-react";
import { ContentAndClasses } from "@/components/app/content-and-classes";
import { PageHeader } from "@/components/app/page-header";
import { PillChip } from "@/components/ui/pill-chip";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default function MaterialsPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Conteúdo"
        title="Materiais e aulas"
        description="Organize a biblioteca privada, conecte materiais ao plano correto e mantenha a sequência de aulas editável."
        action={<PillChip tone="warning"><Files size={14} /> Editor local</PillChip>}
      />
      <ContentAndClasses />
    </div>
  );
}
