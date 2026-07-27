
## Summary

- Compliance: 52%
- Critical Issues: 0
- Major Issues: 7
- Minor Issues: 4

## Findings

| Severity | File | Issue | Expected Behavior |
|---|---|---|---|
| Major (Done ✓) | `app/admin/(protected)/collections/[id]/edit/page.tsx` | The documented edit route renders only a placeholder. The list instead links to the undocumented `/admin/collections/[id]` route. | `/admin/collections/[id]/edit` must render the functional collection editor. |
| ✓ Done (Major) | `features/collections/collection-form.tsx`, `features/collections/schema.ts`, `features/collections/actions.ts` | Per-collection SEO fields and the documented `updateCollectionSeo` capability are absent. Consequently, the `collections` SEO columns (`seo_title`, `meta_description`, canonical, OG image, robots, keywords) cannot be administered. | The collection editor must provide per-collection SEO controls backed by the documented schema fields. |
| ✓ Done (Major) | `features/collections/collection-form.tsx`, `features/collections/schema.ts` | A new form initializes `image_id` as `""`, and clearing an image also writes `""`; the schema accepts only a UUID, `null`, or `undefined`. This prevents saving a collection without an image or after clearing one, although `collections.image_id` is nullable. | An absent image must be represented as `null`/`undefined` and save successfully. |
| ✓ Done (Major) | `features/collections/actions.ts` | `getProductsByIds` has no `requireAdmin()` check. Because Server Actions can be invoked independently of the protected route, this bypasses the documented defense-in-depth authorization model. | Every collection-admin Server Action, including assignment-related reads, must require an admin session. |
| ✓ Done (Major) | `features/collections/actions.ts` | Creating or updating a collection and replacing its product assignments uses multiple independent writes without atomicity. A junction-table failure can leave a new collection created without its intended products, or an existing collection with assignments deleted. | Collection data and its `collection_products` replacement must succeed or fail as one operation. |
| ✓ Done (Major) | `features/collections/actions.ts` | `updateCollection` and `deleteCollection` do not verify that the target collection exists; zero-row writes can return success. This conflicts with the documented `404` behavior for missing records. | Missing collection IDs must return a not-found error, not a successful result. |
| ✓ Done (Major) | `features/collections/actions.ts` | Cache invalidation omits deleted collection-detail paths and, after a slug change, the previous detail path. Published collection pages may therefore remain stale despite the documented immediate revalidation requirement. | Create, update, slug-change, and delete flows must invalidate all affected public collection detail and listing paths. |
| ✓ Done (Minor) | `features/collections/queries.ts` | `getCollections()` converts a database failure into `[]`; the admin UI then presents an incorrect “No collections found” empty state. | Query failures must be distinguishable from a genuine empty collection list. |
| ✓ Done (Minor) | `app/admin/(protected)/collections/[id]/page.tsx`, `features/collections/queries.ts` | Any fetch failure—including a database failure—is turned into a 404 page. | Only a confirmed absent collection should render `notFound`; operational failures need an error state. |
| ✓ Done (Minor) | `features/collections/product-assignment-picker.tsx` | Search-result rows are mouse-only clickable elements, and remove controls have no accessible name. This fails the documented basic admin accessibility requirement. | Product assignment and removal controls must be keyboard-operable with accessible labels. |
| ✓ Done (Minor) | `features/media/components/media-picker-modal.tsx` | When media-library loading fails, the picker silently shows an empty library, indistinguishable from having no images. | A failed media query must display an error state rather than an empty state. |

## Summary

- Compliance: 30%
- Critical Issues: 1
- Major Issues: 9
- Minor Issues: 3

## Findings

