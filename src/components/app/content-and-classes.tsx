"use client";

import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  FileCode2,
  FileText,
  FileUp,
  Filter,
  FolderOpen,
  Globe2,
  Link2,
  LockKeyhole,
  NotebookPen,
  Paperclip,
  Plus,
  Search,
  Tags,
  UserRound
} from "lucide-react";
import { useMemo, useState } from "react";
import { MaterialCard } from "@/components/app/material-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import {
  CONTENT_WORKFLOW_STEPS,
  attachMaterialToLesson,
  completeClassSession,
  createManualLesson,
  createMaterialAttachment,
  createMaterialFromFile,
  createMaterialFromUrl,
  filterMaterials,
  getMaterialOpenMode,
  getMaterialTypeLabel,
  getOrganizedLessonStatusLabel,
  getClassSessionStatusLabel,
  initialClassSessions,
  initialContentMaterials,
  initialOrganizedLessons,
  reorderLesson,
  type AttachmentTargetType,
  type ClassSessionDetail,
  type ContentMaterial,
  type MaterialAttachment,
  type MaterialType,
  type OrganizedLesson
} from "@/lib/content-and-classes";
import { MATERIAL_TYPES } from "@/lib/domain-types";
import styles from "./content-and-classes.module.css";

const materialTypes: Array<MaterialType | "all"> = ["all", ...MATERIAL_TYPES];

function MaterialIcon({ type }: { type: MaterialType }) {
  if (type === "html") return <FileCode2 size={20} strokeWidth={1.8} />;
  if (type === "external_link" || type === "repository") return <Link2 size={20} strokeWidth={1.8} />;
  return <FileText size={20} strokeWidth={1.8} />;
}

