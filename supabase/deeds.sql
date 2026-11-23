-- AM Network — «Благое дело → помощь семье» (v1, 23 Nov 2026)
-- Run in Supabase → SQL Editor AFTER schema.sql. Safe to re-run: it never deletes deeds.
--
-- How it works: a sponsor (for now the founder) pledges a fund of Sadaqah — NOT Zakat.
-- Each AM Academy lesson or module test a signed-in person completes unlocks a few cents of
-- that pledge for a verified family. The person never receives money. The admin hands the
-- unlocked amount to a family through the normal payout (visible in the open report) and
-- records how much was given. Worship (dhikr, prayer, Quran) is never part of this.

create table if not exists public.amn_settings (key text primary key, value text not null);
alter table public.amn_settings enable row level security;          -- no policies: invisible to the site
revoke all on public.amn_settings from anon, authenticated;

create table if not exists public.deeds (
  id       bigint generated always as identity primary key,
  user_id  uuid not null references public.profiles(id) on delete cascade,
  kind     text not null check (kind in ('lesson','exam','day')),
  item     text not null check (char_length(item) between 1 and 80),
  cents    int  not null default 0 check (cents >= 0),
  at       timestamptz not null default now(),
  unique (user_id, kind, item)
);
create index if not exists deeds_user_at on public.deeds (user_id, at);
alter table public.deeds enable row level security;
drop policy if exists deeds_own_read on public.deeds;
create policy deeds_own_read on public.deeds for select to authenticated using (user_id = auth.uid() or public.is_admin());
revoke all on public.deeds from anon, authenticated;
grant select on public.deeds to authenticated;                     -- writes only through record_deed()

create or replace function public.amn_setting_int(k text, dflt int) returns int
language sql stable security definer set search_path = public as $$
  select coalesce((select nullif(regexp_replace(value, '[^0-9]', '', 'g'), '')::int
                     from public.amn_settings where key = k), dflt)
$$;
revoke execute on function public.amn_setting_int(text, int) from public, anon, authenticated;

-- The only way to add a deed. Items are whitelisted against the real curriculum, every person
-- can unlock at most 3 € in total, and nothing beyond the pledged fund is ever unlocked.
create or replace function public.record_deed(p_kind text, p_item text)
returns table (added_cents int, my_cents int, unlocked_cents int, fund_cents int)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  lessons constant text[] := array[
    'zakat-basics/what-is-zakat','zakat-basics/nisab','zakat-basics/what-counts','zakat-basics/eight-categories',
    'riba/what-is-riba','riba/two-kinds','riba/riba-today','riba/way-out',
    'halal-income/halal-basics','halal-income/screening','halal-income/savings-takaful','halal-income/crypto',
    'zakat-sadaqah-waqf/three-forms','zakat-sadaqah-waqf/sadaqah','zakat-sadaqah-waqf/waqf',
    'contracts/why-contract','contracts/murabaha','contracts/ijara','contracts/mudaraba-musharaka','contracts/salam-istisna'];
  exams constant text[] := array['zakat-basics','riba','halal-income','zakat-sadaqah-waqf','contracts'];
  today text := to_char((now() at time zone 'Asia/Dushanbe')::date, 'YYYY-MM-DD');
  fund int; user_cap int; total int; mine int; want int; add int; n int; added int := 0;
begin
  if uid is null then raise exception 'sign in first'; end if;
  if not exists (select 1 from public.profiles where id = uid) then raise exception 'no profile'; end if;
  if p_kind = 'lesson' and not (p_item = any(lessons)) then raise exception 'unknown lesson'; end if;
  if p_kind = 'exam'   and not (p_item = any(exams))   then raise exception 'unknown module'; end if;
  if p_kind not in ('lesson','exam') then raise exception 'unknown deed'; end if;

  select count(*) into n from public.deeds where user_id = uid and at > now() - interval '1 day';
  if n >= 40 then raise exception 'too many today'; end if;

  perform pg_advisory_xact_lock(515151);                            -- one writer at a time: the fund is shared
  fund     := public.amn_setting_int('deed_fund_cents', 0);
  user_cap := public.amn_setting_int('deed_user_cap_cents', 300);

  foreach p_item in array array[p_item, today] loop
    exit when p_item is null;
    select coalesce(sum(cents), 0) into total from public.deeds;
    select coalesce(sum(cents), 0) into mine  from public.deeds where user_id = uid;
    want := case when p_item = today then public.amn_setting_int('deed_cents_day', 2)
                 when p_kind = 'exam' then public.amn_setting_int('deed_cents_exam', 20)
                 else public.amn_setting_int('deed_cents_lesson', 8) end;
    add := greatest(0, least(want, fund - total, user_cap - mine));
    insert into public.deeds (user_id, kind, item, cents)
    values (uid, case when p_item = today then 'day' else p_kind end, p_item, add)
    on conflict (user_id, kind, item) do nothing;
    if found then added := added + add; end if;
    if p_item = today then exit; end if;
  end loop;

  return query select added,
    (select coalesce(sum(d.cents), 0)::int from public.deeds d where d.user_id = uid),
    (select coalesce(sum(d.cents), 0)::int from public.deeds d), fund;
end $$;

-- Public counter: no names, no emails, nothing about any one person.
create or replace function public.deed_stats()
returns table (fund_cents int, unlocked_cents int, given_cents int, people int, lessons int, exams int)
language sql stable security definer set search_path = public as $$
  select public.amn_setting_int('deed_fund_cents', 0),
         (select coalesce(sum(cents), 0)::int from public.deeds),
         public.amn_setting_int('deed_given_cents', 0),
         (select count(distinct user_id)::int from public.deeds),
         (select count(*)::int from public.deeds where kind = 'lesson'),
         (select count(*)::int from public.deeds where kind = 'exam')
$$;

-- Admin: the pledged fund and how much of it has already reached families (both in euro cents).
create or replace function public.set_deed_fund(p_fund_cents int, p_given_cents int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  if p_fund_cents < 0 or p_given_cents < 0 or p_fund_cents > 10000000 or p_given_cents > 10000000 then
    raise exception 'bad amount';
  end if;
  insert into public.amn_settings(key, value) values ('deed_fund_cents', p_fund_cents::text), ('deed_given_cents', p_given_cents::text)
  on conflict (key) do update set value = excluded.value;
end $$;

revoke execute on function public.record_deed(text, text), public.set_deed_fund(int, int) from public, anon;
grant  execute on function public.record_deed(text, text), public.set_deed_fund(int, int) to authenticated;
grant  execute on function public.deed_stats() to anon, authenticated;
