-- Migration 002: multi-image gallery for products.
-- Run in Supabase Dashboard → SQL Editor (after the base schema.sql).
alter table products
  add column if not exists images jsonb not null default '[]';
