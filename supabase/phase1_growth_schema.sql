-- ==========================================================
-- PHASE 1 GROWTH FEATURES
-- - Appointment attendance tracking
-- - Package management
-- - Financial tracking
-- - Blog posts
-- - Public site key integration
-- - Media storage bucket/policies
-- ==========================================================

-- Ensure UUID extension exists
create extension if not exists "uuid-ossp";

-- ------------------------------------------
-- Appointment attendance tracking
-- ------------------------------------------
alter table public.appointments
  add column if not exists attendance_status text not null default 'unknown'
    check (attendance_status in ('unknown', 'attended', 'not_attended'));

alter table public.appointments
  add column if not exists attendance_marked_at timestamp with time zone;

-- ------------------------------------------
-- Site config / public integration key
-- ------------------------------------------
create table if not exists public.dietitian_site_configs (
  dietitian_id uuid references public.dietitians(id) on delete cascade primary key,
  public_site_key text not null unique default replace(uuid_generate_v4()::text, '-', ''),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.dietitian_site_configs enable row level security;

drop policy if exists "Dietitians manage own site config" on public.dietitian_site_configs;
create policy "Dietitians manage own site config" on public.dietitian_site_configs
  for all using (auth.uid() = dietitian_id)
  with check (auth.uid() = dietitian_id);

-- ------------------------------------------
-- Packages
-- ------------------------------------------
create table if not exists public.packages (
  id uuid default uuid_generate_v4() primary key,
  dietitian_id uuid references public.dietitians(id) on delete cascade not null,
  title text not null,
  description text,
  session_count integer not null default 1 check (session_count > 0),
  price numeric not null default 0 check (price >= 0),
  currency text not null default 'TRY',
  is_public boolean not null default true,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_packages_dietitian_created_at
  on public.packages (dietitian_id, created_at desc);

alter table public.packages enable row level security;

drop policy if exists "Dietitians manage own packages" on public.packages;
create policy "Dietitians manage own packages" on public.packages
  for all using (auth.uid() = dietitian_id)
  with check (auth.uid() = dietitian_id);

-- ------------------------------------------
-- Financial transactions
-- ------------------------------------------
create table if not exists public.financial_transactions (
  id uuid default uuid_generate_v4() primary key,
  dietitian_id uuid references public.dietitians(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  category text,
  payment_method text,
  transaction_date date not null default current_date,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_financial_transactions_dietitian_date
  on public.financial_transactions (dietitian_id, transaction_date desc);

alter table public.financial_transactions enable row level security;

drop policy if exists "Dietitians manage own financial transactions" on public.financial_transactions;
create policy "Dietitians manage own financial transactions" on public.financial_transactions
  for all using (auth.uid() = dietitian_id)
  with check (auth.uid() = dietitian_id);

-- ------------------------------------------
-- Blog posts
-- ------------------------------------------
create table if not exists public.blog_posts (
  id uuid default uuid_generate_v4() primary key,
  dietitian_id uuid references public.dietitians(id) on delete cascade not null,
  title text not null,
  slug text,
  excerpt text,
  content_html text not null,
  cover_image_url text,
  is_public boolean not null default true,
  published_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists idx_blog_posts_dietitian_slug
  on public.blog_posts (dietitian_id, slug)
  where slug is not null;

create index if not exists idx_blog_posts_dietitian_published
  on public.blog_posts (dietitian_id, published_at desc);

alter table public.blog_posts enable row level security;

drop policy if exists "Dietitians manage own blog posts" on public.blog_posts;
create policy "Dietitians manage own blog posts" on public.blog_posts
  for all using (auth.uid() = dietitian_id)
  with check (auth.uid() = dietitian_id);

-- ------------------------------------------
-- Storage bucket for blog/media uploads
-- ------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dietitian-media',
  'dietitian-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read dietitian media" on storage.objects;
create policy "Public can read dietitian media" on storage.objects
  for select using (bucket_id = 'dietitian-media');

drop policy if exists "Dietitians can insert own media" on storage.objects;
create policy "Dietitians can insert own media" on storage.objects
  for insert with check (
    bucket_id = 'dietitian-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Dietitians can update own media" on storage.objects;
create policy "Dietitians can update own media" on storage.objects
  for update using (
    bucket_id = 'dietitian-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'dietitian-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Dietitians can delete own media" on storage.objects;
create policy "Dietitians can delete own media" on storage.objects
  for delete using (
    bucket_id = 'dietitian-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
