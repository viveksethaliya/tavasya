"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/server/auth/requireAdmin"
import { blogSchema, BlogFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { slugify } from "@/utils/slugify"
import sanitizeHtml from "sanitize-html"

export async function createBlog(data: BlogFormValues) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const parsed = blogSchema.parse(data)
    
    let slug = parsed.slug
    if (!slug) {
      slug = slugify(parsed.title)
    }

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from("blogs")
      .select("id")
      .eq("slug", slug)
      .single()

    if (existing) {
      return { success: false, error: { message: "A blog post with this slug already exists. Please choose another." } }
    }

    // Handle publishing logic
    let published_at = parsed.published_at
    if (parsed.status === "published" && !published_at) {
      published_at = new Date().toISOString()
    } else if (parsed.status === "draft") {
      published_at = null
    }

    const canonical_url = parsed.canonical_url === "" ? null : parsed.canonical_url
    const cover_image_id = parsed.cover_image_id === "" ? null : parsed.cover_image_id
    const og_image_id = parsed.og_image_id === "" ? null : parsed.og_image_id
    const content = parsed.content ? sanitizeHtml(parsed.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['class', 'style'],
        'img': ['src', 'alt', 'title', 'width', 'height']
      }
    }) : parsed.content

    const { data: blog, error } = await supabase
      .from("blogs")
      .insert({
        ...parsed,
        content,
        slug,
        published_at,
        canonical_url,
        cover_image_id,
        og_image_id,
      })
      .select("id")
      .single()

    if (error) throw error

    revalidatePath("/admin/blog")
    revalidatePath("/blog")
    
    return { success: true, data: blog }
  } catch (error: unknown) {
    console.error("Failed to create blog:", error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any
    if (err?.name === 'ZodError') {
      return { success: false, error: { fieldErrors: err.flatten().fieldErrors } }
    }
    return { success: false, error: { message: err?.message || "Failed to create blog" } }
  }
}

export async function updateBlog(id: string, data: BlogFormValues) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const parsed = blogSchema.parse(data)
    
    let slug = parsed.slug
    if (!slug) {
      slug = slugify(parsed.title)
    }

    const { data: existing } = await supabase
      .from("blogs")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .single()

    if (existing) {
      return { success: false, error: { message: "A blog post with this slug already exists. Please choose another." } }
    }

    // Fetch existing blog to check old status and slug
    const { data: oldBlog, error: fetchError } = await supabase
      .from("blogs")
      .select("status, published_at, slug")
      .eq("id", id)
      .single()

    if (fetchError || !oldBlog) {
      return { success: false, error: { message: "Blog post not found." } }
    }

    // Handle publishing logic
    let published_at = parsed.published_at || (oldBlog?.published_at)
    if (parsed.status === "published" && !published_at) {
      published_at = new Date().toISOString()
    } else if (parsed.status === "draft") {
      published_at = null
    }

    const canonical_url = parsed.canonical_url === "" ? null : parsed.canonical_url
    const cover_image_id = parsed.cover_image_id === "" ? null : parsed.cover_image_id
    const og_image_id = parsed.og_image_id === "" ? null : parsed.og_image_id
    const content = parsed.content ? sanitizeHtml(parsed.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['class', 'style'],
        'img': ['src', 'alt', 'title', 'width', 'height']
      }
    }) : parsed.content

    const { error } = await supabase
      .from("blogs")
      .update({
        ...parsed,
        content,
        slug,
        published_at,
        canonical_url,
        cover_image_id,
        og_image_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/admin/blog")
    revalidatePath("/blog")
    revalidatePath(`/blog/${slug}`)
    if (oldBlog.slug && oldBlog.slug !== slug) {
      revalidatePath(`/blog/${oldBlog.slug}`)
    }
    
    return { success: true }
  } catch (error: unknown) {
    console.error("Failed to update blog:", error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any
    if (err?.name === 'ZodError') {
      return { success: false, error: { fieldErrors: err.flatten().fieldErrors } }
    }
    return { success: false, error: { message: err?.message || "Failed to update blog" } }
  }
}

export async function deleteBlog(id: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: deletedBlog, error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", id)
      .select("id, slug")
      .single()

    if (error) {
      return { success: false, error: { message: "Blog post not found or could not be deleted." } }
    }

    revalidatePath("/admin/blog")
    revalidatePath("/blog")
    if (deletedBlog?.slug) {
      revalidatePath(`/blog/${deletedBlog.slug}`)
    }

    return { success: true }
  } catch (error: unknown) {
    console.error("Failed to delete blog:", error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any
    return { success: false, error: { message: err?.message || "Failed to delete blog" } }
  }
}
