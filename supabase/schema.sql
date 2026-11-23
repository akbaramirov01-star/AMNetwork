-- AM Network — pilot database (v1, November 2026)
-- Paste the whole file into Supabase → SQL Editor → New query → Run.
-- Safe to re-run: it drops and recreates only AM Network objects.
--
-- Model: AM Network never holds money. A family applies, a verifier visits in person,
-- the admin approves, the donor pays the family directly, the admin records the payout,
-- and the payout appears in a public, hash-chained log with no personal data.

-- ───────────────────────── clean re-run ─────────────────────────
drop trigger if exists amn_on_auth_user_created on auth.users;
drop table if exists public.offers, public.deeds, public.events, public.payouts, public.verifications, public.applications, public.profiles cascade;
drop sequence if exists public.app_ref_seq;
drop function if exists public.amn_handle_new_user, public.my_role, public.is_admin, public.amn_app_before,
  public.amn_app_after, public.amn_ver_after, public.amn_pay_before, public.amn_pay_after,
  public.set_role, public.public_payouts, public.public_stats, public.my_payouts, public.list_staff cascade;

-- ───────────────────────── people & roles ─────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text check (char_length(full_name) <= 120),
  phone      text check (char_length(phone) <= 40),
  city       text check (char_length(city) <= 80),
  role       text not null default 'applicant' check (role in ('applicant','donor','verifier','admin')),
  created_at timestamptz not null default now()
);

create function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

create function public.amn_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, left(coalesce(new.raw_user_meta_data->>'full_name', ''), 120))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger amn_on_auth_user_created after insert on auth.users
  for each row execute function public.amn_handle_new_user();
-- Re-run safety: give every existing account a profile again.
insert into public.profiles (id, email, full_name)
  select id, email, left(coalesce(raw_user_meta_data->>'full_name', ''), 120) from auth.users
  on conflict (id) do nothing;

-- Only an admin changes roles.
create function public.set_role(target uuid, new_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  if new_role not in ('applicant','donor','verifier','admin') then raise exception 'bad role'; end if;
  if target = auth.uid() and new_role <> 'admin' then raise exception 'you cannot remove your own admin role'; end if;
  update public.profiles set role = new_role where id = target;
end $$;

-- ───────────────────────── applications ─────────────────────────
create sequence public.app_ref_seq;
create table public.applications (
  id             uuid primary key default gen_random_uuid(),
  ref            text unique not null default ('AMN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.app_ref_seq')::text, 4, '0')),
  created_by     uuid references public.profiles(id) on delete set null default auth.uid(),
  full_name      text not null check (char_length(full_name) between 2 and 120),
  phone          text check (char_length(phone) <= 40),
  region         text not null check (char_length(region) between 2 and 80),   -- city / district, shown publicly
  address        text check (char_length(address) <= 200),                      -- private
  household_size int  check (household_size between 1 and 30),
  dependents     int  check (dependents between 0 and 30),
  monthly_income numeric check (monthly_income >= 0 and monthly_income < 10000000),
  currency       text not null default 'TJS' check (currency in ('TJS','USD','EUR','RUB')),
  categories     text[] not null default '{}' check (cardinality(categories) <= 15),
  situation      text check (char_length(situation) <= 3000),
  consent        boolean not null check (consent),
  status         text not null default 'new' check (status in ('new','assigned','verified','rejected','approved','paid')),
  assigned_to    uuid references public.profiles(id) on delete set null,
  need_score     int check (need_score between 0 and 100),
  admin_note     text check (char_length(admin_note) <= 2000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create function public.amn_app_before() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if not public.is_admin() then
      new.created_by := auth.uid(); new.status := 'new'; new.assigned_to := null;
      new.need_score := null; new.admin_note := null;
    end if;
    return new;
  end if;
  new.updated_at := now();
  new.ref := old.ref; new.created_by := old.created_by; new.created_at := old.created_at;
  if new.assigned_to is distinct from old.assigned_to and new.assigned_to is not null then
    if not exists (select 1 from public.profiles where id = new.assigned_to and role in ('verifier','admin')) then
      raise exception 'assignee must be a verifier';
    end if;
    if new.assigned_to = old.created_by and not exists (select 1 from public.profiles where id = new.assigned_to and role = 'admin') then
      raise exception 'the person who brought the family cannot verify it';
    end if;
    if new.status = 'new' then new.status := 'assigned'; end if;
  end if;
  if new.status = 'approved' and old.status <> 'approved'
     and not exists (select 1 from public.verifications v where v.application_id = new.id and v.recommendation = 'approve') then
    raise exception 'approval needs at least one in-person verification recommending approval';
  end if;
  if new.status = 'paid' and old.status <> 'paid' and coalesce(current_setting('amn.internal', true), '') <> '1' then
    raise exception 'status "paid" is set only by recording a payout';
  end if;
  return new;
end $$;
create trigger amn_app_before before insert or update on public.applications
  for each row execute function public.amn_app_before();

-- ───────────────────────── in-person verifications ─────────────────────────
create table public.verifications (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  verifier_id    uuid not null references public.profiles(id) default auth.uid(),
  visited_on     date not null default current_date,
  checks         jsonb not null default '{}'::jsonb,
  need_score     int check (need_score between 0 and 100),
  recommendation text not null check (recommendation in ('approve','reject')),
  notes          text check (char_length(notes) <= 4000),
  created_at     timestamptz not null default now(),
  unique (application_id, verifier_id)
);

create function public.amn_ver_after() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.applications a
     set need_score = (select round(avg(need_score))::int from public.verifications where application_id = a.id and need_score is not null),
         status = case when a.status in ('new','assigned','verified') then 'verified' else a.status end
   where a.id = new.application_id;
  insert into public.events (application_id, actor, kind, detail)
  values (new.application_id, auth.uid(), 'verified', jsonb_build_object('recommendation', new.recommendation));
  return null;
end $$;

-- ───────────────────────── payouts (money goes donor → family, never through us) ─────────────────────────
create table public.payouts (
  seq            bigint generated always as identity unique,
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id),
  donor_id       uuid references public.profiles(id) on delete set null,
  amount         numeric(14,2) not null check (amount > 0),
  currency       text not null default 'TJS' check (currency in ('TJS','USD','EUR','RUB')),
  method         text not null check (method in ('cash','alif','dc','bank','other')),
  kind           text not null default 'zakat' check (kind in ('zakat','sadaqah')),
  paid_on        date not null default current_date,
  receipt_sha256 text check (receipt_sha256 ~ '^[0-9a-f]{64}$'),
  public_note    text check (char_length(public_note) <= 300),
  prev_hash      text,
  payload        text,
  entry_hash     text,
  created_by     uuid default auth.uid(),
  created_at     timestamptz not null default now()
);

