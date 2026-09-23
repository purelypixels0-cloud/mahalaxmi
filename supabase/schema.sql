-- ============================================================
-- Mahalaxmi Jewellery CMS schema (Supabase / Postgres)
-- Run once in Supabase Dashboard → SQL Editor.
-- Public can READ everything; only logged-in admins can WRITE.
-- ============================================================

-- ---------- helpers ----------
create extension if not exists "pgcrypto";

-- ---------- categories ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  image_url text default '',
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- products ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references categories(id) on delete set null,
  price numeric not null default 0,
  weight text default '',
  purity text default '',
  making_charge text default '',
  description text default '',
  details jsonb not null default '[]',
  image_url text default '',
  images jsonb not null default '[]',
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- collections ----------
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  story text default '',
  image_url text default '',
  pieces int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists collection_pieces (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  name text not null,
  price numeric not null default 0,
  image_url text default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- schemes ----------
create table if not exists schemes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text default '',
  duration_months int not null default 12,
  bonus_percentage numeric not null default 0,
  min_installment numeric not null default 0,
  benefits jsonb not null default '[]',
  terms jsonb not null default '[]',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- journal posts ----------
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text default '',
  content text default '',
  category text default '',
  author text default '',
  read_time text default '',
  publish_date date,
  image_url text default '',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- team ----------
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text default '',
  era text default '',
  image_url text default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- faqs (section = 'home' | 'schemes') ----------
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  section text not null default 'home',
  question text not null,
  answer text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- testimonials ----------
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text default '',
  text text not null default '',
  rating int not null default 5,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- homepage key-value content ----------
create table if not exists homepage_content (
  key text primary key,
  value jsonb not null default '{}'
);

-- ---------- site settings key-value ----------
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'
);

-- ---------- RLS: public read, admin write ----------
alter table categories enable row level security;
alter table products enable row level security;
alter table collections enable row level security;
alter table collection_pieces enable row level security;
alter table schemes enable row level security;
alter table posts enable row level security;
alter table team_members enable row level security;
alter table faqs enable row level security;
alter table testimonials enable row level security;
alter table homepage_content enable row level security;
alter table site_settings enable row level security;

-- drop in case of re-run, then recreate
do $$
declare t text;
begin
  foreach t in array array['categories','products','collections','collection_pieces','schemes','posts','team_members','faqs','testimonials','homepage_content','site_settings']
  loop
    execute format('drop policy if exists "public read" on %I', t);
    execute format('drop policy if exists "admin write" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "admin write" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')', t);
  end loop;
end $$;

-- ---------- image storage ----------
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

drop policy if exists "public read images" on storage.objects;
drop policy if exists "admin write images" on storage.objects;
create policy "public read images" on storage.objects
  for select using (bucket_id = 'site-images');
create policy "admin write images" on storage.objects
  for all using (bucket_id = 'site-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'site-images' and auth.role() = 'authenticated');
