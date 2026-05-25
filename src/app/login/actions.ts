"use server";

import { redirect } from "next/navigation";
import { getEnvStatus } from "@/lib/env";
import { validateInvitationToken } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function getRedirectPath(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/app";
  }

  return path;
}

export async function requestLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = getRedirectPath(String(formData.get("next") ?? ""));
  const inviteToken = String(formData.get("inviteToken") ?? "").trim();

  if (!email) {
    redirect(`/login?error=missing-email&next=${encodeURIComponent(next)}`);
  }

  const envStatus = getEnvStatus();

  if (!envStatus.configured) {
    redirect(`/login?error=setup&next=${encodeURIComponent(next)}`);
  }

  if (inviteToken) {
    const invitation = await validateInvitationToken(inviteToken);

    if (invitation.status !== "valid") {
      redirect(`/invite/${encodeURIComponent(inviteToken)}?error=${invitation.status}`);
    }
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const callbackUrl = `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
      shouldCreateUser: Boolean(inviteToken)
    }
  });

  if (error) {
    redirect(`/login?error=auth&next=${encodeURIComponent(next)}`);
  }

  redirect(`/login?status=check-email&next=${encodeURIComponent(next)}`);
}
