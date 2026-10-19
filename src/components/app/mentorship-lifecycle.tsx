"use client";

import {
  ArrowRight,
  CalendarRange,
  Check,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Clock3,
  CopyPlus,
  LibraryBig,
  MailPlus,
  MessageSquarePlus,
  Play,
  Route,
  Save,
  TrendingUp,
  UserPlus,
  UsersRound
} from "lucide-react";
import { useMemo, useState } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import {
  canRequestRelationship,
  calculateProgress,
  completeSessionAndLesson,
  copyTemplatesToPlan,
  getLessonStatusLabel,
  getPlanStatusLabel,
  lifecycleStepDefinitions,
  lessonTemplates,
  needsMentorFollowUp,
  prepareMenteeInvitation,
  type AvailableMentee,
  type ClassSessionRecord,
  type MentorshipPlanInput,
  type PlanLesson,
  type ProgressNote,
  type RelationshipKey,
  validatePlanForActivation
} from "@/lib/mentorship-lifecycle";
import { LESSON_STATUSES } from "@/lib/domain-types";
import styles from "./mentorship-lifecycle.module.css";

const mentorId = "mentor-preview";

const initialMentees: AvailableMentee[] = [
  {
    id: "ana-ribeiro",
    name: "Ana Ribeiro",
    email: "ana@example.com",
    focus: "Frontend e React",
    availability: "Terças à noite",
    availableForMentorship: true
  },
  {
    id: "bruno-souza",
    name: "Bruno Souza",
    email: "bruno@example.com",
    focus: "JavaScript e APIs",
    availability: "Sábados pela manhã",
    availableForMentorship: true
  },
  {
    id: "marina-costa",
    name: "Marina Costa",
    email: "marina@example.com",
    focus: "HTML e CSS",
    availability: "Indisponível agora",
    availableForMentorship: false
  }
];

const initialRelationships: RelationshipKey[] = [
  { mentorId, menteeId: "bruno-souza", status: "active" }
];

const initialPlanLessons: PlanLesson[] = copyTemplatesToPlan(
  lessonTemplates.slice(0, 3),
  "plan-preview"
).map((lesson, index) => ({
  ...lesson,
  status: index === 0 ? "completed" : index === 1 ? "scheduled" : "not_started"
}));

const initialSessions: ClassSessionRecord[] = [
  {
    id: "session-foundations",
    lessonId: initialPlanLessons[0].id,
    status: "completed",
    scheduledAt: "2026-10-13T19:00:00-03:00",
    completedAt: "2026-10-13T20:00:00-03:00"
  },
  {
    id: "session-git",
    lessonId: initialPlanLessons[1].id,
    status: "confirmed",
    scheduledAt: "2026-10-22T19:00:00-03:00"
  }
];

const initialProgressNotes: ProgressNote[] = [
  {
    id: "note-foundations",
    lessonId: initialPlanLessons[0].id,
    sessionId: "session-foundations",
    applied: "Exercícios de lógica e decomposição de problemas.",
    understood: "Condições e funções pequenas.",
    needsReview: "Laços aninhados.",
    nextAction: "Resolver dois exercícios antes da próxima aula.",
    confidence: "growing",
    sharedWithMentee: true
  }
];

const initialPlan: MentorshipPlanInput = {
  title: "Trilha de desenvolvimento frontend",
  mentorId,
  menteeId: "bruno-souza",
  relationshipId: "relationship-preview",
  startDate: "2026-10-20",
  expectedEndDate: "2027-01-20",
  durationLabel: "12 semanas",
  mainGoal: "",
  primaryContentArea: "Desenvolvimento frontend",
  topics: ["HTML semântico", "CSS responsivo", "JavaScript", "React"],
  status: "draft",
  description: "",
  expectedOutcomes: "Construir e publicar um projeto de portfólio.",
  sharedNotes: ""
};

type Feedback = { tone: "success" | "error"; message: string } | null;

