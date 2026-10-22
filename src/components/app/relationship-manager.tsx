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
import { useMemo, useState } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import type { UserRole } from "@/lib/access";
import styles from "./workspace-board.module.css";

type RelationshipMentee = {
  id: string;
  name: string;
  initials: string;
  focus: string;
  availability: string;
  status: "active" | "paused" | "requested";
  plan: "active" | "not_created";
};

const availablePeople = [
  { id: "gabriel-lima", name: "Gabriel Lima", initials: "GL", focus: "Node.js e APIs", availability: "Quartas, após 19h" },
  { id: "julia-mendes", name: "Júlia Mendes", initials: "JM", focus: "UX para frontend", availability: "Sextas, 18h–21h" },
  { id: "lucas-rocha", name: "Lucas Rocha", initials: "LR", focus: "React e TypeScript", availability: "Sábados pela manhã" }
];

const initialMentees: RelationshipMentee[] = [
  { id: "bruno-souza", name: "Bruno Souza", initials: "BS", focus: "JavaScript e APIs", availability: "Quintas, 19h", status: "active", plan: "active" },
  { id: "ana-ribeiro", name: "Ana Ribeiro", initials: "AR", focus: "Frontend e React", availability: "Terças, 20h", status: "active", plan: "not_created" }
];

type PendingInvite = { id: string; name: string; email: string; sentAt: string; direction: "incoming" | "outgoing" };

