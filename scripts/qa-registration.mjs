import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
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
const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para executar este teste.");
  process.exit(1);
}

const serviceClient = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const email = `qa-registration-${Date.now()}@example.com`;
const menteeEmail = `qa-registration-mentee-${Date.now()}@example.com`;
const password = `Qa!${crypto.randomUUID()}aA1`;
let userId;
let menteeUserId;

try {
  const { data: topic, error: topicError } = await serviceClient
    .from("knowledge_topics")
    .select("slug")
    .eq("is_active", true)
    .limit(1)
    .single();

  if (topicError || !topic?.slug) {
    throw topicError ?? new Error("O catálogo de conhecimentos está vazio.");
  }

  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: "QA Cadastro Mentor",
      initial_role: "mentor",
      bio: "Conta descartável criada pelo teste automatizado.",
      linkedin_url: "https://www.linkedin.com/in/qa-registration",
      github_url: "https://github.com/qa-registration",
      academic_formations: [{
        institution: "Instituição de QA",
        course: "Engenharia de Software",
        degree: "Graduação",
        status: "completed",
        start_year: "2020",
        end_year: "2024"
      }],
      knowledge_topic_slugs: [topic.slug]
    }
  });

  if (error || !data.user) throw error ?? new Error("O Auth não criou o usuário de QA.");
  userId = data.user.id;

  const [profileResult, roleResult, formationResult, knowledgeResult] = await Promise.all([
    serviceClient.from("profiles").select("user_id,linkedin_url,github_url,profile_completed_at").eq("user_id", userId).single(),
    serviceClient.from("user_roles").select("role").eq("user_id", userId).eq("role", "mentor").single(),
    serviceClient.from("academic_formations").select("id", { count: "exact", head: true }).eq("user_id", userId),
    serviceClient.from("user_knowledge_topics").select("topic_id", { count: "exact", head: true }).eq("user_id", userId).eq("selection_kind", "expertise")
  ]);

  if (profileResult.error || !profileResult.data?.profile_completed_at) {
    throw profileResult.error ?? new Error("O perfil completo não foi materializado.");
  }
  if (roleResult.error || roleResult.data?.role !== "mentor") {
    throw roleResult.error ?? new Error("O papel de mentor não foi atribuído.");
  }
  if (formationResult.error || formationResult.count !== 1) {
    throw formationResult.error ?? new Error("A formação acadêmica não foi persistida.");
  }
  if (knowledgeResult.error || knowledgeResult.count !== 1) {
    throw knowledgeResult.error ?? new Error("A especialidade não foi persistida.");
  }

  const passwordClient = createClient(url, environment.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: login, error: loginError } = await passwordClient.auth.signInWithPassword({ email, password });

  if (loginError || login.user?.id !== userId) {
    throw loginError ?? new Error("A autenticação por senha não retornou o usuário criado.");
  }

  await passwordClient.auth.signOut();
  console.log("OK: cadastro de mentor, formação, especialidade e login por senha passaram.");

  const { data: menteeData, error: menteeError } = await serviceClient.auth.admin.createUser({
    email: menteeEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: "QA Cadastro Mentorado",
      initial_role: "mentee",
      bio: "Conta descartável sem formação acadêmica.",
      knowledge_topic_slugs: [topic.slug]
    }
  });

  if (menteeError || !menteeData.user) {
    throw menteeError ?? new Error("O Auth não criou o mentorado de QA.");
  }
  menteeUserId = menteeData.user.id;

  const [menteeRole, menteeFormations, menteeKnowledge] = await Promise.all([
    serviceClient.from("user_roles").select("role").eq("user_id", menteeUserId).eq("role", "mentee").single(),
    serviceClient.from("academic_formations").select("id", { count: "exact", head: true }).eq("user_id", menteeUserId),
    serviceClient.from("user_knowledge_topics").select("topic_id", { count: "exact", head: true }).eq("user_id", menteeUserId).eq("selection_kind", "interest")
  ]);

  if (menteeRole.error || menteeRole.data?.role !== "mentee") {
    throw menteeRole.error ?? new Error("O papel de mentorado não foi atribuído.");
  }
  if (menteeFormations.error || menteeFormations.count !== 0) {
    throw menteeFormations.error ?? new Error("O mentorado recebeu formação acadêmica indevida.");
  }
  if (menteeKnowledge.error || menteeKnowledge.count !== 1) {
    throw menteeKnowledge.error ?? new Error("O interesse do mentorado não foi persistido.");
  }

  const { data: menteeLogin, error: menteeLoginError } = await passwordClient.auth.signInWithPassword({
    email: menteeEmail,
    password
  });
  if (menteeLoginError || menteeLogin.user?.id !== menteeUserId) {
    throw menteeLoginError ?? new Error("O login do mentorado sem formação falhou.");
  }

  await passwordClient.auth.signOut();
  console.log("OK: mentorado sem formação, interesse e login por senha passaram.");
} finally {
  for (const disposableUserId of [userId, menteeUserId].filter(Boolean)) {
    const { error } = await serviceClient.auth.admin.deleteUser(disposableUserId);
    if (error) {
      console.error("Falha ao remover o usuário descartável de QA.");
      process.exitCode = 1;
    } else {
      console.log("OK: usuário descartável removido após o teste.");
    }
  }
}
