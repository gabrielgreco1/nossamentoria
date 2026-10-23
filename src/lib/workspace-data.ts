import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { WorkspaceContext } from "@/lib/workspace-context";

export type PlanWorkspaceItem = {
  id: string;
  relationshipId: string;
  title: string;
  status: string;
  mentorName: string;
  menteeName: string;
  mainGoal: string;
  contentArea: string;
  topics: string[];
  startDate: string;
  expectedEndDate: string;
  durationLabel: string;
  completionPercentage: number;
  totalLessons: number;
  completedLessons: number;
  nextSessionAt: string | null;
};

export type PlanRelationshipItem = {
  id: string;
  status: string;
  mentorName: string;
  menteeName: string;
};

export type PlansWorkspaceData = {
  items: PlanWorkspaceItem[];
  relationships: PlanRelationshipItem[];
  loadError: string | null;
};

export type MaterialWorkspaceItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  sourceUrl: string | null;
  storagePath: string | null;
  openUrl: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
  shared: boolean;
};

export type LessonTemplateWorkspaceItem = {
  id: string;
  title: string;
  category: string;
  objective: string;
  estimatedDurationMinutes: number;
  global: boolean;
};

export type MaterialsWorkspaceData = {
  materials: MaterialWorkspaceItem[];
  templates: LessonTemplateWorkspaceItem[];
  loadError: string | null;
};

export type CalendarSessionItem = {
  id: string;
  title: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  counterpartName: string;
  planTitle: string;
  lessonTitle: string | null;
};

export type NotificationWorkspaceItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type CommunicationNoteWorkspaceItem = {
  id: string;
  authorRole: string;
  type: string;
  visibility: string;
  body: string;
  createdAt: string;
};

export type CalendarWorkspaceData = {
  today: string;
  upcoming: CalendarSessionItem[];
  history: CalendarSessionItem[];
  notifications: NotificationWorkspaceItem[];
  notes: CommunicationNoteWorkspaceItem[];
  loadError: string | null;
};

type RelationshipNameRow = {
  id: string;
  status: string;
  mentor_name: string;
  mentee_name: string;
};

function errorMessage(_error?: unknown) {
  return "Não foi possível carregar as informações.";
}

export async function getPlansWorkspaceData(context: WorkspaceContext): Promise<PlansWorkspaceData> {
  if (!context.user) return { items: [], relationships: [], loadError: null };
  const supabase = await createClient();

  try {
    let plansQuery = supabase
      .from("mentorship_plans")
      .select("id,relationship_id,mentor_user_id,mentee_user_id,title,status,main_goal,primary_content_area,topics,start_date,expected_end_date,duration_label,created_at")
      .order("created_at", { ascending: false });
    let relationshipsQuery = supabase
      .from("mentorship_relationship_details")
      .select("id,status,mentor_name,mentee_name");

    if (context.activeRole === "mentor") {
      plansQuery = plansQuery.eq("mentor_user_id", context.user.id);
      relationshipsQuery = relationshipsQuery.eq("mentor_user_id", context.user.id);
    } else if (context.activeRole === "mentee") {
      plansQuery = plansQuery.eq("mentee_user_id", context.user.id);
      relationshipsQuery = relationshipsQuery.eq("mentee_user_id", context.user.id);
    }

    const [plansResult, relationshipsResult] = await Promise.all([plansQuery, relationshipsQuery]);
    if (plansResult.error) throw plansResult.error;
    if (relationshipsResult.error) throw relationshipsResult.error;

    const plans = plansResult.data ?? [];
    const planIds = plans.map((plan) => plan.id);
    const relationshipNames = new Map(
      ((relationshipsResult.data ?? []) as RelationshipNameRow[]).map((relationship) => [relationship.id, relationship])
    );
    const progressByPlan = new Map<string, { completion: number; total: number; completed: number }>();
    const nextSessionByPlan = new Map<string, string>();

    if (planIds.length > 0) {
      const [progressResult, sessionsResult] = await Promise.all([
        supabase
          .from("mentorship_plan_progress")
          .select("plan_id,completion_percentage,total_lessons,completed_lessons")
          .in("plan_id", planIds),
        supabase
          .from("upcoming_sessions")
          .select("plan_id,scheduled_start")
          .in("plan_id", planIds)
          .order("scheduled_start", { ascending: true })
      ]);
      if (progressResult.error) throw progressResult.error;
      if (sessionsResult.error) throw sessionsResult.error;

      for (const row of progressResult.data ?? []) {
        progressByPlan.set(row.plan_id, {
          completion: Number(row.completion_percentage ?? 0),
          total: Number(row.total_lessons ?? 0),
          completed: Number(row.completed_lessons ?? 0)
        });
      }
      for (const session of sessionsResult.data ?? []) {
        if (!nextSessionByPlan.has(session.plan_id)) nextSessionByPlan.set(session.plan_id, session.scheduled_start);
      }
    }

    return {
      loadError: null,
      relationships: ((relationshipsResult.data ?? []) as RelationshipNameRow[])
        .filter((relationship) => ["active", "paused"].includes(relationship.status))
        .map((relationship) => ({
          id: relationship.id,
          status: relationship.status,
          mentorName: relationship.mentor_name,
          menteeName: relationship.mentee_name
        })),
      items: plans.map((plan) => {
        const names = relationshipNames.get(plan.relationship_id);
        const progress = progressByPlan.get(plan.id) ?? { completion: 0, total: 0, completed: 0 };
        return {
          id: plan.id,
          relationshipId: plan.relationship_id,
          title: plan.title,
          status: plan.status,
          mentorName: names?.mentor_name ?? "Mentor não encontrado",
          menteeName: names?.mentee_name ?? "Mentorado não encontrado",
          mainGoal: plan.main_goal,
          contentArea: plan.primary_content_area,
          topics: plan.topics ?? [],
          startDate: plan.start_date,
          expectedEndDate: plan.expected_end_date,
          durationLabel: plan.duration_label,
          completionPercentage: progress.completion,
          totalLessons: progress.total,
          completedLessons: progress.completed,
          nextSessionAt: nextSessionByPlan.get(plan.id) ?? null
        };
      })
    };
  } catch (error) {
    return { items: [], relationships: [], loadError: errorMessage(error) };
  }
}