export function MentorshipLifecycle() {
  const [relationships, setRelationships] = useState(initialRelationships);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<string | null>(null);
  const [relationshipFeedback, setRelationshipFeedback] = useState<Feedback>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState<Feedback>(null);
  const [plan, setPlan] = useState<MentorshipPlanInput>(initialPlan);
  const [planFeedback, setPlanFeedback] = useState<Feedback>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [lessons, setLessons] = useState<PlanLesson[]>(initialPlanLessons);
  const [templateFeedback, setTemplateFeedback] = useState<Feedback>(null);
  const [sessions, setSessions] = useState<ClassSessionRecord[]>(initialSessions);
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>(initialProgressNotes);
  const [noteDraft, setNoteDraft] = useState({
    applied: "",
    understood: "",
    needsReview: "",
    nextAction: "",
    confidence: "growing" as NonNullable<ProgressNote["confidence"]>,
    sharedWithMentee: true
  });
  const [progressFeedback, setProgressFeedback] = useState<Feedback>(null);

  const selectedMentee = useMemo(
    () => initialMentees.find((mentee) => mentee.id === selectedMenteeId) ?? null,
    [selectedMenteeId]
  );
  const progress = useMemo(
    () => calculateProgress(lessons, sessions, progressNotes),
    [lessons, sessions, progressNotes]
  );
  const followUpNeeded = useMemo(
    () => needsMentorFollowUp(lessons, progressNotes),
    [lessons, progressNotes]
  );

  function reviewRelationship() {
    if (!selectedMentee) {
      setRelationshipFeedback({ tone: "error", message: "Escolha um mentorado antes de continuar." });
      return;
    }

    const decision = canRequestRelationship(mentorId, selectedMentee, relationships);
    if (!decision.allowed) {
      setPendingConfirmation(null);
      setRelationshipFeedback({ tone: "error", message: decision.reason });
      return;
    }

    setRelationshipFeedback(null);
    setPendingConfirmation(selectedMentee.id);
  }

  function confirmRelationship() {
    if (!selectedMentee || pendingConfirmation !== selectedMentee.id) return;

    setRelationships((current) => [
      ...current,
      { mentorId, menteeId: selectedMentee.id, status: "requested" }
    ]);
    setPendingConfirmation(null);
    setRelationshipFeedback({
      tone: "success",
      message: `Solicitação enviada para ${selectedMentee.name}. O plano será a próxima ação após o aceite.`
    });
  }

  function submitInvitation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const invitation = prepareMenteeInvitation({
        email: inviteEmail,
        message: inviteMessage,
        invitedByMentorId: mentorId
      });

      setInviteFeedback({
        tone: "success",
        message: `Convite para ${invitation.email} preparado como mentorado e vinculado ao mentor atual.`
      });
      setInviteEmail("");
      setInviteMessage("");
    } catch (error) {
      setInviteFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível preparar o convite."
      });
    }
  }

  function updatePlan<Key extends keyof MentorshipPlanInput>(key: Key, value: MentorshipPlanInput[Key]) {
    setPlan((current) => ({ ...current, [key]: value }));
    setPlanFeedback(null);
  }

  function savePlan(status: "draft" | "active") {
    if (status === "active") {
      const validation = validatePlanForActivation(plan);
      if (!validation.valid) {
        setPlanFeedback({
          tone: "error",
          message: `Para ativar, preencha: ${validation.missingFields.join(", ")}.`
        });
        return;
      }
    }

    setPlan((current) => ({ ...current, status }));
    setPlanFeedback({
      tone: "success",
      message: status === "active" ? "Plano ativado e visível para o mentorado." : "Rascunho salvo."
    });
  }

  function toggleTemplate(templateId: string) {
    setSelectedTemplateIds((current) =>
      current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [...current, templateId]
    );
    setTemplateFeedback(null);
  }

  function addSelectedTemplates() {
    const selectedTemplates = lessonTemplates.filter((template) => selectedTemplateIds.includes(template.id));
    if (selectedTemplates.length === 0) {
      setTemplateFeedback({ tone: "error", message: "Selecione ao menos um template." });
      return;
    }

    const copies = copyTemplatesToPlan(selectedTemplates, "plan-preview", lessons.length);
    setLessons((current) => [...current, ...copies]);
    setSelectedTemplateIds([]);
    setTemplateFeedback({
      tone: "success",
      message: `${copies.length} ${copies.length === 1 ? "aula foi copiada" : "aulas foram copiadas"} para o plano e já podem ser editadas.`
    });
  }

  function renameLesson(lessonId: string, title: string) {
    setLessons((current) => current.map((lesson) => (lesson.id === lessonId ? { ...lesson, title } : lesson)));
  }

  function completeUpcomingSession() {
    const session = sessions.find((item) => item.status === "confirmed");
    if (!session) {
      setProgressFeedback({ tone: "error", message: "Não há sessão agendada para concluir." });
      return;
    }

    const result = completeSessionAndLesson(sessions, lessons, session.id, new Date().toISOString());
    setSessions(result.sessions);
    setLessons(result.lessons);
    setProgressFeedback({
      tone: "success",
      message: "Sessão concluída e status da aula atualizado automaticamente."
    });
  }

  function addProgressNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!noteDraft.applied.trim() || !noteDraft.nextAction.trim()) {
      setProgressFeedback({
        tone: "error",
        message: "Registre o que foi aplicado e a próxima ação."
      });
      return;
    }

    const latestSession = [...sessions].reverse().find((session) => session.status === "completed");
    setProgressNotes((current) => [
      ...current,
      {
        id: `note-${current.length + 1}`,
        lessonId: latestSession?.lessonId,
        sessionId: latestSession?.id,
        ...noteDraft
      }
    ]);
    setNoteDraft({
      applied: "",
      understood: "",
      needsReview: "",
      nextAction: "",
      confidence: "growing",
      sharedWithMentee: true
    });
    setProgressFeedback({ tone: "success", message: "Nota de progresso registrada." });
  }

  return (
    <section className={styles.lifecycle} aria-labelledby="lifecycle-title">
      <div className={styles.sectionHeading}>
        <span>// 02 Lifecycle</span>
        <h2 id="lifecycle-title">Da primeira conexão ao progresso acompanhado</h2>
        <p>
          A relação pode existir antes do plano. Depois do aceite, cada passo mantém aulas,
          sessões, notas e próximas ações no mesmo contexto.
        </p>
      </div>

      <GlassPanel strong className={styles.lifecycleMap}>
        <div className={styles.panelHeading}>
          <div className={styles.headingIcon}><Route size={20} strokeWidth={1.8} /></div>
          <div>
            <span>Fluxo completo</span>
            <h3>Oito estados para orientar a operação</h3>
          </div>
          <PillChip>Relação antes do plano</PillChip>
        </div>
        <ol className={styles.stepGrid}>
          {lifecycleStepDefinitions.map((item, index) => (
            <li key={item.step}>
              <span className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
              <p>{item.description}</p>
            </li>
          ))}
        </ol>
      </GlassPanel>

      <div className={styles.connectionGrid}>
        <GlassPanel className={styles.workspacePanel}>
          <div className={styles.panelHeading}>
            <div className={styles.headingIcon}><UsersRound size={20} strokeWidth={1.8} /></div>
            <div>
              <span>Mentorados disponíveis</span>
              <h3>Escolher alguém da plataforma</h3>
            </div>
          </div>

          <div className={styles.menteeList} role="radiogroup" aria-label="Escolha um mentorado">
            {initialMentees.map((mentee) => {
              const decision = canRequestRelationship(mentorId, mentee, relationships);
              const selected = selectedMenteeId === mentee.id;

              return (
                <button
                  className={[styles.menteeOption, selected ? styles.selected : ""].join(" ")}
                  key={mentee.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setSelectedMenteeId(mentee.id);
                    setPendingConfirmation(null);
                    setRelationshipFeedback(null);
                  }}
                >
                  <span className={styles.avatar}>{mentee.name.split(" ").map((part) => part[0]).join("")}</span>
                  <span className={styles.menteeCopy}>
                    <strong>{mentee.name}</strong>
                    <small>{mentee.focus} · {mentee.availability}</small>
                    {!decision.allowed ? <em>{decision.reason}</em> : null}
                  </span>
                  {selected ? <Check size={18} /> : <CircleDashed size={18} />}
                </button>
              );
            })}
          </div>

          {pendingConfirmation && selectedMentee ? (
            <div className={styles.confirmation} role="status">
              <div>
                <strong>Confirmar conexão com {selectedMentee.name}?</strong>
                <span>Uma solicitação será aberta; nenhuma relação duplicada será criada.</span>
              </div>
              <div className={styles.inlineActions}>
                <button type="button" onClick={() => setPendingConfirmation(null)}>Cancelar</button>
                <button type="button" onClick={confirmRelationship}>Confirmar</button>
              </div>
            </div>
          ) : null}

          {relationshipFeedback ? (
            <p className={styles[relationshipFeedback.tone]} role="status">{relationshipFeedback.message}</p>
          ) : null}

          <GlassButton type="button" onClick={reviewRelationship} icon={<UserPlus size={16} />}>
            Revisar conexão
          </GlassButton>
        </GlassPanel>

        <GlassPanel className={styles.workspacePanel}>
          <div className={styles.panelHeading}>
            <div className={styles.headingIcon}><MailPlus size={20} strokeWidth={1.8} /></div>
            <div>
              <span>Novo mentorado</span>
              <h3>Convidar por e-mail</h3>
            </div>
          </div>

          <form className={styles.form} onSubmit={submitInvitation}>
            <label>
              E-mail
              <input
                type="email"
                placeholder="mentorado@exemplo.com"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Mensagem opcional
              <textarea
                rows={4}
                placeholder="Conte brevemente como vocês vão começar."
                value={inviteMessage}
                onChange={(event) => setInviteMessage(event.target.value)}
              />
            </label>
            <div className={styles.formMeta}>
              <PillChip tone="muted">Papel: mentorado</PillChip>
              <span>Vinculado ao mentor atual</span>
            </div>
            {inviteFeedback ? (
              <p className={styles[inviteFeedback.tone]} role="status">{inviteFeedback.message}</p>
            ) : null}
            <GlassButton type="submit" icon={<ArrowRight size={16} />}>Preparar convite</GlassButton>
          </form>
        </GlassPanel>
      </div>

      <GlassPanel strong className={styles.planPanel}>
        <div className={styles.panelHeading}>
          <div className={styles.headingIcon}><ClipboardList size={20} strokeWidth={1.8} /></div>
          <div>
            <span>Plano de mentoria</span>
            <h3>Estruturar a trilha de Bruno Souza</h3>
          </div>
          <PillChip tone={plan.status === "active" ? "default" : "warning"}>
            {getPlanStatusLabel(plan.status)}
          </PillChip>
        </div>

        <div className={styles.planContext}>
          <div><span>Mentor</span><strong>Mentor atual</strong></div>
          <div><span>Mentorado</span><strong>Bruno Souza</strong></div>
          <div><span>Relação</span><strong>Ativa</strong></div>
          <div><span>Histórico</span><strong>Preservado ao editar</strong></div>
        </div>

        <form className={styles.planForm} onSubmit={(event) => event.preventDefault()}>
          <label className={styles.spanTwo}>
            Título
            <input value={plan.title} onChange={(event) => updatePlan("title", event.target.value)} />
          </label>
          <label>
            Início
            <input type="date" value={plan.startDate} onChange={(event) => updatePlan("startDate", event.target.value)} />
          </label>
          <label>
            Término esperado
            <input type="date" value={plan.expectedEndDate} onChange={(event) => updatePlan("expectedEndDate", event.target.value)} />
          </label>
          <label>
            Duração
            <input value={plan.durationLabel} onChange={(event) => updatePlan("durationLabel", event.target.value)} />
          </label>
          <label>
            Área principal
            <input value={plan.primaryContentArea} onChange={(event) => updatePlan("primaryContentArea", event.target.value)} />
          </label>
          <label className={styles.spanTwo}>
            Objetivo principal
            <textarea
              rows={3}
              placeholder="Qual transformação este plano deve produzir?"
              value={plan.mainGoal}
              onChange={(event) => updatePlan("mainGoal", event.target.value)}
            />
          </label>
          <label className={styles.spanTwo}>
            Tópicos
            <input
              value={plan.topics.join(", ")}
              onChange={(event) => updatePlan("topics", event.target.value.split(",").map((topic) => topic.trim()).filter(Boolean))}
            />
          </label>
          <label>
            Resultados esperados
            <textarea rows={3} value={plan.expectedOutcomes} onChange={(event) => updatePlan("expectedOutcomes", event.target.value)} />
          </label>
          <label>
            Notas compartilhadas
            <textarea rows={3} value={plan.sharedNotes} onChange={(event) => updatePlan("sharedNotes", event.target.value)} />
          </label>
        </form>

        {planFeedback ? <p className={styles[planFeedback.tone]} role="status">{planFeedback.message}</p> : null}

        <div className={styles.planActions}>
          <span><CalendarRange size={16} /> Planos concluídos ficam somente leitura até serem reabertos.</span>
          <div>
            <GlassButton variant="secondary" type="button" onClick={() => savePlan("draft")} icon={<Save size={16} />}>
              Salvar rascunho
            </GlassButton>
            <GlassButton type="button" onClick={() => savePlan("active")} icon={<Play size={16} />}>
              Ativar plano
            </GlassButton>
          </div>
        </div>
      </GlassPanel>

      <div className={styles.templateGrid}>
        <GlassPanel className={styles.templatePicker}>
          <div className={styles.panelHeading}>
            <div className={styles.headingIcon}><LibraryBig size={20} strokeWidth={1.8} /></div>
            <div>
              <span>Templates de aula</span>
              <h3>Escolher pontos de partida</h3>
            </div>
            <PillChip tone="muted">{selectedTemplateIds.length} selecionados</PillChip>
          </div>

          <div className={styles.templateList}>
            {lessonTemplates.map((template) => {
              const selected = selectedTemplateIds.includes(template.id);
              return (
                <button
                  className={[styles.templateOption, selected ? styles.selected : ""].join(" ")}
                  key={template.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleTemplate(template.id)}
                >
                  <span>
                    <small>{template.category} · {template.estimatedDuration}</small>
                    <strong>{template.title}</strong>
                    <em>{template.objective}</em>
                  </span>
                  {selected ? <Check size={18} /> : <CircleDashed size={18} />}
                </button>
              );
            })}
          </div>

          {templateFeedback ? <p className={styles[templateFeedback.tone]} role="status">{templateFeedback.message}</p> : null}
          <GlassButton type="button" onClick={addSelectedTemplates} icon={<CopyPlus size={16} />}>
            Copiar para o plano
          </GlassButton>
        </GlassPanel>

        <GlassPanel className={styles.lessonDrafts}>
          <div className={styles.panelHeading}>
            <div className={styles.headingIcon}><ClipboardList size={20} strokeWidth={1.8} /></div>
            <div>
              <span>Aulas do plano</span>
              <h3>Cópias independentes e editáveis</h3>
            </div>
            <PillChip>{lessons.length} aulas</PillChip>
          </div>

          {lessons.length === 0 ? (
            <div className={styles.compactEmpty}>
              <CopyPlus size={22} />
              <strong>Nenhuma aula copiada</strong>
              <span>Selecione templates ao lado para montar a primeira sequência.</span>
            </div>
          ) : (
            <ol className={styles.lessonList}>
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <span>{String(lesson.order).padStart(2, "0")}</span>
                  <label>
                    Título editável
                    <input value={lesson.title} onChange={(event) => renameLesson(lesson.id, event.target.value)} />
                  </label>
                  <small>{lesson.category} · {lesson.estimatedDuration} · Não iniciada</small>
                </li>
              ))}
            </ol>
          )}

          <p className={styles.historyNote}>
            Alterações futuras no template não reescrevem estas cópias nem o histórico de aulas concluídas.
          </p>
        </GlassPanel>
      </div>

      <GlassPanel strong className={styles.progressPanel}>
        <div className={styles.panelHeading}>
          <div className={styles.headingIcon}><TrendingUp size={20} strokeWidth={1.8} /></div>
          <div>
            <span>Progresso</span>
            <h3>Aulas, sessões e próximas ações no mesmo panorama</h3>
          </div>
          <PillChip tone={followUpNeeded ? "warning" : "default"}>
            {followUpNeeded ? "Precisa de acompanhamento" : "Em dia"}
          </PillChip>
        </div>

        <div className={styles.progressSummary}>
          <div>
            <strong>{progress.completionPercentage}%</strong>
            <span>Aulas concluídas</span>
            <div className={styles.progressTrack} aria-label={`${progress.completionPercentage}% das aulas concluídas`}>
              <span style={{ width: `${progress.completionPercentage}%` }} />
            </div>
          </div>
          <div><strong>{progress.completedLessons}/{progress.totalLessons}</strong><span>Lições</span></div>
          <div><strong>{progress.completedSessions}</strong><span>Sessões concluídas</span></div>
          <div><strong>{progress.nextActions}</strong><span>Próximas ações</span></div>
        </div>

        <div className={styles.progressGrid}>
          <div className={styles.progressColumn}>
            <div className={styles.subheading}>
              <div><ClipboardList size={18} /><strong>Status das aulas</strong></div>
              <span>Base do progresso</span>
            </div>
            <div className={styles.trackedLessons}>
              {lessons.map((lesson) => (
                <div key={lesson.id}>
                  <span className={styles.lessonOrder}>{String(lesson.order).padStart(2, "0")}</span>
                  <span><strong>{lesson.title}</strong><small>{lesson.estimatedDuration}</small></span>
                  <select
                    aria-label={`Status de ${lesson.title}`}
                    value={lesson.status}
                    onChange={(event) => setLessons((current) => current.map((item) =>
                      item.id === lesson.id ? { ...item, status: event.target.value as PlanLesson["status"] } : item
                    ))}
                  >
                    {LESSON_STATUSES.map((status) => (
                      <option key={status} value={status}>{getLessonStatusLabel(status)}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className={styles.sessionCard}>
              <div className={styles.sessionIcon}><Clock3 size={19} /></div>
              <div>
                <small>Próxima sessão · 22 out, 19:00</small>
                <strong>Fluxo com Git e GitHub</strong>
                <span>Concluir a sessão também conclui a aula vinculada.</span>
              </div>
              <GlassButton type="button" onClick={completeUpcomingSession} icon={<CheckCircle2 size={16} />}>
                Concluir sessão
              </GlassButton>
            </div>
          </div>

          <form className={styles.progressForm} onSubmit={addProgressNote}>
            <div className={styles.subheading}>
              <div><MessageSquarePlus size={18} /><strong>Nova nota de progresso</strong></div>
              <span>Sem notas numéricas</span>
            </div>
            <label>
              O que foi aplicado
              <textarea rows={2} value={noteDraft.applied} onChange={(event) => setNoteDraft((current) => ({ ...current, applied: event.target.value }))} />
            </label>
            <label>
              O que foi compreendido
              <textarea rows={2} value={noteDraft.understood} onChange={(event) => setNoteDraft((current) => ({ ...current, understood: event.target.value }))} />
            </label>
            <label>
              O que precisa de revisão
              <textarea rows={2} value={noteDraft.needsReview} onChange={(event) => setNoteDraft((current) => ({ ...current, needsReview: event.target.value }))} />
            </label>
            <label>
              Próxima ação ou tarefa
              <textarea rows={2} value={noteDraft.nextAction} onChange={(event) => setNoteDraft((current) => ({ ...current, nextAction: event.target.value }))} />
            </label>
            <div className={styles.noteControls}>
              <label>
                Confiança
                <select value={noteDraft.confidence} onChange={(event) => setNoteDraft((current) => ({
                  ...current,
                  confidence: event.target.value as NonNullable<ProgressNote["confidence"]>
                }))}>
                  <option value="low">Baixa</option>
                  <option value="growing">Em evolução</option>
                  <option value="confident">Confiante</option>
                </select>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={noteDraft.sharedWithMentee}
                  onChange={(event) => setNoteDraft((current) => ({ ...current, sharedWithMentee: event.target.checked }))}
                />
                Compartilhar com mentorado
              </label>
            </div>
            <GlassButton type="submit" icon={<MessageSquarePlus size={16} />}>Registrar nota</GlassButton>
          </form>
        </div>

        {progressFeedback ? <p className={styles[progressFeedback.tone]} role="status">{progressFeedback.message}</p> : null}

        <div className={styles.menteeView}>
          <div>
            <span>Visão do mentorado</span>
            <strong>O que está claro agora</strong>
          </div>
          <ul>
            <li><CheckCircle2 size={16} /> {progress.completedLessons} aulas concluídas</li>
            <li><Clock3 size={16} /> {lessons.filter((lesson) => lesson.status === "scheduled").length} aulas próximas</li>
            <li><LibraryBig size={16} /> Materiais sugeridos em cada aula</li>
            <li><MessageSquarePlus size={16} /> {progressNotes.filter((note) => note.sharedWithMentee).length} notas compartilhadas</li>
            <li><ArrowRight size={16} /> {progress.nextActions} próximas ações</li>
          </ul>
        </div>
      </GlassPanel>
    </section>
  );
}
