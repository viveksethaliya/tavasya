import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(100),
  slug: z.string().max(100).optional(),
  sku: z.string().max(50).optional().nullable(),
  short_description: z.string().max(250).optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  status: z.enum(["draft", "published"]),
  is_featured: z.boolean(),
  sort_order: z.number().int(),
})

export type ProductFormValues = z.infer<typeof productSchema>
