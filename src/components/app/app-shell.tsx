"use client";

import { BookOpen, CalendarDays, Files, LayoutDashboard, LogOut, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import { BrandLogo } from "@/components/ui/brand-logo";
import { signOut } from "@/app/app/actions";
import { getRoleLabel, isMixedUser, type UserRole } from "@/lib/access";
import styles from "./app-shell.module.css";

const navigationByRole: Record<UserRole, Array<{ label: string; href: string; icon: typeof LayoutDashboard }>> = {
  admin: [
    { label: "Painel", href: "/app", icon: LayoutDashboard },
    { label: "Mentorados", href: "/app/relationships", icon: UsersRound },
    { label: "Planos", href: "/app/plans", icon: BookOpen },
    { label: "Calendário", href: "/app/calendar", icon: CalendarDays },
    { label: "Materiais", href: "/app/materials", icon: Files },
    { label: "Perfil", href: "/app/profile", icon: UserRound },
    { label: "Administração", href: "/app/admin", icon: ShieldCheck }
  ],
  mentor: [
    { label: "Painel", href: "/app", icon: LayoutDashboard },
    { label: "Mentorados", href: "/app/relationships", icon: UsersRound },
    { label: "Planos", href: "/app/plans", icon: BookOpen },
    { label: "Calendário", href: "/app/calendar", icon: CalendarDays },
    { label: "Materiais", href: "/app/materials", icon: Files },
    { label: "Perfil", href: "/app/profile", icon: UserRound }
  ],
  mentee: [
    { label: "Painel", href: "/app", icon: LayoutDashboard },
    { label: "Minha mentoria", href: "/app/relationships", icon: UsersRound },
    { label: "Meu plano", href: "/app/plans", icon: BookOpen },
    { label: "Calendário", href: "/app/calendar", icon: CalendarDays },
    { label: "Materiais", href: "/app/materials", icon: Files },
    { label: "Perfil", href: "/app/profile", icon: UserRound }
  ]
};

type AppShellProps = {
  children: ReactNode;
  roles?: UserRole[];
  availableRoles?: UserRole[];
  activeRole?: UserRole | null;
  roleSource?: "database" | "metadata" | "missing";
};

export function AppShell({
  children,
  roles = [],
  availableRoles = roles,
  activeRole = roles[0] ?? null,
  roleSource = "missing"
}: AppShellProps) {
  const pathname = usePathname();
  const navigation = activeRole
    ? navigationByRole[activeRole]
    : [{ label: "Painel", href: "/app", icon: LayoutDashboard }];

  return (
    <div className={styles.shell}>
      <GlassPanel as="aside" className={styles.sidebar}>
        <div className={styles.brand}>
          <BrandLogo subtitle="Mentoria privada" priority />
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
            {availableRoles.length > 0 ? availableRoles.map((role) => (
              <form action="/app/view-role" method="post" key={role}>
                <input name="role" type="hidden" value={role} />
                <button
                  className={styles.roleButton}
                  type="submit"
                  aria-pressed={role === activeRole}
                >
                  <PillChip tone={role === activeRole ? "default" : "muted"}>{getRoleLabel(role)}</PillChip>
                </button>
              </form>
            )) : <PillChip tone="warning">Sem papel</PillChip>}
          </div>
          <span>
            {isMixedUser(roles)
              ? "Usuários mistos mantêm mentorias, notas e materiais separados por contexto."
              : "O contexto ativo define quais ações e dados ficam disponíveis."}
          </span>
          {roleSource === "metadata" ? <span className={styles.previewNote}>Contexto recuperado temporariamente da autenticação.</span> : null}
          <form action={signOut}>
            <button className={styles.signOutButton} type="submit"><LogOut size={14} /> Sair</button>
          </form>
        </div>
      </GlassPanel>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
