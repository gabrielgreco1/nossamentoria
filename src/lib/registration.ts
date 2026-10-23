import type { UserRole } from "@/lib/access";

export const PASSWORD_MIN_LENGTH = 12;

export type AcademicFormationInput = {
  institution: string;
  course: string;
  degree: string;
  status: "in_progress" | "completed" | "paused";
  start_year?: string;
  end_year?: string;
};

export type KnowledgeTopicOption = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export type KnowledgeAreaOption = {
  id: string;
  slug: string;
  name: string;
  description: string;
  topics: KnowledgeTopicOption[];
};

export function validatePassword(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return "Inclua letras maiúsculas e minúsculas.";
  }
  if (!/\d/.test(password)) {
    return "Inclua pelo menos um número.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Inclua pelo menos um símbolo.";
  }
  return null;
}

export function normalizeProfileUrl(value: string) {
  const normalized = value.trim();
  if (!normalized || /^[a-z][a-z0-9+.-]*:\/\//i.test(normalized)) return normalized;
  return `https://${normalized.replace(/^\/+/, "")}`;
}

export function isValidProfileUrl(value: string, kind: "linkedin" | "github") {
  if (!value) return false;

  try {
    const url = new URL(normalizeProfileUrl(value));
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    if (url.protocol !== "https:") return false;
    if (kind === "github") return hostname === "github.com" && url.pathname !== "/";
    return (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) && url.pathname !== "/";
  } catch {
    return false;
  }
}

export function getKnowledgeSelectionLabel(role: UserRole) {
  return role === "mentor" ? "especialidades" : "áreas de interesse";
}
