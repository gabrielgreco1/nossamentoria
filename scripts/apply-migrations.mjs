import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";

const root = process.cwd();
const envPath = join(root, ".env");
const migrationsDir = join(root, "supabase", "migrations");

async function loadEnvFile() {
  try {
    const content = await readFile(envPath, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split("=");
      process.env[key] ??= valueParts.join("=");
    }
  } catch {
    // .env is optional; DATABASE_URL may already be set in the shell.
  }
}

await loadEnvFile();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to apply migrations.");
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: "require"
});

try {
  await sql`
    create table if not exists public.schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    const [existing] = await sql`
      select version
      from public.schema_migrations
      where version = ${version}
    `;

    if (existing) {
      console.log(`skip ${file}`);
      continue;
    }

    const migrationSql = await readFile(join(migrationsDir, file), "utf8");

    await sql.begin(async (transaction) => {
      await transaction.unsafe(migrationSql);
      await transaction`
        insert into public.schema_migrations (version)
        values (${version})
      `;
    });

    console.log(`applied ${file}`);
  }
} finally {
  await sql.end();
}
