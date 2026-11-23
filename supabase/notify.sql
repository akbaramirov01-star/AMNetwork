-- AM Network — email the admin when something needs attention (v1, 23 Nov 2026)
-- Run once in Supabase → SQL Editor, AFTER schema.sql. Safe to re-run.
-- The Resend key is stored in Supabase Vault and the admin address in amn_settings —
-- neither ever appears in this repository.

create extension if not exists pg_net with schema extensions;

create table if not exists public.amn_settings (
  key   text primary key,
  value text not null
);
alter table public.amn_settings enable row level security;   -- no policies: invisible to the site
revoke all on public.amn_settings from anon, authenticated;

create or replace function public.amn_notify(subject text, body text) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare k text; to_addr text;
begin
  select decrypted_secret into k from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  select value into to_addr from public.amn_settings where key = 'admin_email';
  if k is null or to_addr is null then return; end if;
  perform net.http_post(
    url     := 'https://api.resend.com/emails',
    body    := jsonb_build_object(
                 'from', 'AM Network <no-reply@amnetwork.io>',
                 'to', jsonb_build_array(to_addr),
                 'subject', left(subject, 200),
                 'text', body),
    headers := jsonb_build_object('Authorization', 'Bearer ' || k, 'Content-Type', 'application/json')
  );
exception when others then
  null;  -- a mail problem must never block an application or a check
end $$;
revoke execute on function public.amn_notify(text, text) from public, anon, authenticated;

-- New application → admin. No family name or phone in the email: open the cabinet for details.
create or replace function public.amn_notify_app() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.amn_notify(
    'AM Network: новая заявка ' || new.ref,
    'Новая заявка ' || new.ref || E'\nГород/район: ' || new.region ||
    E'\nСемья: ' || coalesce(new.household_size::text, '—') || ' чел.' ||
    E'\nКатегории: ' || coalesce(array_to_string(new.categories, ', '), '—') ||
    E'\n\nНазначьте проверяющего: https://amnetwork.io/cabinet/#app/' || new.id);
  return null;
end $$;

-- In-person check done → admin.
create or replace function public.amn_notify_ver() returns trigger
language plpgsql security definer set search_path = public as $$
declare r text;
begin
  select ref into r from public.applications where id = new.application_id;
  perform public.amn_notify(
    'AM Network: проверка ' || coalesce(r, '') || ' — ' || case when new.recommendation = 'approve' then 'помочь' else 'не помогать' end,
    'Проверка на месте по заявке ' || coalesce(r, '') ||
    E'\nРекомендация: ' || case when new.recommendation = 'approve' then 'Помочь' else 'Не помогать' end ||
    E'\nБаллы нужды: ' || coalesce(new.need_score::text, '—') ||
    E'\n\nОткрыть: https://amnetwork.io/cabinet/#app/' || new.application_id);
  return null;
end $$;

drop trigger if exists amn_notify_app on public.applications;
create trigger amn_notify_app after insert on public.applications
  for each row execute function public.amn_notify_app();
drop trigger if exists amn_notify_ver on public.verifications;
create trigger amn_notify_ver after insert on public.verifications
  for each row execute function public.amn_notify_ver();
