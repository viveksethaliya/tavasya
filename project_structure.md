```
meridian-machine-works/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       └── opengraph-image.tsx
│   │   ├── collections/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── privacy-policy/
│   │   │   └── page.tsx
│   │   ├── terms-and-conditions/
│   │   │   └── page.tsx
│   │   └── not-found.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── collections/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── media/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── general/page.tsx
│   │   │   └── seo/page.tsx
│   │   └── unauthorized/page.tsx
│   │
│   ├── api/
│   │   └── contact/
│   │       └── route.ts
│   │
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
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
│   │   ├── components/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── schema.ts
│   ├── collections/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── schema.ts
│   ├── blog/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── schema.ts
│   ├── media/
│   │   ├── actions.ts
│   │   └── queries.ts
│   ├── settings/
│   │   ├── actions.ts
│   │   └── queries.ts
│   └── seo/
│       ├── buildMetadata.ts
│       ├── jsonld.ts
│       └── types.ts
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useToast.ts
│   ├── usePagination.ts
│   └── useMediaLibrary.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── constants.ts
│   └── env.ts
│
├── services/
│   ├── productService.ts
│   ├── collectionService.ts
│   ├── blogService.ts
│   ├── mediaService.ts
│   └── settingsService.ts
│
├── server/
│   ├── actions/
│   ├── auth/
│   │   └── requireAdmin.ts
│   └── validation/
│       └── formErrors.ts
│
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql
│   ├── seed/
│   │   └── seed.sql
│   ├── storage-policies.sql
│   └── config.toml
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
│   └── tailwind.css
│
├── utils/
│   ├── slugify.ts
│   ├── formatDate.ts
│   ├── truncate.ts
│   └── buildImageUrl.ts
│
├── middleware.ts
│
├── public/
│   ├── favicon.ico
│   ├── og-default.jpg
│   └── robots-static-fallback.txt
│
├── documents/
│
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local.example
```
