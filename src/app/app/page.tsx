import {
  Activity,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  LibraryBig,
  LockKeyhole,
  Radar,
  Repeat2,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import { getCurrentUser } from "@/lib/auth";
import { getEnvStatus } from "@/lib/env";
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

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const envStatus = getEnvStatus();
  const user = await getCurrentUser();

  if (envStatus.configured && !user) {
    redirect("/login?next=/app");
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Workspace privado"
        title="Painel de mentoria"
        description="Esta área privada já está atrás da fronteira de autenticação e nasce para transformar aulas, links, notas e tarefas em uma trilha acompanhável."
        action={<PillChip>{user ? "Autenticado" : "Prévia de setup"}</PillChip>}
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
          title="Foundation concluído"
          description="A superfície inicial já comunica visão, papéis, sinais de sucesso e vocabulário comum. O próximo passo é conectar domínio, permissões, convites reais e relações mentor-mentorado."
          action={<GlassButton href="/invite/demo-token" variant="secondary" icon={<FileText size={16} />}>Prévia de convite</GlassButton>}
        />
      </section>
    </AppShell>
  );
}
