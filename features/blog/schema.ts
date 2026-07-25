import { z } from "zod"

export const blogSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }).max(150),
  slug: z.string().max(150).optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  cover_image_id: z.string().uuid().optional().nullable(),
  author_name: z.string().max(100).optional().nullable(),
  status: z.enum(["draft", "published"]),
  published_at: z.string().optional().nullable(),
  seo_title: z.string().max(100).optional().nullable(),
  meta_description: z.string().max(255).optional().nullable(),
  canonical_url: z.string().url().optional().nullable().or(z.literal("")),
  og_image_id: z.string().uuid().optional().nullable(),
  robots: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
})

export type BlogFormValues = z.infer<typeof blogSchema>
