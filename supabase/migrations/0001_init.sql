-- ============================================================================
-- Meridian Machine Works — Production Schema
-- PostgreSQL / Supabase
-- Companion to 03_database_design.md
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Shared trigger function: keep updated_at current on every UPDATE
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- 1. admin_profiles
-- ============================================================================
create table if not exists admin_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'admin' check (role in ('admin')),
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 2. media
-- ============================================================================
create table if not exists media (
  id            uuid primary key default gen_random_uuid(),
  file_path     text not null,
  file_url      text not null,
  file_name     text not null,
  mime_type     text,
  size_bytes    integer,
  alt_text      text,
  width         integer,
  height        integer,
  uploaded_by   uuid references admin_profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_media_created_at on media (created_at desc);

-- ============================================================================
-- 3. site_settings (singleton)
-- ============================================================================
create table if not exists site_settings (
  id                          smallint primary key check (id = 1),
  site_name                   text not null default 'Tavasya Machines',
  company_legal_name          text,
  contact_email               text,
  contact_phone               text,
  address                     text,
  social_links                jsonb not null default '{}'::jsonb,
  default_seo_title           text,
  default_meta_description    text,
  default_robots              text not null default 'index,follow',
  default_og_image_id         uuid references media(id) on delete set null,
  twitter_handle              text,
  favicon_id                  uuid references media(id) on delete set null,
  organization_schema_json    jsonb not null default '{}'::jsonb,
  updated_at                  timestamptz not null default now()
);

drop trigger if exists trg_site_settings_updated_at on site_settings;
create trigger trg_site_settings_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

-- Seed the singleton row
insert into site_settings (id, site_name) values (1, 'Tavasya Machines')
  on conflict (id) do nothing;

-- ============================================================================
-- 4. pages (static route SEO overrides)
-- ============================================================================
create table if not exists pages (
  id                uuid primary key default gen_random_uuid(),
  route_key         text unique not null
                     check (route_key in ('home','about','contact','privacy-policy','terms-and-conditions')),
  seo_title         text,
  meta_description  text,
  canonical_url     text,
  og_image_id       uuid references media(id) on delete set null,
  robots            text default 'index,follow',
  keywords          text,
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_pages_updated_at on pages;
create trigger trg_pages_updated_at
  before update on pages
  for each row execute function set_updated_at();

-- ============================================================================
-- 5. products
-- ============================================================================
create table if not exists products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text unique not null,
  sku                 text unique,
  short_description   text,
  description         text,
  category            text,
  status              text not null default 'draft' check (status in ('draft','published')),
  is_featured         boolean not null default false,
  primary_image_id    uuid references media(id) on delete set null,
  sort_order          integer not null default 0,
  seo_title           text,
  meta_description    text,
  canonical_url       text,
  og_image_id         uuid references media(id) on delete set null,
  robots              text default 'index,follow',
  keywords            text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_products_slug on products (slug);
create index if not exists idx_products_status on products (status);
create index if not exists idx_products_category on products (category);
create index if not exists idx_products_featured on products (is_featured) where is_featured = true;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ============================================================================
-- 6. product_images
-- ============================================================================
create table if not exists product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  media_id      uuid not null references media(id) on delete cascade,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (product_id, media_id)
);

create index if not exists idx_product_images_product on product_images (product_id, sort_order);

-- ============================================================================
-- 7. product_specifications
-- ============================================================================
create table if not exists product_specifications (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  spec_key      text not null,
  spec_value    text not null,
  sort_order    integer not null default 0
);

create index if not exists idx_product_specs_product on product_specifications (product_id, sort_order);

-- ============================================================================
-- 8. product_features
-- ============================================================================
create table if not exists product_features (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  feature_text  text not null,
  sort_order    integer not null default 0
);

create index if not exists idx_product_features_product on product_features (product_id, sort_order);

-- ============================================================================
-- 9. collections
-- ============================================================================
create table if not exists collections (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text unique not null,
  description         text,
  image_id            uuid references media(id) on delete set null,
  status              text not null default 'draft' check (status in ('draft','published')),
  sort_order          integer not null default 0,
  seo_title           text,
  meta_description    text,
  canonical_url       text,
  og_image_id         uuid references media(id) on delete set null,
  robots              text default 'index,follow',
  keywords            text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_collections_slug on collections (slug);
create index if not exists idx_collections_status on collections (status);

drop trigger if exists trg_collections_updated_at on collections;
create trigger trg_collections_updated_at
  before update on collections
  for each row execute function set_updated_at();

-- ============================================================================
-- 10. collection_products (M:N junction)
-- ============================================================================
create table if not exists collection_products (
  collection_id   uuid not null references collections(id) on delete cascade,
  product_id      uuid not null references products(id) on delete cascade,
  sort_order      integer not null default 0,
  primary key (collection_id, product_id)
);

create index if not exists idx_collection_products_collection on collection_products (collection_id, sort_order);
create index if not exists idx_collection_products_product on collection_products (product_id);

-- ============================================================================
-- 11. blogs
-- ============================================================================
create table if not exists blogs (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  slug                text unique not null,
  excerpt             text,
  content             text,
  cover_image_id      uuid references media(id) on delete set null,
  author_name         text,
  status              text not null default 'draft' check (status in ('draft','published')),
  published_at        timestamptz,
  seo_title           text,
  meta_description    text,
  canonical_url       text,
  og_image_id         uuid references media(id) on delete set null,
  robots              text default 'index,follow',
  keywords            text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_blogs_slug on blogs (slug);
create index if not exists idx_blogs_status_published on blogs (status, published_at desc);

drop trigger if exists trg_blogs_updated_at on blogs;
create trigger trg_blogs_updated_at
  before update on blogs
  for each row execute function set_updated_at();

-- ============================================================================
-- Row Level Security (RLS)
-- Public (anon) role: read-only access to published content.
-- Authenticated admin role: full access, enforced via admin_profiles membership.
-- ============================================================================

alter table products enable row level security;
alter table product_images enable row level security;
alter table product_specifications enable row level security;
alter table product_features enable row level security;
alter table collections enable row level security;
alter table collection_products enable row level security;
alter table blogs enable row level security;
alter table media enable row level security;
alter table site_settings enable row level security;
alter table pages enable row level security;
alter table admin_profiles enable row level security;

drop policy if exists "admin_read_own_profile" on admin_profiles;
create policy "admin_read_own_profile" on admin_profiles
  for select using (auth.uid() = id);

-- Public read: published only
drop policy if exists "public_read_published_products" on products;
create policy "public_read_published_products" on products
  for select using (status = 'published');

drop policy if exists "public_read_published_collections" on collections;
create policy "public_read_published_collections" on collections
  for select using (status = 'published');

drop policy if exists "public_read_published_blogs" on blogs;
create policy "public_read_published_blogs" on blogs
  for select using (status = 'published');

drop policy if exists "public_read_pages" on pages;
create policy "public_read_pages" on pages
  for select using (true);

drop policy if exists "public_read_site_settings" on site_settings;
create policy "public_read_site_settings" on site_settings
  for select using (true);

-- Admin full access (service-role key bypasses RLS entirely for server actions;
-- these policies additionally allow authenticated admin sessions direct access
-- where server actions read via the anon/authenticated client)
drop policy if exists "admin_full_access_products" on products;
create policy "admin_full_access_products" on products
  for all using (auth.uid() in (select id from admin_profiles))
  with check (auth.uid() in (select id from admin_profiles));

drop policy if exists "admin_full_access_collections" on collections;
create policy "admin_full_access_collections" on collections
  for all using (auth.uid() in (select id from admin_profiles))
  with check (auth.uid() in (select id from admin_profiles));

drop policy if exists "admin_full_access_blogs" on blogs;
create policy "admin_full_access_blogs" on blogs
  for all using (auth.uid() in (select id from admin_profiles))
  with check (auth.uid() in (select id from admin_profiles));

drop policy if exists "admin_full_access_media" on media;
create policy "admin_full_access_media" on media
  for all using (auth.uid() in (select id from admin_profiles))
  with check (auth.uid() in (select id from admin_profiles));

drop policy if exists "admin_full_access_product_images" on product_images;
create policy "admin_full_access_product_images" on product_images
  for all using (auth.uid() in (select id from admin_profiles))
  with check (auth.uid() in (select id from admin_profiles));

drop policy if exists "admin_full_access_product_specifications" on product_specifications;
create policy "admin_full_access_product_specifications" on product_specifications
  for all using (auth.uid() in (select id from admin_profiles))
  with check (auth.uid() in (select id from admin_profiles));

drop policy if exists "admin_full_access_product_features" on product_features;
create policy "admin_full_access_product_features" on product_features
  for all using (auth.uid() in (select id from admin_profiles))
  with check (auth.uid() in (select id from admin_profiles));

drop policy if exists "admin_full_access_collection_products" on collection_products;
create policy "admin_full_access_collection_products" on collection_products
  for all using (auth.uid() in (select id from admin_profiles))
  with check (auth.uid() in (select id from admin_profiles));

drop policy if exists "admin_full_access_pages" on pages;
create policy "admin_full_access_pages" on pages
  for all using (auth.uid() in (select id from admin_profiles))
  with check (auth.uid() in (select id from admin_profiles));

drop policy if exists "admin_full_access_site_settings" on site_settings;
create policy "admin_full_access_site_settings" on site_settings
  for all using (auth.uid() in (select id from admin_profiles))
  with check (auth.uid() in (select id from admin_profiles));

-- ============================================================================
-- Recommended additional composite indexes (query patterns from services/)
-- ============================================================================
create index if not exists idx_products_status_sort on products (status, sort_order);
create index if not exists idx_collections_status_sort on collections (status, sort_order);

-- ============================================================================
-- RPCs for Atomic Mutations
-- ============================================================================

drop function if exists create_collection_with_products;
create or replace function create_collection_with_products(
  p_name text,
  p_slug text,
  p_description text,
  p_image_id uuid,
  p_status text,
  p_sort_order integer,
  p_seo_title text,
  p_meta_description text,
  p_canonical_url text,
  p_og_image_id uuid,
  p_robots text,
  p_keywords text,
  p_products jsonb
) returns jsonb as $$
declare
  v_collection_id uuid;
  v_item jsonb;
begin
  insert into collections (
    name, slug, description, image_id, status, sort_order,
    seo_title, meta_description, canonical_url, og_image_id, robots, keywords
  ) values (
    p_name, p_slug, p_description, p_image_id, p_status, p_sort_order,
    p_seo_title, p_meta_description, p_canonical_url, p_og_image_id, p_robots, p_keywords
  ) returning id into v_collection_id;

  if p_products is not null and jsonb_array_length(p_products) > 0 then
    for v_item in select * from jsonb_array_elements(p_products) loop
      insert into collection_products (collection_id, product_id, sort_order)
      values (v_collection_id, (v_item->>'product_id')::uuid, (v_item->>'sort_order')::integer);
    end loop;
  end if;

  return jsonb_build_object('id', v_collection_id);
end;
$$ language plpgsql security definer;

drop function if exists update_collection_with_products;
create or replace function update_collection_with_products(
  p_id uuid,
  p_name text,
  p_slug text,
  p_description text,
  p_image_id uuid,
  p_status text,
  p_sort_order integer,
  p_seo_title text,
  p_meta_description text,
  p_canonical_url text,
  p_og_image_id uuid,
  p_robots text,
  p_keywords text,
  p_products jsonb
) returns void as $$
declare
  v_item jsonb;
begin
  update collections set
    name = p_name,
    slug = p_slug,
    description = p_description,
    image_id = p_image_id,
    status = p_status,
    sort_order = p_sort_order,
    seo_title = p_seo_title,
    meta_description = p_meta_description,
    canonical_url = p_canonical_url,
    og_image_id = p_og_image_id,
    robots = p_robots,
    keywords = p_keywords,
    updated_at = now()
  where id = p_id;

  delete from collection_products where collection_id = p_id;

  if p_products is not null and jsonb_array_length(p_products) > 0 then
    for v_item in select * from jsonb_array_elements(p_products) loop
      insert into collection_products (collection_id, product_id, sort_order)
      values (p_id, (v_item->>'product_id')::uuid, (v_item->>'sort_order')::integer);
    end loop;
  end if;
end;
$$ language plpgsql security definer;
