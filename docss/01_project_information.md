# 01 — Project Information

**Project:** Meridian Machine Works — Corporate Marketing Website & Admin Panel
**Document Type:** Project Overview & Scope Definition
**Status:** Pre-Development / Planning
**Audience:** Engineering, Design, Product, QA

---

## 1. Project Overview

Meridian Machine Works ("Meridian") is a B2B industrial machinery manufacturer producing CNC machining centers, hydraulic press systems, industrial conveyor systems, robotic welding cells, and material handling equipment for manufacturing plants, fabrication shops, and heavy industry clients.

This project delivers a modern, SEO-first, multi-page marketing website paired with a lightweight, purpose-built admin panel. The site exists to:

- Present Meridian's product catalog to engineering buyers, procurement teams, and distributors
- Organize products into curated collections (product lines / series)
- Publish technical and industry-news content via a blog
- Convert visitor interest into sales inquiries via a contact/quote-request flow
- Rank well in search engines through fully dynamic, per-page SEO control

The system is built so that non-technical staff (marketing/sales ops) can manage all product, collection, blog, and SEO content without developer involvement after launch.

## 2. Goals

| Goal | Description |
|---|---|
| Credibility | Present Meridian as a modern, capable industrial manufacturer through clean, professional design and complete product data. |
| Lead generation | Every product/collection page funnels toward a quote request or contact action. |
| Findability | Fully dynamic SEO (titles, descriptions, canonical, OG, JSON-LD) on every page, plus sitemap/robots automation. |
| Maintainability | Admin panel is intentionally minimal — only what marketing/sales ops need, nothing more. |
| Performance | Fast, cache-friendly, image-optimized pages suitable for procurement research sessions. |
| Scalability of content | Product catalog, collections, and blog can grow without schema or code changes. |

## 3. Scope

### In Scope
- Public marketing website (12 page types, listed below)
- Admin panel for Products, Collections, Blog, Media Library, General Settings, SEO Settings
- Supabase-backed PostgreSQL database with Supabase Auth (admin-only) and Supabase Storage (media)
- Fully dynamic SEO system (global + per-page overrides) including JSON-LD structured data
- Dynamic `sitemap.xml` and `robots.txt`
- Realistic sample/demo content across all pages and admin entities

### Out of Scope (this phase)
- Public user accounts, wishlists, or e-commerce checkout/payments
- Multi-language / i18n
- Distributor portal or B2B pricing tiers
- CRM integration (contact submissions are stored + emailed only)
- Native mobile app

## 4. Public Website Pages

1. Home
2. About
3. Products (catalog/listing, filterable by collection/category)
4. Product Details
5. Collections (listing)
6. Collection Details
7. Blog (listing)
8. Blog Details
9. Contact
10. Privacy Policy
11. Terms & Conditions
12. 404 Not Found

Every page ships with realistic Meridian-branded sample content (copy, specs, imagery placeholders) so the site is demoable without client-provided material.

## 5. Admin Panel Modules

- **Products** — CRUD, image gallery, specifications, features, per-product SEO
- **Collections** — CRUD, single collection image, per-collection SEO, product assignment
- **Blog** — CRUD, rich text editor, cover image, draft/publish workflow, per-post SEO
- **Media Library** — centralized upload/browse/delete for all images
- **General Settings** — company info, contact details, social links, footer content
- **SEO Settings** — global SEO defaults, Organization schema, social/OG defaults, favicon

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 14+ (App Router), TypeScript |
| Styling | Tailwind CSS |
| Backend logic | Next.js Server Actions + Route Handlers (serverless, deployed on Vercel) |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email/password, admin-only, no public accounts) |
| File/image storage | Supabase Storage |
| Hosting | Vercel (frontend + serverless functions) |
| SEO | Fully dynamic per-page metadata via Next.js Metadata API, custom JSON-LD injection |

## 7. Folder Overview

High-level structure (full detail in `02_project_structure.md`):

```
app/          → routes (public + admin), layouts, metadata
components/   → shared, presentational UI components
features/     → domain modules (products, collections, blog, media, settings, seo)
hooks/        → shared React hooks
lib/          → Supabase clients, constants, config
services/     → data-access layer (Supabase queries/mutations)
server/       → server actions, server-only utilities
supabase/     → SQL migrations, seed scripts, storage policies
types/        → shared TypeScript types/interfaces
styles/       → global Tailwind/CSS
utils/        → generic helper functions
middleware/   → auth/route protection middleware
public/       → static assets (favicon, robots fallback, og defaults)
documents/    → this documentation set
```

## 8. Deployment Overview

- **Frontend + serverless functions:** Vercel, connected to the Git repository, auto-deploy on push to `main` (production) and preview deploys on pull requests.
- **Database & Auth & Storage:** Supabase project (single project for all environments, or separate dev/prod Supabase projects — recommended: separate projects per environment).
- **Environment variables:** Supabase URL/keys, site URL, and SEO defaults stored in Vercel Project Settings (see `10_deployment.md`).
- **Domain & SSL:** Managed via Vercel's domain configuration, automatic HTTPS.
- **CI checks:** Type-check, lint, and build must pass before merge (see `08_development_steps.md`, Phase 9).

This document is the reference baseline for all other documents in this set. Where other documents describe implementation detail, this document defines *why* the project exists and *what* is in scope.
