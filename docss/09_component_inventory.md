# 09 — Component Inventory

Full list of reusable components, grouped by tier (see `07_frontend_architecture.md` §3 for the tier model).

---

## Tier 1 — `components/ui/` (generic primitives)

| Component | Purpose | Variants / Props |
|---|---|---|
| `Button` | Primary interactive element | `variant`: primary, secondary, outline, ghost, destructive · `size`: sm, md, lg · `loading` state |
| `IconButton` | Icon-only button (e.g. delete row, close modal) | `aria-label` required |
| `Badge` | Status/label pill | `variant`: draft, published, featured, neutral |
| `Input` | Text input | `error` state, `label`, `helperText` |
| `Textarea` | Multi-line input | Auto-resize option |
| `Select` | Dropdown select | Native or headless, `error` state |
| `Checkbox` / `Switch` | Boolean input | Used for `is_featured`, publish toggles |
| `Modal` | Overlay dialog | Used for confirmations, Media Picker |
| `Drawer` | Slide-in panel | Used for quick-edit SEO panel |
| `Table` | Data table shell | Sortable header support, empty state |
| `Pagination` | Page navigation | Used on `/blog`, admin lists |
| `Tabs` | Tabbed sections | Used on Product/Collection/Blog edit forms (Info / Images / SEO tabs) |
| `Toast` | Transient notification | Success/error feedback after Server Actions |
| `Skeleton` | Loading placeholder | Cards, tables, images |
| `EmptyState` | "Nothing here yet" placeholder | Admin lists with zero rows |
| `ConfirmDialog` | Destructive-action confirmation | Delete product/collection/blog/media |

## Tier 2 — `components/layout/` & `components/marketing/`

| Component | Purpose |
|---|---|
| `Navbar` | Public site header, primary nav, mobile menu |
| `Footer` | Public site footer — company info, quick links, social links (from `site_settings`) |
| `AdminSidebar` | Admin navigation (Dashboard, Products, Collections, Blog, Media, Settings) |
| `Breadcrumb` | Public breadcrumb trail (also feeds BreadcrumbList JSON-LD) |
| `Hero` | Page-top hero section (Home, About, Collection/Product detail banners) |
| `ProductCard` | Product summary card (image, name, short description, category badge) — used on `/products`, `/collections/[slug]`, "Related Products" |
| `CollectionCard` | Collection summary card (image, name, product count) — used on `/collections`, Home |
| `BlogCard` | Blog post summary card (cover image, title, excerpt, date) — used on `/blog`, Home |
| `SpecTable` | Renders `product_specifications` as a two-column table |
| `FeatureList` | Renders `product_features` as a checked bullet list |
| `QuoteRequestForm` | Public contact/quote form (Contact page, and a compact variant on Product Details) |
| `RichTextRenderer` | Sanitized renderer for blog `content` HTML on the public detail page |
| `SeoJsonLd` | Renders a `<script type="application/ld+json">` block from a schema object |

## Tier 3 — `features/<domain>/components/` (domain-composite)

| Component | Domain | Purpose |
|---|---|---|
| `ProductForm` | products | Full create/edit form (Client Component), tabbed Info/Images/Specs/Features/SEO |
| `ProductImageGallery` | products | Drag-to-reorder gallery editor + primary-image selector |
| `SpecificationEditor` | products | Add/remove/reorder key-value spec rows |
| `FeatureEditor` | products | Add/remove/reorder feature bullet rows |
| `CollectionForm` | collections | Full create/edit form |
| `ProductAssignmentPicker` | collections | Searchable multi-select + drag-reorder for assigning products to a collection |
| `BlogForm` | blog | Full create/edit form with rich text editor, cover image, publish toggle |
| `RichTextEditor` | blog | Client-side WYSIWYG editor component (e.g. Tiptap-based) |
| `MediaLibraryGrid` | media | Grid browser with upload, search, delete |
| `MediaPickerModal` | media | Reusable modal invoked from Product/Collection/Blog/Settings forms to select an existing `media` row |
| `GeneralSettingsForm` | settings | Company info / contact / social links form |
| `SeoSettingsForm` | settings | Global SEO defaults + Organization schema editor |
| `PageSeoOverrideForm` | settings | Per-static-page SEO override editor |
| `AdminDashboardStats` | dashboard | Counts (products, collections, posts) + recent activity |

## Naming & Location Conventions

- Tier 1 components are pure and framework-agnostic in styling terms — no direct Supabase or domain type imports.
- Tier 2 components accept typed props from `types/` and contain no data fetching of their own.
- Tier 3 components may be Server Components that fetch (read-only composites like `AdminDashboardStats`) or Client Components that mutate via Server Actions (all `*Form` and `*Editor` components).
