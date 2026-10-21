import { cache } from "react";
import { normalizeRoles, type UserRole } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { getEnvStatus } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

type RoleRow = {
  role: string;
};

function getMetadataRoles(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  const metadataRoles = user?.app_metadata?.roles;
  const metadataRole = user?.app_metadata?.role;
  const roles = Array.isArray(metadataRoles) ? metadataRoles : [metadataRole];

  return normalizeRoles(roles.map((role) => (typeof role === "string" ? role : null)));
}

export type WorkspaceContext = {
  envStatus: ReturnType<typeof getEnvStatus>;
  user: Awaited<ReturnType<typeof getCurrentUser>>;
  roles: UserRole[];
  roleSource: "database" | "metadata" | "preview" | "missing";
  preview: boolean;
};

export const getWorkspaceContext = cache(async (): Promise<WorkspaceContext> => {
  const envStatus = getEnvStatus();
  const user = await getCurrentUser();

  if (!envStatus.configured) {
    const preview = process.env.NODE_ENV !== "production";

    return {
      envStatus,
      user: null,
      roles: preview ? ["mentor", "mentee"] : [],
      roleSource: preview ? "preview" : "missing",
      preview
    };
  }

  if (!user) {
    return {
      envStatus,
      user: null,
      roles: [],
      roleSource: "missing",
      preview: false
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!error) {
      const databaseRoles = normalizeRoles(
        ((data ?? []) as RoleRow[]).map((record) => record.role)
      );

      if (databaseRoles.length > 0) {
        return {
          envStatus,
          user,
          roles: databaseRoles,
          roleSource: "database",
          preview: false
        };
      }
    }
  } catch {
    // Metadata keeps an existing user reachable while the database is unavailable.
  }

  const metadataRoles = getMetadataRoles(user);

  return {
    envStatus,
    user,
    roles: metadataRoles,
    roleSource: metadataRoles.length > 0 ? "metadata" : "missing",
    preview: false
  };
});
