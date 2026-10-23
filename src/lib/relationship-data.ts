import "server-only";

import type { WorkspaceContext } from "@/lib/workspace-context";
import { createClient } from "@/lib/supabase/server";

type RelationshipRow = {
  id: string;
  status: "invited" | "requested" | "active" | "paused" | "ended";
  mentor_user_id: string;
  mentor_name: string;
  mentee_user_id: string;
  mentee_name: string;
  created_at: string;
  created_by_user_id: string;
};

type PlanRow = {
  id: string;
  relationship_id: string;
  title: string;
  status: "draft" | "active" | "completed" | "paused";
  main_goal: string;
  primary_content_area: string;
};

type ProgressRow = {
  plan_id: string;
  completion_percentage: number | null;
};

type SessionRow = {
  id: string;
  relationship_id: string;
  title: string;
  scheduled_start: string;
  status: "proposed" | "confirmed";
};

type AvailableMenteeRow = {
  user_id: string;
  display_name: string;
  bio: string | null;
  stack: string[] | null;
  availability_notes: string | null;
  created_at: string;
  current_relationship_id: string | null;
  current_relationship_status: string | null;
};

type AvailableMentorRow = {
  user_id: string;
  display_name: string;
  bio: string | null;
  stack: string[] | null;
  availability_notes: string | null;
  mentor_capacity: number;
  active_mentee_count: number;
  available_slots: number;
  current_relationship_id: string | null;
  current_relationship_status: string | null;
  current_relationship_created_by_user_id: string | null;
};

type InvitationRow = {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
};

export type RelationshipPerson = {
  id: string;
  name: string;
  initials: string;
  focus: string;
  availability: string;
};

export type ManagedMentee = RelationshipPerson & {
  relationshipId: string;
  relationshipStatus: RelationshipRow["status"];
  planId: string | null;
  planStatus: PlanRow["status"] | null;
};

export type AvailableMentee = RelationshipPerson & {
  bio: string;
  relationshipId: string | null;
  relationshipStatus: string | null;
  relationshipDirection: "incoming" | "outgoing" | null;
};

export type AvailableMentor = RelationshipPerson & {
  bio: string;
  capacity: number;
  activeMenteeCount: number;
  availableSlots: number;
  relationshipId: string | null;
  relationshipStatus: string | null;
  relationshipDirection: "incoming" | "outgoing" | null;
};

export type MenteeRequest = {
  relationshipId: string;
  mentorName: string;
  requestedAt: string;
};

export type MentorRequest = {
  relationshipId: string;
  menteeName: string;
  requestedAt: string;
};

export type MenteeMentorship = {
  relationshipId: string;
  status: RelationshipRow["status"];
  mentorName: string;
  planId: string | null;
  planTitle: string | null;
  planStatus: PlanRow["status"] | null;
  planProgress: number;
  focus: string;
  mainGoal: string;
  nextSessionTitle: string | null;
  nextSessionAt: string | null;
  nextSessionDay: string | null;
  nextSessionRest: string | null;
};

export type RelationshipPageData = {
  canRequestMentorship: boolean;
  loadError: string | null;
  mentee: {
    mentorship: MenteeMentorship | null;
    requests: MenteeRequest[];
    outgoingRequests: MenteeRequest[];
    availableMentors: AvailableMentor[];
    interests: string[];
    isAvailable: boolean;
  };
  management: {
    mentees: ManagedMentee[];
    availableMentees: AvailableMentee[];
    incomingRequests: MentorRequest[];
    capacity: { limit: number; activeCount: number; availableSlots: number } | null;
    openRequestCount: number;
    pendingInvitations: Array<{
      id: string;
      email: string;
      sentAt: string;
      expiresAt: string;
    }>;
  };
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("pt-BR"))
    .join("");
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", ...options }).format(new Date(value));
}

function emptyData(): RelationshipPageData {
  return {
    canRequestMentorship: false,
    loadError: null,
    mentee: { mentorship: null, requests: [], outgoingRequests: [], availableMentors: [], interests: [], isAvailable: false },
    management: {
      mentees: [],
      availableMentees: [],
      incomingRequests: [],
      capacity: null,
      openRequestCount: 0,
      pendingInvitations: []
    }
  };
}

