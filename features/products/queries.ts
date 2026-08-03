import { createClient } from "@/lib/supabase/server"

export async function getProducts(options?: { publishedOnly?: boolean }) {
  const supabase = await createClient()
  
  let query = supabase.from("products").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false })
  
  if (options?.publishedOnly) {
    query = query.eq("status", "published")
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function getProductById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()
  
  if (error) {
    // PGRST116 = no rows returned — the product genuinely does not exist
    if (error.code === 'PGRST116') {
      return { data: null, notFound: true, error: null }
    }
    return { data: null, notFound: false, error: error.message }
  }
  return { data, notFound: false, error: null }
}

export async function getProductBySlug(slug: string, options?: { publishedOnly?: boolean }) {
  const supabase = await createClient()
  
  let query = supabase.from("products").select(`
    *,
    product_images ( media_id, sort_order ),
    product_specifications ( spec_key, spec_value, sort_order ),
    product_features ( feature_text, sort_order )
  `).eq("slug", slug)
  
  if (options?.publishedOnly) {
    query = query.eq("status", "published")
  }
  
  const { data, error } = await query.single()
  
  if (error) throw error
  return data
}
