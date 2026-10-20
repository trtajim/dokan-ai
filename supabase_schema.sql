-- ==============================================================================
-- DOKANAI CLEAN SLATE PRODUCTION DATABASE SCHEMA & SEEDER
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
  courier_data jsonb default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- Row Level Security (RLS) & Policies
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.orders enable row level security;

create policy "Allow public read stores" on public.stores for select using (true);
create policy "Allow public insert stores" on public.stores for insert with check (true);
create policy "Allow public update stores" on public.stores for update using (true);
create policy "Allow public delete stores" on public.stores for delete using (true);

create policy "Allow public read orders" on public.orders for select using (true);
create policy "Allow public insert orders" on public.orders for insert with check (true);
create policy "Allow public update orders" on public.orders for update using (true);

create policy "Allow public read profiles" on public.profiles for select using (true);
create policy "Allow public insert profiles" on public.profiles for insert with check (true);
create policy "Allow public update profiles" on public.profiles for update using (true);

-- ==============================================================================
-- SEEDER: Official Demo Store for demo@dokan.ai
-- ==============================================================================
do $$
declare
  demo_user_id uuid;
begin
  -- Look up real user id for demo@dokan.ai from auth.users
  select id into demo_user_id from auth.users where email = 'demo@dokan.ai' limit 1;

  if demo_user_id is not null then
    -- Ensure profile exists
    insert into public.profiles (id, email, full_name, created_at, updated_at)
    values (demo_user_id, 'demo@dokan.ai', 'ডেমো মার্চেন্ট', now(), now())
    on conflict (id) do nothing;

    -- Seed 1 realistic smartwatch store under the demo user
    insert into public.stores (
      id,
      slug,
      user_id,
      product_title,
      price,
      regular_price,
      image_url,
      images,
      delivery_fee_inside,
      delivery_fee_outside,
      theme_color,
      config,
      created_at,
      updated_at
    )
    values (
      'store_demo_smartwatch',
      't900-ultra-smartwatch',
      demo_user_id,
      'T900 Ultra 2 Max Smartwatch (অরিজিনাল)',
      1350,
      2200,
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
      '["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"]'::jsonb,
      70,
      130,
      'emerald',
      '{
        "headline": "প্রিমিয়াম ব্লুটুথ কলিং ও ফুল ওয়াটারপ্রুফ স্মার্টওয়াচ",
        "subheadline": "২.০৯ ইঞ্চি ফুল এইচডি ডিসপ্লে, ২ দিনের ব্যাটারি লাইফ এবং প্রিমিয়াম মেটালিক ডিজাইন সহ প্রিমিয়াম কোয়ালিটি ওয়াচ।",
        "urgency_text": "🔥 অফারটি সীমিত সময়ের জন্য! ক্যাশ অন ডেলিভারিতে অর্ডার করুন!",
        "stock": 14,
        "variants": [
          {"name": "Black (কালো স্ট্র্যাপ)", "price": 1350},
          {"name": "Orange (কমলা স্ট্র্যাপ)", "price": 1350},
          {"name": "Silver (সিলভার মেটাল)", "price": 1450}
        ],
        "trust_badges": [
          "ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ)",
          "৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি",
          "১০০% অরিজিনাল প্রোডাক্ট"
        ],
        "features": [
          {
            "title": "সরাসরি কল রিসিভ ও ডায়াল",
            "desc": "বিল্ট-ইন স্পিকার ও মাইক্রোফোন থাকায় ফোন পকেটে রেখেই যেকোনো কল কথা বলুন পরিষ্কারভাবে।"
          },
          {
            "title": "ফুল টাচ ২.০৯\" বিগ ডিসপ্লে",
            "desc": "ক্রিস্টাল ক্লিয়ার সুপার ব্রাইট বেজেল-লেস ডিসপ্লে যা সরাসরি রোদের আলোতেও পরিষ্কার দেখা যায়।"
          }
        ],
        "faqs": [
          {
            "q": "আমি কি পণ্য চেক করে টাকা দিতে পারব?",
            "a": "হ্যাঁ, সম্পূর্ণ ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। ডেলিভারি ম্যানের সামনে প্যাকেট খুলে চেক করে টাকা পরিশোধ করবেন।"
          }
        ],
        "testimonials": [
          {
            "name": "তানভীর আহমেদ",
            "location": "মিরপুর, ঢাকা",
            "comment": "কালকে অর্ডার করেছিলাম আজকেই ডেলিভারি পেলাম! ওয়াচটির ডিসপ্লে আর কলিং কোয়ালিটি সত্যি দারুণ।"
          }
        ]
      }'::jsonb,
      now(),
      now()
    )
    on conflict (slug) do update set
      user_id = excluded.user_id,
      product_title = excluded.product_title,
      price = excluded.price,
      updated_at = now();

    -- Seed 1 sample pending order for demo testing
    insert into public.orders (
      id,
      store_slug,
      customer_name,
      customer_phone,
      customer_address,
      delivery_zone,
      delivery_fee,
      total_price,
      quantity,
      selected_variant,
      status,
      created_at
    )
    values (
      'ord_sample_demo_1',
      't900-ultra-smartwatch',
      'কিবরিয়া হাসান',
      '01711223344',
      'হাউজ #১২, রোড #৪, ধানমন্ডি, ঢাকা',
      'inside_dhaka',
      70,
      1420,
      1,
      'Black (কালো স্ট্র্যাপ)',
      'pending',
      now()
    )
    on conflict (id) do nothing;
  end if;
end $$;
