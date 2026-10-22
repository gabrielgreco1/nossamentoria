import { MaterialsWorkspace } from "@/components/app/materials-workspace";
import { PageHeader } from "@/components/app/page-header";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const context = await getWorkspaceContext();
  const isMentee = context.activeRole === "mentee";

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Biblioteca"
        title={isMentee ? "Meus materiais" : "Materiais e templates"}
        description={isMentee
          ? "Acesse os materiais compartilhados pelo seu mentor no contexto do plano atual."
          : "Encontre, crie e edite materiais ou aulas-base sem misturar a biblioteca com o acompanhamento dos mentorados."}
      />
      <MaterialsWorkspace role={context.activeRole} />
    </div>
  );
}
