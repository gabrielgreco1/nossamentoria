import { RELATIONSHIP_STATUSES, type RelationshipStatus } from "@/lib/domain-types";

export const RELATIONSHIP_STATES = RELATIONSHIP_STATUSES;
export type RelationshipState = RelationshipStatus;

export type RelationshipCreationPath = "mentor_invites" | "mentor_picks" | "admin_creates_or_approves";

export type RelationshipSummary = {
  mentorName: string;
  menteeName: string;
  status: RelationshipState;
  activePlanTitle?: string;
  upcomingSessionLabel?: string;
  sharedContextCount: number;
};

export const relationshipCreationPaths: Array<{
  path: RelationshipCreationPath;
  label: string;
  description: string;
}> = [
  {
    path: "mentor_invites",
    label: "Mentor convida por email",
    description: "Cria uma relação em estado invited até o mentorado aceitar."
  },
  {
    path: "mentor_picks",
    label: "Mentor escolhe mentorado aprovado",
    description: "Conecta mentor a alguém já disponível em uma lista aprovada."
  },
  {
    path: "admin_creates_or_approves",
    label: "Admin cria ou aprova",
    description: "Resolve relações quando a operação privada precisa de ajuste."
  }
];

export function getRelationshipStateLabel(state: RelationshipState) {
  const labels: Record<RelationshipState, string> = {
    invited: "Convidado",
    requested: "Solicitado",
    active: "Ativo",
    paused: "Pausado",
    ended: "Encerrado"
  };

  return labels[state];
}

export function getRelationshipStateDescription(state: RelationshipState) {
  const descriptions: Record<RelationshipState, string> = {
    invited: "Mentor enviou convite e aguarda aceite.",
    requested: "Mentorado ou admin solicitou a relação.",
    active: "Mentor e mentorado estão conectados.",
    paused: "Mentoria temporariamente inativa.",
    ended: "Mentoria concluída ou encerrada."
  };

  return descriptions[state];
}

export function canTrackRegularProgress(relationship: RelationshipSummary) {
  return relationship.status === "active" && Boolean(relationship.activePlanTitle);
}
