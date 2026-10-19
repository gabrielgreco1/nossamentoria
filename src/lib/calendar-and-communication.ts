export const CALENDAR_WORKFLOW_STEPS = [
  {
    id: "schedule",
    label: "Agendar",
    description: "O mentor escolhe contexto, data, duração e uma aula opcional."
  },
  {
    id: "surface",
    label: "Exibir",
    description: "Mentor e mentorado enxergam a próxima sessão sem precisar procurar."
  },
  {
    id: "notify",
    label: "Notificar",
    description: "Eventos importantes aparecem na central interna de notificações."
  },
  {
    id: "communicate",
    label: "Contextualizar",
    description: "Notas preservam decisões e ações no relacionamento correto."
  },
  {
    id: "resolve",
    label: "Resolver",
    description: "A sessão pode ser concluída, reagendada, cancelada ou não realizada."
  }
] as const;

export type CalendarRole = "admin" | "mentor" | "mentee";
export type ScheduledSessionStatus = "proposed" | "confirmed" | "completed" | "canceled" | "missed";

export type ScheduledSession = {
  id: string;
  title: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  planId: string;
  planTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  startAt: string;
  endAt: string;
  status: ScheduledSessionStatus;
  createdAt: string;
  notes: string;
};

export function getScheduledSessionStatusLabel(status: ScheduledSessionStatus) {
  const labels: Record<ScheduledSessionStatus, string> = {
    proposed: "Proposta",
    confirmed: "Confirmada",
    completed: "Concluída",
    canceled: "Cancelada",
    missed: "Não realizada"
  };

  return labels[status];
}

export function getSessionsForRole(
  sessions: ScheduledSession[],
  role: CalendarRole,
  userId: string
) {
  if (role === "admin") return sessions;
  if (role === "mentor") return sessions.filter((session) => session.mentorId === userId);
  return sessions.filter((session) => session.menteeId === userId);
}

export function splitSessionsByDate(sessions: ScheduledSession[], now: string) {
  const currentTime = new Date(now).getTime();

  return {
    upcoming: sessions
      .filter((session) =>
        new Date(session.startAt).getTime() >= currentTime &&
        ["proposed", "confirmed"].includes(session.status)
      )
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    history: sessions
      .filter((session) => new Date(session.startAt).getTime() < currentTime || ["completed", "canceled", "missed"].includes(session.status))
      .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
  };
}

export const initialScheduledSessions: ScheduledSession[] = [
  {
    id: "calendar-responsive",
    title: "Aula de layout responsivo",
    mentorId: "mentor-preview",
    mentorName: "Mentor atual",
    menteeId: "mentee-preview",
    menteeName: "Bruno Souza",
    planId: "plan-preview",
    planTitle: "Trilha de desenvolvimento frontend",
    lessonId: "lesson-responsive",
    lessonTitle: "Layout responsivo",
    startAt: "2026-10-22T19:00:00-03:00",
    endAt: "2026-10-22T20:30:00-03:00",
    status: "confirmed",
    createdAt: "2026-10-15T10:00:00-03:00",
    notes: "Trazer o exercício do painel para revisão."
  },
  {
    id: "calendar-git",
    title: "Fluxo com Git e GitHub",
    mentorId: "mentor-preview",
    mentorName: "Mentor atual",
    menteeId: "mentee-preview",
    menteeName: "Bruno Souza",
    planId: "plan-preview",
    planTitle: "Trilha de desenvolvimento frontend",
    lessonId: "lesson-git",
    lessonTitle: "Fluxo com Git e GitHub",
    startAt: "2026-10-24T10:00:00-03:00",
    endAt: "2026-10-24T11:15:00-03:00",
    status: "proposed",
    createdAt: "2026-10-18T15:20:00-03:00",
    notes: "Horário proposto pelo mentor."
  },
  {
    id: "calendar-foundations",
    title: "Revisão de fundamentos",
    mentorId: "mentor-preview",
    mentorName: "Mentor atual",
    menteeId: "mentee-preview",
    menteeName: "Bruno Souza",
    planId: "plan-preview",
    planTitle: "Trilha de desenvolvimento frontend",
    lessonId: "lesson-foundations",
    lessonTitle: "Revisão de fundamentos",
    startAt: "2026-10-13T19:00:00-03:00",
    endAt: "2026-10-13T20:00:00-03:00",
    status: "completed",
    createdAt: "2026-10-08T09:30:00-03:00",
    notes: "Sessão concluída com exercícios de lógica."
  },
  {
    id: "calendar-canceled",
    title: "Revisão rápida de portfólio",
    mentorId: "mentor-preview",
    mentorName: "Mentor atual",
    menteeId: "another-mentee",
    menteeName: "Ana Ribeiro",
    planId: "plan-portfolio",
    planTitle: "Preparação para oportunidades",
    startAt: "2026-10-17T09:00:00-03:00",
    endAt: "2026-10-17T09:45:00-03:00",
    status: "canceled",
    createdAt: "2026-10-11T11:00:00-03:00",
    notes: "Cancelada por conflito de agenda."
  }
];

