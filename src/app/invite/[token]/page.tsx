import { Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/marketing/auth-card";
import { GlassButton } from "@/components/ui/glass-button";
import { PillChip } from "@/components/ui/pill-chip";
import {
  acceptInvitationToken,
  getCurrentUser,
  validateInvitationToken
} from "@/lib/auth";
import { requestLogin } from "@/app/login/actions";
import styles from "./page.module.css";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const invitation = await validateInvitationToken(token);
  const user = await getCurrentUser();

  if (user && invitation.status === "valid") {
    const accepted = await acceptInvitationToken(token, user.id);

    if (accepted.ok) {
      redirect("/app");
    }

    return (
      <AuthCard
        eyebrow="Convite"
        title="A aceitação do convite precisa de configuração"
        description={accepted.message}
      >
        <GlassButton href="/app" variant="secondary">
          Ir para a área privada
        </GlassButton>
      </AuthCard>
    );
  }

  if (invitation.status !== "valid") {
    return (
      <AuthCard
        eyebrow="Convite"
        title="Este convite não pode ser usado"
        description={invitation.message}
      >
        <div className={styles.state}>
          <ShieldAlert size={22} />
          <div>
            <strong>{invitation.status === "setup" ? "Configuração necessária" : "Convite bloqueado"}</strong>
            <p>
              Peça um novo convite ao mentor ou administrador se este link expirou, foi revogado ou
              já foi usado.
            </p>
          </div>
        </div>
        <GlassButton href="/login" variant="secondary">
          Voltar para login
        </GlassButton>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Convite"
      title="Aceite seu convite da NossaMentoria"
      description="Confirme o email convidado para criar ou acessar sua conta. A área privada só abre depois que este convite for validado."
    >
      <div className={styles.summary}>
        <ShieldCheck size={20} />
        <div>
          <PillChip>Convite válido</PillChip>
          <p>
            {invitation.email ? `Email convidado: ${invitation.email}` : "Use o email que recebeu este convite."}
          </p>
          {invitation.role ? <p>Papel: {invitation.role}</p> : null}
        </div>
      </div>

      <form action={requestLogin} className={styles.form}>
        <input type="hidden" name="next" value={`/invite/${token}`} />
        <input type="hidden" name="inviteToken" value={token} />
        <label>
          Email
          <input
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            defaultValue={invitation.email}
            required
          />
        </label>
        <GlassButton type="submit" icon={<Mail size={16} />}>Continuar com email</GlassButton>
      </form>
    </AuthCard>
  );
}
