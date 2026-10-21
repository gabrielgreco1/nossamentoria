"use client";

import { BookOpen, CalendarDays, Files, LayoutDashboard, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import { getRoleLabel, isMixedUser, type UserRole } from "@/lib/access";
import styles from "./app-shell.module.css";

const navigationByRole: Record<UserRole, Array<{ label: string; href: string; icon: typeof LayoutDashboard }>> = {
  admin: [
    { label: "Painel", href: "/app", icon: LayoutDashboard },
    { label: "Administração", href: "/app/admin", icon: ShieldCheck }
  ],
  mentor: [
    { label: "Painel", href: "/app", icon: LayoutDashboard },
    { label: "Mentorados", href: "/app/relationships", icon: UsersRound },
    { label: "Planos", href: "/app/plans", icon: BookOpen },
    { label: "Materiais", href: "/app/materials", icon: Files },
    { label: "Agenda", href: "/app/calendar", icon: CalendarDays }
  ],
  mentee: [
    { label: "Painel", href: "/app", icon: LayoutDashboard },
    { label: "Minha mentoria", href: "/app/relationships", icon: UsersRound },
    { label: "Meu plano", href: "/app/plans", icon: BookOpen },
    { label: "Materiais", href: "/app/materials", icon: Files },
    { label: "Agenda", href: "/app/calendar", icon: CalendarDays }
  ]
};

type AppShellProps = {
  children: ReactNode;
  roles?: UserRole[];
  preview?: boolean;
  roleSource?: "database" | "metadata" | "preview" | "missing";
};

export function AppShell({ children, roles = [], preview = false, roleSource = "missing" }: AppShellProps) {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<UserRole | null>(roles[0] ?? null);

  useEffect(() => {
    if (!activeRole || !roles.includes(activeRole)) {
      setActiveRole(roles[0] ?? null);
    }
  }, [activeRole, roles]);

  const navigation = useMemo(
    () => (activeRole ? navigationByRole[activeRole] : [{ label: "Painel", href: "/app", icon: LayoutDashboard }]),
    [activeRole]
  );

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
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(`${item.href}/`));

            return (
            <Link className={[styles.navItem, isActive ? styles.navItemActive : ""].join(" ")} href={item.href} key={item.href}>
              <item.icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
            );
          })}
        </nav>

        <div className={styles.context}>
          <span className={styles.contextLabel}>Contexto atual</span>
          <div className={styles.roleChips}>
            {roles.length > 0 ? roles.map((role) => (
              <button
                className={styles.roleButton}
                type="button"
                aria-pressed={role === activeRole}
                onClick={() => setActiveRole(role)}
                key={role}
              >
                <PillChip tone={role === activeRole ? "default" : "muted"}>{getRoleLabel(role)}</PillChip>
              </button>
            )) : <PillChip tone="warning">Sem papel</PillChip>}
          </div>
          <span>
            {isMixedUser(roles)
              ? "Usuários mistos mantêm mentorias, notas e materiais separados por contexto."
              : "O contexto ativo define quais ações e dados ficam disponíveis."}
          </span>
          {preview ? <span className={styles.previewNote}>Prévia até papéis reais virem do banco.</span> : null}
          {!preview && roleSource === "metadata" ? <span className={styles.previewNote}>Contexto recuperado temporariamente da autenticação.</span> : null}
        </div>
      </GlassPanel>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
