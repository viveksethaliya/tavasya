import { createClient } from '@/lib/supabase/server'

export async function getSiteSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single()
  if (error && error.code !== 'PGRST116') {
    // PGRST116 = "no rows found" — treat as empty config, not an error
    return { data: null, error: error.message }
  }
  return { data: data ?? null, error: null }
}

export async function getPages() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('route_key')
  if (error) {
    return { data: [], error: error.message }
  }
  return { data: data ?? [], error: null }
}
