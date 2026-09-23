-- Migration 003: testimonials table (run after base schema.sql).
-- Run in Supabase Dashboard → SQL Editor.
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text default '',
  text text not null default '',
  rating int not null default 5,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table testimonials enable row level security;
drop policy if exists "public read" on testimonials;
drop policy if exists "admin write" on testimonials;
create policy "public read" on testimonials for select using (true);
create policy "admin write" on testimonials for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
