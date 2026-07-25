"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/server/auth/requireAdmin"
import { collectionSchema, CollectionFormValues } from "./schema"
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

    const { data: collection, error } = await supabase
      .from("collections")
      .insert({
        ...collectionData,
        slug,
      })
      .select("id")
      .single()

    if (error) throw error

    // Insert products
    if (products && products.length > 0) {
      const collectionProducts = products.map((productId, index) => ({
        collection_id: collection.id,
        product_id: productId,
        sort_order: index,
      }))
      
      const { error: cpError } = await supabase
        .from("collection_products")
        .insert(collectionProducts)
        
      if (cpError) throw cpError
    }

    revalidatePath("/admin/collections")
    revalidatePath("/collections")
    
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

    const { error } = await supabase
      .from("collections")
      .update({
        ...collectionData,
        slug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    // Delete existing products and re-insert
    const { error: delError } = await supabase
      .from("collection_products")
      .delete()
      .eq("collection_id", id)
      
    if (delError) throw delError

    if (products && products.length > 0) {
      const collectionProducts = products.map((productId, index) => ({
        collection_id: id,
        product_id: productId,
        sort_order: index,
      }))
      
      const { error: cpError } = await supabase
        .from("collection_products")
        .insert(collectionProducts)
        
      if (cpError) throw cpError
    }

    revalidatePath("/admin/collections")
    revalidatePath("/collections")
    revalidatePath(`/collections/${slug}`)
    
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

    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id)

    if (error) throw error

    revalidatePath("/admin/collections")
    revalidatePath("/collections")

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
