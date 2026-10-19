import type {
  AttachmentTargetType,
  LessonStatus,
  MaterialType,
  SessionStatus
} from "@/lib/domain-types";

export type { AttachmentTargetType, MaterialType };

export const CONTENT_WORKFLOW_STEPS = [
  {
    id: "library",
    label: "Organizar biblioteca",
    description: "Materiais privados ficam catalogados por dono, tipo, categoria e tags."
  },
  {
    id: "register",
    label: "Adicionar conteúdo",
    description: "Arquivos e links recebem metadados antes de serem usados na mentoria."
  },
  {
    id: "attach",
    label: "Vincular ao plano",
    description: "O mesmo material pode apoiar planos, aulas e sessões diferentes."
  },
  {
    id: "organize",
    label: "Organizar aulas",
    description: "A ordem, o objetivo e os materiais formam a sequência de aprendizado."
  },
  {
    id: "record",
    label: "Registrar a aula",
    description: "A sessão concluída preserva conteúdo aplicado, notas e próximas ações."
  }
] as const;

export type MaterialVisibility = "private" | "shared";

export type ContentMaterial = {
  id: string;
  ownerId: string;
  type: MaterialType;
  title: string;
  description: string;
  category: string;
  tags: string[];
  source: string;
  visibility: MaterialVisibility;
  createdAt: string;
};

export type MaterialAttachment = {
  id: string;
  materialId: string;
  targetType: AttachmentTargetType;
  targetId: string;
  sharedWithMentee: boolean;
};

export function getMaterialTypeLabel(type: MaterialType) {
  const labels: Record<MaterialType, string> = {
    html: "HTML",
    pdf: "PDF",
    presentation: "Apresentação",
    markdown: "Markdown",
    text: "Texto",
    image: "Imagem",
    external_link: "Link externo",
    repository: "Repositório"
  };

  return labels[type];
}

export function getVisibleMaterialsForMentee(
  materials: ContentMaterial[],
  attachments: MaterialAttachment[],
  allowedTargetIds: string[]
) {
  const sharedMaterialIds = new Set(
    attachments
      .filter((attachment) => attachment.sharedWithMentee && allowedTargetIds.includes(attachment.targetId))
      .map((attachment) => attachment.materialId)
  );

  return materials.filter((material) => sharedMaterialIds.has(material.id));
}

export const initialContentMaterials: ContentMaterial[] = [
  {
    id: "material-html-responsive",
    ownerId: "mentor-preview",
    type: "html",
    title: "Slides de layout responsivo",
    description: "Apresentação exportada em HTML com exemplos de Grid, Flexbox e breakpoints.",
    category: "Frontend",
    tags: ["css", "responsividade", "slides"],
    source: "layout-responsivo.html",
    visibility: "shared",
    createdAt: "2026-10-10T14:00:00-03:00"
  },
  {
    id: "material-pdf-git",
    ownerId: "mentor-preview",
    type: "pdf",
    title: "Guia prático de Git",
    description: "Resumo do fluxo diário com branches, commits e revisão de código.",
    category: "Ferramentas",
    tags: ["git", "github", "guia"],
    source: "guia-git.pdf",
    visibility: "private",
    createdAt: "2026-10-08T10:30:00-03:00"
  },
  {
    id: "material-md-checklist",
    ownerId: "mentor-preview",
    type: "markdown",
    title: "Checklist de revisão de projeto",
    description: "Perguntas para revisar arquitetura, acessibilidade e clareza do README.",
    category: "Carreira",
    tags: ["checklist", "portfólio", "revisão"],
    source: "checklist-projeto.md",
    visibility: "shared",
    createdAt: "2026-10-05T09:00:00-03:00"
  },
  {
    id: "material-repository-exercises",
    ownerId: "mentor-preview",
    type: "repository",
    title: "Exercícios de JavaScript",
    description: "Repositório com desafios progressivos e exemplos de solução.",
    category: "JavaScript",
    tags: ["javascript", "exercícios", "código"],
    source: "https://github.com/exemplo/exercicios-javascript",
    visibility: "private",
    createdAt: "2026-09-28T18:00:00-03:00"
  },
  {
    id: "material-link-accessibility",
    ownerId: "mentor-preview",
    type: "external_link",
    title: "Referência de acessibilidade web",
    description: "Documentação externa para consulta durante exercícios semânticos.",
    category: "Frontend",
    tags: ["html", "acessibilidade", "referência"],
    source: "https://developer.mozilla.org/pt-BR/docs/Web/Accessibility",
    visibility: "shared",
    createdAt: "2026-09-20T11:00:00-03:00"
  }
];

