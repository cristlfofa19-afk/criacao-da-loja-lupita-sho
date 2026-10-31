create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.store_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 80),
  subcategories text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 150),
  price numeric(12,2) not null default 0 check (price >= 0),
  media_url text,
  description text not null default '',
  category_id uuid references public.store_categories(id) on delete set null,
  subcategory text,
  active boolean not null default true,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists store_items_category_idx on public.store_items(category_id);

create table if not exists public.store_coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percent' check (discount_type in ('percent','fixed')),
  value numeric(12,2) not null default 0 check (value >= 0),
  category text not null default 'Todas',
  product_id uuid references public.store_items(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_cashback_rules (
  id uuid primary key default gen_random_uuid(),
  percent numeric(5,2) not null default 0 check (percent >= 0),
  category text not null default 'Todas',
  product_id uuid references public.store_items(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  kind text not null default 'novidade',
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id boolean primary key default true check (id),
  store_name text not null default '',
  whatsapp text not null default '',
  logo_url text not null default '',
  hero_title text not null default '',
  hero_text text not null default '',
  hero_media_url text not null default '',
  hero_media_type text not null default 'image',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_payment_settings (
  id boolean primary key default true check (id),
  pix jsonb not null default '{}',
  credit jsonb not null default '{}',
  debit jsonb not null default '{}',
  paypal jsonb not null default '{}',
  boleto jsonb not null default '{}',
  whatsapp jsonb not null default '{}',
  cashback jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_store_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users a where a.user_id = auth.uid());
$$;

do $$
declare t text;
begin
  foreach t in array array['admin_users','store_categories','store_items','store_coupons','store_cashback_rules','store_announcements','store_settings','store_payment_settings']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s_admin_all" on public.%I', t, t);
    execute format('create policy "%s_admin_all" on public.%I for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin())', t, t);
  end loop;
end $$;

drop policy if exists "store_items_public_read" on public.store_items;
create policy "store_items_public_read" on public.store_items for select to anon, authenticated using (active and published);
drop policy if exists "store_categories_public_read" on public.store_categories;
create policy "store_categories_public_read" on public.store_categories for select to anon, authenticated using (active);
drop policy if exists "store_announcements_public_read" on public.store_announcements;
create policy "store_announcements_public_read" on public.store_announcements for select to anon, authenticated using (active);
drop policy if exists "store_settings_public_read" on public.store_settings;
create policy "store_settings_public_read" on public.store_settings for select to anon, authenticated using (true);
drop policy if exists "store_payment_settings_public_read" on public.store_payment_settings;
create policy "store_payment_settings_public_read" on public.store_payment_settings for select to anon, authenticated using (true);

notify pgrst, 'reload schema';
