-- AM Network — matching platform, part 3 (25 Nov 2026)
-- Run in Supabase → SQL Editor AFTER matching.sql and matching-2.sql. Additive, safe to re-run.
--  • translations of a request (masked text only) cached per language
--  • the applicant's WhatsApp/Telegram number and preferred channel (never shown to givers or to the AI)
--  • answers to the AI's follow-up questions, pasted by the admin, fed into the next AI review
--  • a secure chat per connection: giver ↔ applicant, the applicant joins by a secret link
--  • two-step login for the admin: once the admin has a verified authenticator app, every admin
--    power in the database requires the second step (AAL2) — a stolen password alone gets nothing

create extension if not exists pgcrypto with schema extensions;

-- ── admin protection: AAL2 required once a TOTP factor is verified ──
create or replace function public.amn_aal() returns text
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'aal', 'aal1')
$$;

create or replace function public.is_admin() returns boolean
language plpgsql stable security definer set search_path = public as $$
declare ok boolean; has_factor boolean := false;
begin
  select role = 'admin' into ok from public.profiles where id = auth.uid();
  if not coalesce(ok, false) then return false; end if;
  begin
    select exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified') into has_factor;
  exception when others then has_factor := false;   -- no MFA tables (local tests): plain check
  end;
  return not has_factor or public.amn_aal() = 'aal2';
end $$;
grant execute on function public.is_admin() to authenticated;

-- Small helper the cabinet uses to show "turn on two-step login" / "enter your code".
create or replace function public.admin_security() returns table (is_admin_role boolean, has_factor boolean, aal text)
language plpgsql stable security definer set search_path = public as $$
declare r boolean; f boolean := false;
begin
  select role = 'admin' into r from public.profiles where id = auth.uid();
  begin select exists (select 1 from auth.mfa_factors m where m.user_id = auth.uid() and m.status = 'verified') into f;
  exception when others then f := false; end;
  return query select coalesce(r, false), f, public.amn_aal();
end $$;
revoke execute on function public.admin_security() from public, anon;
grant  execute on function public.admin_security() to authenticated;

-- ── request fields ──
alter table public.applications add column if not exists story_tr jsonb not null default '{}'::jsonb;  -- {lang: masked translation}
alter table public.applications add column if not exists answers text check (char_length(answers) <= 4000);
alter table public.applications add column if not exists contact_channel text check (contact_channel in ('whatsapp','telegram','email'));

-- AI usage log (translations), for a daily cap kept in the database.
create table if not exists public.amn_ai_log (id bigint generated always as identity primary key, kind text not null, at timestamptz not null default now());
alter table public.amn_ai_log enable row level security;
revoke all on public.amn_ai_log from anon, authenticated;

-- intake v3: + messenger number and channel (digits only; shown to the admin, never to givers or the AI)
create or replace function public.intake_request(p_secret text, p jsonb)
returns table (id uuid, ref text)
language plpgsql security definer set search_path = public as $$
declare r public.applications; h text; d text; l text; ph text; ch text;
begin
  perform public.amn_svc(p_secret);
  h := md5(lower(regexp_replace(coalesce(p->>'story', ''), '[^[:alnum:]]+', '', 'g')));
  select a.ref into d from public.applications a where a.story_hash = h order by a.created_at limit 1;
  ph := nullif(left(regexp_replace(coalesce(p->>'phone', ''), '[^0-9+]', '', 'g'), 20), '');
  if ph is not null and char_length(regexp_replace(ph, '\D', '', 'g')) < 7 then ph := null; end if;
  ch := case when p->>'channel' in ('whatsapp','telegram','email') then p->>'channel' end;
  insert into public.applications (full_name, email, phone, contact_channel, region, country, household_size, dependents,
      monthly_income, monthly_expenses, currency, categories, needs, months_in_need, situation,
      show_first_name, lang, consent, source, contact_consent, story_hash, dup_of)
  values (left(coalesce(nullif(trim(p->>'name'), ''), 'Anonymous'), 120),
          nullif(left(trim(p->>'email'), 160), ''), ph, ch,
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
          nullif(p->>'lang', ''), true, 'web',
          coalesce((p->>'contact_consent')::boolean, false), h, d)
  returning * into r;
  l := coalesce(r.lang, 'en');
  if r.email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    perform public.amn_mail(array[r.email], replace(public.amn_t(l, 'got_s'), '{ref}', r.ref),
                            replace(public.amn_t(l, 'got_b'), '{ref}', r.ref));
  end if;
  return query select r.id, r.ref;
end $$;

-- claim_review v3: + the applicant's answers (masked)
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
    'story', public.amn_mask(a.situation), 'applicant_language', a.lang,
    'same_story_already_sent_as', a.dup_of,
    'applicant_answers_to_follow_up_questions', nullif(public.amn_mask(a.answers), ''));
end $$;

