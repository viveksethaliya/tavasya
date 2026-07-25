"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/server/auth/requireAdmin"
import { blogSchema, BlogFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { slugify } from "@/utils/slugify"

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

    // Clean up empty string canonical url since the schema allows it but DB might not like it
    const canonical_url = parsed.canonical_url === "" ? null : parsed.canonical_url

    const { data: blog, error } = await supabase
      .from("blogs")
      .insert({
        ...parsed,
        slug,
        published_at,
        canonical_url,
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

    // Fetch existing blog to check old status
    const { data: oldBlog } = await supabase
      .from("blogs")
      .select("status, published_at")
      .eq("id", id)
      .single()

    // Handle publishing logic
    let published_at = parsed.published_at || (oldBlog?.published_at)
    if (parsed.status === "published" && !published_at) {
      published_at = new Date().toISOString()
    } else if (parsed.status === "draft") {
      published_at = null
    }

    const canonical_url = parsed.canonical_url === "" ? null : parsed.canonical_url

    const { error } = await supabase
      .from("blogs")
      .update({
        ...parsed,
        slug,
        published_at,
        canonical_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/admin/blog")
    revalidatePath("/blog")
    revalidatePath(`/blog/${slug}`)
    
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

    const { error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", id)

    if (error) throw error

    revalidatePath("/admin/blog")
    revalidatePath("/blog")

    return { success: true }
  } catch (error: unknown) {
    console.error("Failed to delete blog:", error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any
    return { success: false, error: { message: err?.message || "Failed to delete blog" } }
  }
}
