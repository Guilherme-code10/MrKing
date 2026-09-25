-- Mr.King V6 — banco online (Supabase)
create extension if not exists pgcrypto;

-- Usuários autorizados a administrar a loja.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin can read own role" on public.admin_users;
create policy "admin can read own role"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  price text not null default 'Consulte',
  sizes text not null default 'Consulte',
  category text not null default 'Outros',
  image_url text not null default '',
  try_on boolean not null default true,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  whatsapp text,
  product_id uuid references public.products(id) on delete set null,
  product_title text,
  event_type text not null default 'interest',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  product_id uuid references public.products(id) on delete set null,
  product_title text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.leads enable row level security;
alter table public.site_events enable row level security;

drop policy if exists "public read published products" on public.products;
create policy "public read published products"
on public.products for select
to anon, authenticated
using (published = true);

drop policy if exists "admin read all products" on public.products;
create policy "admin read all products"
on public.products for select
to authenticated
using (public.is_admin());

drop policy if exists "admin insert products" on public.products;
create policy "admin insert products"
on public.products for insert
to authenticated
with check (public.is_admin());

drop policy if exists "admin update products" on public.products;
create policy "admin update products"
on public.products for update
to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin delete products" on public.products;
create policy "admin delete products"
on public.products for delete
to authenticated
using (public.is_admin());

drop policy if exists "public create leads" on public.leads;
create policy "public create leads"
on public.leads for insert
to anon, authenticated
with check (true);

drop policy if exists "admin read leads" on public.leads;
create policy "admin read leads"
on public.leads for select
to authenticated
using (public.is_admin());

drop policy if exists "public create events" on public.site_events;
create policy "public create events"
on public.site_events for insert
to anon, authenticated
with check (true);

drop policy if exists "admin read events" on public.site_events;
create policy "admin read events"
on public.site_events for select
to authenticated
using (public.is_admin());

insert into public.products (title,description,price,sizes,category,image_url,try_on)
select * from (values
('Camiseta Lisa','Plus size masculino. Consulte cores e tamanhos.','R$ 49,90','G1 a GG10','Camisetas','assets/feed-1.jpg',true),
('Bermuda Plus Size','Consulte cores, modelos e disponibilidade.','R$ 59,90','Consulte','Bermudas','assets/feed-2.jpg',true),
('Moletom Plus Size','Modelo liso, confortável.','R$ 129,90','Consulte','Moletom','assets/feed-3.jpg',true)
) as v(title,description,price,sizes,category,image_url,try_on)
where not exists (select 1 from public.products);

-- Armazenamento público das fotos dos produtos.
insert into storage.buckets (id,name,public)
values ('products','products',true)
on conflict (id) do update set public=true;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'products' and public.is_admin());

drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images"
on storage.objects for update to authenticated
using (bucket_id = 'products' and public.is_admin()) with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images"
on storage.objects for delete to authenticated
using (bucket_id = 'products');
