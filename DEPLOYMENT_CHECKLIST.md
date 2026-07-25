# DEPLOYMENT_CHECKLIST.md

## Vercel Setup
- [X] Import the Git repository into a new Vercel project.
- [X] Verify the framework preset is set to Next.js.
- [X] Enable automatic deployments for `main` branch (Production) and other branches (Preview).
- [X] Set Node.js version to match `package.json` engines (LTS).

## Supabase Setup
- [X] Create separate Supabase projects for staging and production environments.
- [X] Run database migrations (`supabase db push`) against the production project.
- [X] DO NOT run the seed script on the production project unless it's intended for initial client data.
- [X] Verify RLS (Row Level Security) policies are properly enforced.

## DNS
- [X] Configure the custom domain in Vercel settings.
- [X] Update DNS records (A/CNAME) at your domain registrar to point to Vercel.

## SSL
- [X] Verify Vercel has successfully provisioned SSL certificates for the custom domain.
- [X] Check that `https://` is forced and working correctly.

## Environment Variables
- [X] Populate Production environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SITE_URL` (set to the production domain)
  - `CONTACT_FORM_RECIPIENT_EMAIL`
  - `EMAIL_PROVIDER_API_KEY`
- [X] Populate Preview environment variables in Vercel dashboard (using staging Supabase project credentials).

## Storage
- [X] Ensure `media` bucket is created in Supabase Storage.
- [X] Verify bucket is public read, authenticated (admin) write.
- [X] Set file size limits (e.g. 10 MB) on the bucket.

## Security
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is not exposed in `NEXT_PUBLIC_` variables.
- [ ] Verify security headers (CSP, X-Frame-Options, etc.) are applied in `next.config.ts`.
- [ ] Ensure `/admin` routes are protected by middleware and Server Actions enforce `requireAdmin()`.
- [ ] Configure rate-limiting and honeypot for contact form endpoints.

## Performance
- [ ] Confirm images are served exclusively through `next/image` optimizing from Supabase Storage.
- [ ] Verify route-level code splitting and dynamic imports (`next/dynamic`) are functioning for admin libraries.
- [ ] Run Lighthouse audits on production deployment and ensure scores: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.

## Monitoring
- [ ] Verify basic error monitoring via Vercel's function logs is active.
- [ ] (Optional) Integrate a dedicated error-tracking service like Sentry.
- [ ] Monitor database performance/query insights in the Supabase dashboard.
