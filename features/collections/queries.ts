import { createClient } from "@/lib/supabase/server"

export async function getCollections(options?: { publishedOnly?: boolean }) {
  const supabase = await createClient()

  let query = supabase
    .from("collections")
    .select(`
      *,
      collection_products(count)
    `)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (options?.publishedOnly) {
    query = query.eq("status", "published")
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching collections:", error)
    return []
  }

  return data.map(collection => ({
    ...collection,
    product_count: collection.collection_products?.[0]?.count || 0
  }))
}

export async function getCollectionById(id: string) {
  const supabase = await createClient()

  const { data: collection, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !collection) {
    throw new Error("Collection not found")
  }

  const { data: collectionProducts } = await supabase
    .from("collection_products")
    .select("product_id")
    .eq("collection_id", id)
    .order("sort_order", { ascending: true })

  return {
    ...collection,
    products: collectionProducts?.map(cp => cp.product_id) || []
  }
}

export async function getCollectionBySlug(slug: string, options?: { publishedOnly?: boolean }) {
  const supabase = await createClient()

  let query = supabase
    .from("collections")
    .select(`
      *,
      collection_products (
        product_id,
        sort_order
      )
    `)
    .eq("slug", slug)

  if (options?.publishedOnly) {
    query = query.eq("status", "published")
  }

  const { data: collection, error } = await query.single()

  if (error || !collection) {
    throw new Error("Collection not found")
  }

  // Fetch the actual products
  let products = []
  if (collection.collection_products && collection.collection_products.length > 0) {
    const productIds = collection.collection_products.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order).map((cp: { product_id: string }) => cp.product_id)
    
    let productsQuery = supabase
      .from("products")
      .select("*")
      .in("id", productIds)

    if (options?.publishedOnly) {
      productsQuery = productsQuery.eq("status", "published")
    }

    const { data: productsData } = await productsQuery
    
    // Maintain sort order
    if (productsData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products = productIds.map((id: string) => productsData.find((p: { id: string }) => p.id === id)).filter(Boolean) as any
    }
  }

  return {
    ...collection,
    products
  }
}
