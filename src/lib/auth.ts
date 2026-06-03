import type { User } from "@supabase/supabase-js";
import { getEnvStatus, isPublicEnvConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/access";

export type { UserRole };
export type InvitationStatus = "valid" | "invalid" | "expired" | "revoked" | "used" | "setup";

export type UserProfile = {
  id: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  stack: string | null;
  availability_notes: string | null;
  avatar_url: string | null;
};

export type UserAccess = {
  user: User | null;
  profile: UserProfile | null;
  roles: UserRole[];
};

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

const VALID_STATUSES = new Set<InvitationStatus>([
  "valid",
  "invalid",
  "expired",
  "revoked",
  "used",
  "setup"
]);

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

export async function getCurrentUserAccess(): Promise<UserAccess> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      roles: []
    };
  }

  try {
    const supabase = await createClient();
    const [{ data: profile }, { data: roleRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,email,display_name,bio,stack,availability_notes,avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id)
    ]);

    return {
      user,
      profile: (profile as UserProfile | null) ?? null,
      roles: ((roleRows ?? []) as Array<{ role: UserRole }>).map((row) => row.role)
    };
  } catch {
    return {
      user,
      profile: null,
      roles: []
    };
  }
}

export function hasUserRole(access: UserAccess, role: UserRole) {
  return access.roles.includes(role);
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
    const { data, error } = await supabase.rpc("accept_invitation_token", {
      invitation_token: token,
      accepting_user_id: userId
    });

    const result = Array.isArray(data) ? data[0] : data;

    return {
      ok: !error && Boolean(result?.ok ?? true),
      message: error?.message ?? result?.message ?? "Convite aceito."
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível aceitar o convite."
    };
  }
}
