"use client";

import {
  Bell,
  BookOpenCheck,
  CalendarPlus,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  History,
  LockKeyhole,
  MessagesSquare,
  RefreshCw,
  Route,
  Send,
  UserRound,
  XCircle
} from "lucide-react";
import { useMemo, useState } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import {
  CALENDAR_WORKFLOW_STEPS,
  changeScheduledSessionStatus,
  createScheduledSession,
  createNotification,
  createCommunicationNote,
  getCommunicationNoteTypeLabel,
  getNotificationTypeLabel,
  getScheduledSessionStatusLabel,
  getSessionsForRole,
  initialScheduledSessions,
  initialNotifications,
  initialCommunicationNotes,
  markAllNotificationsRead,
  markNotificationRead,
  getVisibleCommunicationNotes,
  rescheduleSession,
  splitSessionsByDate,
  type CalendarRole,
  type CommunicationContextType,
  type CommunicationNote,
  type CommunicationNoteType,
  type InAppNotification,
  type ScheduledSession
} from "@/lib/calendar-and-communication";
import styles from "./calendar-and-communication.module.css";

const roleLabels: Record<CalendarRole, string> = {
  mentor: "Mentor",
  mentee: "Mentorado",
  admin: "Admin"
};

const weekDays = [
  { date: "2026-10-19", weekday: "Seg", day: "19" },
  { date: "2026-10-20", weekday: "Ter", day: "20" },
  { date: "2026-10-21", weekday: "Qua", day: "21" },
  { date: "2026-10-22", weekday: "Qui", day: "22" },
  { date: "2026-10-23", weekday: "Sex", day: "23" },
  { date: "2026-10-24", weekday: "Sáb", day: "24" },
  { date: "2026-10-25", weekday: "Dom", day: "25" }
];

function getRoleUserId(role: CalendarRole) {
  if (role === "mentor") return "mentor-preview";
  if (role === "mentee") return "mentee-preview";
  return "admin-preview";
}

function getTime(value: string) {
  return value.slice(11, 16);
}

