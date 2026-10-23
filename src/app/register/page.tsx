import { AuthCard } from "@/components/marketing/auth-card";
import type { UserRole } from "@/lib/access";
import { validateInvitationToken } from "@/lib/auth";
import type { KnowledgeAreaOption, KnowledgeTopicOption } from "@/lib/registration";
import { createClient } from "@/lib/supabase/server";
import { RegistrationForm } from "./registration-form";

type RegisterPageProps = {
  searchParams: Promise<{ invite?: string }>;
};

type AreaRow = Omit<KnowledgeAreaOption, "topics"> & { sort_order: number };
type TopicRow = KnowledgeTopicOption & { area_id: string; sort_order: number };

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { invite } = await searchParams;
  const supabase = await createClient();
  const [{ data: areasData }, { data: topicsData }] = await Promise.all([
    supabase.from("knowledge_areas").select("id,slug,name,description,sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("knowledge_topics").select("id,area_id,slug,name,description,sort_order").eq("is_active", true).order("sort_order")
  ]);

  const topics = (topicsData ?? []) as TopicRow[];
  const areas = ((areasData ?? []) as AreaRow[]).map((area) => ({
    id: area.id,
    slug: area.slug,
    name: area.name,
    description: area.description,
    topics: topics.filter((topic) => topic.area_id === area.id).map(({ area_id: _areaId, sort_order: _sortOrder, ...topic }) => topic)
  }));

  const invitation = invite ? await validateInvitationToken(invite) : null;
  const invitedRole = invitation?.status === "valid" && ["admin", "mentor", "mentee"].includes(invitation.role ?? "")
    ? invitation.role as UserRole
    : undefined;

  return (
    <AuthCard
      eyebrow={invitedRole ? "Cadastro por convite" : "Nova conta"}
      title="Crie seu perfil na NossaMentoria"
      description="Conclua seu cadastro em quatro etapas rápidas. Cada etapa é exibida separadamente para deixar o processo mais claro."
      wide
    >
      <RegistrationForm
        areas={areas}
        inviteToken={invitedRole ? invite : undefined}
        invitedEmail={invitedRole ? invitation?.email : undefined}
        invitedRole={invitedRole}
      />
    </AuthCard>
  );
}
