import type { InvitationStatus } from "@/lib/auth";
import {
  INVITATION_RECORD_STATUSES,
  type InvitationRecordStatus,
  type InvitationType
} from "@/lib/domain-types";

export const TRACKED_INVITATION_STATUSES = INVITATION_RECORD_STATUSES;
export type TrackedInvitationStatus = InvitationRecordStatus;
export type { InvitationType };

export const invitationFlowSteps = [
  "Pessoa convidada abre landing, login ou link de convite.",
  "Sistema valida o token antes de criar conta.",
  "Conta entra apenas pelo caminho de convite válido.",
  "Papel pretendido é aplicado sem edição pelo convidado.",
  "Relação com mentor é criada ou fica pendente quando existir alvo.",
  "Usuário vai para o workspace privado correto."
];

export function getInvitationStatusLabel(status: InvitationStatus) {
  const labels: Record<InvitationStatus, string> = {
    valid: "Pendente e válido",
    invalid: "Inválido",
    expired: "Expirado",
    revoked: "Revogado",
    used: "Já usado",
    setup: "Setup pendente"
  };

  return labels[status];
}

export function getInvitationBlockedReason(status: InvitationStatus) {
  const reasons: Partial<Record<InvitationStatus, string>> = {
    expired: "Convites expirados não podem criar ou acessar contas.",
    revoked: "Convites revogados precisam ser recriados por mentor ou admin.",
    used: "Convites aceitos não podem ser reutilizados.",
    invalid: "O token não existe ou não pôde ser validado.",
    setup: "A validação depende da configuração do Supabase e das RPCs de convite."
  };

  return reasons[status] ?? null;
}

export function getInvitationTypeLabel(type: InvitationType) {
  const labels: Record<InvitationType, string> = {
    admin_invites_mentor: "Admin convida mentor",
    admin_invites_mentee: "Admin convida mentorado",
    mentor_invites_mentee: "Mentor convida mentorado",
    mentor_requests_future_mentor: "Mentor indica futuro mentor"
  };

  return labels[type];
}
