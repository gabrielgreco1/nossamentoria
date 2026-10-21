import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

function readEnvFile(fileName) {
  const path = resolve(process.cwd(), fileName);

  if (!existsSync(path)) return {};

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator).trim(),
          line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, "$2")
        ];
      })
  );
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const environment = {
  ...readEnvFile(".env"),
  ...readEnvFile(".env.local"),
  ...process.env
};
const secret = environment.SUPABASE_SERVICE_ROLE_KEY;
const staticDirectory = resolve(process.cwd(), ".next", "static");

if (!secret || secret.length < 16) {
  console.error("SUPABASE_SERVICE_ROLE_KEY ausente ou curta demais para uma verificação segura.");
  process.exit(1);
}

if (!existsSync(staticDirectory) || !statSync(staticDirectory).isDirectory()) {
  console.error("Bundle do navegador ausente. Execute npm run build antes desta verificação.");
  process.exit(1);
}

const exposedFile = walk(staticDirectory).find((path) => readFileSync(path).includes(Buffer.from(secret)));

if (exposedFile) {
  console.error("Falha: a service role foi encontrada em um artefato público do navegador.");
  process.exit(1);
}

console.log("OK: a service role não está presente no bundle público do navegador.");
