const REQUIRED_PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL"
] as const;

const REQUIRED_SERVER_ENV_KEYS = ["SUPABASE_SERVICE_ROLE_KEY"] as const;

type PublicEnvKey = (typeof REQUIRED_PUBLIC_ENV_KEYS)[number];
type ServerEnvKey = (typeof REQUIRED_SERVER_ENV_KEYS)[number];

export type EnvStatus = {
  configured: boolean;
  missing: string[];
};

export function getEnvStatus(): EnvStatus {
  const missing = [...REQUIRED_PUBLIC_ENV_KEYS, ...REQUIRED_SERVER_ENV_KEYS].filter(
    (key) => !process.env[key]
  );

  return {
    configured: missing.length === 0,
    missing
  };
}

export function isPublicEnvConfigured() {
  return REQUIRED_PUBLIC_ENV_KEYS.every((key) => Boolean(process.env[key]));
}

export function getPublicEnv(): Record<PublicEnvKey, string> {
  const missing = REQUIRED_PUBLIC_ENV_KEYS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Variáveis públicas de ambiente ausentes: ${missing.join(", ")}`);
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!
  };
}

export function getServerEnv(): Record<ServerEnvKey, string> {
  const missing = REQUIRED_SERVER_ENV_KEYS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Variáveis de servidor ausentes: ${missing.join(", ")}`);
  }

  return {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!
  };
}
