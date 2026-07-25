# 07 — Frontend Architecture

## 1. App Router Structure

The app uses two top-level route groups:

- `app/(public)/...` — the marketing site, wrapped in a public layout (Navbar/Footer), fully SSR'd for SEO.
- `app/admin/...` — the admin panel, wrapped in an authenticated layout with a sidebar, excluded from indexing (`robots: noindex` at the layout level, and disallowed in `robots.ts`).

Both share the same Next.js project and deployment, but are logically and visually separate applications sharing only `lib/`, `types/`, `utils/`, and `components/ui/`.

Dynamic segments (`[slug]`, `[id]`) use `generateStaticParams()` where feasible (products, collections, blog posts) so published content is statically generated at build time and incrementally revalidated afterward (ISR), while draft/admin views are always dynamic (`force-dynamic`).

## 2. Layout System

```
app/layout.tsx                 → <html>, fonts, theme, root providers (Toast, etc.)
app/(public)/layout.tsx        → Navbar, Footer, global metadata defaults via generateMetadata()
app/admin/layout.tsx           → requireAdmin() guard, AdminSidebar, breadcrumb context
```

Each route segment's `layout.tsx` is responsible only for structural chrome; page-level content and data fetching live in `page.tsx`. Nested layouts are used sparingly — only where genuinely shared UI exists (e.g. all `/admin/products/*` routes share a products sub-nav).

## 3. Component Architecture

Three-tier component model:

1. **`components/ui/`** — dumb, fully reusable primitives (Button, Input, Modal, Table, Pagination, Badge). No data-fetching, no domain knowledge. Styled via Tailwind + `class-variance-authority`-style variant props.
2. **`components/layout/` & `components/marketing/`** — composed, still mostly presentational, but aware of site-level concepts (Navbar knows the nav structure; ProductCard knows the `Product` type shape). Receive data via props — never fetch themselves.
3. **`features/<domain>/components/`** — composite, domain-specific components that may be Server Components performing their own data fetch (e.g. a `RelatedProducts` block on the product detail page) or Client Components handling form state (e.g. the product edit form's specification editor).

## 4. Server Components vs. Client Components

**Default: Server Components.** Every page and most components are Server Components unless they need interactivity.

**Promoted to Client Components (`'use client'`) only when they need:**
- Local state / interactivity (forms, modals, drag-to-reorder, rich text editor, media picker)
- Browser-only APIs
- Event handlers

Concretely: all public marketing pages (`Home`, `About`, `Products`, `Product Details`, `Collections`, `Collection Details`, `Blog`, `Blog Details`) are Server Components that fetch directly from Supabase via `services/`. Admin **list/table views** are Server Components; admin **create/edit forms** are Client Components that call Server Actions on submit, with the surrounding page (data loading for "edit" — fetching the existing record) remaining a Server Component that passes initial data down as props.

## 5. Data Fetching

- Public pages fetch via `services/*Service.ts`, which wrap the Supabase server client (`lib/supabase/server.ts`) and are called directly inside `page.tsx`/`layout.tsx` (`async function Page()`), never through an internal API round-trip.
- Admin pages fetch the same way for reads; writes go through Server Actions in `features/<domain>/actions.ts`.
- `generateMetadata()` on every dynamic page calls `features/seo/buildMetadata.ts`, which fetches the entity plus `site_settings`, merges overrides over defaults, and returns the Next.js `Metadata` object (including OG/Twitter fields).
- JSON-LD is injected via a small `<JsonLd data={...} />` Server Component that renders a `<script type="application/ld+json">` tag, fed by `features/seo/jsonld.ts` builder functions (`buildOrganizationSchema`, `buildProductSchema`, `buildCollectionSchema`, `buildArticleSchema`, `buildBreadcrumbSchema`).

## 6. Caching

- **Published catalog/blog pages:** statically generated at build (`generateStaticParams`) and revalidated via `revalidatePath()` calls inside the relevant Server Actions (`updateProduct`, `publishBlogPost`, etc.) — so publishing/editing content invalidates the exact cached page immediately rather than waiting on a time-based revalidation window.
- **Listing pages** (`/products`, `/collections`, `/blog`) use a short time-based `revalidate` (e.g. 60s) as a safety net in addition to action-triggered `revalidatePath()`.
- **Admin pages:** `export const dynamic = 'force-dynamic'` — always fresh, never cached, since admins must see the latest state including their own drafts.
- **`sitemap.xml` / `robots.txt`:** time-based revalidation (e.g. hourly) is sufficient; these don't need instant invalidation.

## 7. Image Optimization

- All images are served through `next/image`, configured with Supabase Storage's public bucket domain in `next.config.mjs` `images.remotePatterns`.
- `utils/buildImageUrl.ts` centralizes Supabase Storage public URL construction (and can be swapped to signed URLs later without touching call sites).
- Card/thumbnail contexts use fixed `sizes` + `fill` with object-cover; detail-page hero images use responsive `sizes` matching the layout breakpoints.
- `alt_text` is required at the `media` row level and is always passed through — never a hardcoded/empty `alt`.
- The single `og-default.jpg` in `public/` is the last-resort fallback when neither a page-specific `og_image_id` nor `site_settings.default_og_image_id` is set.

## 8. Reusable UI Inventory

See `09_component_inventory.md` for the full list of shared components (Buttons, Cards, Hero, Navbar, Footer, Inputs, Badges, Breadcrumb, Pagination, Tables, Modals, Forms).