export function filterMaterials(
  materials: ContentMaterial[],
  query: string,
  type: MaterialType | "all",
  category: string | "all"
) {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

  return materials.filter((material) => {
    const searchable = [material.title, material.description, material.category, ...material.tags]
      .join(" ")
      .toLocaleLowerCase("pt-BR");
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesType = type === "all" || material.type === type;
    const matchesCategory = category === "all" || material.category === category;

    return matchesQuery && matchesType && matchesCategory;
  });
}

export function getMaterialOpenMode(material: ContentMaterial) {
  if (material.type === "html") return "isolated_preview" as const;
  if (material.type === "external_link" || material.type === "repository") return "external_tab" as const;
  return "download_or_preview" as const;
}

export function canManageMaterial(material: ContentMaterial, userId: string, isAdmin = false) {
  return isAdmin || material.ownerId === userId;
}

const FILE_TYPE_BY_EXTENSION: Record<string, MaterialType> = {
  html: "html",
  htm: "html",
  pdf: "pdf",
  ppt: "presentation",
  pptx: "presentation",
  odp: "presentation",
  md: "markdown",
  txt: "text",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image"
};

export type MaterialMetadataInput = {
  ownerId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
};

function validateMaterialMetadata(input: MaterialMetadataInput) {
  if (!input.title.trim()) throw new Error("Informe um título para o material.");
  if (!input.category.trim()) throw new Error("Informe uma categoria para organizar o material.");
}

export function createMaterialFromFile(
  input: MaterialMetadataInput & { fileName: string; now?: string }
): ContentMaterial {
  validateMaterialMetadata(input);
  const extension = input.fileName.split(".").pop()?.toLowerCase() ?? "";
  const type = FILE_TYPE_BY_EXTENSION[extension];

  if (!type) {
    throw new Error("Formato não suportado. Use HTML, PDF, apresentação, Markdown, texto ou imagem.");
  }

  return {
    id: `material-${Date.now()}`,
    ownerId: input.ownerId,
    type,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category.trim(),
    tags: input.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean),
    source: input.fileName,
    visibility: "private",
    createdAt: input.now ?? new Date().toISOString()
  };
}

export function createMaterialFromUrl(
  input: MaterialMetadataInput & { url: string; now?: string }
): ContentMaterial {
  validateMaterialMetadata(input);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(input.url);
  } catch {
    throw new Error("Informe uma URL completa e válida.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("A URL deve usar HTTP ou HTTPS.");
  }

  return {
    id: `material-${Date.now()}`,
    ownerId: input.ownerId,
    type: parsedUrl.hostname.toLowerCase().includes("github.com") ? "repository" : "external_link",
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category.trim(),
    tags: input.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean),
    source: parsedUrl.toString(),
    visibility: "private",
    createdAt: input.now ?? new Date().toISOString()
  };
}

export function createMaterialAttachment(
  materialId: string,
  targetType: AttachmentTargetType,
  targetId: string,
  sharedWithMentee: boolean
): MaterialAttachment {
  if (!materialId || !targetId) throw new Error("Escolha o material e o destino do anexo.");

  return {
    id: `attachment-${materialId}-${targetType}-${targetId}`,
    materialId,
    targetType,
    targetId,
    sharedWithMentee
  };
}

export type OrganizedLessonStatus = LessonStatus;

export type OrganizedLesson = {
  id: string;
  planId: string;
  title: string;
  description: string;
  order: number;
  objective: string;
  topics: string[];
  expectedDuration: string;
  materialIds: string[];
  status: OrganizedLessonStatus;
  nextSessionLabel?: string;
  completedAt?: string;
};

export const initialOrganizedLessons: OrganizedLesson[] = [
  {
    id: "lesson-foundations",
    planId: "plan-preview",
    title: "Revisão de fundamentos",
    description: "Diagnóstico prático da base de programação.",
    order: 1,
    objective: "Identificar pontos fortes e lacunas antes da trilha principal.",
    topics: ["Lógica", "Funções", "Estruturas de dados"],
    expectedDuration: "60 min",
    materialIds: [],
    status: "completed",
    completedAt: "2026-10-13T20:00:00-03:00"
  },
  {
    id: "lesson-responsive",
    planId: "plan-preview",
    title: "Layout responsivo",
    description: "Construção de interfaces adaptáveis com CSS moderno.",
    order: 2,
    objective: "Aplicar Grid, Flexbox e breakpoints em um painel real.",
    topics: ["Grid", "Flexbox", "Media queries"],
    expectedDuration: "90 min",
    materialIds: ["material-html-responsive"],
    status: "scheduled",
    nextSessionLabel: "22 out, 19:00"
  },
  {
    id: "lesson-git",
    planId: "plan-preview",
    title: "Fluxo com Git e GitHub",
    description: "Rotina segura para colaboração e revisão de código.",
    order: 3,
    objective: "Usar branches, commits e pull requests com clareza.",
    topics: ["Commits", "Branches", "Pull requests"],
    expectedDuration: "75 min",
    materialIds: [],
    status: "not_started"
  }
];

