"use client";

import { Edit3, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { savePlan, type PlanMutationState } from "@/app/app/plans/actions";
import { EmptyState } from "@/components/app/empty-state";
import { ProgressIndicator } from "@/components/app/progress-indicator";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import type { PlanWorkspaceItem, PlansWorkspaceData } from "@/lib/workspace-data";
import styles from "./workspace-board.module.css";

const initialState: PlanMutationState = { status: "idle", message: "" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "medium" })
    .format(new Date(`${value}T12:00:00`));
}

function statusLabel(status: string) {
  return ({ draft: "Rascunho", active: "Ativo", completed: "Concluído", paused: "Pausado" } as Record<string, string>)[status] ?? status;
}

function PlanForm({ plan, relationshipId, onCancel }: {
  plan?: PlanWorkspaceItem;
  relationshipId: string;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(savePlan, initialState);

  useEffect(() => {
    if (state.status === "success") onCancel();
  }, [state.status, onCancel]);

  return (
    <GlassPanel strong className={styles.panel}>
      <div className={styles.panelHeader}>
        <div><span className={styles.eyebrow}>{plan ? "Editar plano" : "Novo plano"}</span><h2>{plan?.title ?? "Estruture a nova jornada"}</h2></div>
        <PillChip tone={plan?.status === "active" ? "default" : "warning"}>{plan ? statusLabel(plan.status) : "Rascunho"}</PillChip>
      </div>
      <form action={action} className={styles.form}>
        <input name="relationshipId" type="hidden" value={relationshipId} />
        <input name="planId" type="hidden" value={plan?.id ?? ""} />
        <div className={styles.twoFields}>
          <label>Título<input name="title" required maxLength={160} defaultValue={plan?.title ?? ""} /></label>
          <label>Área principal<input name="contentArea" required maxLength={120} defaultValue={plan?.contentArea ?? ""} /></label>
        </div>
        <label>Objetivo principal<textarea name="mainGoal" required rows={3} defaultValue={plan?.mainGoal ?? ""} /></label>
        <label>Tópicos<input name="topics" placeholder="React, APIs, carreira" defaultValue={plan?.topics.join(", ") ?? ""} /></label>
        <div className={styles.threeFields}>
          <label>Data de início<input name="startDate" required type="date" defaultValue={plan?.startDate ?? ""} /></label>
          <label>Término esperado<input name="expectedEndDate" required type="date" defaultValue={plan?.expectedEndDate ?? ""} /></label>
          <label>Duração<input name="durationLabel" required placeholder="12 semanas" defaultValue={plan?.durationLabel ?? ""} /></label>
        </div>
        <label>Status
          <select name="status" defaultValue={plan?.status ?? "draft"}>
            <option value="draft">Rascunho</option>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="completed">Concluído</option>
          </select>
        </label>
        {state.status !== "idle" ? <div className={state.status === "error" ? styles.noticeError : styles.feedback} role="status">{state.message}</div> : null}
        <div className={styles.panelActions}>
          <button className={styles.textButton} type="button" onClick={onCancel}>Cancelar</button>
          <GlassButton type="submit" disabled={pending} icon={<Save size={15} />}>{pending ? "Salvando..." : "Salvar plano"}</GlassButton>
        </div>
      </form>
    </GlassPanel>
  );
}

export function PlanManager({ data, selectedRelationshipId }: {
  data: PlansWorkspaceData;
  selectedRelationshipId?: string;
}) {
  const selectedRelationship = data.relationships.find((item) => item.id === selectedRelationshipId) ?? data.relationships[0] ?? null;
  const selectedPlans = useMemo(
    () => data.items.filter((plan) => plan.relationshipId === selectedRelationship?.id),
    [data.items, selectedRelationship?.id]
  );
  const [editor, setEditor] = useState<string | "new" | null>(selectedPlans.length ? null : "new");

  useEffect(() => {
    setEditor(selectedPlans.length ? null : "new");
  }, [selectedRelationship?.id]);

  if (data.loadError) return <div className={styles.notice} role="alert">Não foi possível carregar os planos. Tente novamente.</div>;
  if (!selectedRelationship) {
    return <EmptyState title="Nenhum mentorado ativo" description="Aceite uma mentoria antes de criar o primeiro plano." action={<Link className={styles.textButton} href="/app/relationships">Ir para mentorados</Link>} />;
  }

  const planBeingEdited = editor && editor !== "new" ? data.items.find((plan) => plan.id === editor) : undefined;

  return (
    <section className={styles.workspace} aria-label="Planos por mentorado" data-tour="plans-workspace">
      <GlassPanel className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><h2>Escolha um mentorado</h2></div>
          <PillChip tone="muted">{data.relationships.length} relação(ões)</PillChip>
        </div>
        <div className={styles.selectorStrip}>
          {data.relationships.map((relationship) => {
            const plans = data.items.filter((plan) => plan.relationshipId === relationship.id);
            const selected = relationship.id === selectedRelationship.id;
            return (
              <Link
                className={[styles.selectCard, selected ? styles.selectCardActive : ""].join(" ")}
                href={`/app/plans?relationship=${relationship.id}`}
                key={relationship.id}
              >
                <div className={styles.selectCardTop}>
                  <span className={styles.avatar}>{relationship.menteeName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}</span>
                  <span><strong>{relationship.menteeName}</strong><small>{plans.length ? `${plans.length} plano(s)` : "Sem plano"}</small></span>
                </div>
              </Link>
            );
          })}
        </div>
      </GlassPanel>

      <div className={styles.panelHeader}>
        <div><span className={styles.eyebrow}>Mentorado selecionado</span><h2>{selectedRelationship.menteeName}</h2></div>
        <GlassButton icon={<Plus size={15} />} onClick={() => setEditor("new")}>Novo plano</GlassButton>
      </div>

      {editor ? (
        <PlanForm
          key={editor}
          plan={planBeingEdited}
          relationshipId={selectedRelationship.id}
          onCancel={() => setEditor(null)}
        />
      ) : null}

      {selectedPlans.length ? selectedPlans.map((plan) => (
        <GlassPanel strong className={styles.panel} key={plan.id}>
          <div className={styles.panelHeader}>
            <div><span className={styles.eyebrow}>{plan.contentArea}</span><h2>{plan.title}</h2></div>
            <div className={styles.rowActions}>
              <PillChip tone={plan.status === "active" ? "default" : plan.status === "completed" ? "muted" : "warning"}>{statusLabel(plan.status)}</PillChip>
              <button className={styles.textButton} type="button" onClick={() => setEditor(plan.id)}><Edit3 size={14} /> Editar</button>
            </div>
          </div>
          <p>{plan.mainGoal}</p>
          <ProgressIndicator value={plan.completionPercentage} label="Progresso pelas aulas concluídas" />
          <div className={styles.detailGrid}>
            <div><span>Aulas</span><strong>{plan.completedLessons} de {plan.totalLessons} concluídas</strong></div>
            <div><span>Período</span><strong>{formatDate(plan.startDate)} – {formatDate(plan.expectedEndDate)}</strong></div>
          </div>
          {plan.topics.length ? <div className={styles.tagRow}>{plan.topics.map((topic) => <span key={topic}>{topic}</span>)}</div> : null}
        </GlassPanel>
      )) : editor !== "new" ? <div className={styles.emptyState}>Este mentorado ainda não possui um plano.</div> : null}
    </section>
  );
}
