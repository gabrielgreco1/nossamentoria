import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL"
];

function readEnvFile(fileName) {
  const path = resolve(process.cwd(), fileName);

  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, "$2");
        return [key, value];
      })
  );
}

const fileEnvironment = process.env.ENV_CHECK_SKIP_FILES === "1"
  ? {}
  : {
      ...readEnvFile(".env"),
      ...readEnvFile(".env.local")
    };
const environment = { ...fileEnvironment, ...process.env };
const missing = requiredKeys.filter((key) => !environment[key]?.trim());
const invalid = [];

function validUrl(key, protocols) {
  const value = environment[key];

  if (!value) return;

  try {
    const parsed = new URL(value);
    const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

    if (!protocols.includes(parsed.protocol) || (key === "NEXT_PUBLIC_SUPABASE_URL" && !local && parsed.protocol !== "https:")) {
      invalid.push(key);
    }

    if (key === "NEXT_PUBLIC_APP_URL" && (parsed.pathname !== "/" || parsed.search || parsed.hash)) {
      invalid.push(key);
    }
  } catch {
    invalid.push(key);
  }
}

validUrl("NEXT_PUBLIC_SUPABASE_URL", ["https:", "http:"]);
validUrl("NEXT_PUBLIC_APP_URL", ["https:", "http:"]);

if (environment.NEXT_PUBLIC_APP_URL) {
  try {
    const appUrl = new URL(environment.NEXT_PUBLIC_APP_URL);
    const local = appUrl.hostname === "localhost" || appUrl.hostname === "127.0.0.1";
    const production = environment.VERCEL_ENV === "production";

    if (production && !local && appUrl.protocol !== "https:") {
      invalid.push("NEXT_PUBLIC_APP_URL");
    }
  } catch {
    // The URL validation above already records this key.
  }
}

if (
  environment.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  environment.SUPABASE_SERVICE_ROLE_KEY &&
  environment.NEXT_PUBLIC_SUPABASE_ANON_KEY === environment.SUPABASE_SERVICE_ROLE_KEY
) {
  invalid.push("SUPABASE_SERVICE_ROLE_KEY");
}

const uniqueInvalid = [...new Set(invalid)];

if (missing.length || uniqueInvalid.length) {
  if (missing.length) console.error(`Variáveis ausentes: ${missing.join(", ")}`);
  if (uniqueInvalid.length) console.error(`Variáveis inválidas: ${uniqueInvalid.join(", ")}`);
  process.exit(1);
}

console.log(`OK: ${requiredKeys.length} variáveis obrigatórias presentes e válidas; nenhum valor secreto foi exibido.`);
