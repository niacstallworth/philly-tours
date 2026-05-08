alter table public.users enable row level security;
alter table public.payment_orders enable row level security;
alter table public.entitlements enable row level security;
alter table public.iap_receipts enable row level security;
alter table public.idempotency enable row level security;
alter table public.provider_events enable row level security;
alter table public.deletion_requests enable row level security;
alter table public.newsletter_subscribers enable row level security;

revoke all on table public.users from anon, authenticated;
revoke all on table public.payment_orders from anon, authenticated;
revoke all on table public.entitlements from anon, authenticated;
revoke all on table public.iap_receipts from anon, authenticated;
revoke all on table public.idempotency from anon, authenticated;
revoke all on table public.provider_events from anon, authenticated;
revoke all on table public.deletion_requests from anon, authenticated;
revoke all on table public.newsletter_subscribers from anon, authenticated;

drop policy if exists newsletter_subscribers_insert_anon on public.newsletter_subscribers;
drop policy if exists newsletter_subscribers_update_anon on public.newsletter_subscribers;
drop policy if exists newsletter_subscribers_insert_authenticated on public.newsletter_subscribers;
drop policy if exists newsletter_subscribers_update_authenticated on public.newsletter_subscribers;
