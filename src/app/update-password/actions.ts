"use server";

import { redirect } from "next/navigation";
import { validatePassword } from "@/lib/registration";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("passwordConfirmation") ?? "");
  const validation = validatePassword(password);
  if (validation) redirect(`/update-password?error=${encodeURIComponent(validation)}`);
  if (password !== confirmation) redirect("/update-password?error=confirmation");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=invalid-recovery");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/update-password?error=update");
  await supabase.auth.signOut();
  redirect("/login?status=password-updated");
}
