# -- DOKANAI SUPABASE SCHEMA --
# Run this SQL script in your Supabase SQL Editor to set up the database tables

-- 1. Create Stores Table
create table if not exists public.stores (
  id text primary key,
  slug text unique not null,
  product_title text not null,
  price numeric not null,
  regular_price numeric,
  image_url text,
  theme_color text default 'emerald',
  config jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Orders Table
create table if not exists public.orders (
  id text primary key,
  store_slug text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  delivery_zone text default 'inside_dhaka',
  delivery_fee numeric default 70,
  total_price numeric not null,
  quantity integer default 1,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS) & Public Policies
alter table public.stores enable row level security;
alter table public.orders enable row level security;

-- Allow public read & write for demo/hackathon ease:
create policy "Allow public read stores" on public.stores for select using (true);
create policy "Allow public insert stores" on public.stores for insert with check (true);

create policy "Allow public read orders" on public.orders for select using (true);
create policy "Allow public insert orders" on public.orders for insert with check (true);
create policy "Allow public update orders" on public.orders for update using (true);
