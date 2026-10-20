-- Add user ownership and custom delivery fee support to stores table
alter table public.stores add column if not exists user_id text default 'guest';
alter table public.stores add column if not exists delivery_fee_inside numeric default 70;
alter table public.stores add column if not exists delivery_fee_outside numeric default 130;
alter table public.stores add column if not exists images jsonb default '[]'::jsonb;

-- Allow update policy for store editing
create policy "Allow public update stores" on public.stores for update using (true);