export function getOrganizedLessonStatusLabel(status: OrganizedLessonStatus) {
  const labels: Record<OrganizedLessonStatus, string> = {
    not_started: "Não iniciada",
    scheduled: "Agendada",
    in_progress: "Em andamento",
    completed: "Concluída",
    skipped: "Pulada"
  };

  return labels[status];
}

export function createManualLesson(
  input: Omit<OrganizedLesson, "id" | "order" | "status" | "materialIds">,
  currentLessonCount: number
): OrganizedLesson {
  if (!input.title.trim() || !input.objective.trim()) {
    throw new Error("Título e objetivo são obrigatórios para criar uma aula.");
  }

  return {
    ...input,
    id: `lesson-manual-${Date.now()}`,
    title: input.title.trim(),
    objective: input.objective.trim(),
    description: input.description.trim(),
    topics: input.topics.map((topic) => topic.trim()).filter(Boolean),
    order: currentLessonCount + 1,
    materialIds: [],
    status: "not_started"
  };
}

export function reorderLesson(
  lessons: OrganizedLesson[],
  lessonId: string,
  direction: "up" | "down"
) {
  const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= lessons.length) return lessons;

  const next = [...lessons];
  [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
  return next.map((lesson, index) => ({ ...lesson, order: index + 1 }));
}

export function attachMaterialToLesson(
  lessons: OrganizedLesson[],
  lessonId: string,
  materialId: string
) {
  return lessons.map((lesson) => {
    if (lesson.id !== lessonId || lesson.materialIds.includes(materialId)) return lesson;
    return { ...lesson, materialIds: [...lesson.materialIds, materialId] };
  });
}

export type ClassSessionStatus = SessionStatus;

export type ClassSessionDetail = {
  id: string;
  mentorId: string;
  menteeId: string;
  planId: string;
  lessonId?: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualCompletionDate?: string;
  status: ClassSessionStatus;
  appliedContent: string;
  mentorNotes: string;
  sharedNotes: string;
  nextActions: string;
};

export const initialClassSessions: ClassSessionDetail[] = [
  {
    id: "session-foundations-history",
    mentorId: "mentor-preview",
    menteeId: "bruno-souza",
    planId: "plan-preview",
    lessonId: "lesson-foundations",
    scheduledStart: "2026-10-13T19:00",
    scheduledEnd: "2026-10-13T20:00",
    actualCompletionDate: "2026-10-13T20:00",
    status: "completed",
    appliedContent: "Exercícios de lógica, funções pequenas e decomposição de problemas.",
    mentorNotes: "Reforçar laços aninhados na próxima revisão.",
    sharedNotes: "Boa evolução ao explicar cada decisão antes de codificar.",
    nextActions: "Resolver dois exercícios de repetição."
  },
  {
    id: "session-responsive-upcoming",
    mentorId: "mentor-preview",
    menteeId: "bruno-souza",
    planId: "plan-preview",
    lessonId: "lesson-responsive",
    scheduledStart: "2026-10-22T19:00",
    scheduledEnd: "2026-10-22T20:30",
    status: "confirmed",
    appliedContent: "",
    mentorNotes: "",
    sharedNotes: "",
    nextActions: ""
  }
];

export function getClassSessionStatusLabel(status: ClassSessionStatus) {
  const labels: Record<ClassSessionStatus, string> = {
    proposed: "Proposta",
    confirmed: "Confirmada",
    completed: "Concluída",
    canceled: "Cancelada",
    missed: "Não realizada"
  };

  return labels[status];
}

export function completeClassSession(
  sessions: ClassSessionDetail[],
  lessons: OrganizedLesson[],
  sessionId: string,
  details: Pick<ClassSessionDetail, "appliedContent" | "mentorNotes" | "sharedNotes" | "nextActions">,
  completedAt: string
) {
  if (!details.appliedContent.trim()) {
    throw new Error("Registre o conteúdo aplicado antes de concluir a sessão.");
  }

  if (!details.nextActions.trim()) {
    throw new Error("Defina ao menos uma próxima ação antes de concluir a sessão.");
  }

  const targetSession = sessions.find((session) => session.id === sessionId);
  if (!targetSession) throw new Error("Sessão não encontrada.");

  const nextSessions = sessions.map((session) =>
    session.id === sessionId
      ? {
          ...session,
          ...details,
          status: "completed" as const,
          actualCompletionDate: completedAt
        }
      : session
  );
  const nextLessons = targetSession.lessonId
    ? lessons.map((lesson) =>
        lesson.id === targetSession.lessonId
          ? { ...lesson, status: "completed" as const, completedAt }
          : lesson
      )
    : lessons;

  return { sessions: nextSessions, lessons: nextLessons };
}
