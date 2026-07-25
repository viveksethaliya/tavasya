# 03 — Database Design

Normalized PostgreSQL schema (Supabase) for Meridian Machine Works. 11 tables. Full DDL is in `04_sql_schema.sql`; this document explains the *design* — purpose, keys, relationships, and constraints — for each table.

---

## Entity Relationship Summary

```
admin_profiles (1) ── (1) auth.users [Supabase-managed]

media (1) ──< product_images
media (1) ──< products.primary_image_id
media (1) ──< collections.image_id
media (1) ──< blogs.cover_image_id
media (1) ──< site_settings.favicon_id / default_og_image_id

products (1) ──< product_images
products (1) ──< product_specifications
products (1) ──< product_features
products (M) ──< collection_products >── (M) collections

site_settings           → singleton, global config + global SEO
pages                   → static route SEO overrides (Home, About, Contact, Privacy, Terms)
```

---

## 1. `admin_profiles`

**Purpose:** Extends Supabase's built-in `auth.users` with app-specific admin metadata (display name, role). Keeps `auth.users` untouched, which is best practice with Supabase Auth.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | FK → `auth.users.id`, `ON DELETE CASCADE` |
| full_name | text | |
| role | text | Constrained to `'admin'` (single role for now; kept as a column so future roles don't require a migration) |
| created_at | timestamptz | |

**Why it exists:** Supabase Auth owns credentials/sessions; this table lets the app store display data without touching the protected `auth` schema.

---

## 2. `media`

**Purpose:** Central registry of every uploaded file (Supabase Storage object) so images can be reused across products, collections, blog posts, and settings without duplicate uploads.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | default `gen_random_uuid()` |
| file_path | text, NOT NULL | Path within the `media` Storage bucket |
| file_url | text, NOT NULL | Public (or signed) URL, cached at upload time |
| file_name | text, NOT NULL | Original filename |
| mime_type | text | |
| size_bytes | integer | |
| alt_text | text | Accessibility + SEO |
| width | integer | nullable, populated for images |
| height | integer | nullable |
| uploaded_by | uuid | FK → `admin_profiles.id`, `ON DELETE SET NULL` |
| created_at | timestamptz | |

**Why it exists:** Every image-bearing entity references `media.id` rather than storing raw URLs, giving a single Media Library view and preventing orphaned/duplicated files.

---

## 3. `site_settings`

**Purpose:** Singleton table (exactly one row, enforced by a check constraint on `id`) holding company info and **global SEO defaults**.

| Column | Type | Notes |
|---|---|---|
| id | smallint, PK | `CHECK (id = 1)` — enforces singleton |
| site_name | text, NOT NULL | |
| company_legal_name | text | Used in Organization schema |
| contact_email | text | |
| contact_phone | text | |
| address | text | |
| social_links | jsonb | `{ "linkedin": "...", "youtube": "..." }` |
| default_seo_title | text | |
| default_meta_description | text | |
| default_robots | text | e.g. `index,follow` |
| default_og_image_id | uuid | FK → `media.id` |
| twitter_handle | text | For Twitter Card `twitter:site` |
| favicon_id | uuid | FK → `media.id` |
| organization_schema_json | jsonb | Raw JSON-LD Organization object, editable by admin |
| updated_at | timestamptz | |

**Why it exists:** Every page's metadata and JSON-LD Organization schema fall back to these values when a page-specific override is absent. Single source of truth for brand-level SEO.

---

## 4. `pages`

**Purpose:** SEO overrides for static, code-defined routes (Home, About, Contact, Privacy Policy, Terms & Conditions) that have no other CMS record. Content for these pages is largely code-defined/sample copy; only SEO metadata is admin-editable here.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| route_key | text, UNIQUE, NOT NULL | e.g. `'home'`, `'about'`, `'contact'`, `'privacy-policy'`, `'terms-and-conditions'` |
| seo_title | text | |
| meta_description | text | |
| canonical_url | text | |
| og_image_id | uuid | FK → `media.id` |
| robots | text | |
| keywords | text | comma-separated |
| updated_at | timestamptz | |

**Why it exists:** Keeps SEO fully dynamic even for pages that aren't backed by a full content table, satisfying the "fully dynamic SEO" requirement across the *entire* site, not just catalog/blog content.

---

## 5. `products`

**Purpose:** Core catalog entity — one row per machine/product.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text, NOT NULL | |
| slug | text, UNIQUE, NOT NULL | URL segment, indexed |
| sku | text, UNIQUE | |
| short_description | text | Used on cards/listings |
| description | text | Rich text (HTML) for the detail page |
| category | text | e.g. `'CNC Machining'`, `'Hydraulic Press'` |
| status | text, NOT NULL | `'draft' | 'published'`, `CHECK` constraint |
| is_featured | boolean, default false | Highlighted on Home |
| primary_image_id | uuid | FK → `media.id`, nullable |
| sort_order | integer, default 0 | |
| seo_title | text | |
| meta_description | text | |
| canonical_url | text | |
| og_image_id | uuid | FK → `media.id` |
| robots | text | |
| keywords | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | auto-updated via trigger |

**Why it exists:** Primary sellable entity; every other product-related table hangs off this one.

---

## 6. `product_images`

**Purpose:** Ordered gallery of additional images per product (beyond `primary_image_id`).

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| product_id | uuid, NOT NULL | FK → `products.id`, `ON DELETE CASCADE` |
| media_id | uuid, NOT NULL | FK → `media.id`, `ON DELETE CASCADE` |
| sort_order | integer, default 0 | |
| created_at | timestamptz | |

**Constraint:** `UNIQUE (product_id, media_id)` — prevents attaching the same image twice.

**Why it exists:** Separates "one image" (primary, used in cards/OG) from "many images" (full gallery), which is a one-to-many relationship a single column on `products` cannot express.

---

## 7. `product_specifications`

**Purpose:** Key/value technical specs (e.g. "Spindle Speed" → "12,000 RPM"), ordered, per product.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| product_id | uuid, NOT NULL | FK → `products.id`, `ON DELETE CASCADE` |
| spec_key | text, NOT NULL | e.g. `"Max Load Capacity"` |
| spec_value | text, NOT NULL | e.g. `"25,000 kg"` |
| sort_order | integer, default 0 | |

**Why it exists:** Specs vary per product (a conveyor has "belt width", a press has "tonnage") — a flexible key/value table avoids a wide, mostly-null `products` table and lets admins add arbitrary spec rows.

---

## 8. `product_features`

**Purpose:** Simple ordered bullet-point list of feature highlights per product (distinct from technical specs — marketing-facing, not tabular data).

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| product_id | uuid, NOT NULL | FK → `products.id`, `ON DELETE CASCADE` |
| feature_text | text, NOT NULL | |
| sort_order | integer, default 0 | |

**Why it exists:** Kept separate from `product_specifications` because features render as a bullet list (marketing copy) while specs render as a data table (engineering facts) — different UI, different editing UX in the admin panel.

---

## 9. `collections`

**Purpose:** Curated groupings of products (product lines / series), e.g. "Precision Machining Series."

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text, NOT NULL | |
| slug | text, UNIQUE, NOT NULL | |
| description | text | |
| image_id | uuid | FK → `media.id` |
| status | text, NOT NULL | `'draft' | 'published'` |
| sort_order | integer, default 0 | |
| seo_title | text | |
| meta_description | text | |
| canonical_url | text | |
| og_image_id | uuid | FK → `media.id` |
| robots | text | |
| keywords | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Why it exists:** Lets marketing group products by series/use-case independent of the rigid `category` field on `products`, and gives each grouping its own landing page and SEO surface.

---

## 10. `collection_products`

**Purpose:** Many-to-many junction between `collections` and `products` (a product can belong to more than one collection; a collection holds many products).

| Column | Type | Notes |
|---|---|---|
| collection_id | uuid, NOT NULL | FK → `collections.id`, `ON DELETE CASCADE` |
| product_id | uuid, NOT NULL | FK → `products.id`, `ON DELETE CASCADE` |
| sort_order | integer, default 0 | Position within that collection |

**Constraint:** Composite PK `(collection_id, product_id)` — prevents duplicate assignment.

**Why it exists:** Classic M:N resolution table; a normalized alternative to a `collection_id` array/column on `products`, allowing per-collection product ordering.

---

## 11. `blogs`

**Purpose:** Blog posts (technical articles, industry news, product updates).

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| title | text, NOT NULL | |
| slug | text, UNIQUE, NOT NULL | |
| excerpt | text | Listing/teaser copy |
| content | text | Rich text/HTML from the editor |
| cover_image_id | uuid | FK → `media.id` |
| author_name | text | |
| status | text, NOT NULL | `'draft' | 'published'` |
| published_at | timestamptz | Set on publish; null while draft |
| seo_title | text | |
| meta_description | text | |
| canonical_url | text | |
| og_image_id | uuid | FK → `media.id` |
| robots | text | |
| keywords | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Why it exists:** Powers `/blog` and `/blog/[slug]`; `published_at` + `status` together drive both the draft/publish workflow and chronological listing/Article schema `datePublished`.

---

## Design Principles Applied

1. **Every content table owns its own SEO columns** rather than a shared polymorphic table — simpler joins, simpler admin forms, matches the requirement that SEO be editable per-entity in a straightforward tab.
2. **`media` is the single image source of truth** — no entity stores a raw file URL directly; all reference `media.id`, so deleting/replacing an image is a one-place operation.
3. **Soft categorization vs. hard grouping** — `products.category` is a simple filter tag; `collections` is a fully modeled, SEO-bearing, curated entity. They solve different problems and are intentionally not merged.
4. **UUID primary keys** throughout (except the `site_settings` singleton) for safe client-side generation and no ID-guessing in URLs.
5. **`updated_at` trigger-managed** on every mutable table (see `04_sql_schema.sql`) rather than relying on application code to set it.
