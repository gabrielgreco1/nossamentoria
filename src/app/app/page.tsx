import { CalendarDays, ClipboardList, FileText, UsersRound } from "lucide-react";
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
    detail: "Convide ou aceite mentorados depois que papéis e relações estiverem configurados.",
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
        description="Esta área privada já está atrás da fronteira de autenticação. Os próximos cards conectam papéis reais, convites, relações, planos e dados de progresso."
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

      <section className={styles.content}>
        <EmptyState
          title="Pronto para papéis e convites"
          description="O produto agora começa pela landing pública e autenticação. O próximo passo é o schema Supabase e a aceitação de convites com papéis."
          action={<GlassButton href="/invite/demo-token" variant="secondary" icon={<FileText size={16} />}>Prévia de convite</GlassButton>}
        />
      </section>
    </AppShell>
  );
}
