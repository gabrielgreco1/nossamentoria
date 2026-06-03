import {
  Activity,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Database,
  DatabaseZap,
  FileText,
  KeyRound,
  LibraryBig,
  Link2,
  LockKeyhole,
  PauseCircle,
  Radar,
  Repeat2,
  Route,
  ShieldCheck,
  Sparkles,
  UserCog,
  UsersRound,
  UserRoundCheck
} from "lucide-react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import {
  canAccess,
  getRoleLabel,
  getRolePermissions,
  type UserRole
} from "@/lib/access";
import { getCurrentUserAccess } from "@/lib/auth";
import {
  domainEntityDefinitions,
  domainModelRules,
  domainRelationships
} from "@/lib/domain-model";
import { getEnvStatus } from "@/lib/env";
import {
  canTrackRegularProgress,
  getRelationshipStateDescription,
  getRelationshipStateLabel,
  relationshipCreationPaths,
  RELATIONSHIP_STATES,
  type RelationshipSummary
} from "@/lib/relationships";
import styles from "./page.module.css";

const workspaceStats = [
  {
    label: "Mentorados",
    value: "0",
    detail: "Convide, aceite ou acompanhe mentorados depois que papéis e relações estiverem configurados.",
    icon: <UsersRound size={19} strokeWidth={1.8} />
  },
  {
    label: "Planos",
    value: "0",
    detail: "Planos de mentoria vão organizar objetivos, aulas, materiais e progresso.",
    icon: <ClipboardList size={19} strokeWidth={1.8} />
  },
  {
    label: "Aulas",
    value: "0",
    detail: "Próximas aulas aparecem aqui depois da agenda ser implementada.",
    icon: <CalendarDays size={19} strokeWidth={1.8} />
  }
];

const visionPoints = [
  "Plataforma gratuita e sem monetização no MVP.",
  "Entrada privada: contas nascem de convites válidos.",
  "Estrutura pronta para múltiplos mentores e mentorados.",
  "Histórico de aulas, materiais e próximos passos preservado."
];

const rolePreviews = [
  {
    title: "Admins",
    description: "Controlam convites, usuários ativos e correções de papel enquanto a comunidade é privada.",
    icon: <ShieldCheck size={20} strokeWidth={1.8} />,
    needs: ["Convidar", "Ver atividade", "Corrigir papéis"]
  },
  {
    title: "Mentores",
    description: "Organizam mentorados, planos, tópicos, aulas, materiais, agenda e progresso.",
    icon: <Route size={20} strokeWidth={1.8} />,
    needs: ["Criar planos", "Agendar aulas", "Registrar progresso"]
  },
  {
    title: "Mentorados",
    description: "Acompanham plano atual, próximas aulas, materiais, progresso e ações combinadas.",
    icon: <BookOpenCheck size={20} strokeWidth={1.8} />,
    needs: ["Aceitar convite", "Ver materiais", "Entender próximos passos"]
  },
  {
    title: "Usuários mistos",
    description: "Alternam entre orientar e aprender sem misturar relações, dashboards ou notas.",
    icon: <Repeat2 size={20} strokeWidth={1.8} />,
    needs: ["Trocar contexto", "Separar relações", "Evitar notas cruzadas"]
  }
];

const successMetrics = [
  {
    title: "Ativação",
    description: "Convites viram contas, planos e primeiras aulas completas.",
    icon: <Sparkles size={20} strokeWidth={1.8} />,
    signals: [
      "Usuários convidados entram com sucesso",
      "Mentores criam ao menos um plano",
      "Mentorados acessam plano e materiais",
      "Uma aula pode ser agendada e concluída"
    ]
  },
  {
    title: "Engajamento",
    description: "Planos continuam vivos depois da primeira configuração.",
    icon: <Activity size={20} strokeWidth={1.8} />,
    signals: [
      "Planos ativos têm próximas aulas",
      "Mentores atualizam status pós-sessão",
      "Mentorados retornam aos materiais",
      "Progresso fica visível, não estático"
    ]
  },
  {
    title: "Operação",
    description: "Cada papel sabe o que precisa acompanhar agora.",
    icon: <Radar size={20} strokeWidth={1.8} />,
    signals: [
      "Admin entende quem tem acesso",
      "Mentores veem mentorados que precisam de atenção",
      "Mentorados sabem o que estudar em seguida"
    ]
  },
  {
    title: "Qualidade",
    description: "Dados privados e histórico de aulas continuam conectados.",
    icon: <CheckCircle2 size={20} strokeWidth={1.8} />,
    signals: [
      "Registros privados respeitam permissão",
      "Materiais ficam ligados ao plano correto",
      "Aulas concluídas preservam notas aplicadas"
    ]
  }
];

