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
  invalid: string[];
};

function getPublicValues() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  };
}

function getServerValues() {
  return {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

function isValidUrl(value: string | undefined, protocols: string[]) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return protocols.includes(url.protocol);
  } catch {
    return false;
  }
}

function getInvalidPublicKeys(values: ReturnType<typeof getPublicValues>) {
  const invalid: string[] = [];

  if (
    values.NEXT_PUBLIC_SUPABASE_URL &&
    !isValidUrl(values.NEXT_PUBLIC_SUPABASE_URL, ["https:", "http:"])
  ) {
    invalid.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (values.NEXT_PUBLIC_APP_URL) {
    try {
      const appUrl = new URL(values.NEXT_PUBLIC_APP_URL);
      const local = appUrl.hostname === "localhost" || appUrl.hostname === "127.0.0.1";
      const insecureProductionUrl =
        process.env.NODE_ENV === "production" && !local && appUrl.protocol !== "https:";

      if (
        !["https:", "http:"].includes(appUrl.protocol) ||
        appUrl.pathname !== "/" ||
        appUrl.search ||
        appUrl.hash ||
        insecureProductionUrl
      ) {
        invalid.push("NEXT_PUBLIC_APP_URL");
      }
    } catch {
      invalid.push("NEXT_PUBLIC_APP_URL");
    }
  }

  return invalid;
}

export function getEnvStatus(): EnvStatus {
  const publicValues = getPublicValues();
  const serverValues = getServerValues();
  const values = { ...publicValues, ...serverValues };
  const missing = [...REQUIRED_PUBLIC_ENV_KEYS, ...REQUIRED_SERVER_ENV_KEYS].filter(
    (key) => !values[key]
  );
  const invalid = getInvalidPublicKeys(publicValues);

  if (
    serverValues.SUPABASE_SERVICE_ROLE_KEY &&
    serverValues.SUPABASE_SERVICE_ROLE_KEY === publicValues.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    invalid.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  return {
    configured: missing.length === 0 && invalid.length === 0,
    missing,
    invalid
  };
}

export function isPublicEnvConfigured() {
  const values = getPublicValues();
  const missing = REQUIRED_PUBLIC_ENV_KEYS.some((key) => !values[key]);
  return !missing && getInvalidPublicKeys(values).length === 0;
}

export function getPublicEnv(): Record<PublicEnvKey, string> {
  const values = getPublicValues();
  const missing = REQUIRED_PUBLIC_ENV_KEYS.filter((key) => !values[key]);
  const invalid = getInvalidPublicKeys(values);

  if (missing.length > 0 || invalid.length > 0) {
    throw new Error(
      `Variáveis públicas de ambiente ausentes ou inválidas: ${[
        ...missing,
        ...invalid
      ].join(", ")}`
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: values.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: values.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    NEXT_PUBLIC_APP_URL: values.NEXT_PUBLIC_APP_URL!
  };
}

export function getServerEnv(): Record<ServerEnvKey, string> {
  const values = getServerValues();
  const missing = REQUIRED_SERVER_ENV_KEYS.filter((key) => !values[key]);

  if (missing.length > 0) {
    throw new Error(`Variáveis de servidor ausentes: ${missing.join(", ")}`);
  }

  return {
    SUPABASE_SERVICE_ROLE_KEY: values.SUPABASE_SERVICE_ROLE_KEY!
  };
}