-- Translation: who may ask (admin, or an approved giver for a listed request), the masked text,
-- and the cache. Called by the backend with the user's token (may) and the shared secret (get/save).
create or replace function public.may_translate(p_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or (public.is_giver() and exists (
    select 1 from public.applications a where a.id = p_id and a.listed and a.status not in ('rejected','paid')))
$$;
create or replace function public.translation_source(p_secret text, p_id uuid, p_lang text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.applications; n int;
begin
  perform public.amn_svc(p_secret);
  select * into a from public.applications where id = p_id;
  if not found then raise exception 'not found'; end if;
  if a.story_tr ? p_lang then return jsonb_build_object('cached', a.story_tr ->> p_lang); end if;
  select count(*) into n from public.amn_ai_log where kind = 'translate' and at > now() - interval '1 day';
  if n >= coalesce((select nullif(regexp_replace(value, '[^0-9]', '', 'g'), '')::int
                      from public.amn_settings where key = 'translate_daily_cap'), 100) then
    raise exception 'daily cap reached';
  end if;
  insert into public.amn_ai_log(kind) values ('translate');
  return jsonb_build_object('text', public.amn_mask(a.situation), 'answers', nullif(public.amn_mask(a.answers), ''));
end $$;
create or replace function public.save_translation(p_secret text, p_id uuid, p_lang text, p_text text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.amn_svc(p_secret);
  if p_lang !~ '^[a-z]{2}$' then raise exception 'bad lang'; end if;
  update public.applications set story_tr = story_tr || jsonb_build_object(p_lang, left(p_text, 6000)) where id = p_id;
end $$;
revoke execute on function public.translation_source(text, uuid, text), public.save_translation(text, uuid, text, text) from public, authenticated;
grant  execute on function public.translation_source(text, uuid, text), public.save_translation(text, uuid, text, text) to anon;
revoke execute on function public.may_translate(uuid) from public, anon;
grant  execute on function public.may_translate(uuid) to authenticated;

-- Admin pastes the applicant's answers (then runs the AI review again from the cabinet).
create or replace function public.save_answers(p_id uuid, p_answers text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  update public.applications set answers = nullif(left(trim(p_answers), 4000), ''), story_tr = '{}'::jsonb where id = p_id;
end $$;
revoke execute on function public.save_answers(uuid, text) from public, anon;
grant  execute on function public.save_answers(uuid, text) to authenticated;

-- Givers' feed v3: + cached translations.
drop function if exists public.open_requests();
create function public.open_requests()
returns table (id uuid, ref text, first_name text, country text, region text, household_size int,
               dependents int, monthly_income numeric, monthly_expenses numeric, currency text,
               categories text[], needs text[], months_in_need int, story text, ai_review jsonb,
               created_at timestamptz, offers int, my_offer boolean, story_tr jsonb, lang text)
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
           exists (select 1 from public.offers o where o.application_id = a.id and o.giver_id = auth.uid()),
           a.story_tr, a.lang
      from public.applications a
     where a.listed and a.status not in ('rejected','paid')
     order by a.created_at desc;
end $$;
revoke execute on function public.open_requests() from public, anon;
grant  execute on function public.open_requests() to authenticated;

-- ── secure chat ──
-- One chat per connected offer. The applicant joins with a random secret link (only its SHA-256 is
-- stored); the giver and the admin use their accounts. Max 30 messages per hour per side, 2000
-- characters each. Closing a chat or 90 days of silence ends the link.
create table if not exists public.chats (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  offer_id       uuid not null unique references public.offers(id) on delete cascade,
  giver_id       uuid not null references public.profiles(id) on delete cascade,
  token_hash     text not null unique,
  status         text not null default 'open' check (status in ('open','closed')),
  reported       boolean not null default false,
  last_at        timestamptz not null default now(),
  created_at     timestamptz not null default now()
);
create table if not exists public.chat_messages (
  id       bigint generated always as identity primary key,
  chat_id  uuid not null references public.chats(id) on delete cascade,
  sender   text not null check (sender in ('applicant','giver','admin')),
  body     text not null check (char_length(body) between 1 and 2000),
  at       timestamptz not null default now()
);
create index if not exists chat_messages_chat on public.chat_messages(chat_id, id);
alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;
revoke all on public.chats, public.chat_messages from anon, authenticated;   -- only through the functions below

create or replace function public.amn_hash(t text) returns text
language sql immutable as $$ select encode(extensions.digest(convert_to(t, 'UTF8'), 'sha256'), 'hex') $$;

-- Admin opens (or re-issues) the chat for a connected offer; returns the applicant's link token ONCE.
create or replace function public.open_chat(p_offer uuid) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare o public.offers; tok text;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  select * into o from public.offers where id = p_offer;
  if not found then raise exception 'not found'; end if;
  if o.status not in ('connected','helped') then raise exception 'connect first'; end if;
  tok := encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.chats (application_id, offer_id, giver_id, token_hash)
  values (o.application_id, o.id, o.giver_id, public.amn_hash(tok))
  on conflict (offer_id) do update set token_hash = excluded.token_hash, status = 'open', last_at = now();
  return tok;
end $$;

create or replace function public.amn_chat_by_token(p_token text) returns public.chats
language plpgsql stable security definer set search_path = public as $$
declare c public.chats;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{48}$' then raise exception 'bad link'; end if;
  select * into c from public.chats where token_hash = public.amn_hash(p_token);
  if not found or c.status <> 'open' or c.last_at < now() - interval '90 days' then raise exception 'link expired'; end if;
  return c;
end $$;
revoke execute on function public.amn_chat_by_token(text) from public, anon, authenticated;

create or replace function public.amn_chat_send(c public.chats, p_sender text, p_body text) returns void
language plpgsql security definer set search_path = public as $$
declare n int; b text := left(trim(coalesce(p_body, '')), 2000);
begin
  if b = '' then raise exception 'empty'; end if;
  if c.status <> 'open' then raise exception 'chat closed'; end if;
  select count(*) into n from public.chat_messages where chat_id = c.id and sender = p_sender and at > now() - interval '1 hour';
  if n >= 30 then raise exception 'too many messages'; end if;
  insert into public.chat_messages(chat_id, sender, body) values (c.id, p_sender, b);
  update public.chats set last_at = now() where id = c.id;
end $$;
revoke execute on function public.amn_chat_send(public.chats, text, text) from public, anon, authenticated;

create or replace function public.amn_chat_json(c public.chats) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'ref', (select ref from public.applications where id = c.application_id),
    'giver', (select coalesce(nullif(org_name, ''), nullif(full_name, ''), 'AM Network') from public.profiles where id = c.giver_id),
    'status', c.status,
    'messages', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'sender', m.sender, 'body', m.body, 'at', m.at) order by m.id)
                            from (select * from public.chat_messages where chat_id = c.id order by id desc limit 200) m), '[]'::jsonb))
