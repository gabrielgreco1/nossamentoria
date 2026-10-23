"use server";

import { redirect } from "next/navigation";
import { getEnvStatus } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function getRedirectPath(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/app";
  return path;
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = getRedirectPath(String(formData.get("next") ?? ""));

  if (!email || !password) redirect(`/login?error=missing-credentials&next=${encodeURIComponent(next)}`);
  if (!getEnvStatus().configured) redirect(`/login?error=setup&next=${encodeURIComponent(next)}`);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const code = "code" in error ? error.code : undefined;
    if (error.status === 429) redirect(`/login?error=rate-limit&next=${encodeURIComponent(next)}`);
    if (code === "email_not_confirmed") redirect(`/login?error=email-not-confirmed&next=${encodeURIComponent(next)}`);
    redirect(`/login?error=invalid-credentials&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}