const outOfScopeMetrics = ["Receita", "Planos pagos", "Marketplace público", "Publicidade"];

const glossaryTerms = [
  {
    term: "Convite",
    definition: "Entrada controlada que permite criar conta e receber um ou mais papéis."
  },
  {
    term: "Relação de mentoria",
    definition: "Conexão entre mentor e mentorado, mesmo antes de existir um plano completo."
  },
  {
    term: "Plano de mentoria",
    definition: "Plano estruturado com duração, objetivos, tópicos, aulas, conteúdos e progresso."
  },
  {
    term: "Aula",
    definition: "Unidade planejada de aprendizado dentro de um plano de mentoria."
  },
  {
    term: "Sessão de aula",
    definition: "Encontro agendado ou concluído que executa uma aula planejada."
  },
  {
    term: "Material de conteúdo",
    definition: "Arquivo, link, nota ou documento associado ao aprendizado."
  },
  {
    term: "Progresso",
    definition: "Estado visível da evolução do mentorado com base em aulas e notas."
  }
];

const domainPillars = [
  {
    title: "Papéis",
    description: "Usuários recebem permissões por convite ou ação administrativa, nunca por autoatribuição.",
    icon: <UserCog size={20} strokeWidth={1.8} />,
    checks: ["Admin gerencia papéis", "Mentor vê seu contexto", "Mentorado permanece restrito"]
  },
  {
    title: "Convites",
    description: "A entrada na plataforma continua privada e cada convite controla quem pode criar conta.",
    icon: <KeyRound size={20} strokeWidth={1.8} />,
    checks: ["Token válido", "Estado de uso", "Papel pretendido"]
  },
  {
    title: "Relações",
    description: "Planos, materiais, aulas e progresso dependem da relação mentor-mentorado correta.",
    icon: <Link2 size={20} strokeWidth={1.8} />,
    checks: ["Mentor conectado", "Mentorado próprio", "Contexto separado"]
  },
  {
    title: "Políticas",
    description: "Consultas de usuário precisam ser filtradas por papel e relação também no banco.",
    icon: <Database size={20} strokeWidth={1.8} />,
    checks: ["Supabase Auth", "RLS por relação", "Sem esconder só na UI"]
  }
];

const accessRules = [
  "Usuários não podem elevar o próprio papel.",
  "Mentorados veem apenas os próprios planos e materiais compartilhados.",
  "Mentores veem apenas mentorados conectados a eles.",
  "Admins gerenciam convites, papéis e setup da plataforma."
];

const roleAccessDetails: Array<{
  role: UserRole;
  summary: string;
  cannot: string;
}> = [
  {
    role: "admin",
    summary: "Cria convites, define papéis iniciais, vê usuários e resolve relações incorretas.",
    cannot: "Não precisa aprovar cada ação depois que mentor e mentorado estão conectados."
  },
  {
    role: "mentor",
    summary: "Gerencia planos, aulas, materiais, sessões e notas dos mentorados conectados.",
    cannot: "Não edita planos privados de outro mentor sem estar atribuído à relação."
  },
  {
    role: "mentee",
    summary: "Vê os próprios planos, aulas, materiais, calendário, progresso e notas compartilhadas.",
    cannot: "Não edita a estrutura mentor-owned do plano no MVP."
  }
];

const relationshipPreview: RelationshipSummary = {
  mentorName: "Mentor conectado",
  menteeName: "Mentorado convidado",
  status: "invited",
  sharedContextCount: 0
};

const menteeRelationshipView = [
  "Nome do mentor",
  "Status da relação",
  "Plano ativo, quando existir",
  "Próximas sessões",
  "Materiais e notas compartilhadas"
];

