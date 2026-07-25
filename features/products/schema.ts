import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(100),
  slug: z.string().max(100).optional(),
  sku: z.string().max(50).optional().nullable(),
  short_description: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  status: z.enum(["draft", "published"]),
  is_featured: z.boolean(),
  sort_order: z.number().int(),
  // SEO fields
  seo_title: z.string().max(120).optional().nullable(),
  meta_description: z.string().max(320).optional().nullable(),
  canonical_url: z.string().max(500).optional().nullable(),
  og_image_id: z.string().optional().nullable(),
  robots: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
})

export type ProductFormValues = z.infer<typeof productSchema>
