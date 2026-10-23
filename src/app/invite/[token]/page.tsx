import { LogIn, ShieldAlert, ShieldCheck, UserPlus } from "lucide-react";
import { AuthCard } from "@/components/marketing/auth-card";
import { GlassButton } from "@/components/ui/glass-button";
import { PillChip } from "@/components/ui/pill-chip";
import { getCurrentUser, validateInvitationToken } from "@/lib/auth";
import {
  getInvitationBlockedReason,
  getInvitationStatusLabel,
  invitationFlowSteps
} from "@/lib/invitations";
import styles from "./page.module.css";
import { acceptInvitation } from "./actions";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const invitation = await validateInvitationToken(token);
  const user = await getCurrentUser();
  const blockedReason = getInvitationBlockedReason(invitation.status);

  if (user && invitation.status === "valid") {
    return (
      <AuthCard
        eyebrow="Convite"
        title="Confirme o aceite do convite"
        description="Sua conta está autenticada. Confirme para receber o papel e, quando aplicável, criar a relação com o mentor que fez o convite."
      >
        <form action={acceptInvitation}>
          <input name="token" type="hidden" value={token} />
          <GlassButton type="submit">Aceitar convite</GlassButton>
        </form>
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
            <strong>{invitation.status === "setup" ? "Convite indisponível" : "Convite bloqueado"}</strong>
            <PillChip tone="warning">{getInvitationStatusLabel(invitation.status)}</PillChip>
            <p>{blockedReason ?? "Peça um novo convite ao mentor ou administrador."}</p>
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
      description="Crie seu perfil completo com o e-mail convidado ou entre em uma conta existente para concluir o aceite."
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

      <div className={styles.details} aria-label="Campos do convite">
        <span>Status: {getInvitationStatusLabel(invitation.status)}</span>
        <span>Email: {invitation.email ?? "definido no convite"}</span>
        <span>Papel pretendido: {invitation.role ?? "definido pelo convite"}</span>
        <span>Convidado por: {invitation.invitedByUserId ?? "mentor ou admin"}</span>
        <span>Relação alvo: {invitation.mentorRelationshipTargetId ?? "nenhuma relação pré-definida"}</span>
        <span>Expiração: {invitation.expiresAt ?? "definida pelo convite"}</span>
      </div>

      <ol className={styles.steps} aria-label="Fluxo de aceite do convite">
        {invitationFlowSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className={styles.actions}>
        <GlassButton href={`/register?invite=${encodeURIComponent(token)}`} icon={<UserPlus size={16} />}>Criar conta com este convite</GlassButton>
        <GlassButton href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`} variant="secondary" icon={<LogIn size={16} />}>Já tenho uma conta</GlassButton>
      </div>
    </AuthCard>
  );
}
