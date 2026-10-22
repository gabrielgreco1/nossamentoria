import { NextResponse, type NextRequest } from "next/server";
import { getWorkspaceContext, WORKSPACE_ROLE_COOKIE } from "@/lib/workspace-context";
import { USER_ROLES, type UserRole } from "@/lib/access";

export async function POST(request: NextRequest) {
  const context = await getWorkspaceContext();
  const formData = await request.formData();
  const requestedRole = String(formData.get("role") ?? "") as UserRole;

  if (!USER_ROLES.includes(requestedRole) || !context.availableRoles.includes(requestedRole)) {
    return new Response("Contexto de visualização não permitido.", { status: 403 });
  }

  const referer = request.headers.get("referer");
  const destination = referer ? new URL(referer) : new URL("/app", request.url);

  if (destination.origin !== request.nextUrl.origin || !destination.pathname.startsWith("/app")) {
    destination.href = new URL("/app", request.url).href;
  }

  const response = NextResponse.redirect(destination, { status: 303 });
  response.cookies.set(WORKSPACE_ROLE_COOKIE, requestedRole, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/app",
    maxAge: 60 * 60 * 8
  });

  return response;
}
