import type { SupabaseClient } from "@supabase/supabase-js"
import { createServiceRoleClient } from "./supabase-service"

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function resolveDietitianIdFromIdentifier(
  identifier: string | null | undefined,
  providedClient?: SupabaseClient
) {
  const cleaned = identifier?.trim()
  if (!cleaned) return null

  if (UUID_REGEX.test(cleaned)) {
    return cleaned
  }

  const supabase = providedClient ?? createServiceRoleClient()
  const { data, error } = await supabase
    .from("dietitian_site_configs")
    .select("dietitian_id")
    .eq("public_site_key", cleaned)
    .single()

  if (error || !data?.dietitian_id) {
    return null
  }

  return data.dietitian_id as string
}
