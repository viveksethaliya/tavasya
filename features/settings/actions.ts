'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/server/auth/requireAdmin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const generalSettingsSchema = z.object({
  site_name: z.string().min(1).max(120),
  company_legal_name: z.string().max(200).optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().max(30).regex(/^\+?[0-9\s\-()]+$/, 'Invalid phone format').optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  social_links: z.record(z.string(), z.string()).optional().nullable(),
})

const organizationSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('Organization'),
  name: z.string().min(1),
  url: z.string().url().optional(),
  logo: z.string().url().optional(),
}).passthrough()

const seoSettingsSchema = z.object({
  default_seo_title: z.string().max(120).optional().nullable(),
  default_meta_description: z.string().max(320).optional().nullable(),
  default_robots: z.string().max(50).optional().nullable(),
  twitter_handle: z.string().max(50).optional().nullable(),
  organization_schema_json: organizationSchema.optional().nullable(),
  default_og_image_id: z.string().uuid().optional().nullable(),
  favicon_id: z.string().uuid().optional().nullable(),
})

const pageSeoSchema = z.object({
  seo_title: z.string().max(120).optional().nullable(),
  meta_description: z.string().max(320).optional().nullable(),
  canonical_url: z.string().max(500).optional().nullable(),
  robots: z.string().max(50).optional().nullable(),
  keywords: z.string().max(500).optional().nullable(),
  og_image_id: z.string().uuid().optional().nullable(),
})

const ALLOWED_ROUTE_KEYS = ['home', 'about', 'contact', 'privacy-policy', 'terms-and-conditions']

export async function updateGeneralSettings(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  
  // Fetch existing settings to preserve any unrelated social_links
  const { data: existingSettings } = await supabase
    .from('site_settings')
    .select('social_links')
    .eq('id', 1)
    .single()
    
  const existingSocials = (existingSettings?.social_links as Record<string, string>) || {}

  const raw = {
    site_name: formData.get('site_name') as string,
    company_legal_name: formData.get('company_legal_name') as string || null,
    contact_email: formData.get('contact_email') as string || null,
    contact_phone: formData.get('contact_phone') as string || null,
    address: formData.get('address') as string || null,
    social_links: {
      ...existingSocials,
      linkedin: formData.get('social_linkedin') as string || '',
      youtube: formData.get('social_youtube') as string || '',
      twitter: formData.get('social_twitter') as string || '',
      instagram: formData.get('social_instagram') as string || '',
      facebook: formData.get('social_facebook') as string || '',
    },
  }
  const parsed = generalSettingsSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid data', fieldErrors: parsed.error.flatten().fieldErrors } }
  }
  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, ...parsed.data, updated_at: new Date().toISOString() })
  if (error) return { success: false, error: { message: error.message } }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateSeoSettings(formData: FormData) {
  await requireAdmin()
  let orgSchemaObj = null
  const orgSchemaStr = formData.get('organization_schema_json') as string
  if (orgSchemaStr) {
    try {
      orgSchemaObj = JSON.parse(orgSchemaStr)
    } catch {
      return { success: false, error: { message: 'Organization Schema must be valid JSON' } }
    }
  }

  const raw = {
    default_seo_title: formData.get('default_seo_title') as string || null,
    default_meta_description: formData.get('default_meta_description') as string || null,
    default_robots: formData.get('default_robots') as string || null,
    twitter_handle: formData.get('twitter_handle') as string || null,
    organization_schema_json: orgSchemaObj,
    default_og_image_id: formData.get('default_og_image_id') as string || null,
    favicon_id: formData.get('favicon_id') as string || null,
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
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updatePageSeo(
  routeKey: string,
  data: { seo_title?: string; meta_description?: string; canonical_url?: string; robots?: string; keywords?: string; og_image_id?: string | null }
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
  revalidatePath('/', 'layout')
  return { success: true }
}
