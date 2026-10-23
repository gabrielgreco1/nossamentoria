"use server";

import { revalidatePath } from "next/cache";
import { isValidProfileUrl, normalizeProfileUrl, type AcademicFormationInput } from "@/lib/registration";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace-context";

export type ProfileMutationState = {
  status: "idle" | "success" | "error";
  message: string;
};

type AvailabilityInput = {
  weekday: number;
  start_time: string;
  end_time: string;
};

function result(status: ProfileMutationState["status"], message: string): ProfileMutationState {
  return { status, message };
}

function getFormations(formData: FormData): AcademicFormationInput[] {
  const institutions = formData.getAll("educationInstitution").map(String);
  const courses = formData.getAll("educationCourse").map(String);
  const degrees = formData.getAll("educationDegree").map(String);
  const statuses = formData.getAll("educationStatus").map(String);
  const startYears = formData.getAll("educationStartYear").map(String);
  const endYears = formData.getAll("educationEndYear").map(String);

  return institutions.map((institution, index) => ({
    institution: institution.trim(),
    course: (courses[index] ?? "").trim(),
    degree: (degrees[index] ?? "").trim(),
    status: (["in_progress", "completed", "paused"].includes(statuses[index])
      ? statuses[index]
      : "in_progress") as AcademicFormationInput["status"],
    start_year: (startYears[index] ?? "").trim() || undefined,
    end_year: (endYears[index] ?? "").trim() || undefined
  }));
}

function getAvailability(formData: FormData): AvailabilityInput[] | null {
  const weekdays = formData.getAll("availabilityWeekday").map(String);
  const starts = formData.getAll("availabilityStart").map(String);
  const ends = formData.getAll("availabilityEnd").map(String);

  if (weekdays.length !== starts.length || weekdays.length !== ends.length || weekdays.length > 14) return null;

  const periods = weekdays.map((weekday, index) => ({
    weekday: Number(weekday),
    start_time: starts[index] ?? "",
    end_time: ends[index] ?? ""
  }));

  const valid = periods.every((period) =>
    Number.isInteger(period.weekday)
    && period.weekday >= 0
    && period.weekday <= 6
    && /^([01]\d|2[0-3]):[0-5]\d$/.test(period.start_time)
    && /^([01]\d|2[0-3]):[0-5]\d$/.test(period.end_time)
    && period.end_time > period.start_time
  );

  return valid ? periods : null;
}

export async function updateProfile(
  _previousState: ProfileMutationState,
  formData: FormData
): Promise<ProfileMutationState> {
  const context = await getWorkspaceContext();
  if (!context.user || !context.activeRole) return result("error", "Entre novamente para atualizar seu perfil.");

  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const linkedinUrl = normalizeProfileUrl(String(formData.get("linkedinUrl") ?? ""));
  const githubUrl = normalizeProfileUrl(String(formData.get("githubUrl") ?? ""));
  const availabilityNotes = String(formData.get("availabilityNotes") ?? "").trim();
  const topicSlugs = [...new Set(formData.getAll("topicSlugs").map(String).map((slug) => slug.trim()).filter(Boolean))];

  if (displayName.length < 3 || displayName.length > 120) return result("error", "Informe seu nome completo.");
  if (bio.length > 800) return result("error", "A apresentação deve ter no máximo 800 caracteres.");
  if (availabilityNotes.length > 300) return result("error", "As observações devem ter no máximo 300 caracteres.");

  const hasMentorRole = context.roles.includes("mentor");
  if (hasMentorRole) {
    if (!isValidProfileUrl(linkedinUrl, "linkedin")) return result("error", "Informe uma URL válida do LinkedIn.");
    if (!isValidProfileUrl(githubUrl, "github")) return result("error", "Informe uma URL válida do GitHub.");
  } else {
    if (linkedinUrl && !isValidProfileUrl(linkedinUrl, "linkedin")) return result("error", "A URL do LinkedIn é inválida.");
    if (githubUrl && !isValidProfileUrl(githubUrl, "github")) return result("error", "A URL do GitHub é inválida.");
  }

  const isMentorContext = context.activeRole === "mentor";
  const isMenteeContext = context.activeRole === "mentee";
  if ((isMentorContext || isMenteeContext) && topicSlugs.length === 0) {
    return result("error", isMentorContext ? "Selecione pelo menos uma especialidade." : "Selecione pelo menos um interesse.");
  }
  if (topicSlugs.length > 40) return result("error", "Selecione no máximo 40 conhecimentos.");

  const periods = isMentorContext || isMenteeContext ? getAvailability(formData) : [];
  if (periods === null) return result("error", "Revise os períodos: o horário final deve ser posterior ao inicial.");
  if (new Set(periods.map((period) => `${period.weekday}-${period.start_time}-${period.end_time}`)).size !== periods.length) {
    return result("error", "Remova os períodos de disponibilidade duplicados.");
  }

  const formations = isMentorContext ? getFormations(formData) : null;
  if (formations && (formations.length === 0 || formations.length > 5)) {
    return result("error", "Informe entre uma e cinco formações acadêmicas.");
  }
  if (formations?.some((formation) => !formation.institution || !formation.course || !formation.degree)) {
    return result("error", "Preencha instituição, curso e tipo em todas as formações.");
  }
  if (formations?.some((formation) => {
    const start = formation.start_year ? Number(formation.start_year) : null;
    const end = formation.end_year ? Number(formation.end_year) : null;
    return (start !== null && (!Number.isInteger(start) || start < 1950 || start > 2100))
      || (end !== null && (!Number.isInteger(end) || end < 1950 || end > 2100))
      || (start !== null && end !== null && end < start);
  })) {
    return result("error", "Revise os anos informados nas formações.");
  }

  const capacityValue = isMentorContext ? Number(formData.get("mentorCapacity")) : null;
  if (isMentorContext && (!Number.isInteger(capacityValue) || capacityValue === null || capacityValue < 0 || capacityValue > 50)) {
    return result("error", "O limite deve ser um número inteiro entre 0 e 50.");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_own_profile", {
    p_display_name: displayName,
    p_bio: bio || null,
    p_linkedin_url: linkedinUrl || null,
    p_github_url: githubUrl || null,
    p_availability_notes: availabilityNotes || null,
    p_selection_kind: isMentorContext ? "expertise" : isMenteeContext ? "interest" : null,
    p_topic_slugs: isMentorContext || isMenteeContext ? topicSlugs : [],
    p_formations: formations,
    p_availability_kind: isMentorContext ? "teach" : isMenteeContext ? "learn" : null,
    p_availability_periods: periods,
    p_mentor_capacity: capacityValue
  });

  if (error) return result("error", error.message);

  revalidatePath("/app");
  revalidatePath("/app/profile");
  revalidatePath("/app/relationships");
  return result("success", "Perfil atualizado com sucesso.");
}
