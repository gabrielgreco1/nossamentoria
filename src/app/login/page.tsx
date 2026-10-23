import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "@/components/marketing/auth-card";
import { GlassButton } from "@/components/ui/glass-button";
import { signInWithPassword } from "./actions";
import styles from "./page.module.css";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; status?: string; next?: string }>;
};

function getMessage(error?: string, status?: string) {
  if (status === "password-updated") return { tone: "success", text: "Senha atualizada. Entre novamente com a nova senha." };
  if (status === "email-confirmed") return { tone: "success", text: "E-mail confirmado. Sua conta está pronta para entrar." };
  if (error === "setup") return { tone: "warning", text: "Não foi possível iniciar o acesso. Tente novamente mais tarde." };
  if (error === "missing-credentials") return { tone: "warning", text: "Informe e-mail e senha." };
  if (error === "invalid-credentials") return { tone: "warning", text: "E-mail ou senha incorretos." };
  if (error === "email-not-confirmed") return { tone: "warning", text: "Confirme seu e-mail antes de entrar." };
  if (error === "rate-limit") return { tone: "warning", text: "Muitas tentativas. Aguarde alguns minutos." };
  if (error === "invalid-recovery") return { tone: "warning", text: "O link de recuperação expirou. Solicite um novo." };
  if (error === "invalid-link") return { tone: "warning", text: "O link de confirmação ou recuperação é inválido ou expirou." };
  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const message = getMessage(params.error, params.status);
  const next = params.next?.startsWith("/") ? params.next : "/app";

  return (
    <AuthCard eyebrow="Acesso seguro" title="Entrar na NossaMentoria">
      <form action={signInWithPassword} className={styles.form}>
        <input type="hidden" name="next" value={next} />
        <label>E-mail<input name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required /></label>
        <label>Senha<input name="password" type="password" autoComplete="current-password" required /></label>
        <div className={styles.formLinks}><Link href="/forgot-password">Esqueci minha senha</Link></div>
        <GlassButton type="submit" icon={<LockKeyhole size={16} />}>Entrar</GlassButton>
      </form>

      {message ? <div className={message.tone === "success" ? styles.success : styles.warning}>{message.text}</div> : null}
      <p className={styles.note}>Ainda não possui conta? <Link href="/register">Faça seu cadastro</Link>.</p>
    </AuthCard>
  );
}
