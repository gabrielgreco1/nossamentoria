"use client";

import { useActionState } from "react";
import {
  createInvitationAction,
  type InvitationActionState
} from "@/app/app/admin/actions";
import { GlassButton } from "@/components/ui/glass-button";
import styles from "./admin-invitation-form.module.css";

const initialState: InvitationActionState = {
  status: "idle",
  message: ""
};

export function AdminInvitationForm() {
  const [state, formAction, pending] = useActionState(createInvitationAction, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.fields}>
        <label>
          E-mail
          <input name="email" type="email" placeholder="pessoa@exemplo.com" required />
        </label>
        <label>
          Papel inicial
          <select name="role" defaultValue="mentee">
            <option value="mentee">Mentorado</option>
            <option value="mentor">Mentor</option>
          </select>
        </label>
      </div>
      <label>
        Mensagem opcional
        <textarea name="message" rows={3} placeholder="Contexto breve sobre o convite." />
      </label>
      <GlassButton type="submit" disabled={pending}>
        {pending ? "Criando convite..." : "Criar convite"}
      </GlassButton>

      {state.status !== "idle" ? (
        <div className={state.status === "success" ? styles.success : styles.error} role="status">
          <p>{state.message}</p>
          {state.inviteUrl ? (
            <a href={state.inviteUrl} target="_blank" rel="noreferrer">{state.inviteUrl}</a>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