| Severity | File | Issue | Expected Behavior |
|---|---|---|---|
| ✓ Done (Critical) | `schema_now.sql`; `features/products/actions.ts`, `features/products/queries.ts` | The supplied current database schema contains Supabase `auth` tables only; it does not define the required `products`, `product_images`, `product_specifications`, `product_features`, or `media` tables that this module queries and mutates. | The deployed schema must contain the documented product and media tables, constraints, and RLS policies before this module can function. |
| ✓ Done (Major) | `app/admin/(protected)/products/[id]/edit/page.tsx` | The documented edit route renders only a placeholder, while the listing links to the undocumented `/admin/products/[id]` route. | `/admin/products/[id]/edit` must provide the functional product editor. |
| ✓ Done (Major) | `features/products/product-form.tsx`; `features/products/actions.ts` | SEO values entered while creating a product are silently discarded: `createProduct` destructures and inserts only non-SEO fields, and the SEO-specific save action is unavailable until after creation. | Product creation must persist the per-product SEO fields documented for the `products` table. |
| ✓ Done (Major) | `features/products/product-form.tsx` | The OG-image picker always receives `value={null}`, does not display an existing selection, and `handleSeoSave` never includes `og_image_id` in its request. | The selected and existing OG image must be shown and persisted to `products.og_image_id`. |
| ✓ Done (Major) | `features/products/components/product-image-gallery.tsx`; `features/products/components/specification-editor.tsx`; `features/products/components/feature-editor.tsx` | Reordering is documented for image galleries, specifications, and features, but none of these editors implements reorder behavior. The specification/feature “drag” icons are non-functional. | Admins must be able to reorder gallery images, specification rows, and feature rows, with the saved order reflected by `sort_order`. |
| ✓ Done (Major) | `app/admin/(protected)/products/[id]/page.tsx`; `features/products/components/product-image-gallery.tsx`; `features/products/actions.ts` | The editor always supplies `primaryImageId={null}`, so the active primary image is not displayed. Separately, `setPrimaryImage` does not verify that the selected media belongs to that product’s gallery, despite this being a documented invariant. | The gallery must initialize from `products.primary_image_id`, and the server action must permit only an image attached to that product. |
| ✓ Done (Major) | `features/products/actions.ts` | `getProductImages`, `getProductSpecs`, and `getProductFeatures` omit `requireAdmin()`. Exported Server Actions can be invoked outside the protected route, contrary to the documented defense-in-depth access control. | All product-admin Server Actions must require an authenticated admin session. |
| ✓ Done (Major) | `features/products/product-form.tsx`; `features/products/actions.ts` | Specification and feature replacement is destructive and non-atomic: existing rows are deleted before new rows are inserted, delete errors are ignored, and the form ignores unsuccessful specification/feature results before showing success and redirecting. | A product save must surface related-write failures and must not leave specifications or features partially deleted. |
| ✓ Done (Major) | `features/products/actions.ts` | `updateProduct` and `deleteProduct` do not verify that a product exists. A zero-row update/delete can return success, conflicting with the documented not-found behavior. | Missing product IDs must return a not-found failure rather than success. |
| ✓ Done (Major) | `features/products/actions.ts` | Product, image, primary-image, specification, and feature mutations invalidate only limited admin/listing paths. Deleted product detail pages, previous-slug pages, and public detail pages changed through related content may remain stale. | All affected public product detail and listing paths must be revalidated immediately after product-content mutations. |
| ✓ Done (Minor) | `features/products/actions.ts` | `updateProductSeo` accepts its payload without the documented server-side SEO validation, including unvalidated canonical URLs, robots values, keywords, and media IDs. | SEO updates must be validated server-side according to the documented product SEO constraints. |
| ✓ Done (Minor) | `app/admin/(protected)/products/[id]/page.tsx` | Any product-fetch failure is rendered as a 404, including database or operational failures. | Only a confirmed missing product should render `notFound`; other failures require an error state. |
| ✓ Done (Minor) | `features/products/components/product-image-gallery.tsx` | Adding an image performs a full `window.location.reload()`, unnecessarily discarding client state and reloading the entire route. | Image additions should refresh only the relevant route/component state. |

## Summary

- Compliance: 27%
- Critical Issues: 1
- Major Issues: 8
- Minor Issues: 4

## Findings

