export const USER_ROLES = ["admin", "mentor", "mentee"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type AccessAction =
  | "manage_platform"
  | "create_invitation"
  | "view_role_assignments"
  | "resolve_relationships"
  | "view_connected_mentees"
  | "create_mentorship_plan"
  | "upload_owned_material"
  | "schedule_class_session"
  | "record_progress_note"
  | "view_own_plan"
  | "view_shared_material"
  | "accept_relationship";

export type AccessDecision =
  | {
      allowed: true;
      roles: UserRole[];
      mixed: boolean;
    }
  | {
      allowed: false;
      roles: UserRole[];
      mixed: boolean;
      reason: string;
    };

const ROLE_PERMISSIONS: Record<UserRole, AccessAction[]> = {
  admin: ["manage_platform", "create_invitation", "view_role_assignments", "resolve_relationships"],
  mentor: [
    "view_connected_mentees",
    "create_mentorship_plan",
    "upload_owned_material",
    "schedule_class_session",
    "record_progress_note"
  ],
  mentee: ["view_own_plan", "view_shared_material", "accept_relationship"]
};

export function normalizeRoles(roles: Array<string | null | undefined>): UserRole[] {
  return USER_ROLES.filter((role) => roles.includes(role));
}

export function isMixedUser(roles: UserRole[]) {
  return roles.length > 1;
}

export function canAccess(roles: UserRole[], action: AccessAction): AccessDecision {
  const allowed = roles.some((role) => ROLE_PERMISSIONS[role].includes(action));

  if (allowed) {
    return {
      allowed: true,
      roles,
      mixed: isMixedUser(roles)
    };
  }

  return {
    allowed: false,
    roles,
    mixed: isMixedUser(roles),
    reason: "Este contexto não tem permissão para acessar esta área."
  };
}

export function getRoleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    admin: "Admin",
    mentor: "Mentor",
    mentee: "Mentorado"
  };

  return labels[role];
}

export function getRolePermissions(role: UserRole) {
  return ROLE_PERMISSIONS[role];
}
