-- Create a dummy admin user in auth.users
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@meridian.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
) on conflict (id) do nothing;

-- Insert into admin_profiles
insert into public.admin_profiles (id, full_name, role)
values ('00000000-0000-0000-0000-000000000000', 'Meridian Admin', 'admin')
on conflict (id) do nothing;

-- Insert a collection
insert into public.collections (id, name, slug, description, status, sort_order)
values (
  '11111111-1111-1111-1111-111111111111', 
  'Precision Machining Series', 
  'precision-machining-series', 
  'High precision CNC centers.', 
  'published', 
  1
)
on conflict (id) do nothing;

-- Insert a product
insert into public.products (id, name, slug, sku, short_description, category, status, sort_order)
values (
  '22222222-2222-2222-2222-222222222222',
  'CNC Machining Center',
  'cnc-machining-center',
  'CNC-100',
  'A reliable machining center.',
  'CNC',
  'published',
  1
)
on conflict (id) do nothing;

-- Link product to collection
insert into public.collection_products (collection_id, product_id, sort_order)
values ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1)
on conflict (collection_id, product_id) do nothing;

-- Insert a blog post
insert into public.blogs (id, title, slug, excerpt, content, status, published_at)
values (
  '33333333-3333-3333-3333-333333333333',
  'The Future of Manufacturing',
  'future-of-manufacturing',
  'An excerpt about manufacturing.',
  '<p>Some content about manufacturing.</p>',
  'published',
  now()
)
on conflict (id) do nothing;

-- Populate pages SEO overrides
insert into public.pages (route_key, seo_title, meta_description)
values 
  ('home', 'Meridian Home', 'Home description'),
  ('about', 'About Meridian', 'About description'),
  ('contact', 'Contact Us', 'Contact description'),
  ('privacy-policy', 'Privacy Policy', 'Privacy description'),
  ('terms-and-conditions', 'Terms & Conditions', 'Terms description')
on conflict (route_key) do nothing;
