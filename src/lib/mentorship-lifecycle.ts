import {
  MENTORSHIP_PLAN_STATUSES,
  type LessonStatus,
  type MentorshipPlanStatus,
  type ProgressConfidence,
  type RelationshipStatus,
  type SessionStatus
} from "@/lib/domain-types";

export { MENTORSHIP_PLAN_STATUSES };
export type { LessonStatus, MentorshipPlanStatus };

export const LIFECYCLE_STEPS = [
  "connection",
  "relationship_active",
  "plan_created",
  "lessons_added",
  "sessions_scheduled",
  "sessions_recorded",
  "progress_updated",
  "plan_resolved"
] as const;

export type LifecycleStep = (typeof LIFECYCLE_STEPS)[number];

export type LifecycleStepDefinition = {
  step: LifecycleStep;
  label: string;
  description: string;
};

export const lifecycleStepDefinitions: LifecycleStepDefinition[] = [
  {
    step: "connection",
    label: "Conectar",
    description: "O mentor escolhe alguém disponível ou envia um convite."
  },
  {
    step: "relationship_active",
    label: "Ativar relação",
    description: "O aceite transforma o convite em uma relação de mentoria ativa."
  },
  {
    step: "plan_created",
    label: "Criar plano",
    description: "Objetivo, duração, conteúdo e resultados esperados ganham estrutura."
  },
  {
    step: "lessons_added",
    label: "Organizar aulas",
    description: "Aulas manuais ou copiadas de templates formam a trilha."
  },
  {
    step: "sessions_scheduled",
    label: "Agendar",
    description: "Cada encontro fica ligado à relação e, quando fizer sentido, a uma aula."
  },
  {
    step: "sessions_recorded",
    label: "Registrar sessão",
    description: "O encontro concluído preserva o que foi aplicado e combinado."
  },
  {
    step: "progress_updated",
    label: "Atualizar progresso",
    description: "Aulas, sessões, notas e próximas ações mostram a evolução real."
  },
  {
    step: "plan_resolved",
    label: "Resolver plano",
    description: "O plano pode ser concluído, pausado ou estendido pelo mentor."
  }
];

export function getLifecycleCompletion(currentStep: LifecycleStep) {
  const currentIndex = LIFECYCLE_STEPS.indexOf(currentStep);
  return Math.round(((currentIndex + 1) / LIFECYCLE_STEPS.length) * 100);
}

export function canCreatePlan(relationshipStatus: string) {
  return relationshipStatus === "active";
}

export type AvailableMentee = {
  id: string;
  name: string;
  email: string;
  focus: string;
  availability: string;
  availableForMentorship: boolean;
};

export type RelationshipKey = {
  mentorId: string;
  menteeId: string;
  status: RelationshipStatus;
};

export type RelationshipRequestDecision =
  | { allowed: true }
  | { allowed: false; reason: string };

export function canRequestRelationship(
  mentorId: string,
  mentee: AvailableMentee,
  relationships: RelationshipKey[]
): RelationshipRequestDecision {
  if (!mentee.availableForMentorship) {
    return { allowed: false, reason: "Este mentorado não está disponível para uma nova mentoria." };
  }

  const duplicate = relationships.some(
    (relationship) =>
      relationship.mentorId === mentorId &&
      relationship.menteeId === mentee.id &&
      ["invited", "requested", "active", "paused"].includes(relationship.status)
  );

  if (duplicate) {
    return { allowed: false, reason: "Já existe uma relação aberta entre este mentor e mentorado." };
  }

  return { allowed: true };
}

export type MenteeInvitationInput = {
  email: string;
  message?: string;
  invitedByMentorId: string;
};

export type MenteeInvitation = MenteeInvitationInput & {
  intendedRole: "mentee";
  status: "pending";
};

export function prepareMenteeInvitation(input: MenteeInvitationInput): MenteeInvitation {
  const email = input.email.trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Informe um e-mail válido para enviar o convite.");
  }

  return {
    email,
    message: input.message?.trim() || undefined,
    invitedByMentorId: input.invitedByMentorId,
    intendedRole: "mentee",
    status: "pending"
  };
}

export type MentorshipPlanInput = {
  title: string;
  mentorId: string;
  menteeId: string;
  relationshipId: string;
  startDate: string;
  expectedEndDate: string;
  durationLabel: string;
  mainGoal: string;
  primaryContentArea: string;
  topics: string[];
  status: MentorshipPlanStatus;
  description?: string;
  expectedOutcomes?: string;
  prerequisites?: string;
  mentorPrivateNotes?: string;
  sharedNotes?: string;
};

