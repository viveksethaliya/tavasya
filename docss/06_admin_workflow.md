# 06 — Admin Workflows

Documents the end-to-end operational flow for every recurring admin task. These flows map directly to the Server Actions defined in `05_api_architecture.md`.

---

## 1. Create & Publish a Product

```
Login (Supabase Auth)
        ↓
Admin → Products → "New Product"
        ↓
Enter Name, SKU, Category, Short/Full Description  →  createProduct()  [status: draft]
        ↓
Upload Images (Media Library picker or direct upload)  →  uploadMedia() + addProductImage()
        ↓
Set Primary Image  →  setPrimaryImage()
        ↓
Add Specifications (key/value rows, reorderable)  →  upsertSpecifications()
        ↓
Add Features (bullet list, reorderable)  →  upsertFeatures()
        ↓
Assign to Collection(s) (optional, from Product edit screen or Collection screen)  →  assignProducts()
        ↓
SEO Tab: SEO Title, Meta Description, Canonical, OG Image, Robots, Keywords  →  updateProductSeo()
        ↓
Review (live preview / draft link)
        ↓
Publish  →  updateProduct({ status: 'published' })
        ↓
Product appears on /products, its collection page(s), sitemap.xml, and JSON-LD Product schema goes live
```

**Failure/edge handling:** If required fields (name, slug) are missing, the form blocks submission client-side (Zod) and re-validates server-side; slug conflicts surface a "This URL is already in use" inline error with a suggested alternative slug.

---

## 2. Create & Publish a Collection

```
Admin → Collections → "New Collection"
        ↓
Enter Name, Description  →  createCollection()  [status: draft]
        ↓
Upload / Select Collection Image  →  setCollectionImage()
        ↓
Assign Products (searchable multi-select, drag to reorder)  →  assignProducts()
        ↓
SEO Tab  →  updateCollectionSeo()
        ↓
Publish  →  updateCollection({ status: 'published' })
        ↓
Collection appears on /collections, sitemap.xml, JSON-LD CollectionPage schema
```

---

## 3. Create, Draft, and Publish a Blog Post

```
Admin → Blog → "New Post"
        ↓
Enter Title, Author  →  createBlogPost()  [status: draft, published_at: null]
        ↓
Write content in Rich Text Editor (auto-saved as draft on interval)  →  updateBlogPost()
        ↓
Upload / Select Cover Image  →  setCoverImage()
        ↓
Write Excerpt (used on /blog listing cards)
        ↓
SEO Tab  →  updateBlogSeo()
        ↓
Choice:
   ├── Save Draft  →  stays status: draft, not in sitemap, not publicly routable
   └── Publish  →  publishBlogPost()  [status: published, published_at: now()]
        ↓
Post appears on /blog, sitemap.xml, JSON-LD Article schema
        ↓
(Optional later) Unpublish  →  unpublishBlogPost()  → reverts to draft, removed from public listing/sitemap
```

---

## 4. Media Library Usage

```
Admin → Media Library
        ↓
Upload File (drag-and-drop or file picker)  →  uploadMedia()
        ↓
System validates type/size → stores in Supabase Storage `media` bucket → inserts `media` row
        ↓
Set Alt Text (required before the image can be marked primary, for SEO/accessibility)  →  updateMediaMeta()
        ↓
Image available for selection everywhere a "Media Picker" appears
        (Product images, Collection image, Blog cover, Settings OG/Favicon)
        ↓
Deletion attempt  →  deleteMedia()
        ├── If referenced elsewhere → blocked, admin sees list of referencing products/collections/posts
        └── If unreferenced → deleted from Storage + database
```

---

## 5. General Settings Update

```
Admin → Settings → General
        ↓
Edit Company Name, Legal Name, Contact Email/Phone, Address, Social Links
        ↓
Save  →  updateGeneralSettings()
        ↓
Changes reflected immediately in: Footer, Contact page, Organization JSON-LD
```

---

## 6. SEO Settings Update

```
Admin → Settings → SEO
        ↓
Edit Default SEO Title / Description / Robots
        ↓
Select Default OG Image + Favicon (via Media Picker)
        ↓
Edit Organization Schema fields (name, logo, sameAs social links, contact point)
        ↓
Save  →  updateSeoSettings()
        ↓
Changes apply as fallback on every page that has no page-specific SEO override
```

---

## 7. Static Page SEO Override (Home / About / Contact / Privacy / Terms)

```
Admin → Settings → SEO → "Page Overrides" section
        ↓
Select route (Home, About, Contact, Privacy Policy, Terms & Conditions)
        ↓
Edit SEO Title, Meta Description, Canonical, OG Image, Robots, Keywords
        ↓
Save  →  updatePageSeo()
        ↓
Overrides merge on top of global defaults for that specific route
```

---

## Roles

The admin panel supports a single role (`admin`) at launch — every authenticated admin user has full access to all modules. The `admin_profiles.role` column exists specifically so a future role tier (e.g. `editor` with no Settings access) can be introduced without a schema migration.
