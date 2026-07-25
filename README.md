# Tavasya Web Platform

Tavasya is a modern web platform built with Next.js App Router, Tailwind CSS, and Supabase. This repository contains the source code for the public catalog, blog, and custom admin dashboard.

## Project Setup

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Copy `.env.example` to `.env.local` and populate your environment variables.
4. Set up your local or remote Supabase project.

## Development

Run the local development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

## Production

To test the production build locally:

```bash
npm run build
npm run start
```

## Deployment

We recommend Vercel for hosting the frontend and serverless functions, and Supabase for Database, Auth, and Storage.

1. Create a Vercel project and link it to this repository.
2. Set up separate Supabase projects for Production and Preview environments.
3. Configure the respective environment variables in the Vercel dashboard.
4. Deploy the application.

For a detailed deployment checklist, refer to `DEPLOYMENT_CHECKLIST.md`.

## Environment Variables

Refer to `.env.example` for the list of required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key (safe for client exposure).
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (SERVER ONLY).
- `NEXT_PUBLIC_SITE_URL`: Canonical site origin.
- `CONTACT_FORM_RECIPIENT_EMAIL`: Destination address for contact notifications.
- `EMAIL_PROVIDER_API_KEY`: Credentials for transactional email provider.

## Build Commands

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production build.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality.
- `npm run type-check`: Runs TypeScript compiler check without emitting files.

## Database Migration

Database schema is located in `supabase/migrations/0001_init.sql` (and mirrored in `docss/04_sql_schema.sql`).
Apply migrations using the Supabase CLI:

```bash
supabase db push
```
Or execute the SQL in the Supabase dashboard SQL editor.

## Seed Script

Seed data for local development is available in `supabase/seed/seed.sql`.
Run this script to populate your staging/development database with sample products, collections, and blogs.
**Do not run this script on the production database automatically.**

## Backup Strategy

- **Database**: Supabase provides automated daily backups. Point-in-time recovery (PITR) can be enabled via the Supabase Pro plan.
- **Storage**: Media assets in the Supabase Storage bucket are backed up along with the database, but consider external syncing (e.g., AWS S3) for high-value media files if needed.
- **Codebase**: Maintained via Git, with version history accessible on the repository host (GitHub/GitLab).
