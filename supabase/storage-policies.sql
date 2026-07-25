-- Create the 'media' bucket
insert into storage.buckets (id, name, public) 
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public read access
create policy "Public Access" 
  on storage.objects for select 
  using ( bucket_id = 'media' );

-- Admin insert access
create policy "Admin Upload Access" 
  on storage.objects for insert 
  with check ( 
    bucket_id = 'media' 
    and auth.uid() in (select id from public.admin_profiles)
  );

-- Admin update access
create policy "Admin Update Access" 
  on storage.objects for update 
  using ( 
    bucket_id = 'media' 
    and auth.uid() in (select id from public.admin_profiles)
  );

-- Admin delete access
create policy "Admin Delete Access" 
  on storage.objects for delete 
  using ( 
    bucket_id = 'media' 
    and auth.uid() in (select id from public.admin_profiles)
  );
