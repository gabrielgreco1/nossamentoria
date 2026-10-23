import { PageHeader } from "@/components/app/page-header";
import { ProfileEditor } from "@/components/app/profile-editor";
import { getProfilePageData } from "@/lib/profile-data";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const context = await getWorkspaceContext();
  const data = await getProfilePageData(context);
  const description = context.activeRole === "mentor"
    ? "Atualize sua apresentação, especialidades, formação, horários para ensinar e capacidade de acompanhamento."
    : context.activeRole === "mentee"
      ? "Atualize sua apresentação, interesses e os períodos em que você está disponível para aprender."
      : "Atualize as informações básicas e os links associados à sua conta.";

  return (
    <div className={styles.page}>
      <PageHeader eyebrow="Sua conta" title="Perfil" description={description} />
      <ProfileEditor data={data} />
    </div>
  );
}
