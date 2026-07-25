# 08 — Development Steps

Development is broken into 10 sequential phases. Each phase lists its deliverables and a completion checklist. Phases are designed to be shippable/demoable incrementally — by the end of Phase 6 the public catalog is fully functional even before Blog/SEO polish lands.

---

## Phase 1 — Project Setup

- Initialize Next.js (App Router) + TypeScript project
- Configure Tailwind CSS + design tokens
- Set up ESLint/Prettier, strict `tsconfig.json`
- Create Supabase project (or separate dev/prod projects)
- Wire up `.env.local` and `lib/env.ts`
- Establish `lib/supabase/client.ts`, `server.ts`, `admin.ts`

**Checklist**
- [ ] Repo initialized, base folder structure from `02_project_structure.md` scaffolded
- [ ] Tailwind config with brand colors/typography in place
- [ ] Supabase project created, connection verified
- [ ] Environment variables documented in `.env.local.example`
- [ ] Base layout renders a blank page with no console errors

---

## Phase 2 — Authentication

- Implement Supabase Auth email/password sign-in
- Build `/admin/login` page
- Implement `middleware.ts` route protection for `/admin/*`
- Implement `requireAdmin()` server guard
- Seed one admin user + matching `admin_profiles` row

**Checklist**
- [ ] Unauthenticated visit to `/admin` redirects to `/admin/login`
- [ ] Valid login redirects to `/admin` dashboard
- [ ] Invalid login shows inline error, no session created
- [ ] Sign-out clears session and redirects to login
- [ ] `admin_profiles` correctly linked to `auth.users`

---

## Phase 3 — Database

- Run full schema from `04_sql_schema.sql` as a Supabase migration
- Apply RLS policies
- Create Supabase Storage `media` bucket + storage policies
- Write and run `supabase/seed/seed.sql` with sample Meridian data

**Checklist**
- [ ] All 11 tables created with correct constraints/indexes
- [ ] `updated_at` triggers verified on every applicable table
- [ ] RLS confirmed: anon client can read only published rows, cannot write
- [ ] Storage bucket created, public read / authenticated write policy verified
- [ ] Seed data loaded: sample products, collections, blog posts, site_settings, pages

---

## Phase 4 — UI Components

- Build `components/ui/` primitives (Button, Input, Textarea, Select, Modal, Table, Pagination, Badge, Skeleton)
- Build `components/layout/` (Navbar, Footer, Breadcrumb, AdminSidebar)
- Establish shared form patterns (Zod + Server Action error surfacing)

**Checklist**
- [ ] Full component set from `09_component_inventory.md` implemented in isolation (Storybook or a `/dev/components` preview route)
- [ ] Components responsive at mobile/tablet/desktop breakpoints
- [ ] Consistent focus states and basic accessibility (labels, aria attributes) verified

---

## Phase 5 — Products

- Public: `/products` listing (filter by category/collection), `/products/[slug]` detail
- Admin: Products list, create/edit form (info, images, specs, features tabs)
- Media Library integration for product images
- Server Actions: `createProduct`, `updateProduct`, `deleteProduct`, image/spec/feature actions

**Checklist**
- [ ] Admin can create a product end-to-end and see it live on `/products` after publishing
- [ ] Draft products are not publicly routable (404) and excluded from listings/sitemap
- [ ] Image gallery reorder + primary image selection works
- [ ] Specifications and Features editable and correctly ordered on the detail page

---

## Phase 6 — Collections

- Public: `/collections` listing, `/collections/[slug]` detail (lists assigned products)
- Admin: Collections list, create/edit form, product assignment UI
- Server Actions: `createCollection`, `updateCollection`, `deleteCollection`, `assignProducts`

**Checklist**
- [ ] A product correctly appears under all collections it's assigned to
- [ ] Collection reordering (`sort_order`) reflected in both admin and public views
- [ ] Deleting a collection does not delete its products

---

## Phase 7 — Blogs

- Public: `/blog` listing (paginated), `/blog/[slug]` detail
- Admin: Blog list, create/edit form with rich text editor, cover image, draft/publish toggle
- Server Actions: `createBlogPost`, `updateBlogPost`, `publishBlogPost`, `unpublishBlogPost`

**Checklist**
- [ ] Draft posts hidden from public listing/routes/sitemap
- [ ] Publishing sets `published_at` and immediately revalidates the public page
- [ ] Rich text content renders safely (sanitized) on the public detail page
- [ ] Pagination on `/blog` works correctly at post counts > 1 page

---

## Phase 8 — SEO

- Implement `features/seo/buildMetadata.ts` and wire into every page's `generateMetadata()`
- Implement JSON-LD builders: Organization, Product, Article, CollectionPage, BreadcrumbList
- Implement `app/sitemap.ts` and `app/robots.ts`
- Build admin SEO Settings screen (global) and per-entity SEO tabs (already scaffolded in Phases 5–7)
- Build `pages` static-route SEO override UI

**Checklist**
- [ ] Every public page has a unique, correct `<title>` and meta description
- [ ] OG/Twitter card tags verified via a social preview debugger
- [ ] JSON-LD validated with Google's Rich Results Test for each schema type
- [ ] `sitemap.xml` includes all published products/collections/posts/static pages and excludes drafts
- [ ] `robots.txt` correctly disallows `/admin`

---

## Phase 9 — Testing

- Type-check (`tsc --noEmit`) and lint clean across the repo
- Manual QA pass against every page and admin workflow in `06_admin_workflow.md`
- Cross-browser check (Chrome, Safari, Firefox) and mobile viewport check
- Broken-link / 404 sweep
- Lighthouse pass (performance, accessibility, SEO, best practices)
- RLS penetration check: confirm anon client cannot read drafts or write to any table

**Checklist**
- [ ] CI pipeline runs type-check + lint + build on every PR
- [ ] No console errors/warnings on any public page
- [ ] Lighthouse SEO score ≥ 95, Performance ≥ 90 on key pages
- [ ] All admin workflows in `06_admin_workflow.md` manually verified end-to-end

---

## Phase 10 — Deployment

- Connect repo to Vercel, configure environment variables per `10_deployment.md`
- Point production Supabase project, run migrations against it
- Configure custom domain + SSL
- Final smoke test in production
- Set up basic uptime/error monitoring

**Checklist**
- [ ] Production build succeeds on Vercel with zero errors
- [ ] All environment variables present and correct in Vercel dashboard
- [ ] Production Supabase migrations applied and seeded (or intentionally left empty for real client content)
- [ ] Domain resolves with valid SSL
- [ ] Post-deploy smoke test: login, create/publish a product, verify it appears live, verify sitemap/robots