export function validatePlanForActivation(plan: MentorshipPlanInput) {
  const errors: string[] = [];

  if (!plan.mentorId) errors.push("mentor");
  if (!plan.menteeId) errors.push("mentorado");
  if (!plan.relationshipId) errors.push("relação");
  if (!plan.mainGoal.trim()) errors.push("objetivo principal");

  return {
    valid: errors.length === 0,
    missingFields: errors
  };
}

export function canEditPlan(status: MentorshipPlanStatus, reopened = false) {
  return status !== "completed" || reopened;
}

export function getPlanStatusLabel(status: MentorshipPlanStatus) {
  const labels: Record<MentorshipPlanStatus, string> = {
    draft: "Rascunho",
    active: "Ativo",
    completed: "Concluído",
    paused: "Pausado"
  };

  return labels[status];
}

export type LessonTemplate = {
  id: string;
  title: string;
  category: string;
  estimatedDuration: string;
  objective: string;
  suggestedTopics: string[];
  suggestedMaterials: string[];
  suggestedExercise: string;
};

export type PlanLesson = Omit<LessonTemplate, "id"> & {
  id: string;
  planId: string;
  sourceTemplateId?: string;
  order: number;
  status: LessonStatus;
};

export const lessonTemplates: LessonTemplate[] = [
  {
    id: "programming-fundamentals",
    title: "Revisão de fundamentos de programação",
    category: "Fundamentos",
    estimatedDuration: "60 min",
    objective: "Identificar lacunas em lógica, tipos, controle de fluxo e funções.",
    suggestedTopics: ["Variáveis", "Condições", "Laços", "Funções"],
    suggestedMaterials: ["Checklist de fundamentos"],
    suggestedExercise: "Resolver um pequeno problema e explicar cada decisão."
  },
  {
    id: "git-github",
    title: "Fluxo com Git e GitHub",
    category: "Ferramentas",
    estimatedDuration: "75 min",
    objective: "Trabalhar com commits, branches e pull requests com segurança.",
    suggestedTopics: ["Commits", "Branches", "Pull requests"],
    suggestedMaterials: ["Repositório de prática"],
    suggestedExercise: "Criar uma branch, registrar mudanças e abrir um pull request."
  },
  {
    id: "semantic-html",
    title: "HTML e estrutura semântica",
    category: "Frontend",
    estimatedDuration: "60 min",
    objective: "Estruturar páginas legíveis, acessíveis e coerentes.",
    suggestedTopics: ["Semântica", "Formulários", "Acessibilidade"],
    suggestedMaterials: ["Referência de elementos HTML"],
    suggestedExercise: "Reestruturar uma página usando landmarks e headings corretos."
  },
  {
    id: "responsive-css",
    title: "Layout responsivo com CSS",
    category: "Frontend",
    estimatedDuration: "90 min",
    objective: "Criar interfaces que se adaptam com grid, flex e media queries.",
    suggestedTopics: ["Flexbox", "Grid", "Breakpoints"],
    suggestedMaterials: ["Mockup responsivo"],
    suggestedExercise: "Adaptar um painel desktop para telas pequenas."
  },
  {
    id: "javascript-fundamentals",
    title: "Fundamentos de JavaScript",
    category: "JavaScript",
    estimatedDuration: "90 min",
    objective: "Consolidar linguagem, coleções e funções assíncronas.",
    suggestedTopics: ["Arrays", "Objetos", "Promises"],
    suggestedMaterials: ["Lista de exercícios"],
    suggestedExercise: "Transformar e combinar dados vindos de uma API simulada."
  },
  {
    id: "react-state",
    title: "Componentes e estado em React",
    category: "React",
    estimatedDuration: "90 min",
    objective: "Separar responsabilidades e modelar interações com estado local.",
    suggestedTopics: ["Props", "Estado", "Composição"],
    suggestedMaterials: ["Exemplo de componente interativo"],
    suggestedExercise: "Construir um seletor com estado e feedback."
  },
  {
    id: "api-consumption",
    title: "Consumo de APIs",
    category: "Integração",
    estimatedDuration: "75 min",
    objective: "Buscar dados, representar loading e tratar falhas.",
    suggestedTopics: ["HTTP", "Fetch", "Estados assíncronos"],
    suggestedMaterials: ["API de demonstração"],
    suggestedExercise: "Criar uma listagem com loading, sucesso e erro."
  },
  {
    id: "authentication-basics",
    title: "Fundamentos de autenticação",
    category: "Segurança",
    estimatedDuration: "60 min",
    objective: "Entender sessão, identidade e autorização de acesso.",
    suggestedTopics: ["Sessão", "Tokens", "Autorização"],
    suggestedMaterials: ["Diagrama de autenticação"],
    suggestedExercise: "Mapear o fluxo de login e rota protegida."
  },
  {
    id: "portfolio-review",
    title: "Revisão de projeto de portfólio",
    category: "Carreira",
    estimatedDuration: "60 min",
    objective: "Transformar um projeto em evidência clara de habilidade.",
    suggestedTopics: ["README", "Demonstração", "Decisões técnicas"],
    suggestedMaterials: ["Checklist de portfólio"],
    suggestedExercise: "Reescrever a apresentação e priorizar melhorias do projeto."
  },
  {
    id: "interview-preparation",
    title: "Preparação para entrevistas",
    category: "Carreira",
    estimatedDuration: "75 min",
    objective: "Praticar comunicação técnica e resolução de problemas.",
    suggestedTopics: ["Histórias profissionais", "Live coding", "Perguntas técnicas"],
    suggestedMaterials: ["Roteiro de entrevista"],
    suggestedExercise: "Simular uma entrevista e registrar pontos de melhoria."
  }
];

