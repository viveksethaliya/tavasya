'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/server/auth/requireAdmin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const generalSettingsSchema = z.object({
  site_name: z.string().min(1).max(120),
  company_legal_name: z.string().max(200).optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().max(30).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  social_links: z.record(z.string(), z.string()).optional().nullable(),
})

const seoSettingsSchema = z.object({
  default_seo_title: z.string().max(120).optional().nullable(),
  default_meta_description: z.string().max(320).optional().nullable(),
  default_robots: z.string().max(50).optional().nullable(),
  twitter_handle: z.string().max(50).optional().nullable(),
  organization_schema_json: z.string().optional().nullable(),
  default_og_image_id: z.string().optional().nullable(),
  favicon_id: z.string().optional().nullable(),
})

const pageSeoSchema = z.object({
  seo_title: z.string().max(120).optional().nullable(),
  meta_description: z.string().max(320).optional().nullable(),
  canonical_url: z.string().max(500).optional().nullable(),
  robots: z.string().max(50).optional().nullable(),
  keywords: z.string().max(500).optional().nullable(),
})

const ALLOWED_ROUTE_KEYS = ['home', 'about', 'contact', 'privacy-policy', 'terms-and-conditions']

export async function updateGeneralSettings(formData: FormData) {
  await requireAdmin()
  const raw = {
    site_name: formData.get('site_name') as string,
    company_legal_name: formData.get('company_legal_name') as string || null,
    contact_email: formData.get('contact_email') as string || null,
    contact_phone: formData.get('contact_phone') as string || null,
    address: formData.get('address') as string || null,
    social_links: {
      linkedin: formData.get('social_linkedin') as string || '',
      youtube: formData.get('social_youtube') as string || '',
      twitter: formData.get('social_twitter') as string || '',
    },
  }
  const parsed = generalSettingsSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid data', fieldErrors: parsed.error.flatten().fieldErrors } }
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, ...parsed.data, updated_at: new Date().toISOString() })
  if (error) return { success: false, error: { message: error.message } }
  revalidatePath('/admin/settings/general')
  return { success: true }
}

export async function updateSeoSettings(formData: FormData) {
  await requireAdmin()
  const raw = {
    default_seo_title: formData.get('default_seo_title') as string || null,
    default_meta_description: formData.get('default_meta_description') as string || null,
    default_robots: formData.get('default_robots') as string || null,
    twitter_handle: formData.get('twitter_handle') as string || null,
    organization_schema_json: formData.get('organization_schema_json') as string || null,
    default_og_image_id: formData.get('default_og_image_id') as string || null,
    favicon_id: formData.get('favicon_id') as string || null,
  }
  // Validate org schema JSON if provided
  if (raw.organization_schema_json) {
    try { JSON.parse(raw.organization_schema_json) }
    catch { return { success: false, error: { message: 'Organization Schema must be valid JSON' } } }
  }
  const parsed = seoSettingsSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid data', fieldErrors: parsed.error.flatten().fieldErrors } }
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, ...parsed.data, updated_at: new Date().toISOString() })
  if (error) return { success: false, error: { message: error.message } }
  revalidatePath('/admin/settings/seo')
  return { success: true }
}

export async function updatePageSeo(
  routeKey: string,
  data: { seo_title?: string; meta_description?: string; canonical_url?: string; robots?: string; keywords?: string }
) {
  await requireAdmin()
  if (!ALLOWED_ROUTE_KEYS.includes(routeKey)) {
    return { success: false, error: { message: `Invalid route key: ${routeKey}` } }
  }
  const parsed = pageSeoSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid data' } }
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from('pages')
    .upsert({ route_key: routeKey, ...parsed.data, updated_at: new Date().toISOString() })
  if (error) return { success: false, error: { message: error.message } }
  revalidatePath('/admin/settings/seo')
  return { success: true }
}
