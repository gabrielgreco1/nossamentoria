import {
  Bell,
  BookOpenCheck,
  CalendarDays,
  ExternalLink,
  FileText,
  NotebookPen,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { MaterialCard } from "@/components/app/material-card";
import { ProgressIndicator } from "@/components/app/progress-indicator";
import { SessionCard } from "@/components/app/session-card";
import { WeeklyCalendar } from "@/components/app/weekly-calendar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import type { UserRole } from "@/lib/access";
import type {
  CalendarWorkspaceData,
  MaterialsWorkspaceData,
  PlansWorkspaceData
} from "@/lib/workspace-data";
import styles from "./workspace-board.module.css";

function formatDate(value: string, includeTime = false) {
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {})
  }).format(new Date(normalizedValue));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Rascunho",
    active: "Ativo",
    completed: "Concluído",
    paused: "Pausado",
    proposed: "Proposto",
    confirmed: "Confirmado",
    canceled: "Cancelado",
    missed: "Não realizado"
  };
  return labels[status] ?? status;
}

function materialTypeLabel(type: string) {
  const labels: Record<string, string> = {
    html: "HTML",
    pdf: "PDF",
    presentation: "Apresentação",
    markdown: "Markdown",
    text: "Texto",
    image: "Imagem",
    external_link: "Link externo",
    repository: "Repositório"
  };
  return labels[type] ?? type;
}

export function LivePlansWorkspace({ data, role }: { data: PlansWorkspaceData; role?: UserRole | null }) {
  const activeCount = data.items.filter((plan) => plan.status === "active").length;
  const completedCount = data.items.filter((plan) => plan.status === "completed").length;
  const totalLessons = data.items.reduce((total, plan) => total + plan.totalLessons, 0);

  return (
    <section className={styles.workspace} aria-label="Planos de mentoria">
      <div className={styles.summaryGrid}>
        <GlassPanel className={styles.summaryCard}>
          <div><small>Total de planos</small><strong>{data.items.length}</strong><span className={styles.muted}>no seu perfil</span></div>
          <span className={styles.iconBox}><BookOpenCheck size={19} /></span>
        </GlassPanel>
        <GlassPanel className={styles.summaryCard}>
          <div><small>Em andamento</small><strong>{activeCount}</strong><span className={styles.muted}>planos ativos</span></div>
          <span className={styles.iconBox}><UsersRound size={19} /></span>
        </GlassPanel>
        <GlassPanel className={styles.summaryCard}>
          <div><small>Aulas organizadas</small><strong>{totalLessons}</strong><span className={styles.muted}>{completedCount} plano(s) concluído(s)</span></div>
          <span className={styles.iconBox}><CalendarDays size={19} /></span>
        </GlassPanel>
      </div>

      {data.loadError ? <div className={styles.notice} role="alert">Não foi possível carregar os planos. Tente novamente.</div> : null}

      {data.items.length ? data.items.map((plan) => (
        <GlassPanel strong className={styles.panel} key={plan.id}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>{role === "mentee" ? `Mentor: ${plan.mentorName}` : `Mentorado: ${plan.menteeName}`}</span>
              <h2>{plan.title}</h2>
            </div>
            <PillChip tone={plan.status === "active" ? "default" : plan.status === "draft" || plan.status === "paused" ? "warning" : "muted"}>
              {statusLabel(plan.status)}
            </PillChip>
          </div>
          <p>{plan.mainGoal}</p>
          <ProgressIndicator value={plan.completionPercentage} label="Progresso pelas aulas concluídas" />
          <div className={styles.detailGrid}>
            <div><span>Área principal</span><strong>{plan.contentArea}</strong></div>
            <div><span>Aulas</span><strong>{plan.completedLessons} de {plan.totalLessons} concluídas</strong></div>
            <div><span>Período</span><strong>{formatDate(plan.startDate)} – {formatDate(plan.expectedEndDate)}</strong></div>
            <div><span>Próxima sessão</span><strong>{plan.nextSessionAt ? formatDate(plan.nextSessionAt, true) : "Não agendada"}</strong></div>
          </div>
          {plan.topics.length ? <div className={styles.tagRow}>{plan.topics.map((topic) => <span key={topic}>{topic}</span>)}</div> : null}
        </GlassPanel>
      )) : (
        <EmptyState
          title={role === "mentee" ? "Você ainda não possui um plano" : "Nenhum plano criado"}
          description={role === "mentee"
            ? "O plano aparecerá aqui depois que sua mentoria for aceita e o mentor estruturar a trilha."
            : "Primeiro estabeleça uma relação de mentoria. Os planos criados para relações reais aparecerão aqui."}
          action={<Link className={styles.textButton} href="/app/relationships">Ir para mentorias</Link>}
        />
      )}
    </section>
  );
}