export function CalendarAndCommunication() {
  const [sessions, setSessions] = useState<ScheduledSession[]>(initialScheduledSessions);
  const [activeRole, setActiveRole] = useState<CalendarRole>("mentor");
  const [selectedSessionId, setSelectedSessionId] = useState(initialScheduledSessions[0].id);
  const [scheduleDraft, setScheduleDraft] = useState({
    title: "Próxima aula de JavaScript",
    dateTime: "2026-10-27T19:00",
    durationMinutes: 60,
    lessonId: "lesson-git",
    notes: "",
    requiresConfirmation: false
  });
  const [rescheduleAt, setRescheduleAt] = useState("2026-10-29T19:00");
  const [scheduleFeedback, setScheduleFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [notifications, setNotifications] = useState<InAppNotification[]>(initialNotifications);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "unread">("unread");
  const [communicationNotes, setCommunicationNotes] = useState<CommunicationNote[]>(initialCommunicationNotes);
  const [noteViewerRole, setNoteViewerRole] = useState<"mentor" | "mentee">("mentor");
  const [noteContextFilter, setNoteContextFilter] = useState<CommunicationContextType | "all">("all");
  const [noteDraft, setNoteDraft] = useState({
    type: "mentor_shared" as CommunicationNoteType,
    body: "",
    contextType: "session" as CommunicationContextType
  });
  const [noteFeedback, setNoteFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const scopedSessions = useMemo(
    () => getSessionsForRole(sessions, activeRole, getRoleUserId(activeRole)),
    [sessions, activeRole]
  );
  const sessionGroups = useMemo(
    () => splitSessionsByDate(scopedSessions, "2026-10-19T12:00:00-03:00"),
    [scopedSessions]
  );
  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? initialScheduledSessions[0];
  const menteeNotifications = notifications.filter((notification) => notification.recipientId === "mentee-preview");
  const visibleNotifications = menteeNotifications.filter((notification) => notificationFilter === "all" || !notification.read);
  const unreadNotificationCount = menteeNotifications.filter((notification) => !notification.read).length;
  const visibleNotes = getVisibleCommunicationNotes(
    communicationNotes,
    noteViewerRole,
    noteViewerRole === "mentor" ? "mentor-preview" : "mentee-preview"
  ).filter((note) => noteContextFilter === "all" || note.contextType === noteContextFilter);

  function submitSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const lessonLabels: Record<string, string> = {
        "lesson-responsive": "Layout responsivo",
        "lesson-git": "Fluxo com Git e GitHub",
        none: ""
      };
      const session = createScheduledSession(
        {
          title: scheduleDraft.title,
          mentorId: "mentor-preview",
          mentorName: "Mentor atual",
          menteeId: "mentee-preview",
          menteeName: "Bruno Souza",
          planId: "plan-preview",
          planTitle: "Trilha de desenvolvimento frontend",
          lessonId: scheduleDraft.lessonId === "none" ? undefined : scheduleDraft.lessonId,
          lessonTitle: scheduleDraft.lessonId === "none" ? undefined : lessonLabels[scheduleDraft.lessonId],
          startAt: scheduleDraft.dateTime,
          durationMinutes: scheduleDraft.durationMinutes,
          notes: scheduleDraft.notes,
          requiresConfirmation: scheduleDraft.requiresConfirmation
        },
        new Date().toISOString()
      );
      setSessions((current) => [...current, session]);
      setNotifications((current) => [
        createNotification({
          recipientId: session.menteeId,
          type: "session_scheduled",
          title: scheduleDraft.requiresConfirmation ? "Novo horário proposto" : "Nova sessão confirmada",
          body: `${session.title} foi adicionada à agenda para ${session.startAt.slice(8, 10)}/${session.startAt.slice(5, 7)} às ${getTime(session.startAt)}.`,
          relatedEntityType: "session",
          relatedEntityId: session.id,
          createdAt: new Date().toISOString()
        }),
        ...current
      ]);
      setSelectedSessionId(session.id);
      setScheduleFeedback({
        tone: "success",
        message: scheduleDraft.requiresConfirmation
          ? "Sessão proposta e visível para o mentorado."
          : "Sessão confirmada e adicionada à agenda."
      });
    } catch (error) {
      setScheduleFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível agendar a sessão."
      });
    }
  }

  function updateSelectedSession(action: "confirm" | "complete" | "cancel" | "missed" | "reschedule") {
    try {
      setSessions((current) => current.map((session) => {
        if (session.id !== selectedSession.id) return session;
        if (action === "reschedule") return rescheduleSession(session, rescheduleAt, 60);
        const statuses = {
          confirm: "confirmed",
          complete: "completed",
          cancel: "canceled",
          missed: "missed"
        } as const;
        return changeScheduledSessionStatus(session, statuses[action]);
      }));
      const messages = {
        confirm: "Sessão confirmada.",
        complete: "Sessão marcada como concluída e pronta para o registro de aula.",
        cancel: "Sessão cancelada sem contar no progresso.",
        missed: "Sessão marcada como não realizada e não contará no progresso.",
        reschedule: "Sessão reagendada; criação, notas e vínculo com a aula foram preservados."
      };
      setScheduleFeedback({ tone: "success", message: messages[action] });

      if (action === "reschedule" || action === "complete") {
        setNotifications((current) => [
          createNotification({
            recipientId: selectedSession.menteeId,
            type: action === "reschedule" ? "session_rescheduled" : "session_completed",
            title: action === "reschedule" ? "Sessão reagendada" : "Sessão concluída",
            body: action === "reschedule"
              ? `${selectedSession.title} recebeu um novo horário.`
              : `${selectedSession.title} foi concluída e o registro já pode ser consultado.`,
            relatedEntityType: "session",
            relatedEntityId: selectedSession.id,
            createdAt: new Date().toISOString()
          }),
          ...current
        ]);
      }
    } catch (error) {
      setScheduleFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível atualizar a sessão."
      });
    }
  }

  function submitCommunicationNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const contexts: Record<CommunicationContextType, { id: string; label: string }> = {
        relationship: { id: "relationship-preview", label: "Mentoria com Bruno Souza" },
        plan: { id: "plan-preview", label: "Trilha de desenvolvimento frontend" },
        lesson: { id: selectedSession.lessonId ?? "lesson-general", label: selectedSession.lessonTitle ?? "Aula geral" },
        session: { id: selectedSession.id, label: selectedSession.title }
      };
      const context = contexts[noteDraft.contextType];
      const note = createCommunicationNote({
        authorId: noteViewerRole === "mentor" ? "mentor-preview" : "mentee-preview",
        authorRole: noteViewerRole,
        type: noteViewerRole === "mentee" ? "mentee_note" : noteDraft.type,
        body: noteDraft.body,
        contextType: noteDraft.contextType,
        contextId: context.id,
        contextLabel: context.label,
        createdAt: new Date().toISOString()
      });
      setCommunicationNotes((current) => [note, ...current]);

      if (note.visibility === "mentor_and_mentee") {
        setNotifications((current) => [
          createNotification({
            recipientId: noteViewerRole === "mentor" ? "mentee-preview" : "mentor-preview",
            type: "shared_note",
            title: note.type === "next_action" ? "Nova próxima ação" : "Nova nota compartilhada",
            body: note.body,
            relatedEntityType: "note",
            relatedEntityId: note.id,
            createdAt: note.createdAt
          }),
          ...current
        ]);
      }

      setNoteDraft((current) => ({ ...current, body: "" }));
      setNoteFeedback({
        tone: "success",
        message: note.visibility === "mentor_only" ? "Nota privada registrada." : "Nota registrada e compartilhada no contexto correto."
      });
    } catch (error) {
      setNoteFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível registrar a nota."
      });
    }
  }

  return (
    <section className={styles.calendarArea} aria-labelledby="calendar-communication-title">
      <div className={styles.sectionHeading}>
        <span>// 04 Calendário e comunicação</span>
        <h2 id="calendar-communication-title">Próximos encontros e decisões no mesmo contexto</h2>
        <p>
          A agenda prioriza a próxima sessão. Notificações e notas estruturadas preservam o
          contexto da mentoria sem exigir chat em tempo real ou configuração de e-mail.
        </p>
      </div>

      <GlassPanel strong className={styles.workflowPanel}>
        <div className={styles.panelHeading}>
          <div className={styles.headingIcon}><Route size={20} strokeWidth={1.8} /></div>
          <div>
            <span>Fluxo operacional</span>
            <h3>Agendar, avisar, contextualizar e resolver</h3>
          </div>
          <PillChip>Sem chat obrigatório</PillChip>
        </div>
        <ol className={styles.workflowList}>
          {CALENDAR_WORKFLOW_STEPS.map((step, index) => (
            <li key={step.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.label}</strong>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </GlassPanel>

      <GlassPanel className={styles.calendarPanel}>
        <div className={styles.panelHeading}>
          <div className={styles.headingIcon}><CalendarDays size={20} strokeWidth={1.8} /></div>
          <div>
            <span>Agenda semanal</span>
            <h3>19 a 25 de outubro de 2026</h3>
          </div>
          <div className={styles.roleSwitch} role="group" aria-label="Contexto da agenda">
            {(Object.keys(roleLabels) as CalendarRole[]).map((role) => (
              <button
                type="button"
                key={role}
                aria-pressed={activeRole === role}
                onClick={() => setActiveRole(role)}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.calendarGrid}>
          {weekDays.map((day) => {
            const daySessions = scopedSessions.filter((session) => session.startAt.startsWith(day.date));
            return (
              <div className={styles.calendarDay} key={day.date}>
                <div className={styles.dayHeader}>
                  <span>{day.weekday}</span>
                  <strong>{day.day}</strong>
                </div>
                <div className={styles.dayContent}>
                  {daySessions.length === 0 ? <span className={styles.freeDay}>Livre</span> : daySessions.map((session) => (
                    <button type="button" key={session.id} onClick={() => setSelectedSessionId(session.id)}>
                      <small>{getTime(session.startAt)}</small>
                      <strong>{session.title}</strong>
                      <span>{session.menteeName}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.calendarWorkspace}>
          <div className={styles.upcomingList}>
            <div className={styles.miniHeading}>
              <div><Clock3 size={18} /><strong>Próximas sessões</strong></div>
              <span>{sessionGroups.upcoming.length} na agenda</span>
            </div>
            {sessionGroups.upcoming.length === 0 ? (
              <div className={styles.emptyState}>Nenhuma próxima sessão neste contexto.</div>
            ) : sessionGroups.upcoming.map((session) => (
              <button type="button" key={session.id} onClick={() => setSelectedSessionId(session.id)}>
                <span className={styles.dateBadge}>{session.startAt.slice(8, 10)}/{session.startAt.slice(5, 7)}</span>
                <span>
                  <small>{getScheduledSessionStatusLabel(session.status)} · {getTime(session.startAt)}–{getTime(session.endAt)}</small>
                  <strong>{session.title}</strong>
                  <em>{activeRole === "mentee" ? session.mentorName : session.menteeName}</em>
                </span>
                <ExternalLink size={16} />
              </button>
            ))}
          </div>

          <div className={styles.sessionDetail}>
            <div className={styles.miniHeading}>
              <div><BookOpenCheck size={18} /><strong>Contexto da sessão</strong></div>
              <PillChip tone={selectedSession.status === "completed" ? "default" : "warning"}>
                {getScheduledSessionStatusLabel(selectedSession.status)}
              </PillChip>
            </div>
            <h4>{selectedSession.title}</h4>
            <p>{selectedSession.notes}</p>
            <dl>
              <div><dt>Mentor</dt><dd>{selectedSession.mentorName}</dd></div>
              <div><dt>Mentorado</dt><dd>{selectedSession.menteeName}</dd></div>
              <div><dt>Plano</dt><dd>{selectedSession.planTitle}</dd></div>
              <div><dt>Aula</dt><dd>{selectedSession.lessonTitle ?? "Sessão geral"}</dd></div>
            </dl>
            <GlassButton type="button" variant="secondary" icon={<ExternalLink size={16} />}>
              Abrir registro da sessão
            </GlassButton>
          </div>
        </div>

        <div className={styles.historyStrip}>
          <div><History size={17} /><strong>Histórico acessível</strong></div>
          {sessionGroups.history.map((session) => (
            <button type="button" key={session.id} onClick={() => setSelectedSessionId(session.id)}>
              {session.startAt.slice(8, 10)}/{session.startAt.slice(5, 7)} · {session.title} · {getScheduledSessionStatusLabel(session.status)}
            </button>
          ))}
        </div>
      </GlassPanel>

      <div className={styles.schedulingGrid}>
        <GlassPanel className={styles.schedulingPanel}>
          <div className={styles.panelHeading}>
            <div className={styles.headingIcon}><CalendarPlus size={20} strokeWidth={1.8} /></div>
            <div>
              <span>Novo agendamento</span>
              <h3>Agendar a próxima aula rapidamente</h3>
            </div>
          </div>
          <form className={styles.scheduleForm} onSubmit={submitSchedule}>
            <div className={styles.contextRow}>
              <span><UserRound size={15} /> Bruno Souza</span>
              <span><BookOpenCheck size={15} /> Trilha frontend</span>
            </div>
            <label>
              Título
              <input value={scheduleDraft.title} onChange={(event) => setScheduleDraft((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <div className={styles.twoFields}>
              <label>
                Data e horário
                <input type="datetime-local" value={scheduleDraft.dateTime} onChange={(event) => setScheduleDraft((current) => ({ ...current, dateTime: event.target.value }))} />
              </label>
              <label>
                Duração
                <select value={scheduleDraft.durationMinutes} onChange={(event) => setScheduleDraft((current) => ({ ...current, durationMinutes: Number(event.target.value) }))}>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                </select>
              </label>
            </div>
            <label>
              Aula opcional
              <select value={scheduleDraft.lessonId} onChange={(event) => setScheduleDraft((current) => ({ ...current, lessonId: event.target.value }))}>
                <option value="none">Sessão geral do plano</option>
                <option value="lesson-responsive">Layout responsivo</option>
                <option value="lesson-git">Fluxo com Git e GitHub</option>
              </select>
            </label>
            <label>
              Observação
              <textarea rows={3} value={scheduleDraft.notes} onChange={(event) => setScheduleDraft((current) => ({ ...current, notes: event.target.value }))} />
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={scheduleDraft.requiresConfirmation} onChange={(event) => setScheduleDraft((current) => ({ ...current, requiresConfirmation: event.target.checked }))} />
              Criar como proposta aguardando confirmação
            </label>
            <GlassButton type="submit" icon={<CalendarPlus size={16} />}>Adicionar à agenda</GlassButton>
          </form>
        </GlassPanel>

        <GlassPanel className={styles.managePanel}>
          <div className={styles.panelHeading}>
            <div className={styles.headingIcon}><RefreshCw size={20} strokeWidth={1.8} /></div>
            <div>
              <span>Gerenciar sessão</span>
              <h3>{selectedSession.title}</h3>
            </div>
          </div>
          <div className={styles.manageSummary}>
            <div><span>Status</span><strong>{getScheduledSessionStatusLabel(selectedSession.status)}</strong></div>
            <div><span>Horário</span><strong>{selectedSession.startAt.slice(8, 10)}/{selectedSession.startAt.slice(5, 7)} · {getTime(selectedSession.startAt)}</strong></div>
            <div><span>Criada em</span><strong>{selectedSession.createdAt.slice(8, 10)}/{selectedSession.createdAt.slice(5, 7)}</strong></div>
            <div><span>Aula</span><strong>{selectedSession.lessonTitle ?? "Sem aula vinculada"}</strong></div>
          </div>
          <label className={styles.rescheduleField}>
            Novo horário
            <span>
              <input type="datetime-local" value={rescheduleAt} onChange={(event) => setRescheduleAt(event.target.value)} />
              <button type="button" onClick={() => updateSelectedSession("reschedule")}><RefreshCw size={15} /> Reagendar</button>
            </span>
          </label>
          <div className={styles.sessionActions}>
            {selectedSession.status === "proposed" ? (
              <button type="button" onClick={() => updateSelectedSession("confirm")}><CheckCircle2 size={16} /> Confirmar</button>
            ) : null}
            <button type="button" onClick={() => updateSelectedSession("complete")}><CheckCircle2 size={16} /> Concluir</button>
            <button type="button" onClick={() => updateSelectedSession("missed")}><Clock3 size={16} /> Não realizada</button>
            <button type="button" className={styles.dangerAction} onClick={() => updateSelectedSession("cancel")}><XCircle size={16} /> Cancelar</button>
          </div>
          <p className={styles.preservedNote}>Reagendar preserva a data de criação, as notas e o vínculo com a aula.</p>
          {scheduleFeedback ? <p className={styles[scheduleFeedback.tone]} role="status">{scheduleFeedback.message}</p> : null}
        </GlassPanel>
      </div>

      <GlassPanel strong className={styles.notificationPanel}>
        <div className={styles.panelHeading}>
          <div className={styles.headingIcon}><Bell size={20} strokeWidth={1.8} /></div>
          <div>
            <span>Notificações internas</span>
            <h3>Eventos importantes sem depender de e-mail</h3>
          </div>
          <PillChip tone={unreadNotificationCount > 0 ? "warning" : "default"}>
            {unreadNotificationCount} não lidas
          </PillChip>
        </div>

        <div className={styles.notificationToolbar}>
          <div role="group" aria-label="Filtro de notificações">
            <button type="button" aria-pressed={notificationFilter === "unread"} onClick={() => setNotificationFilter("unread")}>Não lidas</button>
            <button type="button" aria-pressed={notificationFilter === "all"} onClick={() => setNotificationFilter("all")}>Todas</button>
          </div>
          <button type="button" onClick={() => setNotifications((current) => markAllNotificationsRead(current, "mentee-preview"))}>
            <CheckCircle2 size={15} /> Marcar todas como lidas
          </button>
        </div>

        <div className={styles.notificationList}>
          {visibleNotifications.length === 0 ? (
            <div className={styles.emptyState}>Nenhuma notificação neste filtro.</div>
          ) : visibleNotifications.map((notification) => (
            <button
              type="button"
              className={notification.read ? styles.readNotification : ""}
              key={notification.id}
              onClick={() => {
                setNotifications((current) => markNotificationRead(current, notification.id));
                if (notification.relatedEntityType === "session") setSelectedSessionId(notification.relatedEntityId);
              }}
            >
              <span className={styles.notificationDot} />
              <span>
                <small>{getNotificationTypeLabel(notification.type)}</small>
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
              </span>
              <span className={styles.notificationLink}>
                {notification.relatedEntityType} <ExternalLink size={14} />
              </span>
            </button>
          ))}
        </div>

        <div className={styles.deliveryNote}>
          <Bell size={16} />
          <span>A entrega inicial acontece dentro do aplicativo. A ausência de configuração de e-mail não bloqueia o MVP.</span>
        </div>
      </GlassPanel>

      <GlassPanel className={styles.communicationPanel}>
        <div className={styles.panelHeading}>
          <div className={styles.headingIcon}><MessagesSquare size={20} strokeWidth={1.8} /></div>
          <div>
            <span>Notas de comunicação</span>
            <h3>Decisões e próximos passos com contexto</h3>
          </div>
          <div className={styles.noteRoleSwitch} role="group" aria-label="Perspectiva das notas">
            <button type="button" aria-pressed={noteViewerRole === "mentor"} onClick={() => {
              setNoteViewerRole("mentor");
              setNoteDraft((current) => ({ ...current, type: "mentor_shared" }));
            }}>Mentor</button>
            <button type="button" aria-pressed={noteViewerRole === "mentee"} onClick={() => {
              setNoteViewerRole("mentee");
              setNoteDraft((current) => ({ ...current, type: "mentee_note" }));
            }}>Mentorado</button>
          </div>
        </div>

        <div className={styles.communicationGrid}>
          <div className={styles.noteTimeline}>
            <div className={styles.noteFilters}>
              {(["all", "relationship", "plan", "lesson", "session"] as const).map((context) => (
                <button type="button" key={context} aria-pressed={noteContextFilter === context} onClick={() => setNoteContextFilter(context)}>
                  {context === "all" ? "Todos" : context === "relationship" ? "Relação" : context === "plan" ? "Plano" : context === "lesson" ? "Aula" : "Sessão"}
                </button>
              ))}
            </div>
            {visibleNotes.length === 0 ? (
              <div className={styles.emptyState}>Nenhuma nota visível neste contexto.</div>
            ) : visibleNotes.map((note) => (
              <article className={styles.noteCard} key={note.id}>
                <div>
                  <span>{getCommunicationNoteTypeLabel(note.type)}</span>
                  <PillChip tone={note.visibility === "mentor_only" ? "warning" : "default"}>
                    {note.visibility === "mentor_only" ? "Só mentor" : "Compartilhada"}
                  </PillChip>
                </div>
                <p>{note.body}</p>
                <footer>
                  <span>{note.authorRole === "mentor" ? "Mentor" : "Mentorado"}</span>
                  <span>{note.contextType} · {note.contextLabel}</span>
                </footer>
              </article>
            ))}
          </div>

          <form className={styles.noteForm} onSubmit={submitCommunicationNote}>
            <div className={styles.miniHeading}>
              <div>{noteViewerRole === "mentor" ? <LockKeyhole size={18} /> : <UserRound size={18} />}<strong>Registrar nota</strong></div>
              <span>Sem conversa em tempo real</span>
            </div>
            {noteViewerRole === "mentor" ? (
              <label>
                Tipo
                <select value={noteDraft.type} onChange={(event) => setNoteDraft((current) => ({ ...current, type: event.target.value as CommunicationNoteType }))}>
                  <option value="mentor_private">Nota privada do mentor</option>
                  <option value="mentor_shared">Nota compartilhada</option>
                  <option value="next_action">Próxima ação</option>
                  <option value="session_summary">Resumo da sessão</option>
                </select>
              </label>
            ) : (
              <div className={styles.menteeNoteLabel}>Tipo: nota do mentorado</div>
            )}
            <label>
              Contexto
              <select value={noteDraft.contextType} onChange={(event) => setNoteDraft((current) => ({ ...current, contextType: event.target.value as CommunicationContextType }))}>
                <option value="relationship">Relação de mentoria</option>
                <option value="plan">Plano atual</option>
                <option value="lesson">Aula selecionada</option>
                <option value="session">Sessão selecionada</option>
              </select>
            </label>
            <label>
              Conteúdo
              <textarea rows={6} placeholder="Registre uma decisão, dúvida ou próximo passo." value={noteDraft.body} onChange={(event) => setNoteDraft((current) => ({ ...current, body: event.target.value }))} />
            </label>
            {noteFeedback ? <p className={styles[noteFeedback.tone]} role="status">{noteFeedback.message}</p> : null}
            <GlassButton type="submit" icon={<Send size={16} />}>Registrar nota</GlassButton>
          </form>
        </div>
      </GlassPanel>
    </section>
  );
}