create function public.amn_pay_before() returns trigger
language plpgsql security definer set search_path = public as $$
declare a public.applications; p text;
begin
  select * into a from public.applications where id = new.application_id;
  if a.status not in ('approved','paid') then raise exception 'only an approved application can receive a payout'; end if;
  perform pg_advisory_xact_lock(424242);
  select entry_hash into p from public.payouts order by seq desc limit 1;
  new.created_by := auth.uid();
  new.prev_hash := coalesce(p, repeat('0', 64));
  new.payload := concat_ws('|', new.prev_hash, a.ref, new.amount::text, new.currency, new.kind,
                           to_char(new.paid_on, 'YYYY-MM-DD'), coalesce(new.receipt_sha256, ''));
  new.entry_hash := encode(sha256(convert_to(new.payload, 'UTF8')), 'hex');
  return new;
end $$;

create function public.amn_pay_after() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform set_config('amn.internal', '1', true);
  update public.applications set status = 'paid' where id = new.application_id and status <> 'paid';
  perform set_config('amn.internal', '', true);
  insert into public.events (application_id, actor, kind, detail)
  values (new.application_id, auth.uid(), 'paid', jsonb_build_object('amount', new.amount, 'currency', new.currency));
  return null;
end $$;

-- ───────────────────────── status timeline ─────────────────────────
create table public.events (
  id             bigint generated always as identity primary key,
  application_id uuid references public.applications(id) on delete cascade,
  actor          uuid,
  kind           text not null,
  detail         jsonb not null default '{}'::jsonb,
  at             timestamptz not null default now()
);

create function public.amn_app_after() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.events (application_id, actor, kind) values (new.id, auth.uid(), 'created');
  elsif new.status is distinct from old.status and new.status not in ('verified','paid') then
    insert into public.events (application_id, actor, kind, detail)
    values (new.id, auth.uid(), new.status, jsonb_build_object('from', old.status));
  end if;
  return null;
end $$;

create trigger amn_app_after after insert or update on public.applications
  for each row execute function public.amn_app_after();
create trigger amn_ver_after after insert on public.verifications
  for each row execute function public.amn_ver_after();