export async function getMaterialsWorkspaceData(context: WorkspaceContext): Promise<MaterialsWorkspaceData> {
  if (!context.user) return { materials: [], templates: [], loadError: null };
  const supabase = await createClient();

  try {
    let menteeMaterialIds: string[] | null = null;

    if (context.activeRole === "mentee") {
      const relationshipsResult = await supabase
        .from("mentor_mentee_relationships")
        .select("id")
        .eq("mentee_user_id", context.user.id)
        .in("status", ["active", "paused"]);
      if (relationshipsResult.error) throw relationshipsResult.error;

      const relationshipIds = (relationshipsResult.data ?? []).map((relationship) => relationship.id);
      if (relationshipIds.length === 0) {
        menteeMaterialIds = [];
      } else {
        const contextsResult = await supabase
          .from("shared_material_contexts")
          .select("material_id")
          .in("relationship_id", relationshipIds)
          .eq("shared_with_mentee", true);
        if (contextsResult.error) throw contextsResult.error;
        menteeMaterialIds = [...new Set((contextsResult.data ?? []).map((context) => context.material_id))];
      }
    }

    let materialsQuery = supabase
      .from("content_materials")
      .select("id,owner_user_id,type,title,description,category,tags,source_url,storage_path,mime_type,size_bytes,created_at")
      .order("created_at", { ascending: false });

    if (context.activeRole !== "mentee") materialsQuery = materialsQuery.eq("owner_user_id", context.user.id);
    if (menteeMaterialIds) {
      if (menteeMaterialIds.length === 0) {
        return { materials: [], templates: [], loadError: null };
      }
      materialsQuery = materialsQuery.in("id", menteeMaterialIds);
    }

    const includeTemplates = context.activeRole !== "mentee";
    const [materialsResult, templatesResult] = await Promise.all([
      materialsQuery,
      includeTemplates
        ? supabase
            .from("lesson_templates")
            .select("id,title,category,objective,estimated_duration_minutes,is_global")
            .order("category")
            .order("title")
        : Promise.resolve({ data: [], error: null })
    ]);
    if (materialsResult.error) throw materialsResult.error;
    if (templatesResult.error) throw templatesResult.error;

    const materials = materialsResult.data ?? [];
    const materialIds = materials.map((material) => material.id);
    const sharedIds = new Set<string>();

    if (materialIds.length > 0) {
      const sharedResult = await supabase
        .from("shared_material_contexts")
        .select("material_id,shared_with_mentee")
        .in("material_id", materialIds)
        .eq("shared_with_mentee", true);
      if (sharedResult.error) throw sharedResult.error;
      for (const row of sharedResult.data ?? []) sharedIds.add(row.material_id);
    }

    const signedUrls = new Map<string, string>();
    await Promise.all(materials.map(async (material) => {
      if (!material.storage_path) return;
      const { data: signedData } = await supabase.storage.from("materials").createSignedUrl(material.storage_path, 3600);
      if (signedData?.signedUrl) signedUrls.set(material.id, signedData.signedUrl);
    }));

    return {
      loadError: null,
      materials: materials.map((material) => ({
        id: material.id,
        type: material.type,
        title: material.title,
        description: material.description ?? "Sem descrição.",
        category: material.category,
        tags: material.tags ?? [],
        sourceUrl: material.source_url,
        storagePath: material.storage_path,
        openUrl: material.source_url ?? signedUrls.get(material.id) ?? null,
        mimeType: material.mime_type,
        sizeBytes: material.size_bytes === null ? null : Number(material.size_bytes),
        createdAt: material.created_at,
        shared: context.activeRole === "mentee" || sharedIds.has(material.id)
      })),
      templates: (templatesResult.data ?? []).map((template) => ({
        id: template.id,
        title: template.title,
        category: template.category,
        objective: template.objective,
        estimatedDurationMinutes: template.estimated_duration_minutes,
        global: template.is_global
      }))
    };
  } catch (error) {
    return { materials: [], templates: [], loadError: errorMessage(error) };
  }
}