$$;
revoke execute on function public.amn_chat_json(public.chats) from public, anon, authenticated;

-- Applicant (no account, secret link).
create or replace function public.chat_view(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin return public.amn_chat_json(public.amn_chat_by_token(p_token)); end $$;
create or replace function public.chat_post(p_token text, p_body text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c public.chats;
begin
  c := public.amn_chat_by_token(p_token);
  perform public.amn_chat_send(c, 'applicant', p_body);
  return public.amn_chat_json(c);
end $$;
create or replace function public.chat_report(p_token text) returns void
language plpgsql security definer set search_path = public as $$
declare c public.chats;
begin c := public.amn_chat_by_token(p_token); update public.chats set reported = true where id = c.id; end $$;
grant execute on function public.chat_view(text), public.chat_post(text, text), public.chat_report(text) to anon, authenticated;

-- Giver and admin (accounts).
create or replace function public.my_chats()
returns table (id uuid, ref text, giver text, status text, reported boolean, last_at timestamptz, unread_hint int)
language sql stable security definer set search_path = public as $$
  select c.id, a.ref, coalesce(nullif(p.org_name, ''), p.full_name, p.email), c.status, c.reported, c.last_at,
         (select count(*)::int from public.chat_messages m where m.chat_id = c.id and m.sender = 'applicant' and m.at > now() - interval '7 days')
    from public.chats c join public.applications a on a.id = c.application_id join public.profiles p on p.id = c.giver_id
   where c.giver_id = auth.uid() or public.is_admin()
   order by c.last_at desc
$$;
create or replace function public.chat_view_my(p_chat uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c public.chats;
begin
  select * into c from public.chats where id = p_chat;
  if not found or not (c.giver_id = auth.uid() or public.is_admin()) then raise exception 'not allowed'; end if;
  return public.amn_chat_json(c);
end $$;
create or replace function public.chat_post_my(p_chat uuid, p_body text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c public.chats;
begin
  select * into c from public.chats where id = p_chat;
  if not found or not (c.giver_id = auth.uid() or public.is_admin()) then raise exception 'not allowed'; end if;
  perform public.amn_chat_send(c, case when c.giver_id = auth.uid() then 'giver' else 'admin' end, p_body);
  return public.amn_chat_json(c);
end $$;
create or replace function public.chat_close(p_chat uuid, p_open boolean default false) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  update public.chats set status = case when p_open then 'open' else 'closed' end, reported = case when p_open then false else reported end where id = p_chat;
end $$;
revoke execute on function public.my_chats(), public.chat_view_my(uuid), public.chat_post_my(uuid, text), public.chat_close(uuid, boolean), public.open_chat(uuid) from public, anon;
grant  execute on function public.my_chats(), public.chat_view_my(uuid), public.chat_post_my(uuid, text), public.chat_close(uuid, boolean), public.open_chat(uuid) to authenticated;