export function copyTemplatesToPlan(
  templates: LessonTemplate[],
  planId: string,
  currentLessonCount = 0
): PlanLesson[] {
  return templates.map((template, index) => ({
    ...template,
    id: `${planId}-${template.id}-${currentLessonCount + index + 1}`,
    planId,
    sourceTemplateId: template.id,
    order: currentLessonCount + index + 1,
    status: "not_started"
  }));
}

export type ClassSessionRecord = {
  id: string;
  lessonId?: string;
  status: SessionStatus;
  scheduledAt: string;
  completedAt?: string;
};

export type ProgressNote = {
  id: string;
  lessonId?: string;
  sessionId?: string;
  applied: string;
  understood: string;
  needsReview: string;
  nextAction: string;
  confidence?: ProgressConfidence;
  sharedWithMentee: boolean;
};

export type ProgressSummary = {
  completedLessons: number;
  totalLessons: number;
  completedSessions: number;
  nextActions: number;
  completionPercentage: number;
};

export function getLessonStatusLabel(status: LessonStatus) {
  const labels: Record<LessonStatus, string> = {
    not_started: "Não iniciada",
    scheduled: "Agendada",
    in_progress: "Em andamento",
    completed: "Concluída",
    skipped: "Pulada"
  };

  return labels[status];
}

export function completeSessionAndLesson(
  sessions: ClassSessionRecord[],
  lessons: PlanLesson[],
  sessionId: string,
  completedAt: string
) {
  const session = sessions.find((item) => item.id === sessionId);
  const nextSessions = sessions.map((item) =>
    item.id === sessionId ? { ...item, status: "completed" as const, completedAt } : item
  );
  const nextLessons = session?.lessonId
    ? lessons.map((lesson) =>
        lesson.id === session.lessonId ? { ...lesson, status: "completed" as const } : lesson
      )
    : lessons;

  return { sessions: nextSessions, lessons: nextLessons };
}

export function calculateProgress(
  lessons: PlanLesson[],
  sessions: ClassSessionRecord[],
  notes: ProgressNote[]
): ProgressSummary {
  const completedLessons = lessons.filter((lesson) => lesson.status === "completed").length;
  const completedSessions = sessions.filter((session) => session.status === "completed").length;
  const nextActions = notes.filter((note) => note.nextAction.trim()).length;

  return {
    completedLessons,
    totalLessons: lessons.length,
    completedSessions,
    nextActions,
    completionPercentage: lessons.length === 0 ? 0 : Math.round((completedLessons / lessons.length) * 100)
  };
}

export function needsMentorFollowUp(lessons: PlanLesson[], notes: ProgressNote[]) {
  return (
    lessons.some((lesson) => lesson.status === "in_progress") ||
    notes.some((note) => note.needsReview.trim().length > 0 || note.confidence === "low")
  );
}
