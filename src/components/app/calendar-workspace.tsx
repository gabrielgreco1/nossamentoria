"use client";

import {
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RotateCcw,
  UserRound,
  XCircle
} from "lucide-react";
import { useMemo, useState } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import {
  changeScheduledSessionStatus,
  createScheduledSession,
  getScheduledSessionStatusLabel,
  initialScheduledSessions,
  type ScheduledSession
} from "@/lib/calendar-and-communication";
import type { UserRole } from "@/lib/access";
import styles from "./workspace-board.module.css";

const weekDays = [
  { iso: "2026-10-19", day: "19", label: "Seg" },
  { iso: "2026-10-20", day: "20", label: "Ter" },
  { iso: "2026-10-21", day: "21", label: "Qua" },
  { iso: "2026-10-22", day: "22", label: "Qui" },
  { iso: "2026-10-23", day: "23", label: "Sex" },
  { iso: "2026-10-24", day: "24", label: "Sáb" },
  { iso: "2026-10-25", day: "25", label: "Dom" }
];

function formatTime(value: string) {
  return value.slice(11, 16);
}

function formatDay(value: string) {
  return value.slice(8, 10);
}

function formatMonth(value: string) {
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return months[Number(value.slice(5, 7)) - 1];
}

export function CalendarWorkspace({ role }: { role?: UserRole | null }) {
  const [sessions, setSessions] = useState(initialScheduledSessions);
  const [selectedId, setSelectedId] = useState(initialScheduledSessions[0].id);
  const [menteeFilter, setMenteeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [draft, setDraft] = useState({
    title: "",
    menteeId: "bruno-souza",
    menteeName: "Bruno Souza",
    lessonTitle: "",
    startAt: "2026-10-29T19:00",
    durationMinutes: 60,
    notes: ""
  });

  const visibleSessions = useMemo(() => sessions
    .filter((session) => role === "mentee"
      ? session.menteeId === "mentee-preview"
      : menteeFilter === "all" || session.menteeId === menteeFilter)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()), [sessions, menteeFilter, role]);
  const upcoming = visibleSessions.filter((session) => ["proposed", "confirmed"].includes(session.status));
  const selected = sessions.find((session) => session.id === selectedId) ?? sessions[0];

  function submitSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const next = createScheduledSession({
        ...draft,
        mentorId: "mentor-preview",
        mentorName: "Mentor atual",
        planId: "plan-preview",
        planTitle: "Trilha de desenvolvimento frontend",
        lessonId: draft.lessonTitle ? "lesson-new" : undefined,
        durationMinutes: Number(draft.durationMinutes),
        requiresConfirmation: true
      }, new Date().toISOString());
      setSessions((current) => [...current, next]);
      setSelectedId(next.id);
      setShowForm(false);
      setFeedback("Sessão proposta e adicionada ao calendário.");
      setDraft((current) => ({ ...current, title: "", lessonTitle: "", notes: "" }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível agendar a sessão.");
    }
  }

  function updateStatus(status: ScheduledSession["status"]) {
    setSessions((current) => current.map((session) => session.id === selected.id ? changeScheduledSessionStatus(session, status) : session));
    setFeedback(`Sessão atualizada para “${getScheduledSessionStatusLabel(status)}”.`);
  }

  return (
    <section className={styles.workspace} aria-label="Calendário de mentorias">
      <GlassPanel className={styles.calendarTopbar}>
        <div>
          <span className={styles.eyebrow}>Semana atual</span>
          <h2 style={{ margin: "4px 0 0" }}>19–25 de outubro de 2026</h2>
        </div>
        <div className={styles.calendarControls}>
          <button className={styles.iconButton} type="button" aria-label="Semana anterior"><ChevronLeft size={17} /></button>
          <button className={styles.textButton} type="button">Hoje</button>
          <button className={styles.iconButton} type="button" aria-label="Próxima semana"><ChevronRight size={17} /></button>
          {role !== "mentee" ? (
            <>
              <select aria-label="Filtrar por mentorado" value={menteeFilter} onChange={(event) => setMenteeFilter(event.target.value)}>
                <option value="all">Todos os mentorados</option>
                <option value="mentee-preview">Bruno Souza</option>
                <option value="another-mentee">Ana Ribeiro</option>
              </select>
              <GlassButton icon={<CalendarPlus size={16} />} onClick={() => setShowForm((current) => !current)}>Nova sessão</GlassButton>
            </>
          ) : <PillChip>Minha agenda</PillChip>}
        </div>
      </GlassPanel>

      {feedback ? <div className={styles.feedback} role="status">{feedback}</div> : null}

      {showForm && role !== "mentee" ? (
        <GlassPanel strong className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span className={styles.eyebrow}>Agendamento rápido</span><h2>Nova sessão</h2></div>
            <button className={styles.iconButton} type="button" onClick={() => setShowForm(false)} aria-label="Fechar formulário"><XCircle size={17} /></button>
          </div>
          <form className={styles.form} onSubmit={submitSession}>
            <div className={styles.threeFields}>
              <label>Título<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
              <label>Mentorado<select value={draft.menteeId} onChange={(event) => {
                const isAna = event.target.value === "another-mentee";
                setDraft((current) => ({ ...current, menteeId: event.target.value, menteeName: isAna ? "Ana Ribeiro" : "Bruno Souza" }));
              }}><option value="mentee-preview">Bruno Souza</option><option value="another-mentee">Ana Ribeiro</option></select></label>
              <label>Aula relacionada<input placeholder="Opcional" value={draft.lessonTitle} onChange={(event) => setDraft((current) => ({ ...current, lessonTitle: event.target.value }))} /></label>
            </div>
            <div className={styles.threeFields}>
              <label>Data e hora<input type="datetime-local" value={draft.startAt} onChange={(event) => setDraft((current) => ({ ...current, startAt: event.target.value }))} /></label>
              <label>Duração<select value={draft.durationMinutes} onChange={(event) => setDraft((current) => ({ ...current, durationMinutes: Number(event.target.value) }))}><option value={45}>45 min</option><option value={60}>60 min</option><option value={90}>90 min</option></select></label>
              <label>Observação<input value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} /></label>
            </div>
            <div className={styles.panelActions}><span className={styles.helper}>O mentorado receberá uma proposta para confirmar.</span><GlassButton type="submit" icon={<CalendarPlus size={15} />}>Criar sessão</GlassButton></div>
          </form>
        </GlassPanel>
      ) : null}

      <GlassPanel strong className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><span className={styles.eyebrow}>Visão semanal</span><h2>Compromissos</h2></div>
          <PillChip tone="muted">{upcoming.length} próximas sessões</PillChip>
        </div>
        <div className={styles.weekGrid}>
          {weekDays.map((day) => {
            const daySessions = visibleSessions.filter((session) => session.startAt.startsWith(day.iso));
            return (
              <div className={[styles.dayColumn, day.iso === "2026-10-22" ? styles.dayToday : ""].join(" ")} key={day.iso}>
                <div className={styles.dayLabel}><span>{day.label}</span><strong>{day.day}</strong></div>
                {daySessions.length ? daySessions.map((session) => (
                  <button className={styles.eventCard} type="button" key={session.id} onClick={() => setSelectedId(session.id)}>
                    <span>{formatTime(session.startAt)}–{formatTime(session.endAt)}</span>
                    <strong>{session.title}</strong>
                    <span>{session.menteeName}</span>
                  </button>
                )) : <span className={styles.muted}>Livre</span>}
              </div>
            );
          })}
        </div>
      </GlassPanel>

      <div className={styles.calendarWorkspace}>
        <GlassPanel className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span className={styles.eyebrow}>Agenda</span><h2>Próximas sessões</h2></div>
            <PillChip>{upcoming.length} agendadas</PillChip>
          </div>
          {upcoming.length ? (
            <div className={styles.agendaList}>
              {upcoming.map((session) => (
                <button className={[styles.agendaItem, selectedId === session.id ? styles.agendaItemActive : ""].join(" ")} type="button" key={session.id} onClick={() => setSelectedId(session.id)}>
                  <span className={styles.dateBadge}><strong>{formatDay(session.startAt)}</strong><small>{formatMonth(session.startAt)}</small></span>
                  <span className={styles.personCopy}><strong>{session.title}</strong><small>{formatTime(session.startAt)} · {session.menteeName}</small></span>
                  <PillChip tone={session.status === "confirmed" ? "default" : "warning"}>{getScheduledSessionStatusLabel(session.status)}</PillChip>
                </button>
              ))}
            </div>
          ) : <div className={styles.emptyState}>Nenhuma próxima sessão neste filtro.</div>}
        </GlassPanel>

        <GlassPanel className={styles.panel}>
          <div className={styles.detailHeader}>
            <div><span className={styles.eyebrow}>Detalhes</span><h2>{selected.title}</h2></div>
            <PillChip tone={selected.status === "confirmed" || selected.status === "completed" ? "default" : "warning"}>{getScheduledSessionStatusLabel(selected.status)}</PillChip>
          </div>
          <div className={styles.detailGrid}>
            <div><span>Mentorado</span><strong><UserRound size={14} /> {selected.menteeName}</strong></div>
            <div><span>Horário</span><strong><Clock3 size={14} /> {formatDay(selected.startAt)}/{selected.startAt.slice(5, 7)}, {formatTime(selected.startAt)}</strong></div>
            <div><span>Plano</span><strong>{selected.planTitle}</strong></div>
            <div><span>Aula</span><strong>{selected.lessonTitle ?? "Sessão geral"}</strong></div>
          </div>
          <div className={styles.notice}>{selected.notes || "Sem observações adicionais para esta sessão."}</div>
          <div className={styles.rowActions}>
            <button className={styles.textButton} type="button" onClick={() => updateStatus("confirmed")}><CheckCircle2 size={14} /> Confirmar</button>
            <button className={styles.textButton} type="button" onClick={() => setFeedback(role === "mentee" ? "Pedido de reagendamento registrado para o mentor." : "Escolha uma nova data no formulário de reagendamento.")}><RotateCcw size={14} /> {role === "mentee" ? "Pedir reagendamento" : "Reagendar"}</button>
            {role !== "mentee" ? <button className={[styles.textButton, styles.textButtonDanger].join(" ")} type="button" onClick={() => updateStatus("canceled")}><XCircle size={14} /> Cancelar</button> : null}
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
