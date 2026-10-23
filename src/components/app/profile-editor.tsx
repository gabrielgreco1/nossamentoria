"use client";

import {
  BrainCircuit,
  Check,
  ChevronDown,
  Clock3,
  GraduationCap,
  Link2,
  Plus,
  Save,
  Trash2,
  UserRound
} from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { updateProfile, type ProfileMutationState } from "@/app/app/profile/actions";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import { getKnowledgeSelectionLabel, normalizeProfileUrl } from "@/lib/registration";
import type { ProfileFormation, ProfilePageData } from "@/lib/profile-data";
import styles from "./profile-editor.module.css";

const initialState: ProfileMutationState = { status: "idle", message: "" };
const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

type EditableFormation = ProfileFormation & { clientId: string };
type EditablePeriod = { clientId: string; weekday: number; startTime: string; endTime: string };

function blankFormation(index: number): EditableFormation {
  return {
    id: "",
    clientId: `formation-${Date.now()}-${index}`,
    institution: "",
    course: "",
    degree: "Graduação",
    status: "in_progress",
    startYear: null,
    endYear: null
  };
}

export function ProfileEditor({ data }: { data: ProfilePageData }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);
  const [selectedTopics, setSelectedTopics] = useState(data.selectedTopicSlugs);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(
    data.areas.find((area) => area.topics.some((topic) => data.selectedTopicSlugs.includes(topic.slug)))?.id ?? null
  );
  const [periods, setPeriods] = useState<EditablePeriod[]>(data.availabilityPeriods.map((period) => ({
    clientId: period.id,
    weekday: period.weekday,
    startTime: period.startTime,
    endTime: period.endTime
  })));
  const [formations, setFormations] = useState<EditableFormation[]>(
    data.formations.length
      ? data.formations.map((formation) => ({ ...formation, clientId: formation.id }))
      : data.role === "mentor" ? [blankFormation(0)] : []
  );

  const selectionLabel = data.role ? getKnowledgeSelectionLabel(data.role) : "conhecimentos";
  const selectedAreas = useMemo(
    () => data.areas.filter((area) => area.topics.some((topic) => selectedTopics.includes(topic.slug))).length,
    [data.areas, selectedTopics]
  );
  const mentorLinksRequired = data.roles.includes("mentor");
  const hasRoleProfile = data.role === "mentor" || data.role === "mentee";

  function toggleTopic(slug: string) {
    setSelectedTopics((current) => current.includes(slug)
      ? current.filter((topic) => topic !== slug)
      : [...current, slug]
    );
  }

  function addPeriod() {
    if (periods.length >= 14) return;
    setPeriods((current) => [...current, {
      clientId: `period-${Date.now()}-${current.length}`,
      weekday: 1,
      startTime: "18:00",
      endTime: "19:00"
    }]);
  }

  function updatePeriod(clientId: string, changes: Partial<EditablePeriod>) {
    setPeriods((current) => current.map((period) => period.clientId === clientId ? { ...period, ...changes } : period));
  }

  function updateFormation(clientId: string, changes: Partial<EditableFormation>) {
    setFormations((current) => current.map((formation) => formation.clientId === clientId ? { ...formation, ...changes } : formation));
  }

  return (
    <form action={action} className={styles.form} data-tour="profile-editor">
      {selectedTopics.map((slug) => <input name="topicSlugs" type="hidden" value={slug} key={slug} />)}

      {data.loadError ? <div className={styles.error} role="alert">Não foi possível carregar o perfil. Tente novamente.</div> : null}
      {state.status !== "idle" ? (
        <div className={state.status === "success" ? styles.feedback : styles.error} role="status">{state.message}</div>
      ) : null}

      <div className={styles.grid}>
        <GlassPanel strong className={styles.panel}>
          <div className={styles.heading}>
            <div><h2>Informações pessoais</h2></div>
            <span className={styles.icon}><UserRound size={19} /></span>
          </div>
          <div className={styles.fields}>
            <label>Nome completo<input name="displayName" defaultValue={data.displayName} minLength={3} maxLength={120} autoComplete="name" required /></label>
            <label>E-mail<input value={data.email} type="email" disabled /><small>O e-mail de acesso não é alterado por esta tela.</small></label>
          </div>
          <label>Apresentação<textarea name="bio" defaultValue={data.bio} rows={5} maxLength={800} placeholder="Conte sobre sua trajetória, momento atual e objetivos." /></label>
        </GlassPanel>

        <GlassPanel className={styles.panel}>
          <div className={styles.heading}>
            <div><h2>Links profissionais</h2></div>
            <span className={styles.icon}><Link2 size={19} /></span>
          </div>
          <label>
            LinkedIn {mentorLinksRequired ? <PillChip>Obrigatório para mentor</PillChip> : null}
            <input
              name="linkedinUrl"
              type="url"
              defaultValue={data.linkedinUrl}
              placeholder="linkedin.com/in/seu-perfil"
              onBlur={(event) => { event.currentTarget.value = normalizeProfileUrl(event.currentTarget.value); }}
              required={mentorLinksRequired}
            />
          </label>
          <label>
            GitHub {mentorLinksRequired ? <PillChip>Obrigatório para mentor</PillChip> : null}
            <input
              name="githubUrl"
              type="url"
              defaultValue={data.githubUrl}
              placeholder="github.com/seu-usuario"
              onBlur={(event) => { event.currentTarget.value = normalizeProfileUrl(event.currentTarget.value); }}
              required={mentorLinksRequired}
            />
          </label>
        </GlassPanel>

        {hasRoleProfile ? (
          <GlassPanel className={styles.widePanel}>
            <div className={styles.heading}>
              <div>
                <h2>{data.role === "mentor" ? "Especialidades" : "Interesses de aprendizado"}</h2>
                <p>Abra uma área e marque os conhecimentos que representam seu perfil.</p>
              </div>
              <span className={styles.icon}><BrainCircuit size={19} /></span>
            </div>
            <div className={styles.subheading}>
              <div><strong>{selectedAreas} área(s)</strong><span className={styles.muted}>{selectedTopics.length} {selectionLabel} selecionado(s)</span></div>
              <PillChip>{data.role === "mentor" ? "Perfil de ensino" : "Perfil de aprendizado"}</PillChip>
            </div>
            <div className={styles.areaList}>
              {data.areas.map((area) => {
                const selectedCount = area.topics.filter((topic) => selectedTopics.includes(topic.slug)).length;
                const expanded = expandedAreaId === area.id;
                return (
                  <div className={styles.areaCard} key={area.id}>
                    <button className={styles.areaButton} type="button" onClick={() => setExpandedAreaId(expanded ? null : area.id)} aria-expanded={expanded}>
                      <span className={styles.areaMark}>{selectedCount ? <Check size={15} /> : null}</span>
                      <span className={styles.areaCopy}><strong>{area.name}</strong><small>{area.description}</small></span>
                      {selectedCount ? <PillChip>{selectedCount}</PillChip> : null}
                      <ChevronDown className={[styles.chevron, expanded ? styles.chevronOpen : ""].join(" ")} size={18} />
                    </button>
                    {expanded ? (
                      <div className={styles.topicOptions}>
                        {area.topics.map((topic) => (
                          <label key={topic.id}>
                            <input type="checkbox" checked={selectedTopics.includes(topic.slug)} onChange={() => toggleTopic(topic.slug)} />
                            <span><strong>{topic.name}</strong><small>{topic.description}</small></span>
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        ) : null}

        {hasRoleProfile ? (
          <GlassPanel className={styles.widePanel}>
            <div className={styles.heading}>
              <div>
                <h2>{data.role === "mentor" ? "Disponibilidade para ensinar" : "Disponibilidade para aprender"}</h2>
                <p>Informe os períodos semanais em que outras pessoas podem combinar encontros com você.</p>
              </div>
              <span className={styles.icon}><Clock3 size={19} /></span>
            </div>
            <div className={styles.periodList}>
              {periods.map((period) => (
                <div className={styles.periodRow} key={period.clientId}>
                  <label>Dia<select name="availabilityWeekday" value={period.weekday} onChange={(event) => updatePeriod(period.clientId, { weekday: Number(event.target.value) })}>{weekdays.map((day, index) => <option value={index} key={day}>{day}</option>)}</select></label>
                  <label>Início<input name="availabilityStart" type="time" value={period.startTime} onChange={(event) => updatePeriod(period.clientId, { startTime: event.target.value })} required /></label>
                  <label>Fim<input name="availabilityEnd" type="time" value={period.endTime} onChange={(event) => updatePeriod(period.clientId, { endTime: event.target.value })} required /></label>
                  <button className={styles.removeButton} type="button" onClick={() => setPeriods((current) => current.filter((item) => item.clientId !== period.clientId))}><Trash2 size={14} /> Remover</button>
                </div>
              ))}
              {periods.length === 0 ? <p className={styles.helper}>Nenhum período informado. Você ainda poderá combinar horários individualmente.</p> : null}
            </div>
            <button className={styles.addButton} type="button" onClick={addPeriod} disabled={periods.length >= 14}><Plus size={15} /> Adicionar período</button>
            <label>Observações opcionais<textarea name="availabilityNotes" defaultValue={data.availabilityNotes} rows={3} maxLength={300} placeholder="Ex.: horários flexíveis em semanas alternadas." /></label>

            {data.role === "mentor" ? (
              <div className={styles.capacityBox}>
                <div><strong>Limite de mentorados</strong><p>Você possui {data.activeMenteeCount} mentoria(s) ativa(s). Use zero para pausar novas solicitações.</p></div>
                <label>Máximo<input name="mentorCapacity" type="number" min={data.activeMenteeCount} max={50} defaultValue={data.mentorCapacity} required /></label>
              </div>
            ) : null}
          </GlassPanel>
        ) : null}

        {data.role === "mentor" ? (
          <GlassPanel className={styles.widePanel}>
            <div className={styles.heading}>
              <div><h2>Formação acadêmica</h2></div>
              <span className={styles.icon}><GraduationCap size={19} /></span>
            </div>
            <div className={styles.formationList}>
              {formations.map((formation, index) => (
                <div className={styles.formationCard} key={formation.clientId}>
                  <div className={styles.rowHeader}>
                    <strong>Formação {index + 1}</strong>
                    {formations.length > 1 ? <button className={styles.removeButton} type="button" onClick={() => setFormations((current) => current.filter((item) => item.clientId !== formation.clientId))}><Trash2 size={14} /> Remover</button> : null}
                  </div>
                  <div className={styles.fields}>
                    <label>Instituição<input name="educationInstitution" value={formation.institution} onChange={(event) => updateFormation(formation.clientId, { institution: event.target.value })} required /></label>
                    <label>Curso<input name="educationCourse" value={formation.course} onChange={(event) => updateFormation(formation.clientId, { course: event.target.value })} required /></label>
                  </div>
                  <div className={styles.formationFields}>
                    <label>Tipo<select name="educationDegree" value={formation.degree} onChange={(event) => updateFormation(formation.clientId, { degree: event.target.value })}><option>Curso técnico</option><option>Graduação</option><option>Pós-graduação</option><option>MBA</option><option>Mestrado</option><option>Doutorado</option><option>Bootcamp</option><option>Curso livre</option></select></label>
                    <label>Status<select name="educationStatus" value={formation.status} onChange={(event) => updateFormation(formation.clientId, { status: event.target.value as EditableFormation["status"] })}><option value="in_progress">Em andamento</option><option value="completed">Concluída</option><option value="paused">Pausada</option></select></label>
                    <div className={styles.fields}>
                      <label>Início<input name="educationStartYear" type="number" min={1950} max={2100} value={formation.startYear ?? ""} onChange={(event) => updateFormation(formation.clientId, { startYear: event.target.value ? Number(event.target.value) : null })} /></label>
                      <label>Fim<input name="educationEndYear" type="number" min={1950} max={2100} value={formation.endYear ?? ""} onChange={(event) => updateFormation(formation.clientId, { endYear: event.target.value ? Number(event.target.value) : null })} /></label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className={styles.addButton} type="button" onClick={() => setFormations((current) => [...current, blankFormation(current.length)])} disabled={formations.length >= 5}><Plus size={15} /> Adicionar formação</button>
          </GlassPanel>
        ) : null}
      </div>

      <div className={styles.saveBar}>
        <GlassButton type="submit" icon={<Save size={16} />} disabled={pending}>{pending ? "Salvando..." : "Salvar perfil"}</GlassButton>
      </div>
    </form>
  );
}