export async function getRelationshipPageData(context: WorkspaceContext): Promise<RelationshipPageData> {
  const result = emptyData();
  result.canRequestMentorship = context.roles.includes("mentor");

  if (!context.user || !context.envStatus.configured) return result;

  const supabase = await createClient();
  const isMenteeView = context.activeRole === "mentee";
  const isActualMentee = context.roles.includes("mentee");
  const isActualMentor = context.roles.includes("mentor");

  try {
    if (isMenteeView) {
      if (!isActualMentee) return result;

      const [relationshipsResult, profileResult, availableMentorsResult] = await Promise.all([
        supabase
          .from("mentorship_relationship_details")
          .select("id,status,mentor_user_id,mentor_name,mentee_user_id,mentee_name,created_at,created_by_user_id")
          .eq("mentee_user_id", context.user.id)
          .neq("status", "ended")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("stack,is_available_for_mentorship")
          .eq("user_id", context.user.id)
          .maybeSingle(),
        supabase.rpc("list_available_mentors")
      ]);

      if (relationshipsResult.error) throw relationshipsResult.error;
      if (profileResult.error) throw profileResult.error;
      if (availableMentorsResult.error) throw availableMentorsResult.error;

      const relationships = (relationshipsResult.data ?? []) as RelationshipRow[];
      const profile = profileResult.data as { stack: string[] | null; is_available_for_mentorship: boolean } | null;
      result.mentee.interests = profile?.stack ?? [];
      result.mentee.isAvailable = profile?.is_available_for_mentorship ?? false;
      result.mentee.requests = relationships
        .filter((relationship) => relationship.status === "requested" && relationship.created_by_user_id !== context.user?.id)
        .map((relationship) => ({
          relationshipId: relationship.id,
          mentorName: relationship.mentor_name,
          requestedAt: formatDate(relationship.created_at, { dateStyle: "medium" })
        }));
      result.mentee.outgoingRequests = relationships
        .filter((relationship) => relationship.status === "requested" && relationship.created_by_user_id === context.user?.id)
        .map((relationship) => ({
          relationshipId: relationship.id,
          mentorName: relationship.mentor_name,
          requestedAt: formatDate(relationship.created_at, { dateStyle: "medium" })
        }));
      result.mentee.availableMentors = ((availableMentorsResult.data ?? []) as AvailableMentorRow[]).map((person) => ({
        id: person.user_id,
        name: person.display_name,
        initials: initials(person.display_name),
        focus: person.stack?.length ? person.stack.slice(0, 3).join(" · ") : "Especialidades ainda não informadas",
        availability: person.availability_notes || "Disponibilidade a combinar",
        bio: person.bio || "Mentor disponível para iniciar uma nova jornada.",
        capacity: person.mentor_capacity,
        activeMenteeCount: person.active_mentee_count,
        availableSlots: person.available_slots,
        relationshipId: person.current_relationship_id,
        relationshipStatus: person.current_relationship_status,
        relationshipDirection: person.current_relationship_id
          ? person.current_relationship_created_by_user_id === context.user?.id ? "outgoing" : "incoming"
          : null
      }));

      const currentRelationship = relationships.find((relationship) => relationship.status === "active")
        ?? relationships.find((relationship) => relationship.status === "paused");

      if (!currentRelationship) return result;

      const [plansResult, sessionsResult] = await Promise.all([
        supabase
          .from("mentorship_plans")
          .select("id,relationship_id,title,status,main_goal,primary_content_area")
          .eq("relationship_id", currentRelationship.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("upcoming_sessions")
          .select("id,relationship_id,title,scheduled_start,status")
          .eq("relationship_id", currentRelationship.id)
          .order("scheduled_start", { ascending: true })
          .limit(1)
      ]);

      if (plansResult.error) throw plansResult.error;
      if (sessionsResult.error) throw sessionsResult.error;

      const plans = (plansResult.data ?? []) as PlanRow[];
      const plan = plans.find((item) => item.status === "active") ?? plans[0] ?? null;
      const session = ((sessionsResult.data ?? [])[0] ?? null) as SessionRow | null;
      let progress = 0;

      if (plan) {
        const progressResult = await supabase
          .from("mentorship_plan_progress")
          .select("plan_id,completion_percentage")
          .eq("plan_id", plan.id)
          .maybeSingle();
        if (progressResult.error) throw progressResult.error;
        progress = Number((progressResult.data as ProgressRow | null)?.completion_percentage ?? 0);
      }

      result.mentee.mentorship = {
        relationshipId: currentRelationship.id,
        status: currentRelationship.status,
        mentorName: currentRelationship.mentor_name,
        planId: plan?.id ?? null,
        planTitle: plan?.title ?? null,
        planStatus: plan?.status ?? null,
        planProgress: progress,
        focus: plan?.primary_content_area ?? "A definir com o mentor",
        mainGoal: plan?.main_goal ?? "O plano será construído após o início da mentoria.",
        nextSessionTitle: session?.title ?? null,
        nextSessionAt: session
          ? formatDate(session.scheduled_start, { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })
          : null,
        nextSessionDay: session ? formatDate(session.scheduled_start, { day: "2-digit" }) : null,
        nextSessionRest: session
          ? formatDate(session.scheduled_start, { month: "long", hour: "2-digit", minute: "2-digit" })
          : null
      };

      return result;
    }

    let relationshipsQuery = supabase
      .from("mentorship_relationship_details")
      .select("id,status,mentor_user_id,mentor_name,mentee_user_id,mentee_name,created_at,created_by_user_id")
      .neq("status", "ended")
      .order("created_at", { ascending: false });

    if (isActualMentor) relationshipsQuery = relationshipsQuery.eq("mentor_user_id", context.user.id);

    const [relationshipsResult, availableResult, invitationsResult, capacityResult] = await Promise.all([
      relationshipsQuery,
      supabase.rpc("list_available_mentees"),
      supabase
        .from("invitations")
        .select("id,email,created_at,expires_at")
        .eq("intended_role", "mentee")
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("mentor_capacity")
        .eq("user_id", context.user.id)
        .maybeSingle()
    ]);

    if (relationshipsResult.error) throw relationshipsResult.error;
    if (availableResult.error) throw availableResult.error;
    if (invitationsResult.error) throw invitationsResult.error;
    if (capacityResult.error) throw capacityResult.error;

    const relationships = (relationshipsResult.data ?? []) as RelationshipRow[];
    const relationshipIds = relationships.map((relationship) => relationship.id);
    let plans: PlanRow[] = [];

    if (relationshipIds.length > 0) {
      const plansResult = await supabase
        .from("mentorship_plans")
        .select("id,relationship_id,title,status,main_goal,primary_content_area")
        .in("relationship_id", relationshipIds)
        .order("created_at", { ascending: false });
      if (plansResult.error) throw plansResult.error;
      plans = (plansResult.data ?? []) as PlanRow[];
    }

    result.management.openRequestCount = relationships.filter((relationship) => relationship.status === "requested").length;
    result.management.mentees = relationships
      .filter((relationship) => relationship.status === "active" || relationship.status === "paused")
      .map((relationship) => {
        const plan = plans.find((item) => item.relationship_id === relationship.id && item.status === "active")
          ?? plans.find((item) => item.relationship_id === relationship.id)
          ?? null;
        return {
          id: relationship.mentee_user_id,
          relationshipId: relationship.id,
          relationshipStatus: relationship.status,
          name: relationship.mentee_name,
          initials: initials(relationship.mentee_name),
          focus: plan?.primary_content_area ?? "Foco a definir",
          availability: relationship.status === "paused" ? "Mentoria pausada" : "Mentoria ativa",
          planId: plan?.id ?? null,
          planStatus: plan?.status ?? null
        };
      });

    result.management.incomingRequests = relationships
      .filter((relationship) =>
        isActualMentor
        && relationship.status === "requested"
        && relationship.created_by_user_id === relationship.mentee_user_id
      )
      .map((relationship) => ({
        relationshipId: relationship.id,
        menteeName: relationship.mentee_name,
        requestedAt: formatDate(relationship.created_at, { dateStyle: "medium" })
      }));

    if (isActualMentor) {
      const limit = Number((capacityResult.data as { mentor_capacity: number } | null)?.mentor_capacity ?? 3);
      const activeCount = relationships.filter((relationship) => relationship.status === "active").length;
      result.management.capacity = { limit, activeCount, availableSlots: Math.max(limit - activeCount, 0) };
    }

    result.management.availableMentees = ((availableResult.data ?? []) as AvailableMenteeRow[]).map((person) => {
      const relationship = relationships.find((item) => item.id === person.current_relationship_id);
      return {
        id: person.user_id,
        name: person.display_name,
        initials: initials(person.display_name),
        focus: person.stack?.length ? person.stack.slice(0, 3).join(" · ") : "Interesses ainda não informados",
        availability: person.availability_notes || "Disponibilidade a combinar",
        bio: person.bio || "Perfil disponível para iniciar uma mentoria.",
        relationshipId: person.current_relationship_id,
        relationshipStatus: person.current_relationship_status,
        relationshipDirection: relationship
          ? relationship.created_by_user_id === context.user?.id ? "outgoing" : "incoming"
          : null
      };
    });

    result.management.pendingInvitations = ((invitationsResult.data ?? []) as InvitationRow[]).map((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      sentAt: formatDate(invitation.created_at, { dateStyle: "medium" }),
      expiresAt: formatDate(invitation.expires_at, { dateStyle: "medium" })
    }));

    return result;
  } catch (error) {
    result.loadError = error instanceof Error ? error.message : "Não foi possível carregar os relacionamentos.";
    return result;
  }
}