create trigger amn_pay_before before insert on public.payouts
  for each row execute function public.amn_pay_before();
create trigger amn_pay_after after insert on public.payouts
  for each row execute function public.amn_pay_after();

-- ───────────────────────── who sees what (Row Level Security) ─────────────────────────
alter table public.profiles      enable row level security;
alter table public.applications  enable row level security;
alter table public.verifications enable row level security;
alter table public.payouts       enable row level security;
alter table public.events        enable row level security;

create policy profiles_read   on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy apps_read   on public.applications for select to authenticated
  using (created_by = auth.uid() or assigned_to = auth.uid() or public.is_admin());
create policy apps_insert on public.applications for insert to authenticated
  with check (auth.uid() is not null);
create policy apps_admin_update on public.applications for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy ver_read   on public.verifications for select to authenticated
  using (verifier_id = auth.uid() or public.is_admin());
create policy ver_insert on public.verifications for insert to authenticated
  with check (
    verifier_id = auth.uid()
    and public.my_role() in ('verifier','admin')
    and exists (select 1 from public.applications a where a.id = application_id
                and a.status in ('assigned','verified')
                and (a.assigned_to = auth.uid() or public.is_admin())
                and (a.created_by is distinct from auth.uid() or public.is_admin()))
  );

create policy pay_admin_read   on public.payouts for select to authenticated using (public.is_admin());
create policy pay_admin_insert on public.payouts for insert to authenticated with check (public.is_admin());

create policy events_read on public.events for select to authenticated
  using (public.is_admin() or exists (select 1 from public.applications a where a.id = application_id
                                       and (a.created_by = auth.uid() or a.assigned_to = auth.uid())));

-- Table privileges (new tables are not exposed automatically in this project).
grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, city) on public.profiles to authenticated;
grant select, insert, update on public.applications to authenticated;
grant usage on sequence public.app_ref_seq to authenticated;
grant select, insert on public.verifications to authenticated;
grant select, insert on public.payouts to authenticated;
grant select on public.events to authenticated;

-- ───────────────────────── read helpers (no personal data leaves these) ─────────────────────────
-- Public transparency log: anyone, signed in or not.
create function public.public_payouts()
returns table (seq bigint, ref text, region text, categories text[], amount numeric, currency text, kind text,
               method text, paid_on date, verifications int, has_receipt boolean,
               prev_hash text, payload text, entry_hash text)
language sql stable security definer set search_path = public as $$
  select p.seq, a.ref, a.region, a.categories, p.amount, p.currency, p.kind, p.method, p.paid_on,
         (select count(*)::int from public.verifications v where v.application_id = a.id),
         p.receipt_sha256 is not null, p.prev_hash, p.payload, p.entry_hash
    from public.payouts p join public.applications a on a.id = p.application_id
   order by p.seq
$$;

create function public.public_stats()
returns table (families_paid int, payouts int, applications int, verified int, total_tjs numeric)
language sql stable security definer set search_path = public as $$
  select (select count(distinct application_id)::int from public.payouts),
         (select count(*)::int from public.payouts),
         (select count(*)::int from public.applications),
         (select count(*)::int from public.applications where status in ('verified','approved','paid')),
         (select coalesce(sum(amount), 0) from public.payouts where currency = 'TJS')
$$;

-- A donor sees where their own Zakat went — without the family's name or address.
create function public.my_payouts()
returns table (ref text, region text, categories text[], amount numeric, currency text, kind text,
               paid_on date, verifications int, entry_hash text)
language sql stable security definer set search_path = public as $$
  select a.ref, a.region, a.categories, p.amount, p.currency, p.kind, p.paid_on,
         (select count(*)::int from public.verifications v where v.application_id = a.id), p.entry_hash
    from public.payouts p join public.applications a on a.id = p.application_id
   where p.donor_id = auth.uid()
   order by p.seq desc
$$;

-- Admin: everyone with a role, for assigning verifiers and choosing donors.
create function public.list_staff()
returns table (id uuid, email text, full_name text, role text, city text, phone text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  return query select p.id, p.email, p.full_name, p.role, p.city, p.phone, p.created_at
                 from public.profiles p order by p.created_at;
end $$;

revoke execute on function public.set_role(uuid, text), public.list_staff(), public.my_payouts() from public, anon;
grant execute on function public.set_role(uuid, text), public.list_staff(), public.my_payouts() to authenticated;
grant execute on function public.public_payouts(), public.public_stats() to anon, authenticated;
grant execute on function public.my_role(), public.is_admin() to authenticated;