export async function getCalendarWorkspaceData(context: WorkspaceContext): Promise<CalendarWorkspaceData> {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  if (!context.user) return { today, upcoming: [], history: [], notifications: [], notes: [], loadError: null };
  const supabase = await createClient();

  try {
    let sessionsQuery = supabase
      .from("class_sessions")
      .select("id,relationship_id,plan_id,lesson_id,mentor_user_id,mentee_user_id,title,scheduled_start,scheduled_end,status")
      .order("scheduled_start", { ascending: true });
    let relationshipsQuery = supabase
      .from("mentorship_relationship_details")
      .select("id,mentor_name,mentee_name");

    if (context.activeRole === "mentor") {
      sessionsQuery = sessionsQuery.eq("mentor_user_id", context.user.id);
      relationshipsQuery = relationshipsQuery.eq("mentor_user_id", context.user.id);
    } else if (context.activeRole === "mentee") {
      sessionsQuery = sessionsQuery.eq("mentee_user_id", context.user.id);
      relationshipsQuery = relationshipsQuery.eq("mentee_user_id", context.user.id);
    }

    const relationshipsResult = await relationshipsQuery;
    if (relationshipsResult.error) throw relationshipsResult.error;
    const relationshipIds = (relationshipsResult.data ?? []).map((relationship) => relationship.id);

    let notesQuery = supabase
      .from("communication_notes")
      .select("id,relationship_id,author_role,type,visibility,body,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (context.activeRole !== "admin") {
      if (relationshipIds.length === 0) {
        notesQuery = notesQuery.eq("relationship_id", "00000000-0000-0000-0000-000000000000");
      } else {
        notesQuery = notesQuery.in("relationship_id", relationshipIds);
      }
    }

    const [sessionsResult, notificationsResult, notesResult] = await Promise.all([
      sessionsQuery,
      supabase
        .from("notifications")
        .select("id,type,title,body,read_at,created_at")
        .eq("recipient_user_id", context.user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      notesQuery
    ]);
    if (sessionsResult.error) throw sessionsResult.error;
    if (notificationsResult.error) throw notificationsResult.error;
    if (notesResult.error) throw notesResult.error;

    const sessions = sessionsResult.data ?? [];
    const planIds = [...new Set(sessions.map((session) => session.plan_id))];
    const lessonIds = [...new Set(sessions.map((session) => session.lesson_id).filter(Boolean))] as string[];
    const planTitles = new Map<string, string>();
    const lessonTitles = new Map<string, string>();

    if (planIds.length > 0) {
      const plansResult = await supabase.from("mentorship_plans").select("id,title").in("id", planIds);
      if (plansResult.error) throw plansResult.error;
      for (const plan of plansResult.data ?? []) planTitles.set(plan.id, plan.title);
    }
    if (lessonIds.length > 0) {
      const lessonsResult = await supabase.from("lessons").select("id,title").in("id", lessonIds);
      if (lessonsResult.error) throw lessonsResult.error;
      for (const lesson of lessonsResult.data ?? []) lessonTitles.set(lesson.id, lesson.title);
    }

    const relationshipNames = new Map(
      ((relationshipsResult.data ?? []) as RelationshipNameRow[]).map((relationship) => [relationship.id, relationship])
    );
    const now = Date.now();
    const mappedSessions = sessions.map((session) => {
      const names = relationshipNames.get(session.relationship_id);
      const counterpartName = context.activeRole === "mentee"
        ? names?.mentor_name
        : names?.mentee_name;
      return {
        id: session.id,
        title: session.title,
        status: session.status,
        scheduledStart: session.scheduled_start,
        scheduledEnd: session.scheduled_end,
        counterpartName: counterpartName ?? "Participante não encontrado",
        planTitle: planTitles.get(session.plan_id) ?? "Plano não encontrado",
        lessonTitle: session.lesson_id ? lessonTitles.get(session.lesson_id) ?? null : null
      };
    });

    return {
      today,
      loadError: null,
      upcoming: mappedSessions.filter((session) =>
        ["proposed", "confirmed"].includes(session.status) && new Date(session.scheduledStart).getTime() >= now
      ),
      history: mappedSessions
        .filter((session) => !["proposed", "confirmed"].includes(session.status) || new Date(session.scheduledStart).getTime() < now)
        .reverse(),
      notifications: (notificationsResult.data ?? []).map((notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        read: Boolean(notification.read_at),
        createdAt: notification.created_at
      })),
      notes: (notesResult.data ?? []).map((note) => ({
        id: note.id,
        authorRole: note.author_role,
        type: note.type,
        visibility: note.visibility,
        body: note.body,
        createdAt: note.created_at
      }))
    };
  } catch (error) {
    return { today, upcoming: [], history: [], notifications: [], notes: [], loadError: errorMessage(error) };
  }
}
