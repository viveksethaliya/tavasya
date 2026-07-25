# 10 — Deployment

## 1. Hosting Topology

| Layer | Provider |
|---|---|
| Frontend + serverless functions (Server Actions, Route Handlers) | Vercel |
| Database, Auth, Storage | Supabase |
| Domain / DNS / SSL | Vercel Domains (or external registrar pointed at Vercel) |

Recommended: **separate Supabase projects for staging and production**, both connected to the same Vercel project via environment-scoped variables (Preview vs Production environments in Vercel).

## 2. Vercel Setup

1. Import the Git repository into a new Vercel project.
2. Set the framework preset to Next.js (auto-detected).
3. Configure environment variables (see §3) separately for **Production** and **Preview** environments.
4. Enable automatic deployments: `main` branch → Production, all other branches/PRs → Preview.
5. Set the Node.js version to match `package.json` `engines` (LTS).

## 3. Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL, used by browser + server clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Anon key, respects RLS, safe for client exposure |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Used exclusively in `lib/supabase/admin.ts` for privileged admin-panel operations; **never** prefixed `NEXT_PUBLIC_`, never sent to the browser |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical site origin, used to build absolute canonical/OG URLs and `sitemap.xml`/`robots.txt` |
| `CONTACT_FORM_RECIPIENT_EMAIL` | Server-only | Destination address for `/api/contact` notifications |
| `EMAIL_PROVIDER_API_KEY` | Server-only | Credentials for the transactional email provider used by the contact endpoint |

An `.env.local.example` file in the repo documents every variable name (without values) so onboarding a new environment is copy-and-fill.

## 4. Supabase Storage

- Bucket: `media` — public read, authenticated (admin) write, per `supabase/storage-policies.sql`.
- Recommended folder convention inside the bucket: `products/`, `collections/`, `blog/`, `settings/` — mirrors `media.file_path`.
- Set a reasonable per-file size limit at the bucket level (e.g. 10 MB) matching the `uploadMedia` action's validation.
- CDN caching: Supabase Storage serves through a CDN by default; combined with `next/image` optimization, no additional image CDN is required at this scale.

## 5. Database Migrations

- `supabase/migrations/0001_init.sql` (mirrors `04_sql_schema.sql`) is applied via the Supabase CLI (`supabase db push`) or the SQL editor in the Supabase dashboard.
- Future schema changes are added as new numbered migration files — never edited in place — so staging/production can be brought up to the same state deterministically.
- `supabase/seed/seed.sql` is run only in development/staging, never automatically in production.

## 6. Production Build

- Build command: `next build` (Vercel default).
- Type-checking and linting are enforced as a pre-merge CI gate (Phase 9), not just at build time, so a broken build never reaches `main`.
- Static generation (`generateStaticParams`) pre-renders all published products, collections, and blog posts at build time; new content published after deploy is served via on-demand ISR (`revalidatePath()` triggered from Server Actions), so a full rebuild is not required for routine content publishing.

## 7. Performance

- Images served exclusively through `next/image` with Supabase Storage as a configured remote pattern.
- Route-level code splitting is automatic under the App Router; admin-only libraries (rich text editor, drag-and-drop) are dynamically imported (`next/dynamic`) so they never ship in the public-site bundle.
- Font loading via `next/font` (self-hosted, no external request/layout shift).
- Target Lighthouse budgets: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 on Home, Product Details, and Blog Details.

## 8. Caching Strategy Summary

| Route type | Strategy |
|---|---|
| Public catalog/blog detail pages | Static + on-demand revalidation (`revalidatePath` from publish/update actions) |
| Public listing pages | Static + short time-based revalidation (e.g. 60s) as a safety net |
| `sitemap.xml` / `robots.txt` | Time-based revalidation (e.g. hourly) |
| Admin pages | `force-dynamic`, never cached |

## 9. Security

- Supabase RLS enabled on every table; public (anon) role is read-only and restricted to `status = 'published'` rows (see `04_sql_schema.sql`).
- `SUPABASE_SERVICE_ROLE_KEY` confined to server-only modules (`lib/supabase/admin.ts`), never imported into any file reachable from a Client Component bundle.
- `middleware.ts` protects every `/admin/*` route except `/admin/login`; each Server Action additionally calls `requireAdmin()` as defense-in-depth (never rely on middleware alone).
- Contact form protected against spam via a honeypot field and basic rate limiting at the route handler.
- Standard security headers (CSP, `X-Frame-Options`, `Referrer-Policy`) configured in `next.config.mjs`.
- Admin login rate-limited to mitigate credential brute-forcing.
- No public user registration exists in this system — the only accounts are admin accounts, provisioned manually via the Supabase dashboard/CLI, not via any public sign-up flow.

## 10. Monitoring & Rollback

- Vercel's built-in deployment history allows instant rollback to any previous production deployment.
- Basic error monitoring via Vercel's function logs; a dedicated error-tracking service (e.g. Sentry) can be added post-launch without architectural changes.
- Supabase dashboard provides database performance/query insights for ongoing tuning of the indexes defined in `04_sql_schema.sql`.