export type ScheduleSessionInput = {
  title: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  planId: string;
  planTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  startAt: string;
  durationMinutes: number;
  notes: string;
  requiresConfirmation: boolean;
};

function toLocalDateTimeString(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function createScheduledSession(input: ScheduleSessionInput, createdAt: string): ScheduledSession {
  if (!input.title.trim() || !input.menteeId || !input.planId || !input.startAt) {
    throw new Error("Informe título, mentorado, plano, data e horário.");
  }

  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes < 15) {
    throw new Error("A duração deve ter pelo menos 15 minutos.");
  }

  const start = new Date(input.startAt);
  if (Number.isNaN(start.getTime())) throw new Error("Informe uma data e um horário válidos.");

  const end = new Date(start.getTime() + input.durationMinutes * 60_000);
  return {
    id: `session-${Date.now()}`,
    title: input.title.trim(),
    mentorId: input.mentorId,
    mentorName: input.mentorName,
    menteeId: input.menteeId,
    menteeName: input.menteeName,
    planId: input.planId,
    planTitle: input.planTitle,
    lessonId: input.lessonId,
    lessonTitle: input.lessonTitle,
    startAt: toLocalDateTimeString(start),
    endAt: toLocalDateTimeString(end),
    status: input.requiresConfirmation ? "proposed" : "confirmed",
    createdAt,
    notes: input.notes.trim()
  };
}

export function rescheduleSession(
  session: ScheduledSession,
  startAt: string,
  durationMinutes: number
): ScheduledSession {
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime()) || durationMinutes < 15) {
    throw new Error("Informe uma nova data e duração válidas.");
  }

  return {
    ...session,
    startAt: toLocalDateTimeString(start),
    endAt: toLocalDateTimeString(new Date(start.getTime() + durationMinutes * 60_000)),
    status: session.status === "proposed" ? "proposed" : "confirmed"
  };
}

export function changeScheduledSessionStatus(
  session: ScheduledSession,
  status: ScheduledSessionStatus
) {
  return { ...session, status };
}

export function countsAsCompletedProgress(session: ScheduledSession) {
  return session.status === "completed";
}

export type NotificationType =
  | "invitation_created"
  | "invitation_accepted"
  | "relationship_activated"
  | "plan_activated"
  | "session_scheduled"
  | "session_rescheduled"
  | "session_completed"
  | "shared_note";

export type InAppNotification = {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedEntityType: "invitation" | "relationship" | "plan" | "session" | "note";
  relatedEntityId: string;
  read: boolean;
  createdAt: string;
};

export const initialNotifications: InAppNotification[] = [
  {
    id: "notification-session",
    recipientId: "mentee-preview",
    type: "session_scheduled",
    title: "Próxima sessão confirmada",
    body: "Layout responsivo foi agendado para 22 de outubro às 19:00.",
    relatedEntityType: "session",
    relatedEntityId: "calendar-responsive",
    read: false,
    createdAt: "2026-10-15T10:01:00-03:00"
  },
  {
    id: "notification-proposal",
    recipientId: "mentee-preview",
    type: "session_scheduled",
    title: "Novo horário proposto",
    body: "O mentor propôs a aula de Git para 24 de outubro às 10:00.",
    relatedEntityType: "session",
    relatedEntityId: "calendar-git",
    read: false,
    createdAt: "2026-10-18T15:21:00-03:00"
  },
  {
    id: "notification-note",
    recipientId: "mentee-preview",
    type: "shared_note",
    title: "Nova próxima ação",
    body: "Resolva dois exercícios de repetição antes do próximo encontro.",
    relatedEntityType: "note",
    relatedEntityId: "note-foundations",
    read: true,
    createdAt: "2026-10-13T20:05:00-03:00"
  }
];

export function createNotification(
  notification: Omit<InAppNotification, "id" | "read"> & { id?: string }
): InAppNotification {
  return {
    ...notification,
    id: notification.id ?? `notification-${Date.now()}`,
    read: false
  };
}

export function markNotificationRead(
  notifications: InAppNotification[],
  notificationId: string
) {
  return notifications.map((notification) =>
    notification.id === notificationId ? { ...notification, read: true } : notification
  );
}

export function markAllNotificationsRead(
  notifications: InAppNotification[],
  recipientId: string
) {
  return notifications.map((notification) =>
    notification.recipientId === recipientId ? { ...notification, read: true } : notification
  );
}

