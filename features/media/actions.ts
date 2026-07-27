'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/server/auth/requireAdmin'
import { revalidatePath } from 'next/cache'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const BUCKET = 'media'

export async function getMediaList(query?: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    let qb = supabase.from('media').select('*')
    if (query && query.trim()) {
      qb = qb.or(`file_name.ilike.%${query.trim()}%,alt_text.ilike.%${query.trim()}%`)
    }
    const { data, error } = await qb.order('created_at', { ascending: false }).limit(50)
    if (error) throw error
    return { success: true, data: data ?? [] }
  } catch (error: unknown) {
    console.error('Failed to fetch media:', error)
    return { success: false, data: [] }
  }
}

export async function uploadMedia(formData: FormData) {
  try {
    const user = await requireAdmin()
    const file = formData.get('file') as File | null
    if (!file) return { success: false, error: { message: 'No file provided' } }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: { message: `File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}` } }
    }
    if (file.size > MAX_SIZE_BYTES) {
      return { success: false, error: { message: 'File exceeds maximum size of 10MB' } }
    }

    const supabase = await createAdminClient()
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const publicUrl = urlData.publicUrl

    const widthStr = formData.get('width') as string | null
    const heightStr = formData.get('height') as string | null
    const width = widthStr ? parseInt(widthStr, 10) : null
    const height = heightStr ? parseInt(heightStr, 10) : null

    // Use admin client for DB insert to bypass RLS issues
    const { data: mediaRow, error: dbError } = await supabase
      .from('media')
      .insert({
        file_path: path,
        file_url: publicUrl,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        alt_text: '',
        uploaded_by: user.id,
        width,
        height,
      })
      .select('id, file_url, file_name, alt_text, file_path')
      .single()

    if (dbError) {
      // Rollback storage upload
      await supabase.storage.from(BUCKET).remove([path])
      throw dbError
    }

    revalidatePath('/admin/media')
    return { success: true, data: mediaRow }
  } catch (error: unknown) {
    console.error('Failed to upload media:', error)
    const err = error as { message?: string }
    return { success: false, error: { message: err?.message ?? 'Upload failed' } }
  }
}

export async function updateMediaMeta(id: string, altText: string) {
  try {
    await requireAdmin()
    if (altText.length > 250) {
      return { success: false, error: { message: 'Alt text must be 250 characters or less' } }
    }
    const supabase = await createClient()
    const { error } = await supabase.from('media').update({ alt_text: altText }).eq('id', id).select('id').single()
    if (error) {
      return { success: false, error: { message: 'Media not found or could not be updated' } }
    }
    revalidatePath('/admin/media')
    return { success: true }
  } catch (error: unknown) {
    console.error('Failed to update media meta:', error)
    const err = error as { message?: string }
    return { success: false, error: { message: err?.message ?? 'Update failed' } }
  }
}

export async function deleteMedia(id: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Check references
    const [
      { data: productsRef },
      { data: primaryRef },
      { data: productsOgRef },
      { data: collectionsRef },
      { data: collectionsOgRef },
      { data: blogsRef },
      { data: blogsOgRef },
      { data: pagesOgRef },
      { data: settingsRef },
      { data: settingsFaviconRef },
    ] = await Promise.all([
      supabase.from('product_images').select('product_id').eq('media_id', id).limit(5),
      supabase.from('products').select('id, name').eq('primary_image_id', id).limit(5),
      supabase.from('products').select('id, name').eq('og_image_id', id).limit(5),
      supabase.from('collections').select('id, name').eq('image_id', id).limit(5),
      supabase.from('collections').select('id, name').eq('og_image_id', id).limit(5),
      supabase.from('blogs').select('id, title').eq('cover_image_id', id).limit(5),
      supabase.from('blogs').select('id, title').eq('og_image_id', id).limit(5),
      supabase.from('pages').select('id, title').eq('og_image_id', id).limit(5),
      supabase.from('site_settings').select('id').eq('default_og_image_id', id).limit(1),
      supabase.from('site_settings').select('id').eq('favicon_id', id).limit(1),
    ])

    const references: string[] = []
    if (productsRef && productsRef.length > 0) references.push(`${productsRef.length} product image gallery entries`)
    if (primaryRef && primaryRef.length > 0) references.push(`${primaryRef.length} product primary images`)
    if (productsOgRef && productsOgRef.length > 0) references.push(`${productsOgRef.length} product OG images`)
    if (collectionsRef && collectionsRef.length > 0) references.push(`${collectionsRef.length} collection images`)
    if (collectionsOgRef && collectionsOgRef.length > 0) references.push(`${collectionsOgRef.length} collection OG images`)
    if (blogsRef && blogsRef.length > 0) references.push(`${blogsRef.length} blog cover images`)
    if (blogsOgRef && blogsOgRef.length > 0) references.push(`${blogsOgRef.length} blog OG images`)
    if (pagesOgRef && pagesOgRef.length > 0) references.push(`${pagesOgRef.length} static page OG images`)
    if (settingsRef && settingsRef.length > 0) references.push('site settings default OG image')
    if (settingsFaviconRef && settingsFaviconRef.length > 0) references.push('site settings favicon')

    if (references.length > 0) {
      return {
        success: false,
        error: { message: `Cannot delete: this image is used by ${references.join(', ')}. Remove it from those entities first.` },
      }
    }

    // Fetch file path
    const { data: media } = await supabase.from('media').select('file_path').eq('id', id).single()
    if (!media) return { success: false, error: { message: 'Media not found' } }

    // Delete from storage
    const adminClient = createAdminClient()
    const { error: storageError } = await adminClient.storage.from(BUCKET).remove([media.file_path])
    if (storageError) throw storageError

    // Delete from DB
    const { error: dbError } = await supabase.from('media').delete().eq('id', id)
    if (dbError) throw dbError

    revalidatePath('/admin/media')
    return { success: true }
  } catch (error: unknown) {
    console.error('Failed to delete media:', error)
    const err = error as { message?: string }
    return { success: false, error: { message: err?.message ?? 'Delete failed' } }
  }
}
