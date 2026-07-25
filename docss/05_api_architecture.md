# 05 — API Architecture

Meridian's backend logic is split between **Next.js Server Actions** (used for all admin mutations, called directly from admin forms — no manually-defined REST endpoints needed) and a small number of **Route Handlers** (used where a true HTTP endpoint is required: external form posts, and the auto-generated SEO routes).

---

## 1. Route Handlers (public HTTP endpoints)

### `GET /sitemap.xml`
| | |
|---|---|
| File | `app/sitemap.ts` (Next.js Metadata Route) |
| Method | GET |
| Purpose | Generates a complete sitemap from published products, collections, blog posts, and static pages |
| Auth | None (public) |
| Validation | N/A |
| Response | `application/xml`, array of `{ url, lastModified, changeFrequency, priority }` |
| Errors | On DB failure, falls back to a minimal sitemap containing only static routes; logs error server-side |

### `GET /robots.txt`
| | |
|---|---|
| File | `app/robots.ts` |
| Method | GET |
| Purpose | Serves crawl rules and points to `sitemap.xml`; disallows `/admin` |
| Auth | None (public) |
| Validation | N/A |
| Response | `text/plain` robots directives |
| Errors | Falls back to a static default (`Allow: /`, `Disallow: /admin`) |

### `POST /api/contact`
| | |
|---|---|
| File | `app/api/contact/route.ts` |
| Method | POST |
| Purpose | Receives the public Contact/Quote Request form submission, sends a notification email, and stores nothing sensitive beyond what's needed for follow-up (implementation may forward to email only, or persist to a lightweight `contact_submissions` table if added later) |
| Auth | None (public), protected by honeypot field + rate limiting |
| Validation | Zod schema: `name` (required, 2–120 chars), `email` (required, valid email), `company` (optional), `message` (required, 10–2000 chars) |
| Response | `200 { success: true }` |
| Errors | `400` validation errors (field-level messages), `429` rate-limited, `500` email/delivery failure |

---

## 2. Server Actions (admin mutations)

Server Actions are colocated in `features/<domain>/actions.ts` and imported directly into the admin forms that call them (`'use server'` functions, not REST routes). Documented here in REST-equivalent terms for clarity.

### Products — `features/products/actions.ts`

| Action | Equivalent | Purpose | Auth | Validation | Response | Errors |
|---|---|---|---|---|---|---|
| `createProduct` | POST | Create a new product (draft by default) | Admin session required (`requireAdmin()`) | Zod: `name`, `slug` (unique, auto-slugified), `category`, `status` enum | `{ id }` | `400` validation, `409` slug conflict, `401` unauthenticated |
| `updateProduct` | PATCH | Update product fields | Admin | Same schema, partial | `{ success: true }` | `400`, `404` not found, `401` |
| `deleteProduct` | DELETE | Delete product (cascades images/specs/features/collection links) | Admin | Confirms `id` exists | `{ success: true }` | `404`, `401` |
| `reorderProducts` | PATCH | Bulk update `sort_order` | Admin | Array of `{ id, sort_order }` | `{ success: true }` | `400`, `401` |
| `addProductImage` | POST | Attach a `media.id` to a product gallery | Admin | `product_id`, `media_id` must exist | `{ id }` | `404`, `409` duplicate, `401` |
| `removeProductImage` | DELETE | Detach an image | Admin | `id` exists | `{ success: true }` | `404`, `401` |
| `setPrimaryImage` | PATCH | Set `products.primary_image_id` | Admin | `media_id` must belong to product's gallery | `{ success: true }` | `400`, `401` |
| `upsertSpecifications` | PUT | Replace the full spec list for a product | Admin | Array of `{ spec_key, spec_value, sort_order }`, non-empty keys | `{ success: true }` | `400`, `401` |
| `upsertFeatures` | PUT | Replace the full feature list | Admin | Array of `{ feature_text, sort_order }` | `{ success: true }` | `400`, `401` |
| `updateProductSeo` | PATCH | Update SEO columns only | Admin | `seo_title` ≤ 60 chars (soft warning), `meta_description` ≤ 160 chars (soft warning) | `{ success: true }` | `400`, `401` |

### Collections — `features/collections/actions.ts`

