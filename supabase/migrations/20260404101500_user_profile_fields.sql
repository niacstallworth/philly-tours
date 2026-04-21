alter table public.users add column if not exists email text;
alter table public.users add column if not exists display_name text;
alter table public.users add column if not exists auth_provider text;
alter table public.users add column if not exists last_seen_at bigint;
alter table public.users add column if not exists updated_at bigint;

create unique index if not exists users_email_idx
  on public.users (email)
  where email is not null;
