"use client";

import {
  CalendarPlus,
  Check,
  ChevronRight,
  CopyPlus,
  MessageSquarePlus,
  Play,
  Save,
  Sparkles,
  UserRound
} from "lucide-react";
import { useMemo, useState } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import {
  calculateProgress,
  copyTemplatesToPlan,
  getLessonStatusLabel,
  lessonTemplates,
  type PlanLesson,
  type ProgressNote
} from "@/lib/mentorship-lifecycle";
import { LESSON_STATUSES } from "@/lib/domain-types";
import type { UserRole } from "@/lib/access";
import styles from "./workspace-board.module.css";

type MenteeSummary = {
  id: string;
  name: string;
  initials: string;
  focus: string;
  hasPlan: boolean;
};

const mentees: MenteeSummary[] = [
  { id: "bruno-souza", name: "Bruno Souza", initials: "BS", focus: "JavaScript e APIs", hasPlan: true },
  { id: "ana-ribeiro", name: "Ana Ribeiro", initials: "AR", focus: "Frontend e React", hasPlan: false }
];

const initialLessons: PlanLesson[] = copyTemplatesToPlan(lessonTemplates.slice(0, 4), "plan-preview").map((lesson, index) => ({
  ...lesson,
  status: index === 0 ? "completed" : index === 1 ? "scheduled" : "not_started"
}));

const initialNotes: ProgressNote[] = [
  {
    id: "note-1",
    lessonId: initialLessons[0].id,
    applied: "Lógica, funções pequenas e decomposição de problemas.",
    understood: "Condições e funções.",
    needsReview: "Laços aninhados.",
    nextAction: "Resolver dois exercícios de repetição.",
    confidence: "growing",
    sharedWithMentee: true
  }
];

