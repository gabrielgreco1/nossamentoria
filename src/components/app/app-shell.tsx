import { BookOpen, CalendarDays, Files, LayoutDashboard, ShieldCheck, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import { getRoleLabel, isMixedUser, type UserRole } from "@/lib/access";
import styles from "./app-shell.module.css";

const navigation = [
  { label: "Painel", href: "/app", icon: LayoutDashboard },
  { label: "Acessos", href: "/app", icon: ShieldCheck },
  { label: "Usuários", href: "/app/users", icon: UsersRound },
  { label: "Planos", href: "/app", icon: BookOpen },
  { label: "Materiais", href: "/app", icon: Files },
  { label: "Agenda", href: "/app", icon: CalendarDays }
];

type AppShellProps = {
  children: ReactNode;
  roles?: UserRole[];
  preview?: boolean;
};

const FALLBACK_ROLES: UserRole[] = ["mentor"];

export function AppShell({ children, roles = FALLBACK_ROLES, preview = false }: AppShellProps) {
  const activeRoles: UserRole[] = roles.length > 0 ? roles : FALLBACK_ROLES;

  return (
    <div className={styles.shell}>
      <GlassPanel as="aside" className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.mark}>NM</span>
          <div>
            <p>NossaMentoria</p>
            <span>Mentoria privada</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Navegação principal">
          {navigation.map((item) => (
            <a className={styles.navItem} href={item.href} key={item.label}>
              <item.icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.context}>
          <span className={styles.contextLabel}>Contexto atual</span>
          <div className={styles.roleChips}>
            {activeRoles.map((role, index) => (
              <PillChip tone={index === 0 ? "default" : "muted"} key={role}>
                {getRoleLabel(role)}
              </PillChip>
            ))}
          </div>
          <span>
            {isMixedUser(activeRoles)
              ? "Usuários mistos mantêm mentorias, notas e materiais separados por contexto."
              : "O contexto ativo define quais ações e dados ficam disponíveis."}
          </span>
          {preview ? <span className={styles.previewNote}>Prévia até papéis reais virem do banco.</span> : null}
        </div>
      </GlassPanel>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
