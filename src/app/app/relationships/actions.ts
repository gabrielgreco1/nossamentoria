"use server";

import { revalidatePath } from "next/cache";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace-context";

export type MenteeInvitationState = {
  status: "idle" | "success" | "error";
  message: string;
  inviteUrl?: string;
};

export type RelationshipMutationState = {
  status: "idle" | "success" | "error";
  message: string;
};

type InvitationResult = { invitation_token: string };

export async function createMenteeInvitation(
  _state: MenteeInvitationState,
  formData: FormData
): Promise<MenteeInvitationState> {
  const context = await getWorkspaceContext();
  if (!context.user || (!context.roles.includes("mentor") && !context.roles.includes("admin"))) {
    return { status: "error", message: "Somente mentores e administradores podem criar este convite." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: "error", message: "Informe um e-mail válido." };

  const isMentor = context.roles.includes("mentor");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_invitation", {
    p_email: email,
    p_intended_role: "mentee",
    p_type: isMentor ? "mentor_invites_mentee" : "admin_invites_mentee",
    p_optional_message: message || null
  });

  if (error) return { status: "error", message: error.message };
  const invitation = (Array.isArray(data) ? data[0] : data) as InvitationResult | null;
  if (!invitation?.invitation_token) return { status: "error", message: "O banco não retornou o link do convite." };

  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return {
    status: "success",
    message: "Convite criado. Envie este link ao futuro mentorado.",
    inviteUrl: `${appUrl}/invite/${invitation.invitation_token}`
  };
}

function mutationError(message: string): RelationshipMutationState {
  return { status: "error", message };
}

export async function requestMentee(
  _state: RelationshipMutationState,
  formData: FormData
): Promise<RelationshipMutationState> {
  const context = await getWorkspaceContext();
  if (!context.user || !context.roles.includes("mentor")) {
    return mutationError("Somente uma conta com papel real de mentor pode solicitar esta mentoria.");
  }

  const menteeUserId = String(formData.get("menteeUserId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(menteeUserId)) return mutationError("Mentorado inválido.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("request_mentorship", { p_mentee_user_id: menteeUserId });
  if (error) return mutationError(error.message);

  revalidatePath("/app");
  revalidatePath("/app/relationships");
  return { status: "success", message: "Solicitação enviada. O mentorado já pode aceitar ou recusar." };
}

export async function respondToMentorshipRequest(
  _state: RelationshipMutationState,
  formData: FormData
): Promise<RelationshipMutationState> {
  const context = await getWorkspaceContext();
  if (!context.user || !context.roles.includes("mentee")) {
    return mutationError("Somente o mentorado desta solicitação pode respondê-la.");
  }

  const relationshipId = String(formData.get("relationshipId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(relationshipId) || !["accept", "decline"].includes(decision)) {
    return mutationError("Resposta inválida.");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_mentorship_request", {
    p_relationship_id: relationshipId,
    p_accept: decision === "accept"
  });
  if (error) return mutationError(error.message);

  revalidatePath("/app");
  revalidatePath("/app/relationships");
  return {
    status: "success",
    message: decision === "accept" ? "Mentoria aceita. Agora vocês podem criar o plano." : "Solicitação recusada."
  };
}

export async function endMentorship(
  _state: RelationshipMutationState,
  formData: FormData
): Promise<RelationshipMutationState> {
  const context = await getWorkspaceContext();
  if (!context.user || (!context.roles.includes("mentor") && !context.roles.includes("admin"))) {
    return mutationError("Você não tem permissão para encerrar esta mentoria.");
  }

  const relationshipId = String(formData.get("relationshipId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(relationshipId)) return mutationError("Relacionamento inválido.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("change_relationship_status", {
    p_relationship_id: relationshipId,
    p_status: "ended"
  });
  if (error) return mutationError(error.message);

  revalidatePath("/app");
  revalidatePath("/app/relationships");
  return { status: "success", message: "Mentoria encerrada. O mentorado voltou a ficar disponível." };
}

export async function cancelMenteeInvitation(
  _state: RelationshipMutationState,
  formData: FormData
): Promise<RelationshipMutationState> {
  const context = await getWorkspaceContext();
  if (!context.user || (!context.roles.includes("mentor") && !context.roles.includes("admin"))) {
    return mutationError("Você não tem permissão para cancelar este convite.");
  }

  const invitationId = String(formData.get("invitationId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(invitationId)) return mutationError("Convite inválido.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("revoke_invitation", { p_invitation_id: invitationId });
  if (error) return mutationError(error.message);

  revalidatePath("/app/relationships");
  return { status: "success", message: "Convite cancelado." };
}