export function RelationshipManager({ role }: { role?: UserRole | null }) {
  const [mentees, setMentees] = useState(initialMentees);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
    { id: "invite-1", name: "Camila Torres", email: "camila@example.com", sentAt: "Enviado há 2 dias", direction: "outgoing" },
    { id: "invite-2", name: "Rafael Martins", email: "rafael@example.com", sentAt: "Recebido hoje", direction: "incoming" }
  ]);
  const [removalId, setRemovalId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  const filteredAvailable = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return availablePeople.filter((person) =>
      !normalized || `${person.name} ${person.focus}`.toLocaleLowerCase("pt-BR").includes(normalized)
    );
  }, [query]);

  function requestMentee(personId: string) {
    if (requestedIds.includes(personId)) return;
    setRequestedIds((current) => [...current, personId]);
    const person = availablePeople.find((item) => item.id === personId);
    setFeedback(`Solicitação enviada para ${person?.name ?? "o mentorado"}.`);
  }

  function removeMentee(menteeId: string) {
    const mentee = mentees.find((item) => item.id === menteeId);
    setMentees((current) => current.filter((item) => item.id !== menteeId));
    setFeedback(`${mentee?.name ?? "Mentorado"} foi removido do seu grupo.`);
    setRemovalId(null);
  }

  function acceptInvite(invite: PendingInvite) {
    setMentees((current) => [...current, {
      id: `accepted-${invite.id}`,
      name: invite.name,
      initials: invite.name.split(" ").map((part) => part[0]).join("").slice(0, 2),
      focus: "Interesse a definir",
      availability: "Disponibilidade a combinar",
      status: "active",
      plan: "not_created"
    }]);
    setPendingInvites((current) => current.filter((item) => item.id !== invite.id));
    setFeedback(`${invite.name} foi aceito no seu grupo.`);
  }

  function sendInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      setFeedback("Informe um e-mail válido para enviar o convite.");
      return;
    }

    setPendingInvites((current) => [
      ...current,
      { id: `invite-${Date.now()}`, name: normalized.split("@")[0], email: normalized, sentAt: "Enviado agora", direction: "outgoing" }
    ]);
    setEmail("");
    setMessage("");
    setFeedback(`Convite enviado para ${normalized}.`);
  }

  if (role === "mentee") {
    const incomingInvites = pendingInvites.filter((invite) => invite.direction === "incoming");

    return (
      <section className={styles.workspace} aria-label="Minha relação de mentoria">
        <div className={styles.summaryGrid}>
          <GlassPanel className={styles.summaryCard}>
            <div><small>Mentor atual</small><strong>1</strong><span className={styles.muted}>relação ativa</span></div>
            <span className={styles.iconBox}><UsersRound size={19} /></span>
          </GlassPanel>
          <GlassPanel className={styles.summaryCard}>
            <div><small>Plano</small><strong>68%</strong><span className={styles.muted}>concluído</span></div>
            <span className={styles.iconBox}><Check size={19} /></span>
          </GlassPanel>
          <GlassPanel className={styles.summaryCard}>
            <div><small>Próximo encontro</small><strong>29</strong><span className={styles.muted}>outubro, 19h</span></div>
            <span className={styles.iconBox}><Clock3 size={19} /></span>
          </GlassPanel>
        </div>

        {feedback ? <div className={styles.feedback} role="status">{feedback}</div> : null}

        <div className={styles.mainGrid}>
          <GlassPanel strong className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.eyebrow}>Mentoria ativa</span><h2>Kauai Staingel</h2></div>
              <PillChip>Ativa</PillChip>
            </div>
            <p>Seu mentor acompanha a trilha de desenvolvimento frontend, compartilha materiais e registra os próximos passos após cada encontro.</p>
            <div className={styles.detailGrid}>
              <div><span>Foco atual</span><strong>JavaScript e APIs</strong></div>
              <div><span>Plano</span><strong>Trilha de desenvolvimento frontend</strong></div>
              <div><span>Próxima sessão</span><strong>29 de outubro, 19h</strong></div>
              <div><span>Status</span><strong>Em andamento</strong></div>
            </div>
            <div className={styles.rowActions}>
              <Link className={styles.textButton} href="/app/plans">Abrir meu plano <ArrowUpRight size={13} /></Link>
            </div>
          </GlassPanel>

          <GlassPanel className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.eyebrow}>Solicitações</span><h3>Convites recebidos</h3></div>
              <PillChip tone="warning">{incomingInvites.length} pendente</PillChip>
            </div>
            {incomingInvites.length ? (
              <ul className={styles.list}>
                {incomingInvites.map((invite) => (
                  <li className={styles.pendingRow} key={invite.id}>
                    <span className={styles.avatar}><MailPlus size={17} /></span>
                    <span className={styles.personCopy}><strong>{invite.name}</strong><small>{invite.sentAt}</small></span>
                    <span className={styles.rowActions}>
                      <button className={styles.textButton} type="button" onClick={() => acceptInvite(invite)}><Check size={14} /> Aceitar</button>
                      <button className={[styles.textButton, styles.textButtonDanger].join(" ")} type="button" onClick={() => setPendingInvites((current) => current.filter((item) => item.id !== invite.id))}>Recusar</button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : <div className={styles.emptyState}>Nenhum convite aguardando sua resposta.</div>}
          </GlassPanel>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.workspace} aria-label="Gestão de mentorados">
      <div className={styles.summaryGrid}>
        <GlassPanel className={styles.summaryCard}>
          <div><small>Seus mentorados</small><strong>{mentees.length}</strong><span className={styles.muted}>relações ativas</span></div>
          <span className={styles.iconBox}><UsersRound size={19} /></span>
        </GlassPanel>
        <GlassPanel className={styles.summaryCard}>
          <div><small>Solicitações abertas</small><strong>{requestedIds.length}</strong><span className={styles.muted}>aguardando aceite</span></div>
          <span className={styles.iconBox}><Clock3 size={19} /></span>
        </GlassPanel>
        <GlassPanel className={styles.summaryCard}>
          <div><small>Convites pendentes</small><strong>{pendingInvites.length}</strong><span className={styles.muted}>enviados por e-mail</span></div>
          <span className={styles.iconBox}><MailPlus size={19} /></span>
        </GlassPanel>
      </div>

      {feedback ? <div className={styles.feedback} role="status">{feedback}</div> : null}

      <div className={styles.mainGrid}>
        <GlassPanel strong className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span className={styles.eyebrow}>Seu grupo</span><h2>Seus mentorados</h2></div>
            <PillChip>{mentees.length} pessoas</PillChip>
          </div>
          <p>Aqui ficam somente as relações. Plano, aulas e progresso são gerenciados na aba Planos.</p>

          {mentees.length ? (
            <ul className={styles.list}>
              {mentees.map((mentee) => (
                <li className={styles.personRow} key={mentee.id}>
                  <span className={styles.avatar}>{mentee.initials}</span>
                  <span className={styles.personCopy}>
                    <strong>{mentee.name}</strong>
                    <small>{mentee.focus} · {mentee.availability}</small>
                    <span><PillChip tone={mentee.plan === "active" ? "default" : "warning"}>{mentee.plan === "active" ? "Plano ativo" : "Plano a criar"}</PillChip></span>
                  </span>
                  <span className={styles.rowActions}>
                    <Link className={styles.textButton} href="/app/plans">Abrir plano <ArrowUpRight size={13} /></Link>
                    <button
                      className={[styles.textButton, styles.textButtonDanger].join(" ")}
                      type="button"
                      onClick={() => removalId === mentee.id ? removeMentee(mentee.id) : setRemovalId(mentee.id)}
                      aria-label={`${removalId === mentee.id ? "Confirmar remoção de" : "Remover"} ${mentee.name}`}
                    >
                      <UserMinus size={14} /> {removalId === mentee.id ? "Confirmar remoção" : "Remover"}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : <div className={styles.emptyState}>Você ainda não possui mentorados no grupo.</div>}
        </GlassPanel>

        <GlassPanel className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span className={styles.eyebrow}>Convite direto</span><h3>Convidar por e-mail</h3></div>
            <span className={styles.iconBox}><MailPlus size={18} /></span>
          </div>
          <form className={styles.compactForm} onSubmit={sendInvite}>
            <label>E-mail<input type="email" placeholder="mentorado@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Mensagem opcional<textarea rows={4} placeholder="Conte como vocês vão começar." value={message} onChange={(event) => setMessage(event.target.value)} /></label>
            <GlassButton type="submit" icon={<MailPlus size={16} />}>Enviar convite</GlassButton>
          </form>
        </GlassPanel>
      </div>

      <GlassPanel className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><span className={styles.eyebrow}>Descobrir</span><h2>Mentorados disponíveis</h2></div>
          <PillChip tone="muted">Disponíveis para aprender</PillChip>
        </div>
        <div className={styles.toolbar}>
          <label className={styles.searchWrap}>
            <Search size={17} />
            <input type="search" placeholder="Buscar por nome ou área de interesse" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>
        <div className={styles.cardGrid}>
          {filteredAvailable.map((person) => {
            const requested = requestedIds.includes(person.id);
            return (
              <article className={styles.selectCard} key={person.id}>
                <div className={styles.selectCardTop}>
                  <span className={styles.avatar}>{person.initials}</span>
                  <span><strong>{person.name}</strong><small>{person.focus}</small></span>
                </div>
                <p>{person.availability}</p>
                <button className={styles.textButton} type="button" disabled={requested} onClick={() => requestMentee(person.id)}>
                  {requested ? <><Check size={14} /> Solicitação enviada</> : <><UserPlus size={14} /> Adicionar ao grupo</>}
                </button>
              </article>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><span className={styles.eyebrow}>Aguardando resposta</span><h2>Convites pendentes</h2></div>
          <PillChip tone="warning">{pendingInvites.length} pendentes</PillChip>
        </div>
        {pendingInvites.length ? (
          <ul className={styles.list}>
            {pendingInvites.map((invite) => (
              <li className={styles.pendingRow} key={invite.id}>
                <span className={styles.avatar}><MailPlus size={17} /></span>
                <span className={styles.personCopy}><strong>{invite.name}</strong><small>{invite.email} · {invite.sentAt}</small><span><PillChip tone={invite.direction === "incoming" ? "warning" : "muted"}>{invite.direction === "incoming" ? "Solicitação recebida" : "Convite enviado"}</PillChip></span></span>
                <span className={styles.rowActions}>
                  {invite.direction === "incoming" ? (
                    <button className={styles.textButton} type="button" onClick={() => acceptInvite(invite)}><Check size={14} /> Aceitar</button>
                  ) : (
                    <button className={styles.textButton} type="button" onClick={() => setFeedback(`Convite reenviado para ${invite.email}.`)}>Reenviar</button>
                  )}
                  <button className={[styles.textButton, styles.textButtonDanger].join(" ")} type="button" onClick={() => setPendingInvites((current) => current.filter((item) => item.id !== invite.id))}>{invite.direction === "incoming" ? "Recusar" : "Cancelar"}</button>
                </span>
              </li>
            ))}
          </ul>
        ) : <div className={styles.emptyState}>Nenhum convite pendente.</div>}
      </GlassPanel>
    </section>
  );
}
