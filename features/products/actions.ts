"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/server/auth/requireAdmin"
import { productSchema, ProductFormValues } from "./schema"
import { slugify } from "@/utils/slugify"
import { revalidatePath } from "next/cache"

export async function createProduct(data: ProductFormValues) {
  await requireAdmin()
  const supabase = await createClient()

  // Validate data
  const parsed = productSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: { message: "Invalid form data", fieldErrors: parsed.error.flatten().fieldErrors } }
  }

  const { name, sku, short_description, description, category, status, is_featured, sort_order } = parsed.data
  const slug = parsed.data.slug || slugify(name)

  // Ensure slug uniqueness
  const { data: existing } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle()
  if (existing) {
    return { success: false, error: { message: `Slug "${slug}" is already in use. Please choose another.` } }
  }

  const { data: inserted, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      sku,
      short_description,
      description,
      category,
      status,
      is_featured,
      sort_order,
    })
    .select("id")
    .single()

  if (error) {
    return { success: false, error: { message: error.message } }
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true, data: inserted }
}

export async function updateProduct(id: string, data: ProductFormValues) {
  await requireAdmin()
  const supabase = await createClient()

  const parsed = productSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: { message: "Invalid form data", fieldErrors: parsed.error.flatten().fieldErrors } }
  }

  const { name, slug, sku, short_description, description, category, status, is_featured, sort_order } = parsed.data
  
  // If slug provided and changed, ensure uniqueness
  if (slug) {
    const { data: existing } = await supabase.from("products").select("id").eq("slug", slug).neq("id", id).maybeSingle()
    if (existing) {
      return { success: false, error: { message: `Slug "${slug}" is already in use.` } }
    }
  }

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug: slug || slugify(name),
      sku,
      short_description,
      description,
      category,
      status,
      is_featured,
      sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: { message: error.message } }
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  if (slug) revalidatePath(`/products/${slug}`)
  return { success: true }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    return { success: false, error: { message: error.message } }
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true }
}
