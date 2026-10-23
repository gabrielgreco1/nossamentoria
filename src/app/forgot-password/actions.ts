"use server";

import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type ResetState = { status: "idle" | "success" | "error"; message: string };

export async function requestPasswordReset(_state: ResetState, formData: FormData): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: "error", message: "Informe um e-mail válido." };

  const supabase = await createClient();
  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent("/update-password")}`
  });

  if (error?.status === 429) return { status: "error", message: "Aguarde alguns minutos antes de solicitar outro e-mail." };
  if (error) return { status: "error", message: "Não foi possível iniciar a recuperação agora." };
  return { status: "success", message: "Se esse e-mail estiver cadastrado, enviaremos as instruções de recuperação." };
}