export function getNotificationTypeLabel(type: NotificationType) {
  const labels: Record<NotificationType, string> = {
    invitation_created: "Convite criado",
    invitation_accepted: "Convite aceito",
    relationship_activated: "Mentoria ativada",
    plan_activated: "Plano ativado",
    session_scheduled: "Sessão agendada",
    session_rescheduled: "Sessão reagendada",
    session_completed: "Sessão concluída",
    shared_note: "Nota compartilhada"
  };

  return labels[type];
}

export type CommunicationNoteType =
  | "mentor_private"
  | "mentor_shared"
  | "mentee_note"
  | "next_action"
  | "session_summary";

export type CommunicationContextType = "relationship" | "plan" | "lesson" | "session";
export type CommunicationVisibility = "mentor_only" | "mentor_and_mentee";

export type CommunicationNote = {
  id: string;
  authorId: string;
  authorRole: "mentor" | "mentee";
  type: CommunicationNoteType;
  body: string;
  contextType: CommunicationContextType;
  contextId: string;
  contextLabel: string;
  visibility: CommunicationVisibility;
  createdAt: string;
};

export const initialCommunicationNotes: CommunicationNote[] = [
  {
    id: "communication-summary",
    authorId: "mentor-preview",
    authorRole: "mentor",
    type: "session_summary",
    body: "Revisamos lógica e funções pequenas. Bruno explicou bem a decomposição antes de codificar.",
    contextType: "session",
    contextId: "calendar-foundations",
    contextLabel: "Revisão de fundamentos",
    visibility: "mentor_and_mentee",
    createdAt: "2026-10-13T20:04:00-03:00"
  },
  {
    id: "communication-private",
    authorId: "mentor-preview",
    authorRole: "mentor",
    type: "mentor_private",
    body: "Preparar um exercício visual para revisar laços aninhados sem aumentar a carga cognitiva.",
    contextType: "plan",
    contextId: "plan-preview",
    contextLabel: "Trilha de desenvolvimento frontend",
    visibility: "mentor_only",
    createdAt: "2026-10-13T20:06:00-03:00"
  },
  {
    id: "communication-action",
    authorId: "mentor-preview",
    authorRole: "mentor",
    type: "next_action",
    body: "Resolver dois exercícios de repetição antes da próxima sessão.",
    contextType: "lesson",
    contextId: "lesson-foundations",
    contextLabel: "Revisão de fundamentos",
    visibility: "mentor_and_mentee",
    createdAt: "2026-10-13T20:07:00-03:00"
  },
  {
    id: "communication-mentee",
    authorId: "mentee-preview",
    authorRole: "mentee",
    type: "mentee_note",
    body: "Ainda tenho dúvida sobre quando escolher map ou um laço tradicional.",
    contextType: "relationship",
    contextId: "relationship-preview",
    contextLabel: "Mentoria com Bruno Souza",
    visibility: "mentor_and_mentee",
    createdAt: "2026-10-16T18:30:00-03:00"
  }
];

export function getCommunicationNoteTypeLabel(type: CommunicationNoteType) {
  const labels: Record<CommunicationNoteType, string> = {
    mentor_private: "Nota privada do mentor",
    mentor_shared: "Nota compartilhada",
    mentee_note: "Nota do mentorado",
    next_action: "Próxima ação",
    session_summary: "Resumo da sessão"
  };

  return labels[type];
}

export function createCommunicationNote(
  input: Omit<CommunicationNote, "id" | "visibility">
): CommunicationNote {
  if (!input.body.trim()) throw new Error("Escreva o conteúdo da nota.");
  if (!input.contextId || !input.contextLabel) throw new Error("Escolha um contexto para a nota.");
  if (input.authorRole === "mentee" && input.type !== "mentee_note") {
    throw new Error("O mentorado pode registrar notas próprias neste fluxo.");
  }
  if (input.authorRole === "mentor" && input.type === "mentee_note") {
    throw new Error("Notas do mentorado precisam ser criadas no contexto de mentorado.");
  }

  return {
    ...input,
    id: `communication-${Date.now()}`,
    body: input.body.trim(),
    visibility: input.type === "mentor_private" ? "mentor_only" : "mentor_and_mentee"
  };
}

export function getVisibleCommunicationNotes(
  notes: CommunicationNote[],
  viewerRole: CalendarRole,
  viewerId: string
) {
  if (viewerRole === "admin") return notes;

  return notes.filter((note) => {
    if (note.visibility === "mentor_only") return viewerRole === "mentor" && note.authorId === viewerId;
    if (viewerRole === "mentor") return true;
    return viewerRole === "mentee";
  });
}
