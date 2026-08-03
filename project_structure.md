```text
tavasya/
+--- app
|   +--- (public)
|   |   +--- about
|   |   |   \--- page.tsx
|   |   +--- blog
|   |   |   +--- [slug]
|   |   |   \--- page.tsx
|   |   +--- collections
|   |   |   +--- [slug]
|   |   |   \--- page.tsx
|   |   +--- contact
|   |   |   \--- page.tsx
|   |   +--- privacy-policy
|   |   |   \--- page.tsx
|   |   +--- products
|   |   |   +--- [slug]
|   |   |   \--- page.tsx
|   |   +--- terms-and-conditions
|   |   |   \--- page.tsx
|   |   +--- layout.tsx
|   |   +--- not-found.tsx
|   |   \--- page.tsx
|   +--- admin
|   |   +--- (protected)
|   |   |   +--- blog
|   |   |   |   +--- new
|   |   |   |   |   \--- page.tsx
|   |   |   |   +--- [id]
|   |   |   |   \--- page.tsx
|   |   |   +--- collections
|   |   |   |   +--- new
|   |   |   |   |   \--- page.tsx
|   |   |   |   +--- [id]
|   |   |   |   \--- page.tsx
|   |   |   +--- inquiries
|   |   |   |   +--- _components
|   |   |   |   |   +--- message-dialog.tsx
|   |   |   |   |   \--- status-select.tsx
|   |   |   |   \--- page.tsx
|   |   |   +--- media
|   |   |   |   \--- page.tsx
|   |   |   +--- products
|   |   |   |   +--- new
|   |   |   |   |   \--- page.tsx
|   |   |   |   +--- [id]
|   |   |   |   \--- page.tsx
|   |   |   +--- settings
|   |   |   |   +--- general
|   |   |   |   |   \--- page.tsx
|   |   |   |   \--- seo
|   |   |   |       \--- page.tsx
|   |   |   +--- unauthorized
|   |   |   |   \--- page.tsx
|   |   |   +--- _components
|   |   |   |   \--- admin-sidebar.tsx
|   |   |   +--- layout.tsx
|   |   |   \--- page.tsx
|   |   \--- login
|   |       \--- page.tsx
|   +--- api
|   |   \--- contact
|   |       \--- route.ts
|   +--- dev
|   |   \--- components
|   |       \--- page.tsx
|   +--- globals.css
|   +--- icon.png
|   +--- layout.tsx
|   +--- robots.ts
|   \--- sitemap.ts
+--- components
|   +--- layout
|   +--- marketing
|   |   +--- blog-card.tsx
|   |   +--- rich-text-renderer.tsx
|   |   \--- seo-json-ld.tsx
|   +--- public
|   |   +--- footer.tsx
|   |   \--- header.tsx
|   \--- ui
|       +--- badge.tsx
|       +--- button.tsx
|       +--- checkbox.tsx
|       +--- confirm-dialog.tsx
|       +--- dialog.tsx
|       +--- drawer.tsx
|       +--- empty-state.tsx
|       +--- form.tsx
|       +--- icon-button.tsx
|       +--- input.tsx
|       +--- label.tsx
|       +--- pagination.tsx
|       +--- select.tsx
|       +--- skeleton.tsx
|       +--- sonner.tsx
|       +--- switch.tsx
|       +--- table.tsx
|       +--- tabs.tsx
|       \--- textarea.tsx
+--- docss
|   +--- 01_project_information.md
|   +--- 02_project_structure.md
|   +--- 03_database_design.md
|   +--- 04_sql_schema.sql
|   +--- 05_api_architecture.md
|   +--- 06_admin_workflow.md
|   +--- 07_frontend_architecture.md
|   +--- 08_development_steps.md
|   +--- 09_component_inventory.md
|   +--- 10_deployment.md
|   +--- blog_plan.md
|   +--- design-tokens.md
|   +--- project_brief_industrial_systems.md
|   \--- Tavasya - Website Content.md
+--- features
|   +--- blog
|   |   +--- components
|   |   |   +--- blog-form.tsx
|   |   |   \--- rich-text-editor.tsx
|   |   +--- actions.ts
|   |   +--- queries.ts
|   |   \--- schema.ts
|   +--- collections
|   |   +--- actions.ts
|   |   +--- collection-form.tsx
|   |   +--- product-assignment-picker.tsx
|   |   +--- queries.ts
|   |   \--- schema.ts
|   +--- contact
|   |   +--- actions.ts
|   |   \--- queries.ts
|   +--- media
|   |   +--- components
|   |   |   +--- media-library-grid.tsx
|   |   |   \--- media-picker-modal.tsx
|   |   +--- actions.ts
|   |   \--- queries.ts
|   +--- products
|   |   +--- components
|   |   |   +--- admin-products-table.tsx
|   |   |   +--- feature-editor.tsx
|   |   |   +--- product-image-gallery.tsx
|   |   |   \--- specification-editor.tsx
|   |   +--- actions.ts
|   |   +--- product-form.tsx
|   |   +--- queries.ts
|   |   \--- schema.ts
|   +--- seo
|   |   +--- buildMetadata.ts
|   |   +--- jsonld.ts
|   |   \--- types.ts
|   \--- settings
|       +--- components
|       |   +--- general-settings-form.tsx
|       |   \--- seo-settings-form.tsx
|       +--- actions.ts
|       \--- queries.ts
+--- hooks
|   +--- useDebounce.ts
|   +--- useMediaLibrary.ts
|   +--- usePagination.ts
|   \--- useToast.ts
+--- lib
|   +--- supabase
|   |   +--- admin.ts
|   |   +--- client.ts
|   |   \--- server.ts
|   +--- constants.ts
|   +--- env.ts
|   \--- utils.ts
+--- public
|   +--- All Machines/
|   +--- icons/
|   +--- Machines Stock Images/
|   +--- Stock Images/
|   +--- hero-bg.png
|   +--- Logo-E10.png
|   +--- Logo-E11.png
|   \--- Logo-E8.png
+--- scripts
|   \--- create-admin.mjs
+--- server
|   +--- actions
|   +--- auth
|   |   +--- actions.ts
|   |   \--- requireAdmin.ts
|   \--- validation
|       \--- formErrors.ts
+--- services
|   +--- blogService.ts
|   +--- collectionService.ts
|   +--- mediaService.ts
|   +--- productService.ts
|   \--- settingsService.ts
+--- styles
|   \--- tailwind.css
+--- supabase
|   +--- migrations
|   |   +--- 0001_init.sql
|   |   \--- 20260725000000_contact_submissions.sql
|   +--- seed
|   |   \--- seed.sql
|   +--- config.toml
|   \--- storage-policies.sql
+--- types
|   +--- blog.ts
|   +--- collection.ts
|   +--- media.ts
|   +--- product.ts
|   +--- seo.ts
|   +--- settings.ts
|   \--- supabase.ts
+--- utils
|   +--- buildImageUrl.ts
|   +--- formatDate.ts
|   +--- slugify.ts
|   \--- truncate.ts
+--- .env.example
+--- .env.local
+--- .env.local.example
+--- components.json
+--- eslint.config.mjs
+--- next.config.ts
+--- package.json
+--- postcss.config.mjs
+--- project_structure.md
+--- tailwind.config.ts
+--- tsconfig.json
```