export function LiveMaterialsWorkspace({ data, role }: { data: MaterialsWorkspaceData; role?: UserRole | null }) {
  return (
    <section className={styles.workspace} aria-label="Materiais">
      {data.loadError ? <div className={styles.notice} role="alert">Não foi possível carregar os materiais. Tente novamente.</div> : null}

      <GlassPanel strong className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><h2>{role === "mentee" ? "Materiais compartilhados" : "Materiais disponíveis"}</h2></div>
          <PillChip tone="muted">{data.materials.length} item(ns)</PillChip>
        </div>
        {data.materials.length ? (
          <div className={styles.materialGrid}>
            {data.materials.map((material) => (
              <MaterialCard
                key={material.id}
                icon={<FileText size={19} />}
                typeLabel={materialTypeLabel(material.type)}
                category={material.category}
                title={material.title}
                description={material.description}
                tags={material.tags}
                status={material.shared ? "Compartilhado" : "Privado"}
                statusTone={material.shared ? "default" : "muted"}
                meta={`Adicionado em ${formatDate(material.createdAt)}`}
                action={material.sourceUrl ? (
                  <a className={styles.textButton} href={material.sourceUrl} target="_blank" rel="noreferrer">Abrir <ExternalLink size={13} /></a>
                ) : <span className={styles.muted}>Arquivo privado</span>}
              />
            ))}
          </div>
        ) : <div className={styles.emptyState}>{role === "mentee" ? "Nenhum material foi compartilhado com você." : "Nenhum material foi adicionado à biblioteca."}</div>}
      </GlassPanel>

      {role !== "mentee" ? (
        <GlassPanel className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><h2>Templates disponíveis</h2></div>
            <PillChip tone="muted">{data.templates.length} template(s)</PillChip>
          </div>
          {data.templates.length ? (
            <ul className={styles.templateList}>
              {data.templates.map((template) => (
                <li className={styles.templateItem} key={template.id}>
                  <strong>{template.title}</strong>
                  <span>{template.category} · {template.estimatedDurationMinutes} minutos · {template.global ? "Global" : "Privado"}</span>
                  <p>{template.objective}</p>
                </li>
              ))}
            </ul>
          ) : <div className={styles.emptyState}>Nenhum template disponível.</div>}
        </GlassPanel>
      ) : null}
    </section>
  );
}

