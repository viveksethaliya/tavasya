import { z } from "zod"

export const collectionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(100),
  slug: z.string().max(100).optional(),
  description: z.string().optional().nullable(),
  image_id: z.union([z.string().uuid(), z.literal("")]).transform(v => v === "" ? null : v).optional().nullable(),
  status: z.enum(["draft", "published"]),
  sort_order: z.number().int(),
  products: z.array(z.string().uuid()),
  seo_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  canonical_url: z.union([z.string().url("Must be a valid URL"), z.literal("")]).transform(v => v === "" ? null : v).optional().nullable(),
  og_image_id: z.union([z.string().uuid(), z.literal("")]).transform(v => v === "" ? null : v).optional().nullable(),
  robots: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
})

export type CollectionFormValues = z.infer<typeof collectionSchema>

export const collectionSeoSchema = z.object({
  seo_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  canonical_url: z.union([z.string().url("Must be a valid URL"), z.literal("")]).transform(v => v === "" ? null : v).optional().nullable(),
  og_image_id: z.union([z.string().uuid(), z.literal("")]).transform(v => v === "" ? null : v).optional().nullable(),
  robots: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
})

export type CollectionSeoValues = z.infer<typeof collectionSeoSchema>
