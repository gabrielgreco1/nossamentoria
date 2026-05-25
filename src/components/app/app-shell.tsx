import { BookOpen, CalendarDays, Files, LayoutDashboard, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import styles from "./app-shell.module.css";

const navigation = [
  { label: "Painel", icon: LayoutDashboard },
  { label: "Mentorados", icon: UsersRound },
  { label: "Planos", icon: BookOpen },
  { label: "Materiais", icon: Files },
  { label: "Agenda", icon: CalendarDays }
];

export function AppShell({ children }: { children: ReactNode }) {
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
            <a className={styles.navItem} href="#" key={item.label}>
              <item.icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.context}>
          <PillChip>Contexto mentor</PillChip>
          <span>A navegação por papel está pronta para receber o estado real de autenticação.</span>
        </div>
      </GlassPanel>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
