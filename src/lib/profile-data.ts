import "server-only";

import type { UserRole } from "@/lib/access";
import type { KnowledgeAreaOption, KnowledgeTopicOption } from "@/lib/registration";
import { createClient } from "@/lib/supabase/server";
import type { WorkspaceContext } from "@/lib/workspace-context";

type AreaRow = Omit<KnowledgeAreaOption, "topics"> & { sort_order: number };
type TopicRow = KnowledgeTopicOption & { area_id: string; sort_order: number };

export type ProfileFormation = {
  id: string;
  institution: string;
  course: string;
  degree: string;
  status: "in_progress" | "completed" | "paused";
  startYear: number | null;
  endYear: number | null;
};

export type ProfileAvailabilityPeriod = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
};

export type ProfilePageData = {
  email: string;
  role: UserRole | null;
  roles: UserRole[];
  displayName: string;
  bio: string;
  linkedinUrl: string;
  githubUrl: string;
  availabilityNotes: string;
  mentorCapacity: number;
  activeMenteeCount: number;
  areas: KnowledgeAreaOption[];
  selectedTopicSlugs: string[];
  formations: ProfileFormation[];
  availabilityPeriods: ProfileAvailabilityPeriod[];
  loadError: string | null;
};

function emptyData(context: WorkspaceContext): ProfilePageData {
  return {
    email: context.user?.email ?? "",
    role: context.activeRole,
    roles: context.roles,
    displayName: "",
    bio: "",
    linkedinUrl: "",
    githubUrl: "",
    availabilityNotes: "",
    mentorCapacity: 3,
    activeMenteeCount: 0,
    areas: [],
    selectedTopicSlugs: [],
    formations: [],
    availabilityPeriods: [],
    loadError: null
  };
}

export async function getProfilePageData(context: WorkspaceContext): Promise<ProfilePageData> {
  const result = emptyData(context);
  if (!context.user || !context.envStatus.configured) return result;

  const supabase = await createClient();
  const selectionKind = context.activeRole === "mentor" ? "expertise" : context.activeRole === "mentee" ? "interest" : null;
  const availabilityKind = context.activeRole === "mentor" ? "teach" : context.activeRole === "mentee" ? "learn" : null;

  try {
    const [profileResult, areasResult, topicsResult, selectionsResult, formationsResult, periodsResult, activeResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name,bio,linkedin_url,github_url,availability_notes,mentor_capacity")
        .eq("user_id", context.user.id)
        .maybeSingle(),
      supabase.from("knowledge_areas").select("id,slug,name,description,sort_order").eq("is_active", true).order("sort_order"),
      supabase.from("knowledge_topics").select("id,area_id,slug,name,description,sort_order").eq("is_active", true).order("sort_order"),
      selectionKind
        ? supabase.from("user_knowledge_topics").select("topic_id").eq("user_id", context.user.id).eq("selection_kind", selectionKind)
        : Promise.resolve({ data: [], error: null }),
      context.activeRole === "mentor"
        ? supabase
            .from("academic_formations")
            .select("id,institution,course,degree,status,start_year,end_year")
            .eq("user_id", context.user.id)
            .order("created_at")
        : Promise.resolve({ data: [], error: null }),
      availabilityKind
        ? supabase
            .from("profile_availability_periods")
            .select("id,weekday,start_time,end_time")
            .eq("user_id", context.user.id)
            .eq("kind", availabilityKind)
            .order("weekday")
            .order("start_time")
        : Promise.resolve({ data: [], error: null }),
      context.activeRole === "mentor"
        ? supabase
            .from("mentor_mentee_relationships")
            .select("id", { count: "exact", head: true })
            .eq("mentor_user_id", context.user.id)
            .eq("status", "active")
        : Promise.resolve({ data: null, error: null, count: 0 })
    ]);

    const firstError = [
      profileResult.error,
      areasResult.error,
      topicsResult.error,
      selectionsResult.error,
      formationsResult.error,
      periodsResult.error,
      activeResult.error
    ].find(Boolean);
    if (firstError) throw firstError;

    const profile = profileResult.data as {
      display_name: string;
      bio: string | null;
      linkedin_url: string | null;
      github_url: string | null;
      availability_notes: string | null;
      mentor_capacity: number;
    } | null;
    const topics = (topicsResult.data ?? []) as TopicRow[];
    const topicById = new Map(topics.map((topic) => [topic.id, topic.slug]));

    result.displayName = profile?.display_name ?? "";
    result.bio = profile?.bio ?? "";
    result.linkedinUrl = profile?.linkedin_url ?? "";
    result.githubUrl = profile?.github_url ?? "";
    result.availabilityNotes = profile?.availability_notes ?? "";
    result.mentorCapacity = Number(profile?.mentor_capacity ?? 3);
    result.activeMenteeCount = activeResult.count ?? 0;
    result.areas = ((areasResult.data ?? []) as AreaRow[]).map((area) => ({
      id: area.id,
      slug: area.slug,
      name: area.name,
      description: area.description,
      topics: topics
        .filter((topic) => topic.area_id === area.id)
        .map(({ area_id: _areaId, sort_order: _sortOrder, ...topic }) => topic)
    }));
    result.selectedTopicSlugs = ((selectionsResult.data ?? []) as Array<{ topic_id: string }>)
      .map((selection) => topicById.get(selection.topic_id))
      .filter((slug): slug is string => Boolean(slug));
    result.formations = ((formationsResult.data ?? []) as Array<{
      id: string;
      institution: string;
      course: string;
      degree: string;
      status: ProfileFormation["status"];
      start_year: number | null;
      end_year: number | null;
    }>).map((formation) => ({
      id: formation.id,
      institution: formation.institution,
      course: formation.course,
      degree: formation.degree,
      status: formation.status,
      startYear: formation.start_year,
      endYear: formation.end_year
    }));
    result.availabilityPeriods = ((periodsResult.data ?? []) as Array<{
      id: string;
      weekday: number;
      start_time: string;
      end_time: string;
    }>).map((period) => ({
      id: period.id,
      weekday: period.weekday,
      startTime: period.start_time.slice(0, 5),
      endTime: period.end_time.slice(0, 5)
    }));

    return result;
  } catch (error) {
    result.loadError = "Não foi possível carregar seu perfil.";
    return result;
  }
}
