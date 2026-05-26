import {
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  LockKeyhole,
  Repeat2,
  Route,
  ShieldCheck,
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

      <section className={styles.content}>
        <EmptyState
          title="Pronto para papéis, convites e relações"
          description="A superfície inicial já comunica a visão do MVP. O próximo passo é conectar schema Supabase, convites reais, papéis e relações mentor-mentorado."
          action={<GlassButton href="/invite/demo-token" variant="secondary" icon={<FileText size={16} />}>Prévia de convite</GlassButton>}
        />
      </section>
    </AppShell>
  );
}
