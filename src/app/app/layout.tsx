import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { getWorkspaceContext } from "@/lib/workspace-context";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

export default async function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const context = await getWorkspaceContext();

  if (!context.user) {
    const error = context.envStatus.configured ? "" : "&error=setup";
    redirect(`/login?next=/app${error}`);
  }

  return (
    <AppShell
      userId={context.user.id}
      roles={context.roles}
      availableRoles={context.availableRoles}
      activeRole={context.activeRole}
    >
      {children}
    </AppShell>
  );
}
