import { createClient } from "@/lib/supabase/server"

export async function getMedia() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching media:", error)
    return []
  }

  return data
}
