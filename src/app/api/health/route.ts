import { NextResponse } from "next/server";
import { getEnvStatus } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const environment = getEnvStatus();
  const healthy = environment.configured;

  return NextResponse.json(
    {
      service: "nossamentoria",
      status: healthy ? "ok" : "degraded",
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      checks: {
        configuration: healthy ? "configured" : "missing"
      },
      timestamp: new Date().toISOString()
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
