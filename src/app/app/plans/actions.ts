"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace-context";

export type PlanMutationState = {
  status: "idle" | "success" | "error";
  message: string;
  planId?: string;
};

const uuidPattern = /^[0-9a-f-]{36}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const planStatuses = new Set(["draft", "active", "paused", "completed"]);

function result(status: PlanMutationState["status"], message: string, planId?: string): PlanMutationState {
  return { status, message, ...(planId ? { planId } : {}) };
}

export async function savePlan(
  _previousState: PlanMutationState,
  formData: FormData
): Promise<PlanMutationState> {
  const context = await getWorkspaceContext();
  if (!context.user || (!context.roles.includes("mentor") && !context.roles.includes("admin"))) {
    return result("error", "Você não tem permissão para salvar planos.");
  }

  const planId = String(formData.get("planId") ?? "");
  const relationshipId = String(formData.get("relationshipId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const mainGoal = String(formData.get("mainGoal") ?? "").trim();
  const contentArea = String(formData.get("contentArea") ?? "").trim();
  const durationLabel = String(formData.get("durationLabel") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const expectedEndDate = String(formData.get("expectedEndDate") ?? "");
  const status = String(formData.get("status") ?? "draft");
  const topics = [...new Set(String(formData.get("topics") ?? "")
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean))];

  if (planId && !uuidPattern.test(planId)) return result("error", "Plano inválido.");
  if (!planId && !uuidPattern.test(relationshipId)) return result("error", "Selecione um mentorado.");
  if (!title || title.length > 160) return result("error", "Informe um título com até 160 caracteres.");
  if (!mainGoal || !contentArea) return result("error", "Preencha o objetivo e a área principal.");
  if (!durationLabel || durationLabel.length > 80) return result("error", "Informe a duração do plano.");
  if (!datePattern.test(startDate) || !datePattern.test(expectedEndDate) || expectedEndDate < startDate) {
    return result("error", "Revise as datas do plano.");
  }
  if (!planStatuses.has(status)) return result("error", "Status do plano inválido.");
  if (topics.length > 30) return result("error", "Informe no máximo 30 tópicos.");

  const supabase = await createClient();
  const payload = {
    title,
    main_goal: mainGoal,
    primary_content_area: contentArea,
    duration_label: durationLabel,
    start_date: startDate,
    expected_end_date: expectedEndDate,
    topics,
    status
  };

  if (planId) {
    const { data: plan, error: planError } = await supabase
      .from("mentorship_plans")
      .select("id,mentor_user_id")
      .eq("id", planId)
      .maybeSingle();
    if (planError || !plan) return result("error", "Plano não encontrado.");
    if (!context.roles.includes("admin") && plan.mentor_user_id !== context.user.id) {
      return result("error", "Você não pode editar este plano.");
    }

    const { error } = await supabase.from("mentorship_plans").update(payload).eq("id", planId);
    if (error) return result("error", "Não foi possível atualizar o plano. Tente novamente.");

    revalidatePath("/app");
    revalidatePath("/app/plans");
    revalidatePath("/app/relationships");
    return result("success", "Plano atualizado.", planId);
  }

  const { data: relationship, error: relationshipError } = await supabase
    .from("mentor_mentee_relationships")
    .select("id,mentor_user_id,mentee_user_id,status")
    .eq("id", relationshipId)
    .maybeSingle();
  if (relationshipError || !relationship || !["active", "paused"].includes(relationship.status)) {
    return result("error", "A mentoria selecionada não está disponível para criar um plano.");
  }
  if (!context.roles.includes("admin") && relationship.mentor_user_id !== context.user.id) {
    return result("error", "Você não pode criar um plano para esta mentoria.");
  }

  const id = crypto.randomUUID();
  const { error } = await supabase.from("mentorship_plans").insert({
    id,
    relationship_id: relationship.id,
    mentor_user_id: relationship.mentor_user_id,
    mentee_user_id: relationship.mentee_user_id,
    created_by_user_id: context.user.id,
    ...payload
  });
  if (error) return result("error", "Não foi possível criar o plano. Tente novamente.");

  revalidatePath("/app");
  revalidatePath("/app/plans");
  revalidatePath("/app/relationships");
  return result("success", "Plano criado com sucesso.", id);
}