| Severity | File | Issue | Expected Behavior |
|---|---|---|---|
| ✓ Done (Critical) | `schema_now.sql`; `features/blog/actions.ts`, `features/blog/queries.ts` | The supplied current database schema defines Supabase `auth` tables only and lacks the required `blogs` and `media` application tables. All blog reads and writes will fail against that schema. | The deployed schema must include the documented blog and media tables, constraints, and RLS policies. |
| ✓ Done (Major) | `app/admin/(protected)/blog/[id]/edit/page.tsx` | The documented blog edit route is a placeholder, while the listing links to the undocumented `/admin/blog/[id]` route. | `/admin/blog/[id]/edit` must render the functional post editor. |
| ✓ Done (Major) | `features/blog/components/blog-form.tsx`; `features/blog/schema.ts` | New posts initialize nullable `cover_image_id` and `og_image_id` as `""`, which fails UUID validation. Clearing either media field produces the same invalid value. | Posts must save without optional images, and clearing an image must store `null`/`undefined`. |
| ✓ Done (Major) | `features/blog/schema.ts`; `features/blog/actions.ts` | A post can be published with empty or null `content`; the documented publish workflow requires non-empty content before publishing. | Publishing must be blocked until the post contains content. |
| ✓ Done (Major) | `features/blog/components/blog-form.tsx` | The documented draft auto-save workflow is absent. Content is saved only through the main form submission. | Draft edits must be auto-saved at an interval, with an appropriate saving/error state. |
| ✓ Done (Major) | `features/blog/components/blog-form.tsx` | The per-post SEO UI omits `robots` and `keywords`, even though both fields are in the documented `blogs` schema and SEO workflow. | Every documented per-post SEO field must be editable in the post form. |
| ✓ Done (Major) | `features/blog/components/blog-form.tsx`; `features/blog/schema.ts` | Arbitrary HTML accepted as blog content is rendered directly in the preview through `dangerouslySetInnerHTML`, with no sanitization at validation or rendering time. | Rich-text content must be sanitized before rendering, as required for safe public post content. |
| ✓ Done (Major) | `features/blog/actions.ts` | `updateBlog` and `deleteBlog` do not confirm that the target post exists. Query/write failures for the existing post are ignored in places, and zero-row mutations can report success. | Missing post IDs and failed prerequisite queries must return an explicit failure/not-found result. |
| ✓ Done (Major) | `features/blog/actions.ts` | Delete invalidates only the blog listing, and slug updates invalidate only the new slug. Previously cached public detail pages can remain available with stale content. | All affected public detail and listing paths, including previous-slug and deleted-post paths, must be revalidated. |
| ✓ Done (Minor) | `features/blog/queries.ts`; `app/admin/(protected)/blog/page.tsx` | A database failure in `getBlogs()` is converted into an empty list, producing a misleading “No blog posts found” state. | The admin list must distinguish a query error from a genuinely empty blog. |
| ✓ Done (Minor) | `features/blog/queries.ts`; `app/admin/(protected)/blog/[id]/page.tsx` | Any detail-query failure is converted into a 404, including database and authorization failures. | Only a confirmed missing post should show `notFound`; operational failures require an error state. |
| ✓ Done (Minor) | `features/blog/schema.ts` | `published_at` accepts any string rather than a validated date-time value. Invalid values reach the database layer instead of producing a field-level validation error. | A publish-date override must be validated as a valid date-time before mutation. |
| ✓ Done (Minor) | `features/blog/components/rich-text-editor.tsx` | The icon-only rich-text toolbar controls lack accessible labels, making the editor controls indistinguishable to assistive technology. | Each toolbar action must expose an accessible name. |



## Summary

- Compliance: 35%
- Critical Issues: 1
- Major Issues: 6
- Minor Issues: 3

## Findings

| Severity | File | Issue | Expected Behavior |
|---|---|---|---|
| ✓ Done (Critical) | `schema_now.sql`; `features/media/actions.ts` | The supplied current database schema has no `media` application table, while this module depends on it for listing, metadata updates, upload records, and deletion. | The deployed schema must include the documented `media` table and its storage/database policies. |
| ✓ Done (Major) | `features/media/actions.ts` | Upload validation permits `image/gif`, which is outside the documented allowed media types (PNG, JPEG, WebP, SVG). | Only the documented image MIME types should be accepted. |
| ✓ Done (Major) | `features/media/actions.ts` | Uploads do not persist the documented `uploaded_by`, `width`, or `height` metadata. `requireAdmin()` is called but its returned user is discarded. | Each media row must record the uploading admin and image dimensions where applicable. |
| ✓ Done (Major) | `features/media/actions.ts` | Reference checks before deletion omit `products.og_image_id`, `collections.og_image_id`, `blogs.og_image_id`, `pages.og_image_id`, and `site_settings.favicon_id`. A referenced asset can therefore be deleted despite the documented “block if in use” workflow. | Deletion must be blocked, with references reported, for every documented foreign-key use of a media row. |
| ✓ Done (Major) | `features/media/actions.ts` | Storage deletion errors are ignored. The database row can be deleted even if the Storage object remains, leaving an orphaned file. | The operation must fail when Storage deletion fails and preserve consistent database/storage state. |
| ✓ Done (Major) | `features/media/actions.ts` | `updateMediaMeta` does not verify that a media row exists; an update against an unknown ID can return success. | Updating metadata for a missing item must return a not-found failure. |
| ✓ Done (Major) | `features/media/components/media-library-grid.tsx`; `features/media/actions.ts` | The documented Media Library search capability is absent, and every library load fetches the full media table. This will not scale as the shared library grows. | The grid must support media search and avoid loading all media records for every browse operation. |
| ✓ Done (Minor) | `features/media/actions.ts`; `features/media/components/media-library-grid.tsx` | A failed media-list query resolves to an empty grid; the UI cannot distinguish an error from “No media uploaded.” | Failed loading must display an error state. |
| ✓ Done (Minor) | `features/media/components/media-picker-modal.tsx` | A failed library query is displayed as an empty media library in the picker. | The picker must expose a loading failure rather than an empty-state message. |
| ✓ Done (Minor) | `features/media/components/media-library-grid.tsx` | The clickable upload drop zone is a non-semantic `div` without keyboard handling or an accessible control name. | Upload must be operable by keyboard and expose an accessible upload control. |


