const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

async function request(path, options = {}) {
  try {
    return await fetch(`${baseUrl}${path}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
      ...options
    });
  } catch (error) {
    throw new Error(`Não foi possível acessar ${path}: ${error.message}`);
  }
}

const landing = await request("/");
const landingBody = await landing.text();
const login = await request("/login");
const health = await request("/api/health");
const healthBody = await health.json();
const privateWorkspace = await request("/app");

const checks = [
  [landing.status === 200 && landingBody.includes("NossaMentoria"), "landing pública"],
  [login.status === 200, "login público"],
  [health.status === 200 && healthBody.status === "ok", "health check configurado"],
  [
    [307, 308].includes(privateWorkspace.status) &&
      privateWorkspace.headers.get("location")?.includes("/login"),
    "workspace privado redireciona anônimo"
  ],
  [landing.headers.get("x-frame-options") === "DENY", "proteção contra framing"],
  [landing.headers.get("x-content-type-options") === "nosniff", "proteção MIME"]
];

const failed = checks.filter(([passed]) => !passed);

for (const [passed, name] of checks) {
  console.log(`${passed ? "OK" : "FALHA"}: ${name}`);
}

if (failed.length) {
  process.exit(1);
}
