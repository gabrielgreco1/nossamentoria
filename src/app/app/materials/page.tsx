import { LiveMaterialsWorkspace } from "@/components/app/live-workspaces";
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
      <PageHeader
        eyebrow="Biblioteca"
        title={isMentee ? "Meus materiais" : "Materiais e templates"}
        description={isMentee
          ? "Acesse os materiais compartilhados pelo seu mentor no contexto do plano atual."
          : "Encontre, crie e edite materiais ou aulas-base sem misturar a biblioteca com o acompanhamento dos mentorados."}
      />
      <LiveMaterialsWorkspace data={data} role={context.activeRole} />
    </div>
  );
}