## Summary

- Compliance: 40%
- Critical Issues: 1
- Major Issues: 6
- Minor Issues: 2

## Findings

| Severity | File | Issue | Expected Behavior |
|---|---|---|---|
| ✓ Done (Critical) | `schema_now.sql`; `features/settings/actions.ts`, `features/settings/queries.ts` | The supplied current database schema does not contain the required `site_settings`, `pages`, or `media` tables. Both settings screens and all their mutations depend on those missing tables. | The deployed schema must include the documented settings, static-page SEO, and media tables before this module can operate. |
| ✓ Done (Major) | `features/settings/components/seo-settings-form.tsx`; `features/settings/actions.ts` | Static-page SEO overrides omit `og_image_id`, despite `pages.og_image_id` being a documented editable SEO field. | Each static-page override must support selecting and persisting its OG image. |
| ✓ Done (Major) | `features/settings/actions.ts`; `features/settings/components/seo-settings-form.tsx` | Organization schema handling conflicts with the documented JSONB design: valid JSON is parsed only for syntax but the original string is written to `organization_schema_json`; the form also types the database value as a string although JSONB is returned as structured data. The documented Organization/schema.org shape is never validated. | Organization schema must be validated as the required schema object and stored/read as JSONB data without string coercion. |
| ✓ Done (Major) | `features/settings/components/general-settings-form.tsx`; `features/settings/actions.ts` | Required Tavasya social links for Instagram and Facebook are unavailable. Saving also reconstructs `social_links` with only LinkedIn, YouTube, and Twitter, discarding any other existing social-link entries. | The settings form must manage the required social links without deleting unrelated stored links. |
| ✓ Done (Major) | `features/settings/actions.ts` | General settings validate only the phone length, not its format, despite the documented phone-format validation requirement. | Invalid contact-phone values must be rejected with a field-level validation error. |
| ✓ Done (Major) | `features/settings/actions.ts` | General, global SEO, and static-page SEO updates revalidate only admin settings routes. Documented immediate changes to the footer, contact page, Organization JSON-LD, public metadata, and static pages are not invalidated. | Settings mutations must revalidate every affected public route, layout, and SEO output. |
| ✓ Done (Major) | `features/settings/actions.ts` | Media identifiers for the default OG image and favicon are accepted as arbitrary strings instead of validated UUIDs. Invalid values reach the database layer and do not produce field-level validation errors. | Referenced media IDs must be validated before updating `site_settings`. |
| ✓ Done (Minor) | `features/settings/queries.ts`; `app/admin/(protected)/settings/general/page.tsx`; `app/admin/(protected)/settings/seo/page.tsx` | Failed settings/page queries are converted to `null` or `[]`, and both screens render blank editable forms rather than an error state. | Database failures must be presented as loading/error states, distinct from an intentionally empty configuration. |
| ✓ Done (Minor) | `features/settings/components/seo-settings-form.tsx` | Form state is not refreshed after successful saves, so the screen can continue to show stale initial values until a navigation or manual refresh. | A successful save must synchronize the visible settings state with the persisted values. |