import { z } from "zod"

export const collectionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(100),
  slug: z.string().max(100).optional(),
  description: z.string().optional().nullable(),
  image_id: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "published"]),
  sort_order: z.number().int(),
  products: z.array(z.string().uuid()),
})

export type CollectionFormValues = z.infer<typeof collectionSchema>
