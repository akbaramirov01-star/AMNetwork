-- AM Network — matching platform (v1, 24 Nov 2026)
-- Run in Supabase → SQL Editor AFTER schema.sql. Additive: it never deletes data, safe to re-run.
--
-- What it adds
--  • requests from the public form (/apply/) land here through our backend, which holds a shared
--    secret (amn_settings 'svc_secret'); the browser never writes to these tables directly
--  • an AI review per request (a hint: Zakat category under 9:60, what to verify, red flags)
--  • a feed of requests for givers (charities/donors) that the admin approved — WITHOUT names,
--    phones, emails or addresses; phone numbers and emails inside the story are masked
--  • "I want to help" offers: AM Network connects the giver and the applicant by hand
-- Every request in the feed is labelled "Not verified by AM Network".

create table if not exists public.amn_settings (key text primary key, value text not null);
alter table public.amn_settings enable row level security;
revoke all on public.amn_settings from anon, authenticated;

-- ── requests: extra columns ──
alter table public.applications add column if not exists country          text check (country ~ '^[A-Z]{2}$');
alter table public.applications add column if not exists email            text check (char_length(email) <= 160);
alter table public.applications add column if not exists monthly_expenses numeric check (monthly_expenses >= 0 and monthly_expenses < 100000000);
alter table public.applications add column if not exists needs            text[] not null default '{}' check (cardinality(needs) <= 12);
alter table public.applications add column if not exists months_in_need   int check (months_in_need between 0 and 600);
alter table public.applications add column if not exists show_first_name  boolean not null default false;
alter table public.applications add column if not exists lang             text check (lang ~ '^[a-z]{2}$');
alter table public.applications add column if not exists source           text not null default 'cabinet' check (source in ('cabinet','web'));
alter table public.applications add column if not exists listed           boolean not null default false;  -- admin shows it to givers
alter table public.applications add column if not exists ai_review        jsonb;
alter table public.applications add column if not exists ai_state         text check (ai_state in ('pending','done','failed'));
alter table public.applications add column if not exists ai_at            timestamptz;
-- Any currency now (requests come from every country); monthly income was capped for TJS amounts.
alter table public.applications drop constraint if exists applications_currency_check;
alter table public.applications add  constraint applications_currency_check check (currency ~ '^[A-Z]{3}$');
alter table public.applications drop constraint if exists applications_monthly_income_check;
alter table public.applications add  constraint applications_monthly_income_check check (monthly_income >= 0 and monthly_income < 100000000);

-- Payouts in any currency too.
alter table public.payouts drop constraint if exists payouts_currency_check;
alter table public.payouts add  constraint payouts_currency_check check (currency ~ '^[A-Z]{3}$');

-- Non-admins cannot set the review, the listing or the source themselves.
create or replace function public.amn_app_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(current_setting('amn.svc', true), '') = '1' or public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.ai_review := null; new.ai_state := null; new.ai_at := null; new.listed := false; new.source := 'cabinet';
  else
    new.ai_review := old.ai_review; new.ai_state := old.ai_state; new.ai_at := old.ai_at;
    new.listed := old.listed; new.source := old.source;
  end if;
  return new;
end $$;
drop trigger if exists amn_app_guard on public.applications;
create trigger amn_app_guard before insert or update on public.applications
  for each row execute function public.amn_app_guard();

-- ── givers ──
alter table public.profiles add column if not exists giver_approved boolean not null default false;
alter table public.profiles add column if not exists org_name text check (char_length(org_name) <= 160);
grant update (org_name) on public.profiles to authenticated;

create or replace function public.is_giver() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and (role = 'admin' or giver_approved))
$$;

