'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/server/auth/requireAdmin'
import { productSchema, ProductFormValues } from './schema'
import { slugify } from '@/utils/slugify'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const productSeoSchema = z.object({
  seo_title: z.string().max(120).optional().nullable(),
  meta_description: z.string().max(320).optional().nullable(),
  canonical_url: z.string().url().max(500).optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  og_image_id: z.string().uuid().optional().nullable(),
  robots: z.enum(['index,follow', 'noindex,follow', 'noindex,nofollow']).optional().nullable(),
  keywords: z.string().max(500).optional().nullable(),
})

async function revalidateProductPaths(productId: string, oldSlug?: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('slug').eq('id', productId).maybeSingle()
  
  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${productId}`)
  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath('/products')
  
  if (data?.slug) {
    revalidatePath(`/products/${data.slug}`)
  }
  if (oldSlug && oldSlug !== data?.slug) {
    revalidatePath(`/products/${oldSlug}`)
  }
}

export async function createProduct(data: ProductFormValues) {
  await requireAdmin()
  const supabase = await createClient()
  const parsed = productSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid form data', fieldErrors: parsed.error.flatten().fieldErrors } }
  }
  const { slug: explicitSlug, ...rest } = parsed.data
  const slug = explicitSlug || slugify(rest.name)
  const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).maybeSingle()
  if (existing) {
    return { success: false, error: { message: `Slug "${slug}" is already in use. Please choose another.` } }
  }
  const { data: inserted, error } = await supabase
    .from('products')
    .insert({ ...rest, slug })
    .select('id')
    .single()
  if (error) return { success: false, error: { message: error.message } }
  await revalidateProductPaths(inserted.id)
  return { success: true, data: inserted }
}

export async function updateProduct(id: string, data: ProductFormValues) {
  await requireAdmin()
  const supabase = await createClient()
  const { data: currentProduct } = await supabase.from('products').select('slug').eq('id', id).maybeSingle()
  const oldSlug = currentProduct?.slug

  const parsed = productSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid form data', fieldErrors: parsed.error.flatten().fieldErrors } }
  }
  const { name, slug, sku, short_description, description, category, status, is_featured, sort_order } = parsed.data
  if (slug) {
    const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).neq('id', id).maybeSingle()
    if (existing) return { success: false, error: { message: `Slug "${slug}" is already in use.` } }
  }
  const { data: updated, error } = await supabase
    .from('products')
    .update({ name, slug: slug || slugify(name), sku, short_description, description, category, status, is_featured, sort_order, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) return { success: false, error: { message: error.message } }
  if (!updated) return { success: false, error: { message: 'Product not found' } }
  await revalidateProductPaths(id, oldSlug)
  return { success: true }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { data: currentProduct } = await supabase.from('products').select('slug').eq('id', id).maybeSingle()
  const oldSlug = currentProduct?.slug

  const { data: deleted, error } = await supabase.from('products').delete().eq('id', id).select('id').maybeSingle()
  if (error) return { success: false, error: { message: error.message } }
  if (!deleted) return { success: false, error: { message: 'Product not found' } }
  await revalidateProductPaths(id, oldSlug)
  return { success: true }
}

// --- Image Actions ---
export async function getProductImages(productId: string) {
  await requireAdmin()
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
  await revalidateProductPaths(productId)
  return { success: true, data }
}

export async function removeProductImage(productImageId: string, productId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('product_images').delete().eq('id', productImageId)
  if (error) return { success: false, error: { message: error.message } }
  await revalidateProductPaths(productId)
  return { success: true }
}

export async function updateProductImageOrder(productId: string, orderedImageIds: string[]) {
  await requireAdmin()
  const supabase = await createClient()
  
  const promises = orderedImageIds.map((id, index) =>
    supabase.from('product_images').update({ sort_order: index }).eq('id', id).eq('product_id', productId)
  )
  await Promise.all(promises)
  
  await revalidateProductPaths(productId)
  return { success: true }
}

export async function setPrimaryImage(productId: string, mediaId: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: link, error: linkError } = await supabase
    .from('product_images')
    .select('id')
    .eq('product_id', productId)
    .eq('media_id', mediaId)
    .maybeSingle()

  if (linkError || !link) {
    return { success: false, error: { message: 'Image must belong to this product gallery' } }
  }

  const { error } = await supabase
    .from('products')
    .update({ primary_image_id: mediaId, updated_at: new Date().toISOString() })
    .eq('id', productId)
  if (error) return { success: false, error: { message: error.message } }
  await revalidateProductPaths(productId)
  return { success: true }
}

// --- Specs & Features ---
export async function getProductSpecs(productId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_specifications')
    .select('id, spec_key, spec_value, sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  if (error) return { success: false, data: [] }
  return { success: true, data: data ?? [] }
}

export async function upsertSpecifications(productId: string, specs: { id?: string; spec_key: string; spec_value: string }[]) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase.from('product_specifications').select('id').eq('product_id', productId)
  if (fetchError) return { success: false, error: { message: fetchError.message } }

  const incomingIds = specs.map(s => s.id).filter(Boolean) as string[]
  const toDelete = existing.map(e => e.id).filter(id => !incomingIds.includes(id))

  if (specs.length > 0) {
    const rows = specs.map((s, i) => ({ 
      ...(s.id ? { id: s.id } : {}), 
      product_id: productId, 
      spec_key: s.spec_key, 
      spec_value: s.spec_value, 
      sort_order: i 
    }))
    const { error: upsertError } = await supabase.from('product_specifications').upsert(rows)
    if (upsertError) return { success: false, error: { message: upsertError.message } }
  }

  if (toDelete.length > 0) {
    const { error: delError } = await supabase.from('product_specifications').delete().in('id', toDelete)
    if (delError) return { success: false, error: { message: delError.message } }
  }

  await revalidateProductPaths(productId)
  return { success: true }
}

export async function getProductFeatures(productId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_features')
    .select('id, feature_text, sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  if (error) return { success: false, data: [] }
  return { success: true, data: data ?? [] }
}

export async function upsertFeatures(productId: string, features: { id?: string; feature_text: string }[]) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase.from('product_features').select('id').eq('product_id', productId)
  if (fetchError) return { success: false, error: { message: fetchError.message } }

  const incomingIds = features.map(f => f.id).filter(Boolean) as string[]
  const toDelete = existing.map(e => e.id).filter(id => !incomingIds.includes(id))

  if (features.length > 0) {
    const rows = features.map((f, i) => ({ 
      ...(f.id ? { id: f.id } : {}), 
      product_id: productId, 
      feature_text: f.feature_text, 
      sort_order: i 
    }))
    const { error: upsertError } = await supabase.from('product_features').upsert(rows)
    if (upsertError) return { success: false, error: { message: upsertError.message } }
  }

  if (toDelete.length > 0) {
    const { error: delError } = await supabase.from('product_features').delete().in('id', toDelete)
    if (delError) return { success: false, error: { message: delError.message } }
  }

  await revalidateProductPaths(productId)
  return { success: true }
}

// --- SEO ---
export async function updateProductSeo(
  productId: string,
  seoData: { seo_title?: string; meta_description?: string; canonical_url?: string; og_image_id?: string | null; robots?: string; keywords?: string }
) {
  await requireAdmin()
  const parsed = productSeoSchema.safeParse(seoData)
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid SEO data', fieldErrors: parsed.error.flatten().fieldErrors } }
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', productId)
  if (error) return { success: false, error: { message: error.message } }
  await revalidateProductPaths(productId)
  return { success: true }
}
