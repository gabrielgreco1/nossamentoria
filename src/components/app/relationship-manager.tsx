"use client";

import {
  ArrowUpRight,
  Check,
  Clock3,
  MailPlus,
  Search,
  UserMinus,
  UserPlus,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  cancelMenteeInvitation,
  createMenteeInvitation,
  endMentorship,
  requestMentee,
  requestMentor,
  respondToMentorshipRequest,
  type MenteeInvitationState,
  type RelationshipMutationState
} from "@/app/app/relationships/actions";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import type { UserRole } from "@/lib/access";
import type { RelationshipPageData } from "@/lib/relationship-data";
import styles from "./workspace-board.module.css";

const initialMutationState: RelationshipMutationState = { status: "idle", message: "" };

type RelationshipManagerProps = {
  role?: UserRole | null;
  data: RelationshipPageData;
};

function statusLabel(status: string | null, direction?: "incoming" | "outgoing" | null) {
  if (status === "requested") return direction === "incoming" ? "Solicitação recebida" : "Solicitação enviada";
  if (status === "invited") return "Convite pendente";
  if (status === "paused") return "Mentoria pausada";
  if (status === "active") return "Mentoria ativa";
  return null;
}

export function RelationshipManager({ role, data }: RelationshipManagerProps) {
  const [invitationState, invitationAction, invitationPending] = useActionState(createMenteeInvitation, {
    status: "idle",
    message: ""
  } satisfies MenteeInvitationState);
  const [requestState, requestAction, requestPending] = useActionState(requestMentee, initialMutationState);
  const [mentorRequestState, mentorRequestAction, mentorRequestPending] = useActionState(requestMentor, initialMutationState);
  const [responseState, responseAction, responsePending] = useActionState(respondToMentorshipRequest, initialMutationState);
  const [endState, endAction, endPending] = useActionState(endMentorship, initialMutationState);
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelMenteeInvitation, initialMutationState);
  const [removalId, setRemovalId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredAvailable = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return data.management.availableMentees.filter((person) =>
      !normalized || `${person.name} ${person.focus} ${person.bio}`.toLocaleLowerCase("pt-BR").includes(normalized)
    );
  }, [data.management.availableMentees, query]);

  const filteredMentors = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return data.mentee.availableMentors.filter((person) =>
      !normalized || `${person.name} ${person.focus} ${person.bio}`.toLocaleLowerCase("pt-BR").includes(normalized)
    );
  }, [data.mentee.availableMentors, query]);

  const mutationFeedback = [requestState, mentorRequestState, responseState, endState, cancelState]
    .find((state) => state.status !== "idle");

  if (role === "mentee") {
    const mentorship = data.mentee.mentorship;
    const activePlan = mentorship?.planStatus === "active";

    return (
      <section className={styles.workspace} aria-label="Minha relação de mentoria">
        <div className={styles.summaryGrid}>
          <GlassPanel className={styles.summaryCard}>
            <div>
              <small>Mentor atual</small>
              <strong>{mentorship ? 1 : 0}</strong>
              <span className={styles.muted}>{mentorship ? "relação em andamento" : "nenhuma relação ativa"}</span>
            </div>
            <span className={styles.iconBox}><UsersRound size={19} /></span>
          </GlassPanel>
          <GlassPanel className={styles.summaryCard}>
            <div>
              <small>Plano</small>
              <strong>{activePlan ? `${mentorship.planProgress}%` : "0"}</strong>
              <span className={styles.muted}>{activePlan ? "concluído" : "nenhum plano ativo"}</span>
            </div>
            <span className={styles.iconBox}><Check size={19} /></span>
          </GlassPanel>
          <GlassPanel className={styles.summaryCard}>
            <div>
              <small>Próximo encontro</small>
              <strong>{mentorship?.nextSessionDay ?? "0"}</strong>
              <span className={styles.muted}>{mentorship?.nextSessionRest ?? "nenhum encontro agendado"}</span>
            </div>
            <span className={styles.iconBox}><Clock3 size={19} /></span>
          </GlassPanel>
        </div>

        {data.loadError ? <div className={styles.notice} role="alert">Não foi possível carregar as mentorias. Tente novamente.</div> : null}
        {mutationFeedback ? <div className={styles.feedback} role="status">{mutationFeedback.message}</div> : null}

        <div className={styles.mainGrid}>
          <GlassPanel strong className={styles.panel}>
            {mentorship ? (
              <>
                <div className={styles.panelHeader}>
                  <div><span className={styles.eyebrow}>Mentoria atual</span><h2>{mentorship.mentorName}</h2></div>
                  <PillChip tone={mentorship.status === "paused" ? "warning" : "default"}>
                    {mentorship.status === "paused" ? "Pausada" : "Ativa"}
                  </PillChip>
                </div>
                <p>{mentorship.mainGoal}</p>
                <div className={styles.detailGrid}>
                  <div><span>Foco atual</span><strong>{mentorship.focus}</strong></div>
                  <div><span>Plano</span><strong>{mentorship.planTitle ?? "Ainda não criado"}</strong></div>
                  <div><span>Próxima sessão</span><strong>{mentorship.nextSessionAt ?? "Ainda não agendada"}</strong></div>
                  <div><span>Status</span><strong>{mentorship.status === "paused" ? "Pausada" : "Em andamento"}</strong></div>
                </div>
                {mentorship.planId ? (
                  <div className={styles.rowActions}>
                    <Link className={styles.textButton} href="/app/plans">Abrir meu plano <ArrowUpRight size={13} /></Link>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className={styles.panelHeader}>
                  <div><span className={styles.eyebrow}>Próximo passo</span><h2>Aguardando uma mentoria</h2></div>
                  <PillChip tone={data.mentee.isAvailable ? "default" : "warning"}>
                    {data.mentee.isAvailable ? "Perfil disponível" : "Perfil indisponível"}
                  </PillChip>
                </div>
                <p>
                  Você ainda não possui mentor, plano ou encontro. Seu perfil aparece para mentores enquanto estiver disponível;
                  quando uma solicitação chegar, ela será exibida ao lado para sua aprovação.
                </p>
                {data.mentee.interests.length ? (
                  <div className={styles.tagRow} aria-label="Seus interesses">
                    {data.mentee.interests.map((interest) => <span key={interest}>{interest}</span>)}
                  </div>
                ) : null}
              </>
            )}
          </GlassPanel>

          <GlassPanel className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.eyebrow}>Solicitações</span><h3>Pedidos recebidos</h3></div>
              <PillChip tone={data.mentee.requests.length ? "warning" : "muted"}>{data.mentee.requests.length} pendente(s)</PillChip>
            </div>
            {data.mentee.requests.length ? (
              <ul className={styles.list}>
                {data.mentee.requests.map((request) => (
                  <li className={styles.pendingRow} key={request.relationshipId}>
                    <span className={styles.avatar}><MailPlus size={17} /></span>
                    <span className={styles.personCopy}>
                      <strong>{request.mentorName}</strong>
                      <small>Solicitado em {request.requestedAt}</small>
                    </span>
                    <form action={responseAction} className={styles.rowActions}>
                      <input name="relationshipId" type="hidden" value={request.relationshipId} />
                      <button className={styles.textButton} name="decision" value="accept" disabled={responsePending}>
                        <Check size={14} /> Aceitar
                      </button>
                      <button className={[styles.textButton, styles.textButtonDanger].join(" ")} name="decision" value="decline" disabled={responsePending}>
                        Recusar
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : <div className={styles.emptyState}>Nenhuma solicitação aguardando sua resposta.</div>}
            {data.mentee.outgoingRequests.length ? (
              <>
                <div className={styles.panelHeader}>
                  <div><span className={styles.eyebrow}>Enviadas</span><h3>Aguardando mentores</h3></div>
                  <PillChip tone="muted">{data.mentee.outgoingRequests.length} enviada(s)</PillChip>
                </div>
                <ul className={styles.list}>
                  {data.mentee.outgoingRequests.map((request) => (
                    <li className={styles.pendingRow} key={request.relationshipId}>
                      <span className={styles.avatar}><Clock3 size={17} /></span>
                      <span className={styles.personCopy}>
                        <strong>{request.mentorName}</strong>
                        <small>Solicitada em {request.requestedAt}</small>
                      </span>
                      <PillChip tone="warning">Aguardando resposta</PillChip>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </GlassPanel>
        </div>

        <GlassPanel className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span className={styles.eyebrow}>Encontrar mentoria</span><h2>Mentores com vagas disponíveis</h2></div>
            <PillChip tone="muted">{data.mentee.availableMentors.length} mentor(es)</PillChip>
          </div>
          <div className={styles.toolbar}>
            <label className={styles.searchWrap}>
              <Search size={17} />
              <input
                type="search"
                placeholder="Buscar por nome ou especialidade"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
          {filteredMentors.length ? (
            <div className={styles.cardGrid}>
              {filteredMentors.map((mentor) => {
                const relationshipLabel = statusLabel(mentor.relationshipStatus, mentor.relationshipDirection);
                const hasOpenRelationship = mentor.relationshipStatus === "requested" || mentor.relationshipStatus === "invited";
                return (
                  <article className={styles.selectCard} key={mentor.id}>
                    <div className={styles.selectCardTop}>
                      <span className={styles.avatar}>{mentor.initials}</span>
                      <span><strong>{mentor.name}</strong><small>{mentor.focus}</small></span>
                    </div>
                    <p>{mentor.bio}</p>
                    <small className={styles.muted}>{mentor.availability}</small>
                    <PillChip tone="default">
                      {mentor.availableSlots} {mentor.availableSlots === 1 ? "vaga disponível" : "vagas disponíveis"}
                    </PillChip>
                    <form action={mentorRequestAction}>
                      <input name="mentorUserId" type="hidden" value={mentor.id} />
                      <button className={styles.textButton} disabled={mentorRequestPending || hasOpenRelationship}>
                        {hasOpenRelationship
                          ? <><Check size={14} /> {relationshipLabel}</>
                          : <><UserPlus size={14} /> Solicitar mentoria</>}
                      </button>
                    </form>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              {data.mentee.mentorship
                ? "Você já possui uma mentoria em andamento."
                : "Nenhum mentor com vagas corresponde à busca."}
            </div>
          )}
        </GlassPanel>
      </section>
    );
  }

  const { mentees, availableMentees, incomingRequests, capacity, openRequestCount, pendingInvitations } = data.management;

  return (
    <section className={styles.workspace} aria-label="Gestão de mentorados">
      <div className={styles.summaryGrid}>
        <GlassPanel className={styles.summaryCard}>
          <div>
            <small>Seus mentorados</small>
            <strong>{capacity ? `${capacity.activeCount}/${capacity.limit}` : mentees.length}</strong>
            <span className={styles.muted}>{capacity ? `${capacity.availableSlots} vaga(s) disponível(is)` : "relações ativas ou pausadas"}</span>
          </div>
          <span className={styles.iconBox}><UsersRound size={19} /></span>
        </GlassPanel>
        <GlassPanel className={styles.summaryCard}>
          <div><small>Solicitações abertas</small><strong>{openRequestCount}</strong><span className={styles.muted}>aguardando aceite</span></div>
          <span className={styles.iconBox}><Clock3 size={19} /></span>
        </GlassPanel>
        <GlassPanel className={styles.summaryCard}>
          <div><small>Convites pendentes</small><strong>{pendingInvitations.length}</strong><span className={styles.muted}>links ainda válidos</span></div>
          <span className={styles.iconBox}><MailPlus size={19} /></span>
        </GlassPanel>
      </div>

      {data.loadError ? <div className={styles.notice} role="alert">Não foi possível carregar os mentorados. Tente novamente.</div> : null}
      {mutationFeedback ? <div className={styles.feedback} role="status">{mutationFeedback.message}</div> : null}

      <div className={styles.mainGrid}>
        <GlassPanel strong className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span className={styles.eyebrow}>Seu grupo</span><h2>Seus mentorados</h2></div>
            <PillChip>{mentees.length} pessoa(s)</PillChip>
          </div>

          {mentees.length ? (
            <ul className={styles.list}>
              {mentees.map((mentee) => (
                <li className={styles.personRow} key={mentee.relationshipId}>
                  <span className={styles.avatar}>{mentee.initials}</span>
                  <span className={styles.personCopy}>
                    <Link className={styles.personLink} href={`/app/plans?relationship=${mentee.relationshipId}`}>
                      <strong>{mentee.name}</strong>
                    </Link>
                    <small>{mentee.focus} · {mentee.availability}</small>
                    <span>
                      <PillChip tone={mentee.planStatus === "active" ? "default" : "warning"}>
                        {mentee.planStatus === "active" ? "Plano ativo" : mentee.planId ? "Plano em rascunho" : "Plano a criar"}
                      </PillChip>
                    </span>
                  </span>
                  <span className={styles.rowActions}>
                    <Link className={styles.textButton} href={`/app/plans?relationship=${mentee.relationshipId}`}>
                      {mentee.planId ? "Abrir plano" : "Criar plano"} <ArrowUpRight size={13} />
                    </Link>
                    {removalId === mentee.relationshipId ? (
                      <form action={endAction} className={styles.rowActions}>
                        <input name="relationshipId" type="hidden" value={mentee.relationshipId} />
                        <button className={[styles.textButton, styles.textButtonDanger].join(" ")} disabled={endPending}>
                          <UserMinus size={14} /> Confirmar
                        </button>
                        <button className={styles.textButton} type="button" onClick={() => setRemovalId(null)}>Voltar</button>
                      </form>
                    ) : (
                      <button
                        className={[styles.textButton, styles.textButtonDanger].join(" ")}
                        type="button"
                        onClick={() => setRemovalId(mentee.relationshipId)}
                        aria-label={`Encerrar mentoria com ${mentee.name}`}
                      >
                        <UserMinus size={14} /> Encerrar
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : <div className={styles.emptyState}>Nenhuma mentoria ativa ou pausada.</div>}
        </GlassPanel>

        <div className={styles.stack}>
          {capacity ? (
            <GlassPanel className={styles.panel}>
              <div className={styles.panelHeader}>
                <div><span className={styles.eyebrow}>Recebidas</span><h3>Solicitações de mentorados</h3></div>
                <PillChip tone={incomingRequests.length ? "warning" : "muted"}>{incomingRequests.length} pendente(s)</PillChip>
              </div>
              {incomingRequests.length ? (
                <ul className={styles.list}>
                  {incomingRequests.map((request) => (
                    <li className={styles.pendingRow} key={request.relationshipId}>
                      <span className={styles.avatar}><UserPlus size={17} /></span>
                      <span className={styles.personCopy}>
                        <strong>{request.menteeName}</strong>
                        <small>Solicitada em {request.requestedAt}</small>
                      </span>
                      <form action={responseAction} className={styles.rowActions}>
                        <input name="relationshipId" type="hidden" value={request.relationshipId} />
                        <button className={styles.textButton} name="decision" value="accept" disabled={responsePending || capacity.availableSlots === 0}>
                          <Check size={14} /> Aceitar
                        </button>
                        <button className={[styles.textButton, styles.textButtonDanger].join(" ")} name="decision" value="decline" disabled={responsePending}>
                          Recusar
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : <div className={styles.emptyState}>Nenhuma solicitação aguardando sua resposta.</div>}
            </GlassPanel>
          ) : null}

          <GlassPanel className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.eyebrow}>Convite direto</span><h3>Convidar por e-mail</h3></div>
              <span className={styles.iconBox}><MailPlus size={18} /></span>
            </div>
            <form action={invitationAction} className={styles.compactForm}>
              <label>E-mail<input name="email" type="email" placeholder="mentorado@exemplo.com" required /></label>
              <label>Mensagem opcional<textarea name="message" rows={4} placeholder="Conte como vocês vão começar." /></label>
              <GlassButton type="submit" icon={<MailPlus size={16} />} disabled={invitationPending || capacity?.availableSlots === 0}>
                {invitationPending ? "Criando..." : "Criar convite"}
              </GlassButton>
              {invitationState.status !== "idle" ? (
                <div className={styles.notice} role="status">
                  <strong>{invitationState.message}</strong>
                  {invitationState.inviteUrl ? <a href={invitationState.inviteUrl} target="_blank" rel="noreferrer">{invitationState.inviteUrl}</a> : null}
                </div>
              ) : null}
            </form>
          </GlassPanel>
        </div>
      </div>

      <GlassPanel className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><span className={styles.eyebrow}>Descobrir</span><h2>Mentorados disponíveis</h2></div>
          <PillChip tone="muted">{availableMentees.length} perfil(is)</PillChip>
        </div>
        <p>Pessoas disponíveis para iniciar uma mentoria.</p>
        <div className={styles.toolbar}>
          <label className={styles.searchWrap}>
            <Search size={17} />
            <input type="search" placeholder="Buscar por nome ou área de interesse" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>
        {filteredAvailable.length ? (
          <div className={styles.cardGrid}>
            {filteredAvailable.map((person) => {
              const relationshipLabel = statusLabel(person.relationshipStatus, person.relationshipDirection);
              const alreadyRequested = person.relationshipStatus === "requested" || person.relationshipStatus === "invited";
              return (
                <article className={styles.selectCard} key={person.id}>
                  <div className={styles.selectCardTop}>
                    <span className={styles.avatar}>{person.initials}</span>
                    <span><strong>{person.name}</strong><small>{person.focus}</small></span>
                  </div>
                  <p>{person.bio}</p>
                  <small className={styles.muted}>{person.availability}</small>
                  {data.canRequestMentorship ? (
                    <form action={requestAction}>
                      <input name="menteeUserId" type="hidden" value={person.id} />
                      <button className={styles.textButton} disabled={requestPending || alreadyRequested}>
                        {alreadyRequested ? <><Check size={14} /> {relationshipLabel}</> : <><UserPlus size={14} /> Adicionar mentorado</>}
                      </button>
                    </form>
                  ) : (
                    <PillChip tone={alreadyRequested ? "warning" : "muted"}>{relationshipLabel ?? "Disponível para mentoria"}</PillChip>
                  )}
                </article>
              );
            })}
          </div>
        ) : <div className={styles.emptyState}>Nenhum mentorado disponível corresponde à busca.</div>}
      </GlassPanel>

      <GlassPanel className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><span className={styles.eyebrow}>Aguardando cadastro</span><h2>Convites pendentes</h2></div>
          <PillChip tone="warning">{pendingInvitations.length} pendente(s)</PillChip>
        </div>
        {pendingInvitations.length ? (
          <ul className={styles.list}>
            {pendingInvitations.map((invitation) => (
              <li className={styles.pendingRow} key={invitation.id}>
                <span className={styles.avatar}><MailPlus size={17} /></span>
                <span className={styles.personCopy}>
                  <strong>{invitation.email}</strong>
                  <small>Criado em {invitation.sentAt} · válido até {invitation.expiresAt}</small>
                  <span><PillChip tone="muted">Link aguardando uso</PillChip></span>
                </span>
                <form action={cancelAction} className={styles.rowActions}>
                  <input name="invitationId" type="hidden" value={invitation.id} />
                  <button className={[styles.textButton, styles.textButtonDanger].join(" ")} disabled={cancelPending}>Cancelar</button>
                </form>
              </li>
            ))}
          </ul>
        ) : <div className={styles.emptyState}>Nenhum convite pendente.</div>}
      </GlassPanel>
    </section>
  );
}
