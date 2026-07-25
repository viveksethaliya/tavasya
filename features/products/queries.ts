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
  
  if (error) throw error
  return data
}

export async function getProductBySlug(slug: string, options?: { publishedOnly?: boolean }) {
  const supabase = await createClient()
  
  let query = supabase.from("products").select("*").eq("slug", slug)
  
  if (options?.publishedOnly) {
    query = query.eq("status", "published")
  }
  
  const { data, error } = await query.single()
  
  if (error) throw error
  return data
}
