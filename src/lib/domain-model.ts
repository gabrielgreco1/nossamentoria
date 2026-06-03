export const DOMAIN_ENTITIES = [
  "User",
  "Profile",
  "Invitation",
  "MentorMenteeRelationship",
  "MentorshipPlan",
  "LessonTemplate",
  "Lesson",
  "ContentMaterial",
  "ClassSession",
  "ProgressNote",
  "Notification"
] as const;

export type DomainEntity = (typeof DOMAIN_ENTITIES)[number];

export type DomainEntityDefinition = {
  entity: DomainEntity;
  purpose: string;
  ownership: string;
  stableKey: string;
};

export type DomainRelationship = {
  from: DomainEntity;
  relation: string;
  to: DomainEntity;
  scopeRule: string;
};

export const domainEntityDefinitions: DomainEntityDefinition[] = [
  {
    entity: "User",
    purpose: "Identidade autenticada pelo Supabase Auth.",
    ownership: "Pertence ao próprio usuário autenticado.",
    stableKey: "auth.users.id"
  },
  {
    entity: "Profile",
    purpose: "Nome, bio, flags de papel, stack e disponibilidade.",
    ownership: "Um perfil para cada usuário.",
    stableKey: "user_id"
  },
  {
    entity: "Invitation",
    purpose: "Registro de acesso privado por convite.",
    ownership: "Criado por admin ou mentor autorizado.",
    stableKey: "token_hash"
  },
  {
    entity: "MentorMenteeRelationship",
    purpose: "Conexão entre um mentor e um mentorado.",
    ownership: "Referência explícita a mentor_user_id e mentee_user_id.",
    stableKey: "relationship_id"
  },
  {
    entity: "MentorshipPlan",
    purpose: "Plano estruturado de aprendizado para uma relação.",
    ownership: "Pertence a uma relação mentor-mentorado.",
    stableKey: "relationship_id"
  },
  {
    entity: "LessonTemplate",
    purpose: "Aula reutilizável ou pré-definida.",
    ownership: "Criada por mentor ou equipe/admin.",
    stableKey: "template_id"
  },
  {
    entity: "Lesson",
    purpose: "Item planejado dentro de um plano.",
    ownership: "Pertence a um plano de mentoria.",
    stableKey: "plan_id"
  },
  {
    entity: "ContentMaterial",
    purpose: "Arquivo, link, nota ou documento de aprendizado.",
    ownership: "Possui owner_user_id e contexto de uso explícito.",
    stableKey: "owner_user_id"
  },
  {
    entity: "ClassSession",
    purpose: "Encontro agendado ou concluído para uma aula.",
    ownership: "Vinculado à relação e opcionalmente a uma aula.",
    stableKey: "relationship_id"
  },
  {
    entity: "ProgressNote",
    purpose: "Nota de progresso, aplicação em aula ou próxima ação.",
    ownership: "Ligada a plano, aula, sessão ou relação.",
    stableKey: "subject_id"
  },
  {
    entity: "Notification",
    purpose: "Evento simples para convites, agenda e atualizações.",
    ownership: "Pertence ao usuário destinatário.",
    stableKey: "recipient_user_id"
  }
];

export const domainRelationships: DomainRelationship[] = [
  {
    from: "User",
    relation: "tem um",
    to: "Profile",
    scopeRule: "Perfil é filtrado pelo user_id autenticado."
  },
  {
    from: "User",
    relation: "pode ter muitos papéis via",
    to: "Profile",
    scopeRule: "Papéis alimentam policies e não podem ser autoatribuídos."
  },
  {
    from: "MentorMenteeRelationship",
    relation: "referencia mentor e mentorado como",
    to: "User",
    scopeRule: "Consultas de mentor/mentorado passam pela relação."
  },
  {
    from: "MentorshipPlan",
    relation: "pertence a uma",
    to: "MentorMenteeRelationship",
    scopeRule: "Plano só aparece para participantes ou admin autorizado."
  },
  {
    from: "Lesson",
    relation: "pertence a um",
    to: "MentorshipPlan",
    scopeRule: "Aula herda escopo do plano."
  },
  {
    from: "ClassSession",
    relation: "pode referenciar uma",
    to: "Lesson",
    scopeRule: "Sessão herda escopo de relação e aula."
  },
  {
    from: "ContentMaterial",
    relation: "é owned por",
    to: "User",
    scopeRule: "Material é rastreado por owner e anexos explícitos."
  },
  {
    from: "ProgressNote",
    relation: "pertence a plano, aula, sessão ou",
    to: "MentorMenteeRelationship",
    scopeRule: "Nota nunca é buscada fora do contexto autorizado."
  },
  {
    from: "Notification",
    relation: "notifica um",
    to: "User",
    scopeRule: "Notificação é filtrada por recipient_user_id."
  }
];

export const domainModelRules = [
  "Cada objeto de domínio tem ownership claro.",
  "Escopo de query deve ser implementável por foreign keys explícitas.",
  "Materiais enviados precisam apontar owner e contexto de uso.",
  "Relações importantes não devem viver apenas em JSON blobs."
];
