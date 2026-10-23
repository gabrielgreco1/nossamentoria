"use server";

import { revalidatePath } from "next/cache";
import { MATERIAL_TYPES } from "@/lib/domain-types";
import { createClient } from "@/lib/supabase/server";
import { MATERIALS_BUCKET, uploadPrivateMaterial } from "@/lib/supabase/storage";
import { getWorkspaceContext } from "@/lib/workspace-context";

export type MaterialMutationState = {
  status: "idle" | "success" | "error";
  message: string;
  materialId?: string;
};

const uuidPattern = /^[0-9a-f-]{36}$/i;
const linkTypes = new Set(["external_link", "repository"]);
const maxFileSize = 10 * 1024 * 1024;

function result(status: MaterialMutationState["status"], message: string, materialId?: string): MaterialMutationState {
  return { status, message, ...(materialId ? { materialId } : {}) };
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function safeFileName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(-120) || "arquivo";
}

export async function saveMaterial(
  _previousState: MaterialMutationState,
  formData: FormData
): Promise<MaterialMutationState> {
  const context = await getWorkspaceContext();
  if (!context.user || (!context.roles.includes("mentor") && !context.roles.includes("admin"))) {
    return result("error", "Você não tem permissão para salvar materiais.");
  }

  const materialId = String(formData.get("materialId") ?? "");
  const type = String(formData.get("type") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const tags = [...new Set(String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean))];
  const fileValue = formData.get("file");
  const file = fileValue && typeof fileValue !== "string" && fileValue.size > 0 ? fileValue : null;

  if (materialId && !uuidPattern.test(materialId)) return result("error", "Material inválido.");
  if (!MATERIAL_TYPES.includes(type as (typeof MATERIAL_TYPES)[number])) return result("error", "Tipo de material inválido.");
  if (!title || title.length > 160 || !category || category.length > 100) {
    return result("error", "Preencha o título e a categoria.");
  }
  if (description.length > 1000 || tags.length > 30) return result("error", "Revise a descrição e as tags.");
  if (file && file.size > maxFileSize) return result("error", "O arquivo deve ter no máximo 10 MB.");
  if (linkTypes.has(type) && !validHttpUrl(sourceUrl)) return result("error", "Informe uma URL válida.");

  const supabase = await createClient();
  let current: {
    id: string;
    owner_user_id: string;
    source_url: string | null;
    storage_path: string | null;
    mime_type: string | null;
    size_bytes: number | null;
  } | null = null;

  if (materialId) {
    const { data, error } = await supabase
      .from("content_materials")
      .select("id,owner_user_id,source_url,storage_path,mime_type,size_bytes")
      .eq("id", materialId)
      .maybeSingle();
    if (error || !data) return result("error", "Material não encontrado.");
    if (!context.roles.includes("admin") && data.owner_user_id !== context.user.id) {
      return result("error", "Você não pode editar este material.");
    }
    current = data;
  }

  const id = materialId || crypto.randomUUID();
  let nextStoragePath = current?.storage_path ?? null;
  let nextSourceUrl = current?.source_url ?? null;
  let nextMimeType = current?.mime_type ?? null;
  let nextSizeBytes = current?.size_bytes ?? null;
  let uploadedPath: string | null = null;

  if (linkTypes.has(type)) {
    nextSourceUrl = sourceUrl;
    nextStoragePath = null;
    nextMimeType = null;
    nextSizeBytes = null;
  } else if (file) {
    uploadedPath = `${context.user.id}/${id}/${Date.now()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await uploadPrivateMaterial(supabase, uploadedPath, file);
    if (uploadError) return result("error", "Não foi possível enviar o arquivo. Tente novamente.");
    nextStoragePath = uploadedPath;
    nextSourceUrl = null;
    nextMimeType = file.type || "application/octet-stream";
    nextSizeBytes = file.size;
  } else if (!nextStoragePath) {
    return result("error", "Selecione um arquivo para este tipo de material.");
  }

  const payload = {
    type,
    title,
    description: description || null,
    category,
    tags,
    source_url: nextSourceUrl,
    storage_path: nextStoragePath,
    mime_type: nextMimeType,
    size_bytes: nextSizeBytes
  };

  const mutation = materialId
    ? await supabase.from("content_materials").update(payload).eq("id", id)
    : await supabase.from("content_materials").insert({ id, owner_user_id: context.user.id, ...payload });

  if (mutation.error) {
    if (uploadedPath) await supabase.storage.from(MATERIALS_BUCKET).remove([uploadedPath]);
    return result("error", `Não foi possível ${materialId ? "atualizar" : "criar"} o material. Tente novamente.`);
  }

  if (current?.storage_path && current.storage_path !== nextStoragePath) {
    await supabase.storage.from(MATERIALS_BUCKET).remove([current.storage_path]);
  }

  revalidatePath("/app/materials");
  return result("success", materialId ? "Material atualizado." : "Material criado com sucesso.", id);
}