export function ContentAndClasses() {
  const [materials, setMaterials] = useState<ContentMaterial[]>(initialContentMaterials);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MaterialType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [previewMaterialId, setPreviewMaterialId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<MaterialAttachment[]>([
    {
      id: "attachment-html-lesson",
      materialId: "material-html-responsive",
      targetType: "lesson",
      targetId: "lesson-responsive",
      sharedWithMentee: true
    },
    {
      id: "attachment-checklist-plan",
      materialId: "material-md-checklist",
      targetType: "plan",
      targetId: "plan-preview",
      sharedWithMentee: true
    }
  ]);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadDraft, setUploadDraft] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    url: "",
    targetType: "none" as AttachmentTargetType | "none",
    sharedWithMentee: false
  });
  const [uploadFeedback, setUploadFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [lessons, setLessons] = useState<OrganizedLesson[]>(initialOrganizedLessons);
  const [selectedLessonId, setSelectedLessonId] = useState(initialOrganizedLessons[1].id);
  const [lessonDraft, setLessonDraft] = useState({
    title: "",
    description: "",
    objective: "",
    topics: "",
    expectedDuration: "60 min"
  });
  const [materialToAttach, setMaterialToAttach] = useState(initialContentMaterials[0].id);
  const [lessonFeedback, setLessonFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [sessions, setSessions] = useState<ClassSessionDetail[]>(initialClassSessions);
  const [selectedSessionId, setSelectedSessionId] = useState(initialClassSessions[1].id);
  const [sessionDraft, setSessionDraft] = useState({
    appliedContent: "",
    mentorNotes: "",
    sharedNotes: "",
    nextActions: ""
  });
  const [sessionFeedback, setSessionFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(materials.map((material) => material.category))).sort(),
    [materials]
  );
  const visibleMaterials = useMemo(
    () => filterMaterials(materials, query, typeFilter, categoryFilter),
    [materials, query, typeFilter, categoryFilter]
  );
  const previewMaterial = materials.find((material) => material.id === previewMaterialId) ?? null;
  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? initialClassSessions[0];

  function submitMaterial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const metadata = {
        ownerId: "mentor-preview",
        title: uploadDraft.title,
        description: uploadDraft.description,
        category: uploadDraft.category,
        tags: uploadDraft.tags.split(",")
      };
      const material = uploadMode === "file"
        ? createMaterialFromFile({ ...metadata, fileName: selectedFileName })
        : createMaterialFromUrl({ ...metadata, url: uploadDraft.url });

      setMaterials((current) => [material, ...current]);

      if (uploadDraft.targetType !== "none") {
        const targetIds: Record<AttachmentTargetType, string> = {
          plan: "plan-preview",
          lesson: "lesson-responsive",
          session: "session-upcoming"
        };
        const attachment = createMaterialAttachment(
          material.id,
          uploadDraft.targetType,
          targetIds[uploadDraft.targetType],
          uploadDraft.sharedWithMentee
        );
        setAttachments((current) => [...current, attachment]);
      }

      setUploadFeedback({
        tone: "success",
        message: `${material.title} foi adicionado à biblioteca${uploadDraft.targetType === "none" ? "." : " e anexado ao contexto escolhido."}`
      });
      setSelectedFileName("");
      setUploadDraft({
        title: "",
        description: "",
        category: "",
        tags: "",
        url: "",
        targetType: "none",
        sharedWithMentee: false
      });
    } catch (error) {
      setUploadFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível adicionar o material."
      });
    }
  }

  function submitManualLesson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const lesson = createManualLesson(
        {
          planId: "plan-preview",
          title: lessonDraft.title,
          description: lessonDraft.description,
          objective: lessonDraft.objective,
          topics: lessonDraft.topics.split(","),
          expectedDuration: lessonDraft.expectedDuration
        },
        lessons.length
      );
      setLessons((current) => [...current, lesson]);
      setSelectedLessonId(lesson.id);
      setLessonDraft({ title: "", description: "", objective: "", topics: "", expectedDuration: "60 min" });
      setLessonFeedback({ tone: "success", message: "Aula criada e adicionada ao final do plano." });
    } catch (error) {
      setLessonFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível criar a aula."
      });
    }
  }

  function attachSelectedMaterial() {
    const lesson = lessons.find((item) => item.id === selectedLessonId);
    const material = materials.find((item) => item.id === materialToAttach);
    if (!lesson || !material) {
      setLessonFeedback({ tone: "error", message: "Escolha uma aula e um material." });
      return;
    }

    setLessons((current) => attachMaterialToLesson(current, lesson.id, material.id));
    const attachment = createMaterialAttachment(material.id, "lesson", lesson.id, true);
    setAttachments((current) => current.some((item) => item.id === attachment.id) ? current : [...current, attachment]);
    setLessonFeedback({ tone: "success", message: `${material.title} foi anexado a ${lesson.title}.` });
  }

  function selectSession(session: ClassSessionDetail) {
    setSelectedSessionId(session.id);
    setSessionDraft({
      appliedContent: session.appliedContent,
      mentorNotes: session.mentorNotes,
      sharedNotes: session.sharedNotes,
      nextActions: session.nextActions
    });
    setSessionFeedback(null);
  }

  function finishSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = completeClassSession(
        sessions,
        lessons,
        selectedSession.id,
        sessionDraft,
        new Date().toISOString()
      );
      setSessions(result.sessions);
      setLessons(result.lessons);
      setSessionFeedback({
        tone: "success",
        message: "Sessão concluída, histórico salvo e progresso da aula atualizado."
      });
    } catch (error) {
      setSessionFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível concluir a sessão."
      });
    }
  }

  return (
    <section className={styles.contentArea} aria-labelledby="content-classes-title">
      <div className={styles.sectionHeading}>
        <span>// 03 Conteúdo e aulas</span>
        <h2 id="content-classes-title">Materiais preparados antes e registrados depois da aula</h2>
        <p>
          A biblioteca pertence ao mentor. O compartilhamento acontece somente quando um material
          é anexado ao plano, à aula ou à sessão correta.
        </p>
      </div>

      <GlassPanel strong className={styles.workflowPanel}>
        <div className={styles.panelHeading}>
          <div className={styles.headingIcon}><BookOpenCheck size={20} strokeWidth={1.8} /></div>
          <div>
            <span>Fluxo de conteúdo</span>
            <h3>Da biblioteca ao histórico da sessão</h3>
          </div>
          <PillChip>Supabase no final</PillChip>
        </div>
        <ol className={styles.workflowList}>
          {CONTENT_WORKFLOW_STEPS.map((step, index) => (
            <li key={step.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.label}</strong>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </GlassPanel>

      <GlassPanel className={styles.libraryPanel}>
        <div className={styles.panelHeading}>
          <div className={styles.headingIcon}><FolderOpen size={20} strokeWidth={1.8} /></div>
          <div>
            <span>Biblioteca do mentor</span>
            <h3>Encontrar e reutilizar materiais</h3>
          </div>
          <PillChip tone="muted">{visibleMaterials.length} materiais</PillChip>
        </div>

        <div className={styles.filters}>
          <label className={styles.searchField}>
            <Search size={17} />
            <input
              type="search"
              placeholder="Buscar por título, tag ou categoria"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            <Filter size={16} />
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as MaterialType | "all")}>
              {materialTypes.map((type) => (
                <option key={type} value={type}>{type === "all" ? "Todos os tipos" : getMaterialTypeLabel(type)}</option>
              ))}
            </select>
          </label>
          <label>
            <Tags size={16} />
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">Todas as categorias</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
        </div>

        {visibleMaterials.length === 0 ? (
          <div className={styles.emptyLibrary}>
            <Search size={22} />
            <strong>Nenhum material encontrado</strong>
            <span>Altere a busca ou limpe os filtros para ver a biblioteca.</span>
          </div>
        ) : (
          <div className={styles.materialGrid}>
            {visibleMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                icon={<MaterialIcon type={material.type} />}
                typeLabel={getMaterialTypeLabel(material.type)}
                category={material.category}
                title={material.title}
                description={material.description}
                tags={material.tags}
                status={material.visibility === "shared" ? "Em uso" : "Privado"}
                statusTone={material.visibility === "shared" ? "default" : "muted"}
                meta={<><LockKeyhole size={14} /> Proprietário: você</>}
                action={(
                  <button type="button" onClick={() => setPreviewMaterialId(material.id)}>
                    <Eye size={15} /> Abrir
                  </button>
                )}
              />
            ))}
          </div>
        )}

        {previewMaterial ? (
          <div className={styles.previewPanel} role="status">
            <div>
              <span>Prévia segura</span>
              <strong>{previewMaterial.title}</strong>
              <p>{previewMaterial.source}</p>
            </div>
            <div>
              <PillChip tone="warning">
                {getMaterialOpenMode(previewMaterial) === "isolated_preview"
                  ? "HTML isolado do app"
                  : getMaterialOpenMode(previewMaterial) === "external_tab"
                    ? "Nova aba externa"
                    : "Prévia ou download"}
              </PillChip>
              <GlassButton
                type="button"
                variant="secondary"
                onClick={() => setPreviewMaterialId(null)}
                icon={<ArrowUpRight size={16} />}
              >
                Fechar prévia
              </GlassButton>
            </div>
          </div>
        ) : null}
      </GlassPanel>

      <div className={styles.uploadGrid}>
        <GlassPanel className={styles.uploadPanel}>
          <div className={styles.panelHeading}>
            <div className={styles.headingIcon}><FileUp size={20} strokeWidth={1.8} /></div>
            <div>
              <span>Novo material</span>
              <h3>Adicionar arquivo ou link</h3>
            </div>
          </div>

          <div className={styles.modeSwitch} role="group" aria-label="Origem do material">
            <button type="button" aria-pressed={uploadMode === "file"} onClick={() => setUploadMode("file")}>
              <FileUp size={16} /> Arquivo
            </button>
            <button type="button" aria-pressed={uploadMode === "url"} onClick={() => setUploadMode("url")}>
              <Globe2 size={16} /> URL externa
            </button>
          </div>

          <form className={styles.uploadForm} onSubmit={submitMaterial}>
            {uploadMode === "file" ? (
              <label className={styles.fileDrop}>
                <FileUp size={22} />
                <strong>{selectedFileName || "Escolha um arquivo"}</strong>
                <span>HTML, PDF, apresentação, Markdown, texto ou imagem</span>
                <input
                  type="file"
                  accept=".html,.htm,.pdf,.ppt,.pptx,.odp,.md,.txt,image/*"
                  onChange={(event) => setSelectedFileName(event.target.files?.[0]?.name ?? "")}
                />
              </label>
            ) : (
              <label>
                URL
                <input
                  type="url"
                  placeholder="https://..."
                  value={uploadDraft.url}
                  onChange={(event) => setUploadDraft((current) => ({ ...current, url: event.target.value }))}
                />
              </label>
            )}
            <div className={styles.twoFields}>
              <label>
                Título
                <input value={uploadDraft.title} onChange={(event) => setUploadDraft((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label>
                Categoria
                <input placeholder="Ex.: Frontend" value={uploadDraft.category} onChange={(event) => setUploadDraft((current) => ({ ...current, category: event.target.value }))} />
              </label>
            </div>
            <label>
              Descrição
              <textarea rows={3} value={uploadDraft.description} onChange={(event) => setUploadDraft((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label>
              Tags separadas por vírgula
              <input placeholder="css, slides, responsividade" value={uploadDraft.tags} onChange={(event) => setUploadDraft((current) => ({ ...current, tags: event.target.value }))} />
            </label>
            <div className={styles.twoFields}>
              <label>
                Anexar agora
                <select value={uploadDraft.targetType} onChange={(event) => setUploadDraft((current) => ({
                  ...current,
                  targetType: event.target.value as AttachmentTargetType | "none"
                }))}>
                  <option value="none">Somente biblioteca</option>
                  <option value="plan">Plano atual</option>
                  <option value="lesson">Aula selecionada</option>
                  <option value="session">Próxima sessão</option>
                </select>
              </label>
              <label className={styles.checkboxField}>
                <input
                  type="checkbox"
                  disabled={uploadDraft.targetType === "none"}
                  checked={uploadDraft.sharedWithMentee}
                  onChange={(event) => setUploadDraft((current) => ({ ...current, sharedWithMentee: event.target.checked }))}
                />
                Compartilhar com mentorado
              </label>
            </div>
            {uploadFeedback ? <p className={styles[uploadFeedback.tone]} role="status">{uploadFeedback.message}</p> : null}
            <GlassButton type="submit" icon={<CheckCircle2 size={16} />}>Adicionar material</GlassButton>
          </form>
        </GlassPanel>

        <GlassPanel className={styles.safetyPanel}>
          <div className={styles.panelHeading}>
            <div className={styles.headingIcon}><LockKeyhole size={20} strokeWidth={1.8} /></div>
            <div>
              <span>Segurança e acesso</span>
              <h3>Conteúdo privado por padrão</h3>
            </div>
          </div>
          <ul>
            <li><strong>{materials.length}</strong><span>materiais do mentor atual</span></li>
            <li><strong>{attachments.length}</strong><span>anexos com destino explícito</span></li>
            <li><strong>{attachments.filter((item) => item.sharedWithMentee).length}</strong><span>anexos visíveis ao mentorado</span></li>
          </ul>
          <div className={styles.safetyNote}>
            <FileCode2 size={19} />
            <div>
              <strong>HTML nunca é executado dentro do workspace</strong>
              <p>A integração futura deve armazenar o arquivo no Supabase Storage e abrir a prévia em rota isolada ou como download.</p>
            </div>
          </div>
          <div className={styles.attachmentLegend}>
            <Paperclip size={17} />
            <span>Adicionar à biblioteca não torna o conteúdo público. O mentorado só recebe acesso por um anexo compartilhado.</span>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel strong className={styles.lessonPanel}>
        <div className={styles.panelHeading}>
          <div className={styles.headingIcon}><BookOpenCheck size={20} strokeWidth={1.8} /></div>
          <div>
            <span>Organização das aulas</span>
            <h3>Sequência explícita dentro do plano</h3>
          </div>
          <PillChip>{lessons.length} aulas</PillChip>
        </div>

        <div className={styles.lessonWorkspace}>
          <div className={styles.lessonSequence}>
            <div className={styles.miniHeading}>
              <strong>Plano · Trilha frontend</strong>
              <span>Reordene sem apagar o histórico concluído</span>
            </div>
            <ol>
              {lessons.map((lesson, index) => (
                <li
                  className={selectedLessonId === lesson.id ? styles.activeLesson : ""}
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                >
                  <span className={styles.lessonNumber}>{String(lesson.order).padStart(2, "0")}</span>
                  <div>
                    <small>{getOrganizedLessonStatusLabel(lesson.status)} · {lesson.expectedDuration}</small>
                    <strong>{lesson.title}</strong>
                    <p>{lesson.objective}</p>
                    <span>{lesson.materialIds.length} materiais{lesson.nextSessionLabel ? ` · Próxima sessão: ${lesson.nextSessionLabel}` : ""}</span>
                  </div>
                  <div className={styles.orderActions}>
                    <button
                      type="button"
                      aria-label={`Mover ${lesson.title} para cima`}
                      disabled={index === 0}
                      onClick={(event) => {
                        event.stopPropagation();
                        setLessons((current) => reorderLesson(current, lesson.id, "up"));
                      }}
                    ><ChevronUp size={16} /></button>
                    <button
                      type="button"
                      aria-label={`Mover ${lesson.title} para baixo`}
                      disabled={index === lessons.length - 1}
                      onClick={(event) => {
                        event.stopPropagation();
                        setLessons((current) => reorderLesson(current, lesson.id, "down"));
                      }}
                    ><ChevronDown size={16} /></button>
                  </div>
                </li>
              ))}
            </ol>

            <div className={styles.attachControl}>
              <label>
                Material para a aula selecionada
                <select value={materialToAttach} onChange={(event) => setMaterialToAttach(event.target.value)}>
                  {materials.map((material) => <option key={material.id} value={material.id}>{material.title}</option>)}
                </select>
              </label>
              <GlassButton type="button" variant="secondary" onClick={attachSelectedMaterial} icon={<Paperclip size={16} />}>
                Anexar e compartilhar
              </GlassButton>
            </div>
          </div>

          <form className={styles.lessonForm} onSubmit={submitManualLesson}>
            <div className={styles.miniHeading}>
              <strong>Criar aula manualmente</strong>
              <span>Ela pode existir antes de uma sessão</span>
            </div>
            <label>
              Título
              <input value={lessonDraft.title} onChange={(event) => setLessonDraft((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <label>
              Objetivo
              <textarea rows={2} value={lessonDraft.objective} onChange={(event) => setLessonDraft((current) => ({ ...current, objective: event.target.value }))} />
            </label>
            <label>
              Descrição
              <textarea rows={2} value={lessonDraft.description} onChange={(event) => setLessonDraft((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <div className={styles.twoFields}>
              <label>
                Tópicos
                <input placeholder="React, estado, composição" value={lessonDraft.topics} onChange={(event) => setLessonDraft((current) => ({ ...current, topics: event.target.value }))} />
              </label>
              <label>
                Duração esperada
                <input value={lessonDraft.expectedDuration} onChange={(event) => setLessonDraft((current) => ({ ...current, expectedDuration: event.target.value }))} />
              </label>
            </div>
            <GlassButton type="submit" icon={<Plus size={16} />}>Adicionar aula</GlassButton>
          </form>
        </div>

        {lessonFeedback ? <p className={styles[lessonFeedback.tone]} role="status">{lessonFeedback.message}</p> : null}

        <div className={styles.menteeLessonView}>
          <div><CalendarDays size={18} /><strong>Visão do mentorado</strong></div>
          <span>{lessons.filter((lesson) => lesson.status === "completed").length} concluídas</span>
          <span>{lessons.filter((lesson) => lesson.status === "scheduled").length} próximas</span>
          <span>{attachments.filter((item) => item.targetType === "lesson" && item.sharedWithMentee).length} materiais compartilhados</span>
          <span>Próximas ações aparecem após a sessão</span>
        </div>
      </GlassPanel>

      <GlassPanel className={styles.sessionPanel}>
        <div className={styles.panelHeading}>
          <div className={styles.headingIcon}><NotebookPen size={20} strokeWidth={1.8} /></div>
          <div>
            <span>Registros de sessão</span>
            <h3>Preservar o que realmente aconteceu em aula</h3>
          </div>
          <PillChip tone="muted">{sessions.filter((session) => session.status === "completed").length} concluídas</PillChip>
        </div>

        <div className={styles.sessionWorkspace}>
          <div className={styles.sessionHistory}>
            <div className={styles.miniHeading}>
              <strong>Histórico e próximas sessões</strong>
              <span>Mentor e mentorado conectados</span>
            </div>
            {sessions.map((session) => {
              const lesson = lessons.find((item) => item.id === session.lessonId);
              return (
                <button
                  className={selectedSessionId === session.id ? styles.activeSession : ""}
                  type="button"
                  key={session.id}
                  onClick={() => selectSession(session)}
                >
                  <span className={styles.sessionDate}>
                    {session.scheduledStart.slice(8, 10)}/{session.scheduledStart.slice(5, 7)}
                  </span>
                  <span>
                    <small>{getClassSessionStatusLabel(session.status)}</small>
                    <strong>{lesson?.title ?? "Sessão geral do plano"}</strong>
                    <em>{session.scheduledStart.slice(11)}–{session.scheduledEnd.slice(11)}</em>
                  </span>
                  <PillChip tone={session.status === "completed" ? "default" : "warning"}>
                    {session.status === "completed" ? "Histórico" : "Próxima"}
                  </PillChip>
                </button>
              );
            })}

            <div className={styles.sessionContext}>
              <span><UserRound size={15} /> Mentor atual</span>
              <span><UserRound size={15} /> Bruno Souza</span>
              <span><BookOpenCheck size={15} /> Trilha frontend</span>
            </div>
          </div>

          <form className={styles.sessionForm} onSubmit={finishSession}>
            <div className={styles.miniHeading}>
              <strong>{selectedSession.status === "completed" ? "Revisar registro" : "Concluir sessão"}</strong>
              <span>A aula vinculada será atualizada</span>
            </div>
            <label>
              Conteúdo aplicado
              <textarea rows={3} value={sessionDraft.appliedContent} onChange={(event) => setSessionDraft((current) => ({ ...current, appliedContent: event.target.value }))} />
            </label>
            <label>
              Notas privadas do mentor
              <textarea rows={2} value={sessionDraft.mentorNotes} onChange={(event) => setSessionDraft((current) => ({ ...current, mentorNotes: event.target.value }))} />
            </label>
            <label>
              Notas compartilhadas
              <textarea rows={2} value={sessionDraft.sharedNotes} onChange={(event) => setSessionDraft((current) => ({ ...current, sharedNotes: event.target.value }))} />
            </label>
            <label>
              Próximas ações
              <textarea rows={2} value={sessionDraft.nextActions} onChange={(event) => setSessionDraft((current) => ({ ...current, nextActions: event.target.value }))} />
            </label>
            {sessionFeedback ? <p className={styles[sessionFeedback.tone]} role="status">{sessionFeedback.message}</p> : null}
            <GlassButton type="submit" icon={<CheckCircle2 size={16} />}>
              {selectedSession.status === "completed" ? "Atualizar registro" : "Concluir e atualizar progresso"}
            </GlassButton>
          </form>
        </div>

        <div className={styles.sessionAudit}>
          <strong>Histórico útil</strong>
          <span>Data planejada</span>
          <span>Data real de conclusão</span>
          <span>Conteúdo aplicado</span>
          <span>Notas privadas e compartilhadas</span>
          <span>Próximas ações</span>
        </div>
      </GlassPanel>
    </section>
  );
}
