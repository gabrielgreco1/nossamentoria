import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const requiredComponents = [
  "src/components/ui/glass-panel.tsx",
  "src/components/ui/glass-button.tsx",
  "src/components/ui/pill-chip.tsx",
  "src/components/ui/brand-logo.tsx",
  "src/components/marketing/auth-card.tsx",
  "src/components/marketing/landing-section.tsx",
  "src/components/marketing/landing-hero.tsx",
  "src/components/app/app-shell.tsx",
  "src/components/app/page-header.tsx",
  "src/components/app/stat-card.tsx",
  "src/components/app/empty-state.tsx",
  "src/components/app/progress-indicator.tsx",
  "src/components/app/material-card.tsx",
  "src/components/app/session-card.tsx"
];

const requiredAssets = [
  "public/brand/nossamentoria-symbol-v1.png"
];

const requiredTokens = [
  "--canvas: #f7f3ea",
  "--surface: #fffdf7",
  "--text-primary: #13231f",
  "--brand-teal: #0f766e",
  "--brand-blue: #2563eb",
  "--accent-amber: #f5b84b",
  "--accent-coral: #e56b5f",
  "prefers-reduced-motion"
];

const errors = [];

for (const component of requiredComponents) {
  try {
    await access(path.join(root, component));
  } catch {
    errors.push(`Componente obrigatório ausente: ${component}`);
  }
}

for (const asset of requiredAssets) {
  try {
    await access(path.join(root, asset));
  } catch {
    errors.push(`Ativo de marca ausente: ${asset}`);
  }
}

const globals = await readFile(path.join(root, "src/app/globals.css"), "utf8");
for (const token of requiredTokens) {
  if (!globals.includes(token)) errors.push(`Token ou regra global ausente: ${token}`);
}

const rootLayout = await readFile(path.join(root, "src/app/layout.tsx"), "utf8");
if (!["Inter", "Sora", "--font-inter", "--font-sora"].every((value) => rootLayout.includes(value))) {
  errors.push("Inter e Sora precisam continuar configuradas no layout raiz com variáveis CSS.");
}

const motionFiles = await Promise.all([
  readFile(path.join(root, "src/components/marketing/blur-text.tsx"), "utf8"),
  readFile(path.join(root, "src/components/marketing/reveal.tsx"), "utf8")
]);
if (motionFiles.some((content) => !content.includes("useReducedMotion"))) {
  errors.push("Os componentes animados precisam consultar useReducedMotion.");
}

const reuseChecks = [
  ["src/app/page.tsx", "LandingHero"],
  ["src/components/app/live-workspaces.tsx", "MaterialCard"],
  ["src/components/app/live-workspaces.tsx", "ProgressIndicator"],
  ["src/components/app/live-workspaces.tsx", "SessionCard"]
];

for (const [file, component] of reuseChecks) {
  const content = await readFile(path.join(root, file), "utf8");
  if (!content.includes(component)) errors.push(`${component} não está sendo reutilizado em ${file}.`);
}

if (errors.length > 0) {
  console.error("Falha no gate do design system:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Design system validado: ${requiredComponents.length} componentes, marca, tokens e movimento reduzido.`);
