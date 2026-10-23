"use client";

import { Mail } from "lucide-react";
import { useActionState } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { requestPasswordReset, type ResetState } from "./actions";
import styles from "../login/page.module.css";

const initialState: ResetState = { status: "idle", message: "" };

export function ResetForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);
  return <form action={action} className={styles.form}>
    <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
    <GlassButton type="submit" icon={<Mail size={16} />} disabled={pending}>{pending ? "Enviando..." : "Recuperar senha"}</GlassButton>
    {state.status !== "idle" ? <div className={state.status === "success" ? styles.success : styles.warning} role="status">{state.message}</div> : null}
  </form>;
}
