"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import type { UserRole } from "@/lib/access";
import type { CalendarSessionItem } from "@/lib/workspace-data";
import styles from "./workspace-board.module.css";

const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function sessionIso(value: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function sessionTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function WeeklyCalendar({ sessions, today, role }: { sessions: CalendarSessionItem[]; today: string; role?: UserRole | null }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const days = useMemo(() => {
    const anchor = new Date(`${today}T12:00:00`);
    const mondayOffset = (anchor.getDay() + 6) % 7;
    anchor.setDate(anchor.getDate() - mondayOffset + weekOffset * 7);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(anchor);
      date.setDate(anchor.getDate() + index);
      return { date, iso: isoDate(date), label: dayLabels[index] };
    });
  }, [today, weekOffset]);
  const visibleCount = sessions.filter((session) => days.some((day) => day.iso === sessionIso(session.scheduledStart))).length;
  const range = `${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(days[0].date)} – ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(days[6].date)}`;

  return (
    <GlassPanel strong className={styles.panel}>
      <div className={styles.panelHeader}>
        <div><span className={styles.eyebrow}>Visão semanal</span><h2>{range}</h2></div>
        <div className={styles.calendarControls}>
          <button className={styles.iconButton} type="button" aria-label="Semana anterior" onClick={() => setWeekOffset((value) => value - 1)}><ChevronLeft size={17} /></button>
          <button className={styles.textButton} type="button" onClick={() => setWeekOffset(0)}>Hoje</button>
          <button className={styles.iconButton} type="button" aria-label="Próxima semana" onClick={() => setWeekOffset((value) => value + 1)}><ChevronRight size={17} /></button>
          <PillChip tone="muted">{visibleCount} sessão(ões)</PillChip>
        </div>
      </div>
      <div className={styles.weekGrid}>
        {days.map((day) => {
          const daySessions = sessions.filter((session) => sessionIso(session.scheduledStart) === day.iso);
          return (
            <div className={[styles.dayColumn, day.iso === today ? styles.dayToday : ""].join(" ")} key={day.iso}>
              <div className={styles.dayLabel}><span>{day.label}</span><strong>{day.date.getDate()}</strong></div>
              {daySessions.length ? daySessions.map((session) => (
                <article className={styles.eventCard} key={session.id}>
                  <span>{sessionTime(session.scheduledStart)}–{sessionTime(session.scheduledEnd)}</span>
                  <strong>{session.title}</strong>
                  <span>{role === "mentee" ? session.planTitle : session.counterpartName}</span>
                </article>
              )) : <span className={styles.muted}>Livre</span>}
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
