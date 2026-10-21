import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { getWorkspaceContext } from "@/lib/workspace-context";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

export default async function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const context = await getWorkspaceContext();

  if (!context.preview && !context.user) {
    const error = context.envStatus.configured ? "" : "&error=setup";
    redirect(`/login?next=/app${error}`);
  }

  return (
    <AppShell roles={context.roles} preview={context.preview} roleSource={context.roleSource}>
      {children}
    </AppShell>
  );
}
