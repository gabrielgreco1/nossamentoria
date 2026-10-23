"use server";

import { getPublicEnv } from "@/lib/env";
import { validateInvitationToken } from "@/lib/auth";
import {
  isValidProfileUrl,
  normalizeProfileUrl,
  validatePassword,
  type AcademicFormationInput
} from "@/lib/registration";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/access";

export type RegistrationState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialRoles = new Set<UserRole>(["mentor", "mentee"]);

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

function error(message: string): RegistrationState {
  return { status: "error", message };
}

export async function registerUser(
  _previousState: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");
  const requestedRole = String(formData.get("role") ?? "") as UserRole;
  const inviteToken = String(formData.get("inviteToken") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const linkedinUrl = normalizeProfileUrl(String(formData.get("linkedinUrl") ?? ""));
  const githubUrl = normalizeProfileUrl(String(formData.get("githubUrl") ?? ""));
  const topicSlugs = [...new Set(formData.getAll("topicSlugs").map(String).map((value) => value.trim()).filter(Boolean))];

  if (fullName.length < 3 || fullName.length > 120) return error("Informe seu nome completo.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error("Informe um e-mail válido.");
  const passwordError = validatePassword(password);
  if (passwordError) return error(passwordError);
  if (password !== passwordConfirmation) return error("A confirmação da senha não corresponde.");

  let role = requestedRole;
  let nextPath = "/app";

  if (inviteToken) {
    const invitation = await validateInvitationToken(inviteToken);
    if (invitation.status !== "valid" || !invitation.role) {
      return error("Este convite não está mais disponível.");
    }
    if (invitation.email?.toLowerCase() !== email) {
      return error("Use exatamente o e-mail que recebeu o convite.");
    }
    role = invitation.role as UserRole;
    nextPath = `/invite/${encodeURIComponent(inviteToken)}`;
  } else if (!initialRoles.has(role)) {
    return error("Escolha Mentor ou Mentorado. Administradores precisam de convite.");
  }

  const formations = role === "mentor" ? getFormations(formData) : [];

  if (role === "mentor") {
    if (!isValidProfileUrl(linkedinUrl, "linkedin")) return error("Informe uma URL válida do LinkedIn.");
    if (!isValidProfileUrl(githubUrl, "github")) return error("Informe uma URL válida do GitHub.");
  } else {
    if (linkedinUrl && !isValidProfileUrl(linkedinUrl, "linkedin")) return error("A URL do LinkedIn é inválida.");
    if (githubUrl && !isValidProfileUrl(githubUrl, "github")) return error("A URL do GitHub é inválida.");
  }

  if (role === "mentor" && (formations.length === 0 || formations.some((item) => !item.institution || !item.course || !item.degree))) {
    return error("Preencha instituição, curso e tipo em todas as formações.");
  }
  if (topicSlugs.length === 0) {
    return error(role === "mentor" ? "Selecione pelo menos uma especialidade." : "Selecione pelo menos uma área de interesse.");
  }

  const supabase = await createClient();
  const { data: availableTopics, error: topicsError } = await supabase
    .from("knowledge_topics")
    .select("slug")
    .in("slug", topicSlugs)
    .eq("is_active", true);

  if (topicsError || (availableTopics?.length ?? 0) !== topicSlugs.length) {
    return error("Uma das áreas selecionadas não está disponível. Atualize a página e tente novamente.");
  }

  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const callbackUrl = `${appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl,
      data: {
        full_name: fullName,
        initial_role: role,
        bio,
        linkedin_url: linkedinUrl || null,
        github_url: githubUrl || null,
        academic_formations: formations,
        knowledge_topic_slugs: topicSlugs
      }
    }
  });

  if (signUpError) {
    if (signUpError.status === 429) return error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
    if (signUpError.code === "user_already_exists") return error("Este e-mail já possui uma conta. Entre pelo login.");
    if (signUpError.code === "weak_password") return error("A senha não atende aos requisitos de segurança.");
    return error(signUpError.message || "Não foi possível concluir o cadastro.");
  }

  return {
    status: "success",
    message: "Cadastro recebido. Abra o e-mail de confirmação para ativar sua conta e depois entre com sua senha."
  };
}
