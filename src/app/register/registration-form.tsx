"use client";

import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  UsersRound
} from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { PillChip } from "@/components/ui/pill-chip";
import type { UserRole } from "@/lib/access";
import {
  PASSWORD_MIN_LENGTH,
  getKnowledgeSelectionLabel,
  normalizeProfileUrl,
  validatePassword,
  type KnowledgeAreaOption
} from "@/lib/registration";
import { registerUser, type RegistrationState } from "./actions";
import styles from "./page.module.css";

const initialState: RegistrationState = { status: "idle", message: "" };
const steps = ["Tipo de perfil", "Conta e acesso", "Perfil profissional", "Áreas e conhecimentos"];

type RegistrationFormProps = {
  areas: KnowledgeAreaOption[];
  inviteToken?: string;
  invitedEmail?: string;
  invitedRole?: UserRole;
};

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function RegistrationForm({ areas, inviteToken, invitedEmail, invitedRole }: RegistrationFormProps) {
  const [state, action, pending] = useActionState(registerUser, initialState);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole>(invitedRole ?? "mentee");
  const [formationCount, setFormationCount] = useState(1);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [clientError, setClientError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const selectionLabel = getKnowledgeSelectionLabel(role);

  function focusStep(nextStep: number) {
    setStep(nextStep);
    setClientError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => document.getElementById(`registration-step-${nextStep}`)?.focus(), 0);
  }

  function validateCurrentStep(currentStep: number) {
    const panel = formRef.current?.querySelector<HTMLElement>(`[data-step="${currentStep}"]`);

    if (currentStep === 2 && panel) {
      for (const fieldName of ["linkedinUrl", "githubUrl"]) {
        const input = panel.querySelector<HTMLInputElement>(`input[name="${fieldName}"]`);
        if (input) input.value = normalizeProfileUrl(input.value);
      }
    }

    const controls = panel ? Array.from(panel.querySelectorAll<FormControl>("input, textarea, select")) : [];

    for (const control of controls) {
      if (!control.checkValidity()) {
        control.reportValidity();
        return false;
      }
    }

    if (currentStep === 1 && formRef.current) {
      const password = formRef.current.elements.namedItem("password");
      const confirmation = formRef.current.elements.namedItem("passwordConfirmation");

      if (password instanceof HTMLInputElement) {
        const passwordError = validatePassword(password.value);
        if (passwordError) {
          setClientError(passwordError);
          password.focus();
          return false;
        }
      }

      if (
        password instanceof HTMLInputElement &&
        confirmation instanceof HTMLInputElement &&
        password.value !== confirmation.value
      ) {
        setClientError("A confirmação da senha não corresponde.");
        confirmation.focus();
        return false;
      }
    }

    if (currentStep === 3 && selectedTopics.length === 0) {
      setClientError(
        role === "mentor"
          ? "Selecione ao menos uma especialidade dentro de uma área."
          : "Selecione ao menos um conhecimento de interesse dentro de uma área."
      );
      return false;
    }

    setClientError("");
    return true;
  }

  function nextStep() {
    if (validateCurrentStep(step)) focusStep(Math.min(step + 1, steps.length - 1));
  }

  function toggleArea(area: KnowledgeAreaOption) {
    if (!selectedAreaIds.includes(area.id)) {
      setSelectedAreaIds((current) => [...current, area.id]);
      setExpandedAreaId(area.id);
      return;
    }

    setExpandedAreaId((current) => current === area.id ? null : area.id);
  }

  function removeArea(area: KnowledgeAreaOption) {
    const areaTopics = new Set(area.topics.map((topic) => topic.slug));
    setSelectedAreaIds((current) => current.filter((id) => id !== area.id));
    setSelectedTopics((current) => current.filter((slug) => !areaTopics.has(slug)));
    setExpandedAreaId((current) => current === area.id ? null : current);
  }

  function toggleTopic(slug: string) {
    setSelectedTopics((current) => current.includes(slug)
      ? current.filter((currentSlug) => currentSlug !== slug)
      : [...current, slug]
    );
    setClientError("");
  }

  if (state.status === "success") {
    return (
      <div className={styles.successState} role="status">
        <ShieldCheck size={26} />
        <div><strong>Confirme seu e-mail</strong><p>{state.message}</p></div>
      </div>
    );
  }

  return (
    <form
      action={action}
      className={styles.form}
      ref={formRef}
      onSubmit={(event) => {
        if (!validateCurrentStep(3)) event.preventDefault();
      }}
    >
      {inviteToken ? <input name="inviteToken" type="hidden" value={inviteToken} /> : null}
      {selectedTopics.map((slug) => <input name="topicSlugs" type="hidden" value={slug} key={slug} />)}

      <div className={styles.progressHeader} aria-label={`Etapa ${step + 1} de ${steps.length}`}>
        <div className={styles.progressCopy}>
          <span>Etapa {step + 1} de {steps.length}</span>
          <strong>{steps[step]}</strong>
        </div>
        <div className={styles.progressTrack} aria-hidden="true">
          <span style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <ol className={styles.stepper}>
          {steps.map((label, index) => (
            <li
              className={index === step ? styles.stepCurrent : index < step ? styles.stepComplete : ""}
              key={label}
              aria-current={index === step ? "step" : undefined}
            >
              <span>{index < step ? <Check size={13} /> : index + 1}</span>
              <small>{label}</small>
            </li>
          ))}
        </ol>
      </div>

      <section className={[styles.stepPanel, step !== 0 ? styles.stepHidden : ""].join(" ")} data-step="0" aria-hidden={step !== 0}>
        <div className={styles.sectionHeading}>
          <span>01</span>
          <div><h2 id="registration-step-0" tabIndex={-1}>Como você quer participar?</h2><p>Escolha o perfil que representa sua participação na NossaMentoria.</p></div>
        </div>

        {invitedRole ? (
          <div className={styles.invitedRole}>
            <span>Papel definido pelo convite</span>
            <PillChip>{invitedRole === "admin" ? "Administrador" : invitedRole === "mentor" ? "Mentor" : "Mentorado"}</PillChip>
            <input name="role" type="hidden" value={invitedRole} />
          </div>
        ) : (
          <fieldset className={styles.roleFieldset}>
            <legend className={styles.srOnly}>Escolha seu tipo de perfil</legend>
            <label className={role === "mentee" ? styles.roleSelected : ""}>
              <input name="role" type="radio" value="mentee" checked={role === "mentee"} onChange={() => setRole("mentee")} />
              <span className={styles.roleIcon}><GraduationCap size={22} /></span>
              <span><strong>Quero ser mentorado</strong><small>Busco orientação, acompanhamento e um plano para evoluir.</small></span>
            </label>
            <label className={role === "mentor" ? styles.roleSelected : ""}>
              <input name="role" type="radio" value="mentor" checked={role === "mentor"} onChange={() => setRole("mentor")} />
              <span className={styles.roleIcon}><UsersRound size={22} /></span>
              <span><strong>Quero ser mentor</strong><small>Quero compartilhar experiência e acompanhar outras pessoas.</small></span>
            </label>
          </fieldset>
        )}
      </section>

      <section className={[styles.stepPanel, step !== 1 ? styles.stepHidden : ""].join(" ")} data-step="1" aria-hidden={step !== 1}>
        <div className={styles.sectionHeading}>
          <span>02</span>
          <div><h2 id="registration-step-1" tabIndex={-1}>Crie sua conta</h2><p>Estes dados serão usados para confirmar seu e-mail e acessar a plataforma.</p></div>
        </div>
        <div className={styles.twoColumns}>
          <label>Nome completo<input name="fullName" autoComplete="name" required /></label>
          <label>E-mail<input name="email" type="email" autoComplete="email" defaultValue={invitedEmail} readOnly={Boolean(invitedEmail)} required /></label>
        </div>
        <div className={styles.twoColumns}>
          <label>Senha<input name="password" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required /><small>Mínimo de {PASSWORD_MIN_LENGTH} caracteres, com maiúscula, minúscula, número e símbolo.</small></label>
          <label>Confirmar senha<input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required /></label>
        </div>
      </section>

      <section className={[styles.stepPanel, step !== 2 ? styles.stepHidden : ""].join(" ")} data-step="2" aria-hidden={step !== 2}>
        <div className={styles.sectionHeading}>
          <span>03</span>
          <div><h2 id="registration-step-2" tabIndex={-1}>Perfil profissional</h2><p>Conte um pouco sobre você para criar conexões mais coerentes.</p></div>
        </div>
        <label>Apresentação<textarea name="bio" rows={4} maxLength={800} placeholder="Conte brevemente sobre sua trajetória e seus objetivos." /></label>
        <div className={styles.twoColumns}>
          <label>LinkedIn {role === "mentor" ? <em>obrigatório</em> : <small>opcional</small>}<input name="linkedinUrl" type="url" placeholder="linkedin.com/in/seu-perfil" onBlur={(event) => { event.currentTarget.value = normalizeProfileUrl(event.currentTarget.value); }} required={role === "mentor"} /><small>Você pode informar com ou sem https://.</small></label>
          <label>GitHub {role === "mentor" ? <em>obrigatório</em> : <small>opcional</small>}<input name="githubUrl" type="url" placeholder="github.com/seu-usuario" onBlur={(event) => { event.currentTarget.value = normalizeProfileUrl(event.currentTarget.value); }} required={role === "mentor"} /><small>Você pode informar com ou sem https://.</small></label>
        </div>

        {role === "mentor" ? (
          <div className={styles.formationSection}>
            <div className={styles.subsectionHeading}><div><strong>Formação acadêmica</strong><p>Obrigatória para mentores. Adicione ao menos uma formação.</p></div><PillChip>Obrigatória</PillChip></div>
            <div className={styles.formations}>
              {Array.from({ length: formationCount }, (_, index) => (
                <div className={styles.formationCard} key={index}>
                  <div className={styles.formationHeader}><strong>Formação {index + 1}</strong>{formationCount > 1 ? <button type="button" onClick={() => setFormationCount((count) => Math.max(1, count - 1))}><Trash2 size={14} /> Remover</button> : null}</div>
                  <div className={styles.twoColumns}>
                    <label>Instituição<input name="educationInstitution" required /></label>
                    <label>Curso<input name="educationCourse" required /></label>
                  </div>
                  <div className={styles.threeColumns}>
                    <label>Tipo<select name="educationDegree" defaultValue="Graduação" required><option>Curso técnico</option><option>Graduação</option><option>Pós-graduação</option><option>MBA</option><option>Mestrado</option><option>Doutorado</option><option>Bootcamp</option><option>Curso livre</option></select></label>
                    <label>Status<select name="educationStatus" defaultValue="in_progress"><option value="in_progress">Em andamento</option><option value="completed">Concluída</option><option value="paused">Pausada</option></select></label>
                    <div className={styles.yearFields}><label>Início<input name="educationStartYear" type="number" min="1950" max="2100" placeholder="2022" /></label><label>Fim<input name="educationEndYear" type="number" min="1950" max="2100" placeholder="2026" /></label></div>
                  </div>
                </div>
              ))}
            </div>
            <button className={styles.addButton} type="button" onClick={() => setFormationCount((count) => Math.min(5, count + 1))} disabled={formationCount >= 5}><Plus size={15} /> Adicionar outra formação</button>
          </div>
        ) : null}
      </section>

      <section className={[styles.stepPanel, step !== 3 ? styles.stepHidden : ""].join(" ")} data-step="3" aria-hidden={step !== 3}>
        <div className={styles.sectionHeading}>
          <span>04</span>
          <div><h2 id="registration-step-3" tabIndex={-1}>{role === "mentor" ? "Suas especialidades" : "Seus interesses"}</h2><p>Primeiro escolha uma área. Depois marque os conhecimentos relacionados.</p></div>
        </div>

        <div className={styles.selectionSummary}>
          <span>{selectedAreaIds.length} {selectedAreaIds.length === 1 ? "área selecionada" : "áreas selecionadas"}</span>
          <strong>{selectedTopics.length} {selectedTopics.length === 1 ? "conhecimento" : "conhecimentos"}</strong>
        </div>

        <div className={styles.areaList}>
          {areas.map((area) => {
            const selected = selectedAreaIds.includes(area.id);
            const expanded = expandedAreaId === area.id;
            const selectedCount = area.topics.filter((topic) => selectedTopics.includes(topic.slug)).length;

            return (
              <div className={[styles.areaPicker, selected ? styles.areaSelected : ""].join(" ")} key={area.id}>
                <button type="button" className={styles.areaButton} onClick={() => toggleArea(area)} aria-expanded={expanded}>
                  <span className={styles.areaCheck}>{selected ? <Check size={15} /> : null}</span>
                  <span className={styles.areaCopy}><strong>{area.name}</strong><small>{area.description}</small></span>
                  {selectedCount ? <PillChip>{selectedCount} selecionado{selectedCount > 1 ? "s" : ""}</PillChip> : null}
                  <ChevronDown className={expanded ? styles.chevronExpanded : ""} size={18} />
                </button>

                {expanded ? (
                  <div className={styles.topicDropdown}>
                    <div className={styles.topicDropdownHeading}>
                      <span>Escolha suas {selectionLabel}</span>
                      <button type="button" onClick={() => removeArea(area)}>Remover área</button>
                    </div>
                    <div className={styles.topicOptions}>
                      {area.topics.map((topic) => (
                        <label className={selectedTopics.includes(topic.slug) ? styles.topicSelected : ""} key={topic.id}>
                          <input type="checkbox" value={topic.slug} checked={selectedTopics.includes(topic.slug)} onChange={() => toggleTopic(topic.slug)} />
                          <span><strong>{topic.name}</strong><small>{topic.description}</small></span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {clientError ? <div className={styles.error} role="alert">{clientError}</div> : null}
      {state.status === "error" ? <div className={styles.error} role="alert">{state.message}</div> : null}

      <div className={styles.navigation}>
        {step > 0 ? <GlassButton type="button" variant="secondary" icon={<ChevronLeft size={16} />} onClick={() => focusStep(step - 1)}>Voltar</GlassButton> : <span />}
        {step < steps.length - 1 ? (
          <GlassButton type="button" icon={<ChevronRight size={16} />} onClick={nextStep}>Continuar</GlassButton>
        ) : (
          <div className={styles.submitAction}>
            <p>Você receberá um e-mail para confirmar seu cadastro.</p>
            <GlassButton type="submit" icon={<UserPlus size={16} />} disabled={pending}>{pending ? "Criando conta..." : "Criar conta"}</GlassButton>
          </div>
        )}
      </div>
    </form>
  );
}
