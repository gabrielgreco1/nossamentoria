import type { SupabaseClient } from "@supabase/supabase-js";

export const MATERIALS_BUCKET = "mentor-materials";

export async function uploadPrivateMaterial(
  supabase: SupabaseClient,
  path: string,
  file: File
) {
  return supabase.storage.from(MATERIALS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
}
