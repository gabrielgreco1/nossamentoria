"use server";

import { redirect } from "next/navigation";
import { acceptInvitationToken, getCurrentUser, validateInvitationToken } from "@/lib/auth";

export async function acceptInvitation(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);

  const invitation = await validateInvitationToken(token);
  if (invitation.status !== "valid") redirect(`/invite/${encodeURIComponent(token)}?error=${invitation.status}`);

  const accepted = await acceptInvitationToken(token, user.id);
  if (!accepted.ok) redirect(`/invite/${encodeURIComponent(token)}?error=acceptance`);
  redirect("/app");
}
