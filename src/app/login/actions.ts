"use server";

import { redirect } from "next/navigation";
import { getEnvStatus, getPublicEnv } from "@/lib/env";
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
  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const callbackUrl = `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
      shouldCreateUser: Boolean(inviteToken)
    }
  });

  if (error) {
    const errorCode = "code" in error ? error.code : undefined;
    const isRateLimited =
      error.status === 429 ||
      errorCode === "over_email_send_rate_limit" ||
      errorCode === "over_request_rate_limit";

    if (isRateLimited) {
      redirect(`/login?error=rate-limit&next=${encodeURIComponent(next)}`);
    }

    if (errorCode === "email_address_not_authorized") {
      redirect(`/login?error=email-not-authorized&next=${encodeURIComponent(next)}`);
    }

    redirect(`/login?error=auth&next=${encodeURIComponent(next)}`);
  }

  redirect(`/login?status=check-email&next=${encodeURIComponent(next)}`);
}
