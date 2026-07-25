'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/server/auth/requireAdmin'
import { productSchema, ProductFormValues } from './schema'
import { slugify } from '@/utils/slugify'
import { revalidatePath } from 'next/cache'

export async function createProduct(data: ProductFormValues) {
  await requireAdmin()
  const supabase = await createClient()
  const parsed = productSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid form data', fieldErrors: parsed.error.flatten().fieldErrors } }
  }
  const { name, sku, short_description, description, category, status, is_featured, sort_order } = parsed.data
  const slug = parsed.data.slug || slugify(name)
  const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).maybeSingle()
  if (existing) {
    return { success: false, error: { message: `Slug "${slug}" is already in use. Please choose another.` } }
  }
  const { data: inserted, error } = await supabase
    .from('products')
    .insert({ name, slug, sku, short_description, description, category, status, is_featured, sort_order })
    .select('id')
    .single()
  if (error) return { success: false, error: { message: error.message } }
  revalidatePath('/admin/products')
  revalidatePath('/products')
  return { success: true, data: inserted }
}

export async function updateProduct(id: string, data: ProductFormValues) {
  await requireAdmin()
  const supabase = await createClient()
  const parsed = productSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid form data', fieldErrors: parsed.error.flatten().fieldErrors } }
  }
  const { name, slug, sku, short_description, description, category, status, is_featured, sort_order } = parsed.data
  if (slug) {
    const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).neq('id', id).maybeSingle()
    if (existing) return { success: false, error: { message: `Slug "${slug}" is already in use.` } }
  }
  const { error } = await supabase
    .from('products')
    .update({ name, slug: slug || slugify(name), sku, short_description, description, category, status, is_featured, sort_order, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { success: false, error: { message: error.message } }
  revalidatePath('/admin/products')
  revalidatePath('/products')
  if (slug) revalidatePath(`/products/${slug}`)
  return { success: true }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { success: false, error: { message: error.message } }
  revalidatePath('/admin/products')
  revalidatePath('/products')
  return { success: true }
}

// --- Image Actions ---
export async function getProductImages(productId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_images')
    .select('id, media_id, sort_order, media(id, file_url, file_name, alt_text)')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  if (error) return { success: false, data: [] }
  return { success: true, data: data ?? [] }
}

export async function addProductImage(productId: string, mediaId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { count } = await supabase
    .from('product_images')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)
  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, media_id: mediaId, sort_order: count ?? 0 })
    .select('id')
    .single()
  if (error) return { success: false, error: { message: error.message } }
  revalidatePath(`/admin/products/${productId}`)
  return { success: true, data }
}

export async function removeProductImage(productImageId: string, productId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('product_images').delete().eq('id', productImageId)
  if (error) return { success: false, error: { message: error.message } }
  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

export async function setPrimaryImage(productId: string, mediaId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .update({ primary_image_id: mediaId, updated_at: new Date().toISOString() })
    .eq('id', productId)
  if (error) return { success: false, error: { message: error.message } }
  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

// --- Specs & Features ---
export async function getProductSpecs(productId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_specifications')
    .select('id, spec_key, spec_value, sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  if (error) return { success: false, data: [] }
  return { success: true, data: data ?? [] }
}

export async function upsertSpecifications(productId: string, specs: { spec_key: string; spec_value: string }[]) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from('product_specifications').delete().eq('product_id', productId)
  if (specs.length > 0) {
    const rows = specs.map((s, i) => ({ product_id: productId, spec_key: s.spec_key, spec_value: s.spec_value, sort_order: i }))
    const { error } = await supabase.from('product_specifications').insert(rows)
    if (error) return { success: false, error: { message: error.message } }
  }
  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

export async function getProductFeatures(productId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_features')
    .select('id, feature_text, sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  if (error) return { success: false, data: [] }
  return { success: true, data: data ?? [] }
}

export async function upsertFeatures(productId: string, features: { feature_text: string }[]) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from('product_features').delete().eq('product_id', productId)
  if (features.length > 0) {
    const rows = features.map((f, i) => ({ product_id: productId, feature_text: f.feature_text, sort_order: i }))
    const { error } = await supabase.from('product_features').insert(rows)
    if (error) return { success: false, error: { message: error.message } }
  }
  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

// --- SEO ---
export async function updateProductSeo(
  productId: string,
  seoData: { seo_title?: string; meta_description?: string; canonical_url?: string; og_image_id?: string; robots?: string; keywords?: string }
) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .update({ ...seoData, updated_at: new Date().toISOString() })
    .eq('id', productId)
  if (error) return { success: false, error: { message: error.message } }
  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}
