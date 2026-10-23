import { LockKeyhole } from "lucide-react";
import { AuthCard } from "@/components/marketing/auth-card";
import { GlassButton } from "@/components/ui/glass-button";
import { PASSWORD_MIN_LENGTH } from "@/lib/registration";
import { updatePassword } from "./actions";
import styles from "../login/page.module.css";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const message = error === "confirmation" ? "A confirmação não corresponde." : error ? "Não foi possível atualizar a senha. Revise os requisitos." : null;
  return <AuthCard eyebrow="Segurança" title="Escolha uma nova senha" description="Use pelo menos oito caracteres e evite senhas utilizadas em outros serviços.">
    <form action={updatePassword} className={styles.form}>
      <label>Nova senha<input name="password" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required /></label>
      <label>Confirmar nova senha<input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required /></label>
      {message ? <div className={styles.warning}>{message}</div> : null}
      <GlassButton type="submit" icon={<LockKeyhole size={16} />}>Atualizar senha</GlassButton>
    </form>
  </AuthCard>;
}
