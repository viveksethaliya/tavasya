"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/server/auth/requireAdmin"
import { collectionSchema, CollectionFormValues, collectionSeoSchema, CollectionSeoValues } from "./schema"
import { revalidatePath } from "next/cache"
import { slugify } from "@/utils/slugify"

export async function createCollection(data: CollectionFormValues) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const parsed = collectionSchema.parse(data)
    
    let slug = parsed.slug
    if (!slug) {
      slug = slugify(parsed.name)
    }

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", slug)
      .single()

    if (existing) {
      return { success: false, error: { message: "A collection with this slug already exists. Please choose another." } }
    }

    const { products, ...collectionData } = parsed

    const { data: result, error } = await supabase.rpc("create_collection_with_products", {
      p_name: collectionData.name,
      p_slug: slug,
      p_description: collectionData.description || null,
      p_image_id: collectionData.image_id || null,
      p_status: collectionData.status,
      p_sort_order: collectionData.sort_order,
      p_seo_title: collectionData.seo_title || null,
      p_meta_description: collectionData.meta_description || null,
      p_canonical_url: collectionData.canonical_url || null,
      p_og_image_id: collectionData.og_image_id || null,
      p_robots: collectionData.robots || 'index,follow',
      p_keywords: collectionData.keywords || null,
      p_products: products && products.length > 0 
        ? products.map((productId, index) => ({ product_id: productId, sort_order: index }))
        : null
    })

    if (error) throw error

    const collection = { id: result.id, ...collectionData, slug }

    revalidatePath("/admin/collections")
    revalidatePath("/collections")
    revalidatePath(`/collections/${slug}`)
    
    return { success: true, data: collection }
  } catch (error: unknown) {
    console.error("Failed to create collection:", error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any
    if (err?.name === 'ZodError') {
      return { success: false, error: { fieldErrors: err.flatten().fieldErrors } }
    }
    return { success: false, error: { message: err?.message || "Failed to create collection" } }
  }
}

export async function updateCollection(id: string, data: CollectionFormValues) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Verify target exists
    const { data: targetCollection } = await supabase
      .from("collections")
      .select("id, slug")
      .eq("id", id)
      .single()

    if (!targetCollection) {
      return { success: false, error: { message: "Collection not found" } }
    }

    const parsed = collectionSchema.parse(data)
    
    let slug = parsed.slug
    if (!slug) {
      slug = slugify(parsed.name)
    }

    const { data: existing } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .single()

    if (existing) {
      return { success: false, error: { message: "A collection with this slug already exists. Please choose another." } }
    }

    const { products, ...collectionData } = parsed

    const { error } = await supabase.rpc("update_collection_with_products", {
      p_id: id,
      p_name: collectionData.name,
      p_slug: slug,
      p_description: collectionData.description || null,
      p_image_id: collectionData.image_id || null,
      p_status: collectionData.status,
      p_sort_order: collectionData.sort_order,
      p_seo_title: collectionData.seo_title || null,
      p_meta_description: collectionData.meta_description || null,
      p_canonical_url: collectionData.canonical_url || null,
      p_og_image_id: collectionData.og_image_id || null,
      p_robots: collectionData.robots || 'index,follow',
      p_keywords: collectionData.keywords || null,
      p_products: products && products.length > 0 
        ? products.map((productId, index) => ({ product_id: productId, sort_order: index }))
        : null
    })

    if (error) throw error

    revalidatePath("/admin/collections")
    revalidatePath("/collections")
    revalidatePath(`/collections/${slug}`)
    if (targetCollection.slug !== slug) {
      revalidatePath(`/collections/${targetCollection.slug}`)
    }
    
    return { success: true }
  } catch (error: unknown) {
    console.error("Failed to update collection:", error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any
    if (err?.name === 'ZodError') {
      return { success: false, error: { fieldErrors: err.flatten().fieldErrors } }
    }
    return { success: false, error: { message: err?.message || "Failed to update collection" } }
  }
}

export async function deleteCollection(id: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id)
      .select("id, slug")

    if (error) throw error
    if (!data || data.length === 0) {
      return { success: false, error: { message: "Collection not found" } }
    }

    revalidatePath("/admin/collections")
    revalidatePath("/collections")
    if (data[0].slug) {
      revalidatePath(`/collections/${data[0].slug}`)
    }

    return { success: true }
  } catch (error: unknown) {
    console.error("Failed to delete collection:", error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any
    return { success: false, error: { message: err?.message || "Failed to delete collection" } }
  }
}

export async function searchProducts(query: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select("id, name, sku, primary_image_id")
      .ilike("name", `%${query}%`)
      .limit(20)

    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to search products:", error)
    return { success: false, data: [] }
  }
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return { success: true, data: [] }
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select("id, name, sku, primary_image_id")
      .in("id", ids)

    if (error) throw error
    
    // Sort matching original ids array
    const sortedData = ids
      .map(id => data.find((d: { id: string }) => d.id === id))
      .filter((d): d is { id: string; name: string; sku: string | null; primary_image_id: string | null } => Boolean(d))
    
    return { success: true, data: sortedData }
  } catch (error: unknown) {
    console.error("Failed to get products by ids:", error)
    return { success: false, data: [] }
  }
}

export async function updateCollectionSeo(id: string, data: CollectionSeoValues) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const parsed = collectionSeoSchema.parse(data)

    const { data: result, error } = await supabase
      .from("collections")
      .update({
        ...parsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, slug")

    if (error) throw error
    if (!result || result.length === 0) {
       return { success: false, error: { message: "Collection not found" } }
    }

    revalidatePath("/admin/collections")
    revalidatePath("/collections")
    if (result[0].slug) {
      revalidatePath(`/collections/${result[0].slug}`)
    }

    return { success: true }
  } catch (error: unknown) {
    console.error("Failed to update collection seo:", error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any
    if (err?.name === 'ZodError') {
      return { success: false, error: { fieldErrors: err.flatten().fieldErrors } }
    }
    return { success: false, error: { message: err?.message || "Failed to update collection seo" } }
  }
}