| Action | Purpose | Auth | Validation | Response | Errors |
|---|---|---|---|---|---|
| `createCollection` | Create collection | Admin | `name`, unique `slug` | `{ id }` | `400`, `409`, `401` |
| `updateCollection` | Update fields | Admin | Partial schema | `{ success: true }` | `400`, `404`, `401` |
| `deleteCollection` | Delete (cascades `collection_products` rows only, not the products themselves) | Admin | `id` exists | `{ success: true }` | `404`, `401` |
| `setCollectionImage` | Set `image_id` | Admin | `media_id` exists | `{ success: true }` | `404`, `401` |
| `assignProducts` | Replace the set of products in a collection | Admin | Array of `product_id` (+ `sort_order`) | `{ success: true }` | `400`, `401` |
| `updateCollectionSeo` | Update SEO columns | Admin | Same limits as product SEO | `{ success: true }` | `400`, `401` |

### Blog — `features/blog/actions.ts`

| Action | Purpose | Auth | Validation | Response | Errors |
|---|---|---|---|---|---|
| `createBlogPost` | Create draft post | Admin | `title`, unique `slug`, `content` | `{ id }` | `400`, `409`, `401` |
| `updateBlogPost` | Update content/fields | Admin | Partial schema | `{ success: true }` | `400`, `404`, `401` |
| `deleteBlogPost` | Delete post | Admin | `id` exists | `{ success: true }` | `404`, `401` |
| `publishBlogPost` | Set `status = 'published'`, `published_at = now()` | Admin | `id` exists, `content` non-empty | `{ success: true }` | `400`, `404`, `401` |
| `unpublishBlogPost` | Revert to draft | Admin | `id` exists | `{ success: true }` | `404`, `401` |
| `setCoverImage` | Set `cover_image_id` | Admin | `media_id` exists | `{ success: true }` | `404`, `401` |
| `updateBlogSeo` | Update SEO columns | Admin | Same limits as above | `{ success: true }` | `400`, `401` |

### Media — `features/media/actions.ts`

| Action | Purpose | Auth | Validation | Response | Errors |
|---|---|---|---|---|---|
| `uploadMedia` | Upload file to Supabase Storage `media` bucket, insert `media` row | Admin | Max 10 MB, mime type in `image/png, image/jpeg, image/webp, image/svg+xml` | `{ id, file_url }` | `400` invalid type/size, `500` storage failure, `401` |
| `updateMediaMeta` | Update `alt_text` | Admin | `alt_text` ≤ 250 chars | `{ success: true }` | `400`, `404`, `401` |
| `deleteMedia` | Delete Storage object + row | Admin | Blocked if still referenced (returns list of referencing entities) | `{ success: true }` | `409` in use, `404`, `401` |

### Settings — `features/settings/actions.ts`

| Action | Purpose | Auth | Validation | Response | Errors |
|---|---|---|---|---|---|
| `updateGeneralSettings` | Update `site_settings` company/contact fields | Admin | Email format, phone format | `{ success: true }` | `400`, `401` |
| `updateSeoSettings` | Update global SEO defaults, Organization schema JSON, favicon | Admin | `organization_schema_json` must be valid JSON matching schema.org shape | `{ success: true }` | `400` invalid JSON, `401` |
| `updatePageSeo` | Update a single `pages` row by `route_key` | Admin | `route_key` in allowed enum | `{ success: true }` | `400`, `404`, `401` |

---

## 3. Authentication Actions — `server/auth/`

| Action | Purpose | Auth | Validation | Response | Errors |
|---|---|---|---|---|---|
| `signIn` | Supabase Auth email/password sign-in | Public (rate-limited) | Valid email + password ≥ 8 chars | Sets session cookie, `{ success: true }` | `401` invalid credentials, `429` too many attempts |
| `signOut` | Clears Supabase session | Admin | — | `{ success: true }` | — |
| `requireAdmin()` | Server-only guard used at the top of every admin action/page | — | Verifies session + `admin_profiles` row exists | Throws `Unauthorized` (caught → redirect to `/admin/login`) | `401` |

---

## 4. Cross-Cutting Conventions

- **Validation:** All input validated with Zod schemas colocated in `features/<domain>/schema.ts`; server actions never trust client-supplied data, including values that also have client-side validation.
- **Errors:** Server actions return a consistent shape: `{ success: false, error: { code, message, fieldErrors? } }` on failure, `{ success: true, data? }` on success — never throw raw exceptions to the client.
- **Auth:** Every mutation (create/update/delete/publish) calls `requireAdmin()` first; public read paths use the anon Supabase client constrained by RLS policies (see `04_sql_schema.sql`).
- **Slugs:** Generated server-side via `utils/slugify.ts` from the `name`/`title` field on create, editable afterward with uniqueness re-validated on save.
