import { PageHeader } from "@/components/app/page-header";
import { ProfileEditor } from "@/components/app/profile-editor";
import { getProfilePageData } from "@/lib/profile-data";
import { getWorkspaceContext } from "@/lib/workspace-context";
import styles from "../section-page.module.css";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const context = await getWorkspaceContext();
  const data = await getProfilePageData(context);

  return (
    <div className={styles.page}>
      <PageHeader title="Perfil" />
      <ProfileEditor data={data} />
    </div>
  );
}
