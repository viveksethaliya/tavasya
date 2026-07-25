import { createClient } from '@/lib/supabase/server'

export async function getSiteSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single()
  if (error) return null
  return data
}

export async function getPages() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('route_key')
  if (error) return []
  return data ?? []
}