export function LiveCalendarWorkspace({ data, role }: { data: CalendarWorkspaceData; role?: UserRole | null }) {
  const unreadCount = data.notifications.filter((notification) => !notification.read).length;

  return (
    <section className={styles.workspace} aria-label="Agenda e comunicação">
      <div className={styles.summaryGrid}>
        <GlassPanel className={styles.summaryCard}>
          <div><small>Próximas sessões</small><strong>{data.upcoming.length}</strong><span className={styles.muted}>propostas ou confirmadas</span></div>
          <span className={styles.iconBox}><CalendarDays size={19} /></span>
        </GlassPanel>
        <GlassPanel className={styles.summaryCard}>
          <div><small>Histórico</small><strong>{data.history.length}</strong><span className={styles.muted}>sessões anteriores</span></div>
          <span className={styles.iconBox}><BookOpenCheck size={19} /></span>
        </GlassPanel>
        <GlassPanel className={styles.summaryCard}>
          <div><small>Notificações</small><strong>{unreadCount}</strong><span className={styles.muted}>não lidas</span></div>
          <span className={styles.iconBox}><Bell size={19} /></span>
        </GlassPanel>
      </div>

      {data.loadError ? <div className={styles.notice} role="alert">Não foi possível carregar a agenda. Tente novamente.</div> : null}

      <WeeklyCalendar
        sessions={[...data.upcoming, ...data.history]}
        today={data.today}
        role={role}
      />

      <div className={styles.mainGrid}>
        <GlassPanel strong className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><h2>Próximos encontros</h2></div>
            <PillChip>{data.upcoming.length} sessão(ões)</PillChip>
          </div>
          {data.upcoming.length ? (
            <div className={styles.stack}>
              {data.upcoming.map((session) => (
                <SessionCard
                  key={session.id}
                  icon={<CalendarDays size={19} />}
                  eyebrow={`${statusLabel(session.status)} · ${formatDate(session.scheduledStart, true)}`}
                  title={session.title}
                  description={`${role === "mentee" ? "Mentor" : "Mentorado"}: ${session.counterpartName} · ${session.planTitle}${session.lessonTitle ? ` · ${session.lessonTitle}` : ""}`}
                />
              ))}
            </div>
          ) : <div className={styles.emptyState}>Nenhum encontro futuro agendado.</div>}
        </GlassPanel>

        <GlassPanel className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><h3>Sessões anteriores</h3></div>
            <PillChip tone="muted">{data.history.length}</PillChip>
          </div>
          {data.history.length ? (
            <ul className={styles.agendaList}>
              {data.history.map((session) => (
                <li className={styles.agendaItem} key={session.id}>
                  <span className={styles.dateBadge}><strong>{formatDate(session.scheduledStart)}</strong></span>
                  <span><strong>{session.title}</strong><small>{session.counterpartName} · {statusLabel(session.status)}</small></span>
                </li>
              ))}
            </ul>
          ) : <div className={styles.emptyState}>Ainda não existe histórico de sessões.</div>}
        </GlassPanel>
      </div>

      <div className={styles.mainGrid}>
        <GlassPanel className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><h2>Notificações</h2></div>
            <PillChip tone={unreadCount ? "warning" : "muted"}>{unreadCount} não lida(s)</PillChip>
          </div>
          {data.notifications.length ? (
            <ul className={styles.list}>
              {data.notifications.map((notification) => (
                <li className={styles.pendingRow} key={notification.id}>
                  <span className={styles.avatar}><Bell size={16} /></span>
                  <span className={styles.personCopy}>
                    <strong>{notification.title}</strong>
                    <small>{notification.body} · {formatDate(notification.createdAt, true)}</small>
                  </span>
                  <PillChip tone={notification.read ? "muted" : "warning"}>{notification.read ? "Lida" : "Nova"}</PillChip>
                </li>
              ))}
            </ul>
          ) : <div className={styles.emptyState}>Nenhuma notificação registrada.</div>}
        </GlassPanel>

        <GlassPanel className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><h2>Notas recentes</h2></div>
            <span className={styles.iconBox}><NotebookPen size={18} /></span>
          </div>
          {data.notes.length ? (
            <ul className={styles.list}>
              {data.notes.map((note) => (
                <li className={styles.templateItem} key={note.id}>
                  <strong>{note.authorRole === "mentor" ? "Mentor" : "Mentorado"} · {formatDate(note.createdAt, true)}</strong>
                  <p>{note.body}</p>
                  <span>{note.visibility === "mentor_only" ? "Privada do mentor" : "Compartilhada"}</span>
                </li>
              ))}
            </ul>
          ) : <div className={styles.emptyState}>Nenhuma nota registrada no seu contexto.</div>}
        </GlassPanel>
      </div>
    </section>
  );
}
