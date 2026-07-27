import { z } from "zod"

export const blogSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }).max(150),
  slug: z.string().max(150).optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  cover_image_id: z.string().uuid().optional().nullable().or(z.literal("")),
  author_name: z.string().max(100).optional().nullable(),
  status: z.enum(["draft", "published"]),
  published_at: z.string().datetime({ message: "Invalid date-time format" }).optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
  seo_title: z.string().max(100).optional().nullable(),
  meta_description: z.string().max(255).optional().nullable(),
  canonical_url: z.string().url().optional().nullable().or(z.literal("")),
  og_image_id: z.string().uuid().optional().nullable().or(z.literal("")),
  robots: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.status === "published") {
    const raw = data.content || ""
    const stripped = raw.replace(/<[^>]*>/g, "").trim()
    const hasMedia = raw.includes("<img") || raw.includes("<iframe") || raw.includes("<video")
    
    if (stripped.length === 0 && !hasMedia) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Content is required to publish a post",
        path: ["content"],
      })
    }
  }
})

export type BlogFormValues = z.infer<typeof blogSchema>
