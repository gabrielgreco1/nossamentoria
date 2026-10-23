import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function readEnvFile(fileName) {
  const path = resolve(process.cwd(), fileName);

  if (!existsSync(path)) return {};

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator).trim(),
          line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, "$2")
        ];
      })
  );
}

const environment = {
  ...readEnvFile(".env"),
  ...readEnvFile(".env.local"),
  ...process.env
};
const url = environment.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = (environment.QA_BASE_URL ?? environment.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

if (!url || !anonKey || !serviceRoleKey) {
  console.error("Defina as quatro variáveis obrigatórias do projeto para executar este teste.");
  process.exit(1);
}

const serviceClient = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
let invitationId;

try {
  const { error: staleCleanupError } = await serviceClient
    .from("invitations")
    .delete()
    .like("email", "qa-stage06-%@example.com");

  if (staleCleanupError) {
    throw staleCleanupError;
  }

  let adminEmail = environment.QA_ADMIN_EMAIL;

  if (!adminEmail) {
    const { data: adminRole, error: adminRoleError } = await serviceClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (adminRoleError || !adminRole?.user_id) {
      throw adminRoleError ?? new Error("Nenhum administrador foi encontrado para o QA.");
    }

    const { data: adminUser, error: adminUserError } = await serviceClient.auth.admin.getUserById(
      adminRole.user_id
    );

    if (adminUserError || !adminUser.user?.email) {
      throw adminUserError ?? new Error("O administrador de QA não possui e-mail no Auth.");
    }

    adminEmail = adminUser.user.email;
  }

  const anonymousClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: anonymousProfiles, error: anonymousProfilesError } = await anonymousClient
    .from("profiles")
    .select("user_id")
    .limit(1);

  const anonymousProfilesBlocked =
    anonymousProfilesError?.code === "42501" ||
    (!anonymousProfilesError && (anonymousProfiles?.length ?? 0) === 0);

  if (!anonymousProfilesBlocked) {
    throw anonymousProfilesError ?? new Error("Leitura anônima de profiles não foi bloqueada por RLS.");
  }

  const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
    type: "magiclink",
    email: adminEmail
  });

  if (linkError || !linkData.properties?.hashed_token) {
    throw linkError ?? new Error("Token técnico do administrador não foi gerado.");
  }

  const authVerifier = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: verified, error: verifyError } = await authVerifier.auth.verifyOtp({
    type: "magiclink",
    token_hash: linkData.properties.hashed_token
  });

  if (verifyError || !verified.session) {
    throw verifyError ?? new Error("Sessão técnica do administrador não foi criada.");
  }

  let browserCookies = [];
  const userClient = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => browserCookies,
      setAll: (nextCookies) => {
        browserCookies = nextCookies.map(({ name, value }) => ({ name, value }));
      }
    }
  });
  const { error: sessionError } = await userClient.auth.setSession({
    access_token: verified.session.access_token,
    refresh_token: verified.session.refresh_token
  });

  if (sessionError) throw sessionError;

  const { data: roles, error: rolesError } = await userClient
    .from("user_roles")
    .select("role")
    .eq("user_id", verified.session.user.id);

  if (rolesError || !roles?.some(({ role }) => role === "admin")) {
    throw rolesError ?? new Error("O usuário de QA não possui o papel admin no banco.");
  }

  const cookieHeader = browserCookies.map(({ name, value }) => `${name}=${value}`).join("; ");
  const [workspace, adminPage, profilePage] = await Promise.all([
    fetch(`${appUrl}/app`, { headers: { cookie: cookieHeader }, redirect: "manual" }),
    fetch(`${appUrl}/app/admin`, { headers: { cookie: cookieHeader }, redirect: "manual" }),
    fetch(`${appUrl}/app/profile`, { headers: { cookie: cookieHeader }, redirect: "manual" })
  ]);
  const adminBody = await adminPage.text();
  const profileBody = await profilePage.text();

  if (
    workspace.status !== 200
    || adminPage.status !== 200
    || profilePage.status !== 200
    || !adminBody.includes("Criar convite privado")
    || !profileBody.includes("Informações pessoais")
  ) {
    throw new Error(
      `Rotas autenticadas inválidas: /app=${workspace.status}, /app/admin=${adminPage.status}, /app/profile=${profilePage.status}.`
    );
  }

  const testEmail = `qa-stage06-${Date.now()}@example.com`;
  const { data: invitationData, error: invitationError } = await userClient.rpc("create_invitation", {
    p_email: testEmail,
    p_intended_role: "mentee",
    p_type: "admin_invites_mentee",
    p_optional_message: "QA automatizado da Etapa 06"
  });

  if (invitationError) throw invitationError;

  const invitation = Array.isArray(invitationData) ? invitationData[0] : invitationData;
  invitationId = invitation?.invitation_id;

  if (!invitationId || !invitation?.invitation_token) {
    throw new Error("A criação do convite não retornou ID e token.");
  }

  const { data: storedInvitation, error: storedInvitationError } = await serviceClient
    .from("invitations")
    .select("id,status")
    .eq("email", testEmail)
    .single();

  if (storedInvitationError || !storedInvitation?.id) {
    throw storedInvitationError ?? new Error("O convite técnico não foi persistido.");
  }

  invitationId = storedInvitation.id;

  if (storedInvitation.status !== "pending") {
    throw new Error(`O convite técnico nasceu com status inesperado: ${storedInvitation.status}.`);
  }

  const { error: revokeError } = await serviceClient
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId);

  if (revokeError) throw revokeError;

  const { data: revoked, error: revokedReadError } = await serviceClient
    .from("invitations")
    .select("id,status")
    .eq("id", invitationId)
    .single();

  if (revokedReadError || revoked?.status !== "revoked") {
    throw revokedReadError ?? new Error("O convite técnico não foi revogado.");
  }

  console.log("OK: RLS anônima, sessão admin, rotas protegidas, Perfil e convite criar/revogar passaram.");
} finally {
  if (invitationId) {
    const { data: removed, error: cleanupError } = await serviceClient
      .from("invitations")
      .delete()
      .eq("id", invitationId)
      .select("id");

    if (cleanupError || removed?.length !== 1) {
      console.error("Falha ao remover o convite técnico de QA.");
      process.exitCode = 1;
    } else {
      console.log("OK: convite técnico removido após o teste.");
    }
  }
}
