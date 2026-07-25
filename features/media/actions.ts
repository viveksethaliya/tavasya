"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/server/auth/requireAdmin"

export async function getMediaList() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to fetch media:", error)
    return { success: false, data: [] }
  }
}
