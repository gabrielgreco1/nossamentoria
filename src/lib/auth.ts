import type { User } from "@supabase/supabase-js";
import {
  INVITATION_VALIDATION_STATUSES,
  type InvitationValidationStatus
} from "@/lib/domain-types";
import { getEnvStatus, isPublicEnvConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type InvitationStatus = InvitationValidationStatus;

export type InvitationValidation = {
  status: InvitationStatus;
  message: string;
  email?: string;
  role?: string;
  invitedByUserId?: string;
  mentorRelationshipTargetId?: string;
  expiresAt?: string;
};

type InvitationRecord = {
  status?: string;
  invitation_status?: string;
  email?: string;
  intended_role?: string;
  role?: string;
  invited_by_user_id?: string;
  invited_by?: string;
  mentor_relationship_target_id?: string;
  mentor_id?: string;
  expires_at?: string;
  expiration_date?: string;
};

const VALID_STATUSES = new Set<InvitationStatus>(INVITATION_VALIDATION_STATUSES);

export async function getCurrentUser(): Promise<User | null> {
  if (!isPublicEnvConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    return user;
  } catch {
    return null;
  }
}

export async function validateInvitationToken(token: string): Promise<InvitationValidation> {
  const envStatus = getEnvStatus();

  if (!envStatus.configured) {
    return {
      status: "setup",
      message: `Variáveis de ambiente ausentes: ${envStatus.missing.join(", ")}`
    };
  }

  if (!token.trim()) {
    return {
      status: "invalid",
      message: "Este link de convite está sem token."
    };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("validate_invitation_token", {
      invitation_token: token
    });

    if (error) {
      return {
        status: "invalid",
        message: "A validação de convites ainda não está configurada no Supabase."
      };
    }

    const record = Array.isArray(data) ? (data[0] as InvitationRecord | undefined) : (data as InvitationRecord | null);
    const rawStatus = String(record?.status ?? record?.invitation_status ?? "invalid");
    const status = VALID_STATUSES.has(rawStatus as InvitationStatus)
      ? (rawStatus as InvitationStatus)
      : "invalid";

    return {
      status,
      message: status === "valid" ? "Convite pronto." : `Convite com status ${status}.`,
      email: record?.email,
      role: record?.intended_role ?? record?.role,
      invitedByUserId: record?.invited_by_user_id ?? record?.invited_by,
      mentorRelationshipTargetId: record?.mentor_relationship_target_id ?? record?.mentor_id,
      expiresAt: record?.expires_at ?? record?.expiration_date
    };
  } catch {
    return {
      status: "invalid",
      message: "Não foi possível validar o convite."
    };
  }
}

export async function acceptInvitationToken(token: string, userId: string) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("accept_invitation_token", {
      invitation_token: token,
      accepting_user_id: userId
    });

    return {
      ok: !error,
      message: error?.message ?? "Convite aceito."
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível aceitar o convite."
    };
  }
}