export function MentorshipPlans({ role }: { role?: UserRole | null }) {
  const [selectedMenteeId, setSelectedMenteeId] = useState(mentees[0].id);
  const [lessonsByMentee, setLessonsByMentee] = useState<Record<string, PlanLesson[]>>({ "bruno-souza": initialLessons });
  const [notesByMentee, setNotesByMentee] = useState<Record<string, ProgressNote[]>>({ "bruno-souza": initialNotes });
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [createdPlanIds, setCreatedPlanIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [newPlan, setNewPlan] = useState({
    title: "Trilha de desenvolvimento frontend",
    goal: "",
    startDate: "2026-10-27",
    endDate: "2027-01-27",
    firstSession: "2026-10-29T19:00"
  });

  const selectedMentee = mentees.find((mentee) => mentee.id === selectedMenteeId) ?? mentees[0];
  const hasPlan = selectedMentee.hasPlan || createdPlanIds.includes(selectedMentee.id);
  const lessons = lessonsByMentee[selectedMentee.id] ?? [];
  const notes = notesByMentee[selectedMentee.id] ?? [];
  const progress = useMemo(
    () => calculateProgress(lessons, [{ id: "session-1", lessonId: lessons[0]?.id, status: "completed", scheduledAt: "2026-10-13T19:00" }], notes),
    [lessons, notes]
  );

  function toggleTemplate(templateId: string) {
    setSelectedTemplateIds((current) => current.includes(templateId)
      ? current.filter((id) => id !== templateId)
      : [...current, templateId]);
  }

  function createPlan() {
    if (!newPlan.title.trim() || !newPlan.goal.trim() || selectedTemplateIds.length === 0) {
      setFeedback("Preencha título, objetivo e escolha ao menos um template de aula.");
      return;
    }
    const copiedLessons = copyTemplatesToPlan(
      lessonTemplates.filter((template) => selectedTemplateIds.includes(template.id)),
      `plan-${selectedMentee.id}`
    );
    setLessonsByMentee((current) => ({ ...current, [selectedMentee.id]: copiedLessons }));
    setNotesByMentee((current) => ({ ...current, [selectedMentee.id]: [] }));
    setCreatedPlanIds((current) => [...current, selectedMentee.id]);
    setFeedback(`Plano de ${selectedMentee.name} criado com ${copiedLessons.length} aulas e primeira sessão agendada.`);
  }

  function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!noteDraft.trim()) return;
    setNotesByMentee((current) => ({ ...current, [selectedMentee.id]: [...(current[selectedMentee.id] ?? []), {
      id: `note-${Date.now()}`,
      applied: "",
      understood: "",
      needsReview: "",
      nextAction: noteDraft.trim(),
      confidence: "growing",
      sharedWithMentee: true
    }] }));
    setNoteDraft("");
    setFeedback("Próxima ação registrada no plano.");
  }

  if (role === "mentee") {
    return (
      <section className={styles.workspace} aria-label="Meu plano de mentoria">
        <GlassPanel strong className={styles.planHero}>
          <div>
            <span className={styles.eyebrow}>Plano ativo · Kauai Staingel</span>
            <h2>Trilha de desenvolvimento frontend</h2>
            <p>Consolidar fundamentos e construir um projeto de portfólio completo, responsivo e publicado.</p>
            <div className={styles.tagRow} style={{ marginTop: 16 }}>
              <span>Início: 20 out 2026</span><span>12 semanas</span><span>Próxima aula: 29 out, 19h</span>
            </div>
          </div>
          <div className={styles.planStats}>
            <div><strong>{progress.completionPercentage}%</strong><span>progresso</span></div>
            <div><strong>{progress.completedLessons}/{progress.totalLessons}</strong><span>aulas</span></div>
            <div><strong>{progress.nextActions}</strong><span>ações</span></div>
          </div>
        </GlassPanel>

        <div className={styles.mainGrid}>
          <GlassPanel className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.eyebrow}>Minha trilha</span><h2>Aulas e progresso</h2></div>
              <PillChip>{progress.completionPercentage}% concluído</PillChip>
            </div>
            <div className={styles.progressTrack} aria-label={`${progress.completionPercentage}% concluído`}><span style={{ width: `${progress.completionPercentage}%` }} /></div>
            <ol className={styles.lessonList}>
              {lessons.map((lesson) => (
                <li className={styles.lessonRow} key={lesson.id}>
                  <span className={styles.lessonNumber}>{String(lesson.order).padStart(2, "0")}</span>
                  <div><strong>{lesson.title}</strong><small>{lesson.category} · {lesson.estimatedDuration}</small></div>
                  <PillChip tone={lesson.status === "completed" ? "default" : "muted"}>{getLessonStatusLabel(lesson.status)}</PillChip>
                </li>
              ))}
            </ol>
          </GlassPanel>

          <div className={styles.stack}>
            <GlassPanel className={styles.panel}>
              <div className={styles.panelHeader}>
                <div><span className={styles.eyebrow}>Próxima sessão</span><h3>Layout responsivo</h3></div>
                <span className={styles.iconBox}><CalendarPlus size={18} /></span>
              </div>
              <p>29 de outubro, 19:00–20:30</p>
              <div className={styles.tagRow}><span>Com Kauai Staingel</span><span>Confirmada</span></div>
              <GlassButton variant="secondary" href="/app/calendar" icon={<ChevronRight size={15} />}>Ver no calendário</GlassButton>
            </GlassPanel>
            <GlassPanel className={styles.panel}>
              <div className={styles.panelHeader}>
                <div><span className={styles.eyebrow}>Acompanhamento</span><h3>Próximas ações</h3></div>
                <span className={styles.iconBox}><MessageSquarePlus size={18} /></span>
              </div>
              <ul className={styles.list}>
                {notes.filter((note) => note.sharedWithMentee).map((note) => <li className={styles.notice} key={note.id}>{note.nextAction}</li>)}
              </ul>
            </GlassPanel>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.workspace} aria-label="Planos por mentorado">
      <GlassPanel className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><span className={styles.eyebrow}>Seu grupo</span><h2>Escolha um mentorado</h2></div>
          <PillChip tone="muted">{mentees.length} relações ativas</PillChip>
        </div>
        <div className={[styles.selectorStrip, styles.mentorSelector].join(" ")} role="radiogroup" aria-label="Selecionar mentorado">
          {mentees.map((mentee) => {
            const selected = mentee.id === selectedMenteeId;
            const planAvailable = mentee.hasPlan || createdPlanIds.includes(mentee.id);
            return (
              <button
                className={[styles.selectCard, selected ? styles.selectCardActive : ""].join(" ")}
                type="button"
                role="radio"
                aria-checked={selected}
                key={mentee.id}
                onClick={() => { setSelectedMenteeId(mentee.id); setFeedback(""); }}
              >
                <div className={styles.selectCardTop}>
                  <span className={styles.avatar}>{mentee.initials}</span>
                  <span><strong>{mentee.name}</strong><small>{mentee.focus}</small></span>
                </div>
                <span><PillChip tone={planAvailable ? "default" : "warning"}>{planAvailable ? "Plano ativo" : "Novo mentorado"}</PillChip></span>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      {feedback ? <div className={styles.feedback} role="status">{feedback}</div> : null}

      {hasPlan ? (
        <>
          <GlassPanel strong className={styles.planHero}>
            <div>
              <span className={styles.eyebrow}>Plano ativo · {selectedMentee.name}</span>
              <h2>{selectedMentee.id === "bruno-souza" ? "Trilha de desenvolvimento frontend" : newPlan.title}</h2>
              <p>{selectedMentee.id === "bruno-souza" ? "Consolidar fundamentos e construir um projeto de portfólio completo, responsivo e publicado." : newPlan.goal}</p>
              <div className={styles.tagRow} style={{ marginTop: 16 }}>
                <span>Início: {selectedMentee.id === "bruno-souza" ? "20 out 2026" : newPlan.startDate.split("-").reverse().join("/")}</span><span>12 semanas</span><span>Próxima aula: 29 out, 19h</span>
              </div>
            </div>
            <div className={styles.planStats}>
              <div><strong>{progress.completionPercentage}%</strong><span>progresso</span></div>
              <div><strong>{progress.completedLessons}/{progress.totalLessons}</strong><span>aulas</span></div>
              <div><strong>{progress.nextActions}</strong><span>ações</span></div>
            </div>
          </GlassPanel>

          <div className={styles.mainGrid}>
            <GlassPanel className={styles.panel}>
              <div className={styles.panelHeader}>
                <div><span className={styles.eyebrow}>Aulas do plano</span><h2>Trilha e progresso</h2></div>
                <GlassButton variant="secondary" icon={<CopyPlus size={15} />} href="/app/materials">Gerenciar templates</GlassButton>
              </div>
              <div className={styles.progressTrack} aria-label={`${progress.completionPercentage}% concluído`}><span style={{ width: `${progress.completionPercentage}%` }} /></div>
              <ol className={styles.lessonList}>
                {lessons.map((lesson) => (
                  <li className={styles.lessonRow} key={lesson.id}>
                    <span className={styles.lessonNumber}>{String(lesson.order).padStart(2, "0")}</span>
                    <div>
                      <input
                        className={styles.inlineInput}
                        aria-label={`Título da aula ${lesson.order}`}
                        value={lesson.title}
                        onChange={(event) => setLessonsByMentee((current) => ({
                          ...current,
                          [selectedMentee.id]: lessons.map((item) => item.id === lesson.id ? { ...item, title: event.target.value } : item)
                        }))}
                      />
                      <small>{lesson.category} · {lesson.estimatedDuration}</small>
                    </div>
                    <select
                      aria-label={`Status de ${lesson.title}`}
                      value={lesson.status}
                      onChange={(event) => setLessonsByMentee((current) => ({
                        ...current,
                        [selectedMentee.id]: lessons.map((item) => item.id === lesson.id ? { ...item, status: event.target.value as PlanLesson["status"] } : item)
                      }))}
                    >
                      {LESSON_STATUSES.map((status) => <option value={status} key={status}>{getLessonStatusLabel(status)}</option>)}
                    </select>
                  </li>
                ))}
              </ol>
              <div className={styles.panelActions}>
                <span className={styles.helper}>As cópias do plano podem ser ajustadas sem alterar o template original.</span>
                <GlassButton variant="secondary" icon={<Save size={15} />}>Salvar alterações</GlassButton>
              </div>
            </GlassPanel>

            <div className={styles.stack}>
              <GlassPanel className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div><span className={styles.eyebrow}>Próxima sessão</span><h3>Layout responsivo</h3></div>
                  <span className={styles.iconBox}><CalendarPlus size={18} /></span>
                </div>
                <p>29 de outubro, 19:00–20:30</p>
                <div className={styles.tagRow}><span>Bruno Souza</span><span>Confirmada</span></div>
                <GlassButton variant="secondary" href="/app/calendar" icon={<ChevronRight size={15} />}>Abrir no calendário</GlassButton>
              </GlassPanel>

              <GlassPanel className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div><span className={styles.eyebrow}>Acompanhamento</span><h3>Próximas ações</h3></div>
                  <span className={styles.iconBox}><MessageSquarePlus size={18} /></span>
                </div>
                <ul className={styles.list}>
                  {notes.slice(-3).map((note) => <li className={styles.notice} key={note.id}>{note.nextAction}</li>)}
                </ul>
                <form className={styles.compactForm} onSubmit={addNote}>
                  <label>Nova ação<textarea rows={2} placeholder="O que deve acontecer antes da próxima aula?" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} /></label>
                  <GlassButton type="submit" icon={<MessageSquarePlus size={15} />}>Registrar ação</GlassButton>
                </form>
              </GlassPanel>
            </div>
          </div>
        </>
      ) : (
        <GlassPanel strong className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span className={styles.eyebrow}>Novo mentorado · {selectedMentee.name}</span><h2>Monte o primeiro plano</h2></div>
            <PillChip tone="warning">Ainda sem plano</PillChip>
          </div>

          <div className={styles.stepper} aria-label="Etapas para criar o plano">
            <div className={styles.stepActive}><small>Etapa 1</small><strong>Plano</strong></div>
            <div className={selectedTemplateIds.length ? styles.stepActive : ""}><small>Etapa 2</small><strong>Aulas</strong></div>
            <div className={newPlan.firstSession ? styles.stepActive : ""}><small>Etapa 3</small><strong>Calendário</strong></div>
          </div>

          <div className={styles.editorGrid}>
            <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
              <div className={styles.panelHeader}><div><span className={styles.eyebrow}>Informações</span><h3>Objetivo e duração</h3></div><UserRound size={19} /></div>
              <label>Título do plano<input value={newPlan.title} onChange={(event) => setNewPlan((current) => ({ ...current, title: event.target.value }))} /></label>
              <label>Objetivo principal<textarea rows={4} placeholder="Qual transformação este plano deve produzir?" value={newPlan.goal} onChange={(event) => setNewPlan((current) => ({ ...current, goal: event.target.value }))} /></label>
              <div className={styles.twoFields}>
                <label>Data de início<input type="date" value={newPlan.startDate} onChange={(event) => setNewPlan((current) => ({ ...current, startDate: event.target.value }))} /></label>
                <label>Término esperado<input type="date" value={newPlan.endDate} onChange={(event) => setNewPlan((current) => ({ ...current, endDate: event.target.value }))} /></label>
              </div>
              <label>Primeira sessão<input type="datetime-local" value={newPlan.firstSession} onChange={(event) => setNewPlan((current) => ({ ...current, firstSession: event.target.value }))} /></label>
            </form>

            <div className={styles.stack}>
              <div className={styles.panelHeader}>
                <div><span className={styles.eyebrow}>Templates de aula</span><h3>Escolha a sequência inicial</h3></div>
                <PillChip tone="muted">{selectedTemplateIds.length} escolhidos</PillChip>
              </div>
              <div className={styles.templateList}>
                {lessonTemplates.slice(0, 5).map((template) => {
                  const selected = selectedTemplateIds.includes(template.id);
                  return (
                    <button className={[styles.templateItem, selected ? styles.templateItemActive : ""].join(" ")} type="button" aria-pressed={selected} onClick={() => toggleTemplate(template.id)} key={template.id}>
                      <span>{template.category} · {template.estimatedDuration}</span>
                      <strong>{template.title}</strong>
                      <small>{template.objective}</small>
                      {selected ? <Check size={16} /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.panelActions}>
            <span className={styles.helper}><Sparkles size={15} /> Os templates viram cópias editáveis apenas dentro deste plano.</span>
            <div className={styles.rowActions}>
              <GlassButton variant="secondary" icon={<Save size={15} />}>Salvar rascunho</GlassButton>
              <GlassButton icon={<Play size={15} />} onClick={createPlan}>Criar e ativar plano</GlassButton>
            </div>
          </div>
        </GlassPanel>
      )}
    </section>
  );
}
