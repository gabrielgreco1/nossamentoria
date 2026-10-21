import { Mail } from "lucide-react";
import { AuthCard } from "@/components/marketing/auth-card";
import { GlassButton } from "@/components/ui/glass-button";
import { PillChip } from "@/components/ui/pill-chip";
import { getEnvStatus } from "@/lib/env";
import { requestLogin } from "./actions";
import styles from "./page.module.css";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    status?: string;
    next?: string;
  }>;
};

function getMessage(error?: string, status?: string) {
  if (status === "check-email") {
    return {
      tone: "success",
      text: "Confira seu email para acessar pelo link seguro."
    };
  }

  if (error === "setup") {
    return {
      tone: "warning",
      text: "A autenticação ainda não está configurada. Fale com o administrador da plataforma."
    };
  }

  if (error === "missing-email") {
    return {
      tone: "warning",
      text: "Informe seu email para receber o link seguro de entrada."
    };
  }

  if (error === "auth") {
    return {
      tone: "warning",
      text: "Não foi possível enviar o link agora. Aguarde um momento e tente novamente."
    };
  }

  if (error === "rate-limit") {
    return {
      tone: "warning",
      text: "Um link já foi solicitado recentemente. Aguarde alguns minutos antes de pedir outro."
    };
  }

  if (error === "email-not-authorized") {
    return {
      tone: "warning",
      text: "O envio para este endereço ainda não está liberado. Fale com o administrador da plataforma."
    };
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const message = getMessage(params.error, params.status);
  const envStatus = getEnvStatus();
  const next = params.next?.startsWith("/") ? params.next : "/app";

  return (
    <AuthCard
      eyebrow="Acesso seguro"
      title="Entrar na NossaMentoria"
      description="Use o email conectado ao seu convite. Novas contas só são criadas a partir de um convite válido."
    >
      <form action={requestLogin} className={styles.form}>
        <input type="hidden" name="next" value={next} />
        <label>
          Email
          <input name="email" type="email" placeholder="voce@exemplo.com" required />
        </label>
        <GlassButton type="submit" icon={<Mail size={16} />}>Enviar link de entrada</GlassButton>
      </form>

      {message ? (
        <div className={message.tone === "success" ? styles.success : styles.warning}>
          {message.text}
        </div>
      ) : null}

      {!envStatus.configured ? (
        <div className={styles.setup}>
          <PillChip tone="warning">Configuração necessária</PillChip>
          <code>{envStatus.missing.join(", ")}</code>
        </div>
      ) : null}

      <p className={styles.note}>
        Ainda não tem convite? Peça um link para um mentor ou administrador antes de criar uma
        conta.
      </p>
    </AuthCard>
  );
}
