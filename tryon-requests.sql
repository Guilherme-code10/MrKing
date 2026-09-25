-- Mr.King — solicitações do provador manual

create table if not exists public.tryon_requests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_title text not null,
  whatsapp text not null,
  photo_path text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tryon_requests enable row level security;

drop policy if exists "public create tryon requests"
on public.tryon_requests;

create policy "public create tryon requests"
on public.tryon_requests
for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "admin read tryon requests"
on public.tryon_requests;

create policy "admin read tryon requests"
on public.tryon_requests
for select
to authenticated
using (public.is_admin());

drop policy if exists "admin update tryon requests"
on public.tryon_requests;

create policy "admin update tryon requests"
on public.tryon_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Bucket PRIVADO para fotos enviadas pelos clientes.
insert into storage.buckets (id, name, public)
values ('tryon-photos', 'tryon-photos', false)
on conflict (id) do update set public = false;

-- Cliente pode enviar uma foto.
drop policy if exists "public upload tryon photos"
on storage.objects;

create policy "public upload tryon photos"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'tryon-photos');

-- Somente usuário autenticado pode visualizar.
drop policy if exists "admin read tryon photos"
on storage.objects;

create policy "admin read tryon photos"
on storage.objects
for select
to authenticated
using (bucket_id = 'tryon-photos' and public.is_admin());

-- Somente usuário autenticado pode excluir.
drop policy if exists "admin delete tryon photos"
on storage.objects;

create policy "admin delete tryon photos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'tryon-photos');