const activeRelationshipPreview: RelationshipSummary = {
  mentorName: "Mentor conectado",
  menteeName: "Mentorado ativo",
  status: "active",
  activePlanTitle: "Plano de mentoria obrigatório",
  upcomingSessionLabel: "Próxima sessão vinculada à relação",
  sharedContextCount: 3
};

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const envStatus = getEnvStatus();
  const access = await getCurrentUserAccess();
  const user = access.user;
  const activeRoles = access.roles.length > 0 ? access.roles : (["mentor", "mentee"] satisfies UserRole[]);
  const rolePreview = !user || access.roles.length === 0;
  const blockedAccess = canAccess(activeRoles, "manage_platform");

  if (envStatus.configured && !access.user) {
    redirect("/login?next=/app");
  }

  const roleLabel = access.roles.length > 0 ? access.roles.join(" + ") : "Sem papel atribuído";
  const displayName = access.profile?.display_name ?? access.profile?.email ?? access.user?.email;

  return (
    <AppShell roles={activeRoles} preview={rolePreview}>
      <PageHeader
        eyebrow="Workspace privado"
        title="Painel de mentoria"
        description={
          displayName
            ? `Sessão de ${displayName}. Papéis ativos: ${roleLabel}.`
            : "Esta área privada já está atrás da fronteira de autenticação e nasce para transformar aulas, links, notas e tarefas em uma trilha acompanhável."
        }
        action={<PillChip>{access.user ? "Autenticado" : "Prévia de setup"}</PillChip>}
      />

      {!envStatus.configured ? (
        <GlassPanel strong className={styles.setup}>
          <h2>Configuração do Supabase necessária</h2>
          <p>
            Configure as variáveis de ambiente obrigatórias antes de usar login, validação de
            convites e roteamento privado com Supabase.
          </p>
          <code>{envStatus.missing.join(", ")}</code>
        </GlassPanel>
      ) : null}

      <section className={styles.grid} aria-label="Workspace summary">
        {workspaceStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>

      <section className={styles.domainSection} aria-label="Domínio e permissões">
        <GlassPanel strong className={styles.domainIntro}>
          <div className={styles.panelTitle}>
            <ShieldCheck size={20} strokeWidth={1.8} />
            <div>
              <span>01 Domain</span>
              <h2>Limites de acesso antes de qualquer dado privado</h2>
            </div>
          </div>
          <p>
            A fase de domínio define quem pode acessar convites, papéis, relações, planos,
            materiais, aulas e progresso. A interface mostra o estado, mas a proteção real precisa
            viver nas políticas do Supabase.
          </p>
        </GlassPanel>

        <div className={styles.domainGrid}>
          {domainPillars.map((pillar) => (
            <GlassPanel className={styles.domainCard} key={pillar.title}>
              <div className={styles.metricHeader}>
                <div className={styles.icon}>{pillar.icon}</div>
                <div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </div>
              </div>
              <ul>
                {pillar.checks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </GlassPanel>
          ))}
        </div>

        <GlassPanel className={styles.accessPanel}>
          <span>Critérios de acesso</span>
          <ul>
            {accessRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </GlassPanel>
      </section>

      <section className={styles.rolesAccessSection} aria-label="Papéis e acessos">
        <div className={styles.sectionHeading}>
          <span>// Papéis e acesso</span>
          <h2>Permissões separadas para admin, mentor, mentorado e usuários mistos</h2>
        </div>

        <div className={styles.roleAccessGrid}>
          {roleAccessDetails.map((item) => (
            <GlassPanel className={styles.roleAccessCard} key={item.role}>
              <div className={styles.roleAccessHeader}>
                <PillChip tone={activeRoles.includes(item.role) ? "default" : "muted"}>
                  {getRoleLabel(item.role)}
                </PillChip>
                <span>{activeRoles.includes(item.role) ? "No contexto atual" : "Disponível por convite"}</span>
              </div>
              <p>{item.summary}</p>
              <ul>
                {getRolePermissions(item.role).map((permission) => (
                  <li key={permission}>{permission.replaceAll("_", " ")}</li>
                ))}
              </ul>
              <strong>{item.cannot}</strong>
            </GlassPanel>
          ))}
        </div>

        {!blockedAccess.allowed ? (
          <GlassPanel className={styles.blockedPanel}>
            <div>
              <span>Estado bloqueado</span>
              <h3>Acesso administrativo indisponível neste contexto</h3>
              <p>{blockedAccess.reason} Nenhum dado privado deve ser renderizado para ações sem permissão.</p>
            </div>
            <PillChip tone="warning">Bloqueado server-side</PillChip>
          </GlassPanel>
        ) : null}
      </section>

      <section className={styles.relationshipSection} aria-label="Relação mentor-mentorado">
        <GlassPanel strong className={styles.relationshipIntro}>
          <div className={styles.panelTitle}>
            <UserRoundCheck size={20} strokeWidth={1.8} />
            <div>
              <span>Relação mentor-mentorado</span>
              <h2>Planos e progresso nascem de uma relação específica</h2>
            </div>
          </div>
          <p>
            Uma relação conecta um mentor e um mentorado antes mesmo de existir um plano detalhado.
            O MVP pode focar em uma relação ativa por vez, mas o modelo já aceita crescimento para
            múltiplos mentores no futuro.
          </p>
        </GlassPanel>

        <div className={styles.relationshipStateGrid}>
          {RELATIONSHIP_STATES.map((state) => (
            <GlassPanel className={styles.relationshipStateCard} key={state}>
              <PillChip tone={state === relationshipPreview.status ? "default" : "muted"}>
                {getRelationshipStateLabel(state)}
              </PillChip>
              <p>{getRelationshipStateDescription(state)}</p>
            </GlassPanel>
          ))}
        </div>

        <div className={styles.relationshipFlowGrid}>
          <GlassPanel className={styles.relationshipCard}>
            <div className={styles.metricHeader}>
              <div className={styles.icon}><Link2 size={20} strokeWidth={1.8} /></div>
              <div>
                <h3>Caminhos de criação</h3>
                <p>Mentor, mentorado e admin entram no fluxo por caminhos controlados.</p>
              </div>
            </div>
            <ul>
              {relationshipCreationPaths.map((item) => (
                <li key={item.path}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </GlassPanel>

          <GlassPanel className={styles.relationshipCard}>
            <div className={styles.metricHeader}>
              <div className={styles.icon}><BookOpenCheck size={20} strokeWidth={1.8} /></div>
              <div>
                <h3>Tracking regular</h3>
                <p>O mentor cria um plano antes de transformar encontros em progresso contínuo.</p>
              </div>
            </div>
            <div className={styles.relationshipCheck}>
              <PillChip tone={canTrackRegularProgress(relationshipPreview) ? "default" : "warning"}>
                {canTrackRegularProgress(relationshipPreview) ? "Pronto para tracking" : "Plano pendente"}
              </PillChip>
              <p>
                Relação atual: {relationshipPreview.mentorName} e {relationshipPreview.menteeName}.
                Sem plano ativo, aulas e progresso ainda não devem ser tratados como acompanhamento regular.
              </p>
            </div>
            <div className={styles.relationshipCheck}>
              <PillChip>Exemplo ativo</PillChip>
              <p>
                {activeRelationshipPreview.activePlanTitle}; {activeRelationshipPreview.upcomingSessionLabel};
                {` ${activeRelationshipPreview.sharedContextCount} itens compartilhados.`}
              </p>
            </div>
          </GlassPanel>

          <GlassPanel className={styles.relationshipCard}>
            <div className={styles.metricHeader}>
              <div className={styles.icon}><PauseCircle size={20} strokeWidth={1.8} /></div>
              <div>
                <h3>Visão do mentorado</h3>
                <p>A tela do mentorado deve mostrar apenas contexto compartilhado daquela relação.</p>
              </div>
            </div>
            <ul>
              {menteeRelationshipView.map((item) => (
                <li key={item}>
                  <strong>{item}</strong>
                  <span>Visível quando pertence à relação mentor-mentorado correta.</span>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      </section>

      <section className={styles.modelSection} aria-label="Modelo de domínio">
        <GlassPanel strong className={styles.modelIntro}>
          <div className={styles.panelTitle}>
            <DatabaseZap size={20} strokeWidth={1.8} />
            <div>
              <span>Modelo de domínio</span>
              <h2>Entidades com ownership e chaves explícitas para o MVP</h2>
            </div>
          </div>
          <p>
            Este modelo fecha a fase Domain: cada objeto precisa ter dono, relação rastreável e
            foreign keys suficientes para políticas de acesso no Supabase.
          </p>
        </GlassPanel>

        <div className={styles.entityGrid}>
          {domainEntityDefinitions.map((item) => (
            <GlassPanel className={styles.entityCard} key={item.entity}>
              <h3>{item.entity}</h3>
              <p>{item.purpose}</p>
              <span>{item.ownership}</span>
              <code>{item.stableKey}</code>
            </GlassPanel>
          ))}
        </div>

        <div className={styles.modelSplit}>
          <GlassPanel className={styles.relationshipMapCard}>
            <div className={styles.metricHeader}>
              <div className={styles.icon}><Link2 size={20} strokeWidth={1.8} /></div>
              <div>
                <h3>Relações explícitas</h3>
                <p>O banco precisa permitir escopo por papel, relação e ownership.</p>
              </div>
            </div>
            <ul>
              {domainRelationships.map((item) => (
                <li key={`${item.from}-${item.relation}-${item.to}`}>
                  <strong>{item.from} {item.relation} {item.to}</strong>
                  <span>{item.scopeRule}</span>
                </li>
              ))}
            </ul>
          </GlassPanel>

          <GlassPanel className={styles.modelRulesCard}>
            <div className={styles.metricHeader}>
              <div className={styles.icon}><ShieldCheck size={20} strokeWidth={1.8} /></div>
              <div>
                <h3>Regras para implementação</h3>
                <p>Essas regras guiam schema, RLS e queries das próximas fases.</p>
              </div>
            </div>
            <ul>
              {domainModelRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      </section>

      <section className={styles.visionGrid} aria-label="Visão do MVP e personas">
        <GlassPanel strong className={styles.visionPanel}>
          <div className={styles.panelTitle}>
            <LockKeyhole size={20} strokeWidth={1.8} />
            <div>
              <span>Visão do produto</span>
              <h2>Mentoria prática, privada e rastreável</h2>
            </div>
          </div>
          <ul>
            {visionPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </GlassPanel>

        <div className={styles.roleGrid}>
          {rolePreviews.map((role) => (
            <GlassPanel className={styles.roleCard} key={role.title}>
              <div className={styles.icon}>{role.icon}</div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
              <ul>
                {role.needs.map((need) => (
                  <li key={need}>{need}</li>
                ))}
              </ul>
            </GlassPanel>
          ))}
        </div>
      </section>

      <section className={styles.metricsSection} aria-label="Métricas de sucesso do MVP">
        <div className={styles.sectionHeading}>
          <span>// Sucesso do MVP</span>
          <h2>O que mostra que a mentoria ficou mais fácil de operar</h2>
        </div>

        <div className={styles.metricsGrid}>
          {successMetrics.map((metric) => (
            <GlassPanel className={styles.metricCard} key={metric.title}>
              <div className={styles.metricHeader}>
                <div className={styles.icon}>{metric.icon}</div>
                <div>
                  <h3>{metric.title}</h3>
                  <p>{metric.description}</p>
                </div>
              </div>
              <ul>
                {metric.signals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </GlassPanel>
          ))}
        </div>

        <GlassPanel className={styles.scopePanel}>
          <span>Fora do escopo de sucesso</span>
          <div>
            {outOfScopeMetrics.map((metric) => (
              <PillChip tone="muted" key={metric}>{metric}</PillChip>
            ))}
          </div>
        </GlassPanel>
      </section>

      <section className={styles.glossarySection} aria-label="Glossário do produto">
        <GlassPanel strong className={styles.glossaryIntro}>
          <div className={styles.panelTitle}>
            <LibraryBig size={20} strokeWidth={1.8} />
            <div>
              <span>Glossário</span>
              <h2>Termos que mantêm produto, specs e código falando a mesma língua</h2>
            </div>
          </div>
          <p>
            Foundation fica completo quando visão, papéis, sucesso e vocabulário apontam para o
            mesmo modelo de mentoria privada.
          </p>
        </GlassPanel>

        <div className={styles.termGrid}>
          {glossaryTerms.map((item) => (
            <GlassPanel className={styles.termCard} key={item.term}>
              <h3>{item.term}</h3>
              <p>{item.definition}</p>
            </GlassPanel>
          ))}
        </div>
      </section>

      <section className={styles.content}>
        <EmptyState
          title="Pronto para detalhar papéis e acesso"
          description="A fase Domain já tem seus limites principais visíveis. O próximo passo é transformar papéis, convites, relações e políticas em regras concretas de acesso."
          action={<GlassButton href="/invite/demo-token" variant="secondary" icon={<FileText size={16} />}>Prévia de convite</GlassButton>}
        />
      </section>
    </AppShell>
  );
}
