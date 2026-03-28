create table if not exists public.newsletter_subscribers (
  email text primary key,
  source text not null,
  status text not null default 'active',
  subscribed_at bigint not null,
  updated_at bigint not null,
  metadata_json text
);

alter table public.newsletter_subscribers enable row level security;

create policy "newsletter_subscribers_insert_anon"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (status = 'active');

create policy "newsletter_subscribers_update_anon"
  on public.newsletter_subscribers
  for update
  to anon, authenticated
  using (true)
  with check (status = 'active');
