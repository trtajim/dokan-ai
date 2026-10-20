-- ==============================================================================
-- DOKANAI CLEAN SLATE PRODUCTION DATABASE SCHEMA
-- WARNING: Running this script DROPS all existing DokanAI tables and recreates
-- them cleanly with full indexes, RLS policies, and real Supabase Auth triggers.
-- ==============================================================================

-- 1. Drop existing tables if they exist
drop table if exists public.orders cascade;
drop table if exists public.stores cascade;
drop table if exists public.profiles cascade;

-- 2. Drop existing triggers & functions
drop function if exists public.handle_new_user() cascade;

-- ==============================================================================
-- Table: public.profiles
-- User account settings, merchant identity, and telegram notifications
-- ==============================================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  telegram_chat_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- Table: public.stores
-- Merchant landing pages & online stores
-- ==============================================================================
create table public.stores (
  id text primary key,
  slug text unique not null,
  user_id uuid references auth.users(id) on delete cascade,
  product_title text not null,
  price numeric not null,
  regular_price numeric,
  image_url text,
  images jsonb default '[]'::jsonb,
  delivery_fee_inside numeric default 70,
  delivery_fee_outside numeric default 130,
  theme_color text default 'emerald',
  config jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast user store queries and slug routing
create index idx_stores_user_id on public.stores(user_id);
create index idx_stores_slug on public.stores(slug);

-- ==============================================================================
-- Table: public.orders
-- Customer orders placed on merchant storefronts
-- ==============================================================================
create table public.orders (
  id text primary key,
  store_slug text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  delivery_zone text default 'inside_dhaka',
  delivery_fee numeric default 70,
  total_price numeric not null,
  quantity integer default 1,
  selected_variant text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast orders lookup
create index idx_orders_store_slug on public.orders(store_slug);
create index idx_orders_created_at on public.orders(created_at desc);

-- ==============================================================================
-- Automatic Profile Creation on Supabase Auth SignUp
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute whenever a user signs up via auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- Row Level Security (RLS) & Policies
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.orders enable row level security;

-- Public can read store details (for customer landing pages)
create policy "Allow public read stores" on public.stores for select using (true);
create policy "Allow public insert stores" on public.stores for insert with check (true);
create policy "Allow public update stores" on public.stores for update using (true);
create policy "Allow public delete stores" on public.stores for delete using (true);

-- Public can place orders and read/update them
create policy "Allow public read orders" on public.orders for select using (true);
create policy "Allow public insert orders" on public.orders for insert with check (true);
create policy "Allow public update orders" on public.orders for update using (true);

-- Profiles policies
create policy "Allow public read profiles" on public.profiles for select using (true);
create policy "Allow public insert profiles" on public.profiles for insert with check (true);
create policy "Allow public update profiles" on public.profiles for update using (true);
