# 02 — Project Structure

Complete folder tree for the Meridian Machine Works website and admin panel, with a short explanation of every important file/directory.

```
meridian-machine-works/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx                     # Public site layout: navbar, footer, global SEO defaults
│   │   ├── page.tsx                        # Home page
│   │   ├── about/
│   │   │   └── page.tsx                    # About page
│   │   ├── products/
│   │   │   ├── page.tsx                    # Products listing (filter/sort)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx                # Product details (dynamic metadata + JSON-LD)
│   │   │       └── opengraph-image.tsx     # Dynamic OG image per product (optional)
│   │   ├── collections/
│   │   │   ├── page.tsx                    # Collections listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx                # Collection details (lists assigned products)
│   │   ├── blog/
│   │   │   ├── page.tsx                    # Blog listing (paginated)
│   │   │   └── [slug]/
│   │   │       └── page.tsx                # Blog post details (Article schema)
│   │   ├── contact/
│   │   │   └── page.tsx                    # Contact page + quote request form
│   │   ├── privacy-policy/
│   │   │   └── page.tsx                    # Static legal content, admin-editable via Settings
│   │   ├── terms-and-conditions/
│   │   │   └── page.tsx                    # Static legal content
│   │   └── not-found.tsx                   # Custom 404 page
│   │
│   ├── admin/
│   │   ├── layout.tsx                      # Admin shell: sidebar, auth guard, session check
│   │   ├── login/
│   │   │   └── page.tsx                    # Supabase Auth sign-in form
│   │   ├── page.tsx                         # Admin dashboard (counts, recent activity)
│   │   ├── products/
│   │   │   ├── page.tsx                    # Product list/table
│   │   │   ├── new/page.tsx                # Create product form
│   │   │   └── [id]/edit/page.tsx          # Edit product (images, specs, features, SEO tabs)
│   │   ├── collections/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── media/
│   │   │   └── page.tsx                    # Media library grid, upload, delete
│   │   ├── settings/
│   │   │   ├── general/page.tsx            # Company info, contact, socials
│   │   │   └── seo/page.tsx                # Global SEO defaults, Organization schema
│   │   └── unauthorized/page.tsx           # Shown when a non-admin session hits /admin
│   │
│   ├── api/
│   │   └── contact/
│   │       └── route.ts                    # POST handler for contact/quote form submissions
│   │
│   ├── sitemap.ts                          # Dynamic sitemap.xml generator (Next.js Metadata Route)
│   ├── robots.ts                           # Dynamic robots.txt generator
│   ├── layout.tsx                          # Root layout: html/body, fonts, providers
│   └── globals.css                         # Tailwind entry + global CSS variables
│
├── components/
│   ├── ui/                                 # Generic, unstyled-opinion primitives
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Pagination.tsx
│   │   └── Skeleton.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── Breadcrumb.tsx
│   └── marketing/
│       ├── Hero.tsx
│       ├── ProductCard.tsx
│       ├── CollectionCard.tsx
│       ├── BlogCard.tsx
│       ├── SpecTable.tsx
│       ├── FeatureList.tsx
│       └── QuoteRequestForm.tsx
│
├── features/
│   ├── products/
│   │   ├── components/                     # Product-specific composite components
│   │   ├── actions.ts                       # Server actions: create/update/delete/reorder
│   │   ├── queries.ts                        # Read queries used by pages
│   │   └── schema.ts                         # Zod validation schema for product forms
│   ├── collections/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── schema.ts
│   ├── blog/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── schema.ts
│   ├── media/
│   │   ├── actions.ts                        # Upload/delete against Supabase Storage
│   │   └── queries.ts
│   ├── settings/
│   │   ├── actions.ts
│   │   └── queries.ts
│   └── seo/
│       ├── buildMetadata.ts                  # Shared function: merges global + page SEO overrides
│       ├── jsonld.ts                          # Builds Organization/Product/Article/Collection/Breadcrumb schema
│       └── types.ts
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useToast.ts
│   ├── usePagination.ts
│   └── useMediaLibrary.ts                   # Client hook for the media picker modal
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                         # Browser Supabase client
│   │   ├── server.ts                         # Server Supabase client (cookies-based session)
│   │   └── admin.ts                          # Service-role client, server-only, for privileged ops
│   ├── constants.ts                          # Enums: product status, blog status, etc.
│   └── env.ts                                # Typed environment variable accessors
│
├── services/
│   ├── productService.ts                    # Data-access layer wrapping Supabase queries for products
│   ├── collectionService.ts
│   ├── blogService.ts
│   ├── mediaService.ts
│   └── settingsService.ts
│
├── server/
│   ├── actions/                              # Thin wrappers re-exporting feature actions for app/ imports
│   ├── auth/
│   │   └── requireAdmin.ts                   # Server-side guard used in admin layouts/actions
│   └── validation/
│       └── formErrors.ts                     # Shared server-side validation error formatting
│
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql                     # Mirrors 04_sql_schema.sql
│   ├── seed/
│   │   └── seed.sql                          # Sample Meridian product/collection/blog data
│   ├── storage-policies.sql                  # Bucket RLS policies for `media` bucket
│   └── config.toml                           # Local Supabase CLI config
│
├── types/
│   ├── product.ts
│   ├── collection.ts
│   ├── blog.ts
│   ├── media.ts
│   ├── settings.ts
│   └── seo.ts
│
├── styles/
│   └── tailwind.css                          # Tailwind base/components/utilities + design tokens
│
├── utils/
│   ├── slugify.ts
│   ├── formatDate.ts
│   ├── truncate.ts
│   └── buildImageUrl.ts                       # Resolves Supabase Storage public URLs
│
├── middleware.ts                              # Route matcher: protects /admin/*, redirects unauthenticated
│
├── public/
│   ├── favicon.ico
│   ├── og-default.jpg                         # Fallback OpenGraph image
│   └── robots-static-fallback.txt             # Reference only; robots.ts is the live source
│
├── documents/                                  # This documentation set (01–10 + SQL)
│
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local.example
```

## Notes on Key Files

- **`app/sitemap.ts` / `app/robots.ts`** — Next.js Metadata Route conventions; both query the database live (products, collections, blog posts, static pages) so new content is automatically included with no redeploy.
- **`features/seo/buildMetadata.ts`** — single source of truth for merging `site_settings` (global defaults) with per-entity SEO overrides; every page's `generateMetadata()` calls into this.
- **`lib/supabase/admin.ts`** — the only place the Supabase service-role key is used; strictly server-only, never imported into client components.
- **`middleware.ts`** — matches `/admin/:path*` (excluding `/admin/login`) and redirects unauthenticated requests to the login page.
