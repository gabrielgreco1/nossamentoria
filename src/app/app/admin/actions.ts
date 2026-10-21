"use server";

import { revalidatePath } from "next/cache";
import { canAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace-context";

export type InvitationActionState = {
  status: "idle" | "success" | "error";
  message: string;
  inviteUrl?: string;
};

type InvitationRpcResult = {
  invitation_id: string;
  invitation_token: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createInvitationAction(
  _previousState: InvitationActionState,
  formData: FormData
): Promise<InvitationActionState> {
  const context = await getWorkspaceContext();
  const access = canAccess(context.roles, "create_invitation");

  if (!context.user) {
    return { status: "error", message: "Autenticação obrigatória." };
  }

  if (!access.allowed) {
    return { status: "error", message: access.reason };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (!emailPattern.test(email)) {
    return { status: "error", message: "Informe um e-mail válido." };
  }

  if (role !== "mentor" && role !== "mentee") {
    return { status: "error", message: "Escolha um papel válido para o convite." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_invitation", {
    p_email: email,
    p_intended_role: role,
    p_type: role === "mentor" ? "admin_invites_mentor" : "admin_invites_mentee",
    p_optional_message: message || null
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  const invitation = (Array.isArray(data) ? data[0] : data) as InvitationRpcResult | null;

  if (!invitation?.invitation_token) {
    return { status: "error", message: "O banco não retornou o token do convite." };
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  revalidatePath("/app/admin");

  return {
    status: "success",
    message: "Convite criado. Copie o link agora; o token não fica disponível novamente.",
    inviteUrl: `${appUrl}/invite/${invitation.invitation_token}`
  };
}

export async function revokeInvitationAction(formData: FormData) {
  const context = await getWorkspaceContext();
  const access = canAccess(context.roles, "create_invitation");

  if (!context.user || !access.allowed) {
    return;
  }

  const invitationId = String(formData.get("invitationId") ?? "");

  if (!invitationId) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .eq("status", "pending");

  if (error) {
    throw new Error("Não foi possível revogar o convite.");
  }

  revalidatePath("/app/admin");
}