create or replace function public.set_giver(target uuid, approved boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  update public.profiles set giver_approved = approved,
         role = case when approved and role = 'applicant' then 'donor' else role end
   where id = target;
end $$;

-- ── service calls from our backend (shared secret) ──
create or replace function public.amn_svc(p_secret text) returns boolean
language plpgsql security definer set search_path = public as $$
declare s text;
begin
  select value into s from public.amn_settings where key = 'svc_secret';
  if s is null or char_length(s) < 24 or p_secret is null or p_secret <> s then
    raise exception 'not allowed';
  end if;
  perform set_config('amn.svc', '1', true);
  return true;
end $$;
revoke execute on function public.amn_svc(text) from public, anon, authenticated;

-- Mask phone numbers and emails a person typed into their story.
create or replace function public.amn_mask(t text) returns text
language sql immutable as $$
  select regexp_replace(regexp_replace(coalesce(t, ''),
         '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[…]', 'g'),
         '\+?[0-9][0-9 ()\-]{6,}[0-9]', '[…]', 'g')
$$;

-- Public form → a request. Called only by the backend.
create or replace function public.intake_request(p_secret text, p jsonb)
returns table (id uuid, ref text)
language plpgsql security definer set search_path = public as $$
declare r public.applications;
begin
  perform public.amn_svc(p_secret);
  insert into public.applications (full_name, email, region, country, household_size, dependents,
      monthly_income, monthly_expenses, currency, categories, needs, months_in_need, situation,
      show_first_name, lang, consent, source)
  values (left(coalesce(nullif(trim(p->>'name'), ''), 'Anonymous'), 120),
          nullif(left(trim(p->>'email'), 160), ''),
          left(coalesce(nullif(trim(p->>'city'), ''), '—'), 80),
          nullif(upper(p->>'country'), ''),
          nullif(p->>'members', '')::int, nullif(p->>'children', '')::int,
          nullif(p->>'income', '')::numeric, nullif(p->>'expenses', '')::numeric,
          coalesce(nullif(upper(p->>'currency'), ''), 'USD'),
          coalesce(array(select jsonb_array_elements_text(p->'categories')), '{}'),
          coalesce(array(select jsonb_array_elements_text(p->'needs')), '{}'),
          nullif(p->>'months', '')::int,
          left(p->>'story', 3000),
          coalesce((p->>'show_first_name')::boolean, false),
          nullif(p->>'lang', ''), true, 'web')
  returning * into r;
  return query select r.id, r.ref;
end $$;

-- The backend asks for the data to review. No name, email, phone or address leaves here,
-- and the story is masked. At most `ai_daily_cap` reviews a day (default 30) — kept in the
-- database, so a redeploy of the backend cannot reset it.
create or replace function public.claim_review(p_secret text, p_id uuid, p_force boolean default false)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.applications; cap int; n int;
begin
  perform public.amn_svc(p_secret);
  perform pg_advisory_xact_lock(616161);
  select * into a from public.applications where applications.id = p_id for update;
  if not found then raise exception 'not found'; end if;
  if a.ai_state = 'done' and not p_force then return null; end if;
  if a.ai_state = 'pending' and a.ai_at > now() - interval '3 minutes' then return null; end if;
  cap := coalesce((select nullif(regexp_replace(value, '[^0-9]', '', 'g'), '')::int
                     from public.amn_settings where key = 'ai_daily_cap'), 30);
  select count(*) into n from public.applications where ai_at > now() - interval '1 day';
  if n >= cap then raise exception 'daily cap reached'; end if;
  update public.applications set ai_state = 'pending', ai_at = now() where applications.id = p_id;
  return jsonb_build_object('ref', a.ref, 'country', a.country, 'city', a.region,
    'household_size', a.household_size, 'children_or_dependents', a.dependents,
    'monthly_income', a.monthly_income, 'monthly_expenses', a.monthly_expenses, 'currency', a.currency,
    'categories', a.categories, 'needs', a.needs, 'months_in_need', a.months_in_need,
    'story', public.amn_mask(a.situation), 'applicant_language', a.lang);
end $$;

create or replace function public.save_review(p_secret text, p_id uuid, p_review jsonb, p_ok boolean)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.amn_svc(p_secret);
  update public.applications
     set ai_review = case when p_ok then p_review else ai_review end,
         ai_state  = case when p_ok then 'done' else 'failed' end
   where id = p_id;
end $$;

-- A signed-in person may ask for a review of their own request; the admin of any request.
create or replace function public.can_review(p_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.applications a where a.id = p_id
                 and (a.created_by = auth.uid() or public.is_admin()))
$$;

revoke execute on function public.intake_request(text, jsonb), public.claim_review(text, uuid, boolean),
                           public.save_review(text, uuid, jsonb, boolean) from public, authenticated;
grant  execute on function public.intake_request(text, jsonb), public.claim_review(text, uuid, boolean),
                           public.save_review(text, uuid, jsonb, boolean) to anon;   -- the secret is the lock
revoke execute on function public.can_review(uuid), public.is_giver(), public.set_giver(uuid, boolean) from public, anon;
grant  execute on function public.can_review(uuid), public.is_giver(), public.set_giver(uuid, boolean) to authenticated;

-- ── the givers' feed ──
create or replace function public.open_requests()
returns table (id uuid, ref text, first_name text, country text, region text, household_size int,
               dependents int, monthly_income numeric, monthly_expenses numeric, currency text,
               categories text[], needs text[], months_in_need int, story text, ai_review jsonb,
               created_at timestamptz, offers int, my_offer boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_giver() then raise exception 'givers only'; end if;
  return query
    select a.id, a.ref,
           case when a.show_first_name then split_part(trim(a.full_name), ' ', 1) end,
           a.country, a.region, a.household_size, a.dependents, a.monthly_income, a.monthly_expenses,
           a.currency, a.categories, a.needs, a.months_in_need, public.amn_mask(a.situation),
           a.ai_review, a.created_at,
           (select count(*)::int from public.offers o where o.application_id = a.id),
           exists (select 1 from public.offers o where o.application_id = a.id and o.giver_id = auth.uid())
      from public.applications a
     where a.listed and a.status not in ('rejected','paid')
     order by a.created_at desc;
end $$;

-- ── "I want to help" ──
create table if not exists public.offers (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  giver_id       uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  message        text check (char_length(message) <= 1000),
  status         text not null default 'new' check (status in ('new','connected','helped','closed')),
  created_at     timestamptz not null default now(),
  unique (application_id, giver_id)
);
alter table public.offers enable row level security;
drop policy if exists offers_read on public.offers;
create policy offers_read on public.offers for select to authenticated using (giver_id = auth.uid() or public.is_admin());
drop policy if exists offers_admin_update on public.offers;
create policy offers_admin_update on public.offers for update to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.offers from anon, authenticated;
grant select, update on public.offers to authenticated;

create or replace function public.make_offer(p_id uuid, p_message text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_giver() then raise exception 'givers only'; end if;
  if not exists (select 1 from public.applications where id = p_id and listed and status not in ('rejected','paid')) then
    raise exception 'not open';
  end if;
  insert into public.offers (application_id, giver_id, message) values (p_id, auth.uid(), left(p_message, 1000))
  on conflict (application_id, giver_id) do update set message = excluded.message;
end $$;
revoke execute on function public.make_offer(uuid, text), public.open_requests() from public, anon;
grant  execute on function public.make_offer(uuid, text), public.open_requests() to authenticated;

-- Admin: offers with who made them, to connect people by hand.
create or replace function public.list_offers()
returns table (id uuid, application_id uuid, ref text, giver_email text, giver_name text, org_name text,
               message text, status text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  return query select o.id, o.application_id, a.ref, p.email, p.full_name, p.org_name, o.message, o.status, o.created_at
                 from public.offers o join public.applications a on a.id = o.application_id
                 join public.profiles p on p.id = o.giver_id order by o.created_at desc;
end $$;
revoke execute on function public.list_offers() from public, anon;
grant  execute on function public.list_offers() to authenticated;

-- list_staff with giver flags (admin).
drop function if exists public.list_staff();
create function public.list_staff()
returns table (id uuid, email text, full_name text, role text, city text, phone text, created_at timestamptz,
               giver_approved boolean, org_name text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  return query select p.id, p.email, p.full_name, p.role, p.city, p.phone, p.created_at, p.giver_approved, p.org_name
                 from public.profiles p order by p.created_at;
end $$;
revoke execute on function public.list_staff() from public, anon;
grant  execute on function public.list_staff() to authenticated;

-- Public numbers for the homepage (no personal data).
create or replace function public.match_stats()
returns table (requests int, countries int, listed int, givers int, offers int)
language sql stable security definer set search_path = public as $$
  select (select count(*)::int from public.applications),
         (select count(distinct country)::int from public.applications where country is not null),
         (select count(*)::int from public.applications where listed and status not in ('rejected','paid')),
         (select count(*)::int from public.profiles where giver_approved),
         (select count(*)::int from public.offers)
$$;
grant execute on function public.match_stats() to anon, authenticated;
