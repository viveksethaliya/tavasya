import { createClient } from "@/lib/supabase/server"

export async function getBlogs(options?: { publishedOnly?: boolean }) {
  const supabase = await createClient()

  let query = supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false })

  if (options?.publishedOnly) {
    query = query.eq("status", "published").order("published_at", { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching blogs:", error)
    return { data: [], error: error.message }
  }

  return { data: data ?? [], error: null }
}

export async function getBlogById(id: string) {
  const supabase = await createClient()

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null, notFound: true, error: null }
    }
    return { data: null, notFound: false, error: error.message }
  }

  return { data: blog, notFound: false, error: null }
}

export async function getBlogBySlug(slug: string, options?: { publishedOnly?: boolean }) {
  const supabase = await createClient()

  let query = supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)

  if (options?.publishedOnly) {
    query = query.eq("status", "published")
  }

  const { data: blog, error } = await query.single()

  if (error || !blog) {
    throw new Error("Blog not found")
  }

  return blog
}

export async function getRelatedBlogs(currentBlogId: string, limit: number = 3) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("blogs")
    .select("id, title, slug, excerpt, published_at, cover_image_id")
    .eq("status", "published")
    .neq("id", currentBlogId)
    .order("published_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching related blogs:", error)
    return []
  }

  return data
}
