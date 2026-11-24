-- AM Network — matching platform, part 2 (24 Nov 2026)
-- Run in Supabase → SQL Editor AFTER matching.sql (and notify.sql for e-mail). Additive, safe to re-run.
--  • e-mail to the applicant when a request arrives (in their language)
--  • e-mail to approved givers when a request is shown to them
--  • "Connect": with the applicant's consent the admin connects a giver — both get an e-mail and
--    the giver sees the applicant's first name and e-mail in the cabinet
--  • spotting copy-pasted requests (same story sent twice), and deleting test/spam requests
-- E-mails need notify.sql (Resend key in Vault). Without it everything works, just no e-mails.

alter table public.applications add column if not exists contact_consent boolean not null default false;
alter table public.applications add column if not exists story_hash text;
alter table public.applications add column if not exists dup_of text;

-- ── e-mail helper (Resend via pg_net); never blocks the app ──
create or replace function public.amn_mail(p_to text[], p_subject text, p_body text, p_bcc boolean default false) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare k text; payload jsonb;
begin
  if p_to is null or cardinality(p_to) = 0 then return; end if;
  select decrypted_secret into k from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  if k is null then return; end if;
  payload := jsonb_build_object('from', 'AM Network <no-reply@amnetwork.io>', 'reply_to', 'contact@amnetwork.io',
                                'subject', left(p_subject, 200), 'text', p_body);
  if p_bcc then payload := payload || jsonb_build_object('to', jsonb_build_array('contact@amnetwork.io'), 'bcc', to_jsonb(p_to[1:49]));
  else payload := payload || jsonb_build_object('to', to_jsonb(p_to[1:49])); end if;
  perform net.http_post(url := 'https://api.resend.com/emails', body := payload,
    headers := jsonb_build_object('Authorization', 'Bearer ' || k, 'Content-Type', 'application/json'));
exception when others then null;
end $$;
revoke execute on function public.amn_mail(text[], text, text, boolean) from public, anon, authenticated;

-- Short texts in the applicant's language.
create or replace function public.amn_t(p_lang text, p_key text) returns text
language sql immutable as $$
  with j as (select '{
 "got_s":{"en":"AM Network: request {ref} received","ru":"AM Network: заявка {ref} получена","tj":"AM Network: аризаи {ref} қабул шуд","ar":"AM Network: تم استلام الطلب {ref}","id":"AM Network: permohonan {ref} diterima","tr":"AM Network: {ref} numaralı başvuru alındı","zh":"AM Network：申请 {ref} 已收到","ms":"AM Network: permohonan {ref} diterima","fr":"AM Network : demande {ref} reçue","de":"AM Network: Antrag {ref} eingegangen"},
 "got_b":{"en":"Assalamu alaikum!\n\nYour request {ref} has been received. A person will read it. Charities and donors approved by AM Network see it without your name or contact details; whoever wants to help will check it themselves.\n\nThis does not guarantee help. AM Network never asks for money or a fee.\n\nQuestions or to delete your request: reply to this e-mail with your number {ref}.","ru":"Ассаляму алейкум!\n\nВаша заявка {ref} получена. Её прочитает человек. Одобренные AM Network фонды и доноры видят её без вашего имени и контактов; тот, кто захочет помочь, проверит её сам.\n\nЭто не гарантирует помощь. AM Network никогда не просит денег или оплату.\n\nВопросы или удаление заявки: ответьте на это письмо с номером {ref}.","tj":"Ассалому алайкум!\n\nАризаи шумо {ref} қабул шуд. Онро одам мехонад. Фондҳо ва хайрхоҳони тасдиқшуда онро бе ном ва тамоси шумо мебинанд; касе ки кӯмак кардан мехоҳад, онро худаш месанҷад.\n\nИн кафолати кӯмак нест. AM Network ҳеҷ гоҳ пул ё пардохт талаб намекунад.\n\nСаволҳо ё нест кардани ариза: ба ин мактуб бо рақами {ref} ҷавоб диҳед.","ar":"السلام عليكم!\n\nتم استلام طلبك {ref}. سيقرؤه شخص من فريقنا. الجمعيات والمحسنون المعتمدون يرونه دون اسمك أو بيانات اتصالك، ومن يرغب في المساعدة يتحقق منه بنفسه.\n\nهذا لا يضمن المساعدة. لا يطلب AM Network أي مال أو رسوم أبدًا.\n\nللأسئلة أو لحذف الطلب: ردّ على هذه الرسالة مع رقم {ref}.","id":"Assalamu alaikum!\n\nPermohonan Anda {ref} telah diterima dan akan dibaca oleh seseorang. Lembaga dan donatur yang disetujui AM Network melihatnya tanpa nama dan kontak Anda; yang ingin membantu akan memeriksanya sendiri.\n\nIni tidak menjamin bantuan. AM Network tidak pernah meminta uang atau biaya.\n\nPertanyaan atau penghapusan: balas email ini dengan nomor {ref}.","tr":"Esselamü aleyküm!\n\n{ref} numaralı başvurunuz alındı ve bir kişi tarafından okunacak. AM Network tarafından onaylanan vakıflar ve bağışçılar başvurunuzu adınız ve iletişim bilgileriniz olmadan görür; yardım etmek isteyen kendisi doğrular.\n\nBu, yardım garantisi değildir. AM Network asla para veya ücret istemez.\n\nSorular veya silme talebi için bu e-postayı {ref} numarasıyla yanıtlayın.","zh":"愿真主赐您平安！\n\n您的申请 {ref} 已收到，将由工作人员阅读。经 AM Network 批准的慈善机构和捐助者看到的申请不含您的姓名和联系方式；愿意帮助的人会自行核实。\n\n这并不保证一定获得帮助。AM Network 从不索取任何钱款或费用。\n\n如有疑问或需删除申请，请回复此邮件并注明编号 {ref}。","ms":"Assalamualaikum!\n\nPermohonan anda {ref} telah diterima dan akan dibaca oleh seseorang. Badan amal dan penderma yang diluluskan AM Network melihatnya tanpa nama dan maklumat hubungan anda; yang ingin membantu akan menyemaknya sendiri.\n\nIni tidak menjamin bantuan. AM Network tidak pernah meminta wang atau bayaran.\n\nSoalan atau pemadaman: balas e-mel ini dengan nombor {ref}.","fr":"Assalamou alaykoum !\n\nVotre demande {ref} a bien été reçue. Une personne la lira. Les associations et donateurs approuvés par AM Network la voient sans votre nom ni vos coordonnées ; celui qui souhaite aider la vérifie lui-même.\n\nCela ne garantit pas une aide. AM Network ne demande jamais d''argent ni de frais.\n\nQuestions ou suppression : répondez à cet e-mail en indiquant le numéro {ref}.","de":"Assalamu alaikum!\n\nIhr Antrag {ref} ist eingegangen und wird von einem Menschen gelesen. Von AM Network freigegebene Organisationen und Spender sehen ihn ohne Ihren Namen und Ihre Kontaktdaten; wer helfen möchte, prüft ihn selbst.\n\nDas garantiert keine Hilfe. AM Network verlangt nie Geld oder Gebühren.\n\nFragen oder Löschung: Antworten Sie auf diese E-Mail mit der Nummer {ref}."},
 "con_s":{"en":"AM Network: a charity wants to help with request {ref}","ru":"AM Network: фонд хочет помочь по заявке {ref}","tj":"AM Network: фонд мехоҳад бо аризаи {ref} кӯмак кунад","ar":"AM Network: جهة ترغب في المساعدة في الطلب {ref}","id":"AM Network: lembaga ingin membantu permohonan {ref}","tr":"AM Network: bir vakıf {ref} başvurusuna yardım etmek istiyor","zh":"AM Network：有机构愿意帮助申请 {ref}","ms":"AM Network: badan amal ingin membantu permohonan {ref}","fr":"AM Network : une association souhaite aider pour la demande {ref}","de":"AM Network: Eine Organisation möchte bei Antrag {ref} helfen"},
 "con_b":{"en":"Assalamu alaikum!\n\n{org} has seen your request {ref} and wants to help. They will contact you by e-mail and may ask for documents to check your situation.\n\nAM Network never asks for money or a fee, and neither should they. If anything feels wrong, reply to this e-mail.","ru":"Ассаляму алейкум!\n\n{org} увидел вашу заявку {ref} и хочет помочь. С вами свяжутся по e-mail и могут попросить документы, чтобы проверить ситуацию.\n\nAM Network никогда не просит денег или оплату — и они не должны. Если что-то кажется неправильным, ответьте на это письмо.","tj":"Ассалому алайкум!\n\n{org} аризаи шумо {ref}-ро дид ва мехоҳад кӯмак кунад. Бо шумо тавассути e-mail тамос мегиранд ва шояд барои санҷиш ҳуҷҷатҳо пурсанд.\n\nAM Network ҳеҷ гоҳ пул ё пардохт талаб намекунад — онҳо ҳам набояд. Агар чизе нодуруст бошад, ба ин мактуб ҷавоб диҳед.","ar":"السلام عليكم!\n\nاطّلعت {org} على طلبك {ref} وترغب في المساعدة. سيتواصلون معك عبر البريد الإلكتروني وقد يطلبون مستندات للتحقق من وضعك.\n\nلا يطلب AM Network أي مال أو رسوم أبدًا، ولا ينبغي لهم ذلك أيضًا. إن شعرت بأي خطأ فردّ على هذه الرسالة.","id":"Assalamu alaikum!\n\n{org} telah melihat permohonan Anda {ref} dan ingin membantu. Mereka akan menghubungi Anda lewat email dan mungkin meminta dokumen untuk memeriksa keadaan Anda.\n\nAM Network tidak pernah meminta uang atau biaya, begitu pula mereka. Jika ada yang terasa salah, balas email ini.","tr":"Esselamü aleyküm!\n\n{org}, {ref} numaralı başvurunuzu gördü ve yardım etmek istiyor. Sizinle e-posta ile iletişime geçecek ve durumunuzu doğrulamak için belge isteyebilir.\n\nAM Network asla para veya ücret istemez; onlar da istememeli. Bir sorun olduğunu düşünürseniz bu e-postayı yanıtlayın.","zh":"愿真主赐您平安！\n\n{org} 看到了您的申请 {ref}，愿意提供帮助。他们会通过邮件联系您，并可能请您提供材料以核实情况。\n\nAM Network 从不索取钱款或费用，他们也不应如此。如有任何异常，请回复此邮件。","ms":"Assalamualaikum!\n\n{org} telah melihat permohonan anda {ref} dan ingin membantu. Mereka akan menghubungi anda melalui e-mel dan mungkin meminta dokumen untuk menyemak keadaan anda.\n\nAM Network tidak pernah meminta wang atau bayaran, begitu juga mereka. Jika ada yang tidak kena, balas e-mel ini.","fr":"Assalamou alaykoum !\n\n{org} a vu votre demande {ref} et souhaite aider. Ils vous contacteront par e-mail et pourront demander des documents pour vérifier votre situation.\n\nAM Network ne demande jamais d''argent ni de frais, eux non plus ne doivent pas le faire. Si quelque chose vous semble anormal, répondez à cet e-mail.","de":"Assalamu alaikum!\n\n{org} hat Ihren Antrag {ref} gesehen und möchte helfen. Man wird Sie per E-Mail kontaktieren und eventuell Unterlagen zur Prüfung erbitten.\n\nAM Network verlangt nie Geld oder Gebühren – und die Helfenden auch nicht. Wenn Ihnen etwas seltsam vorkommt, antworten Sie auf diese E-Mail."}
}'::jsonb as d)
  select coalesce(d -> p_key ->> coalesce(nullif(p_lang, ''), 'en'), d -> p_key ->> 'en', '') from j
$$;

-- ── intake v2: consent to be contacted, duplicate spotting, applicant e-mail ──
create or replace function public.intake_request(p_secret text, p jsonb)
returns table (id uuid, ref text)
language plpgsql security definer set search_path = public as $$
declare r public.applications; h text; d text; l text;
begin
  perform public.amn_svc(p_secret);
  h := md5(lower(regexp_replace(coalesce(p->>'story', ''), '[^[:alnum:]]+', '', 'g')));
  select a.ref into d from public.applications a where a.story_hash = h order by a.created_at limit 1;
  insert into public.applications (full_name, email, region, country, household_size, dependents,
      monthly_income, monthly_expenses, currency, categories, needs, months_in_need, situation,
      show_first_name, lang, consent, source, contact_consent, story_hash, dup_of)
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

-- claim_review v2: tell the AI when the same story was already sent.
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
    'same_story_already_sent_as', a.dup_of);
end $$;

-- ── e-mail to approved givers when a request is shown to them ──
create or replace function public.amn_listed_mail() returns trigger
language plpgsql security definer set search_path = public as $$
declare tos text[]; c text;
begin
  if new.listed and not coalesce(old.listed, false) then
    select array_agg(email) into tos from public.profiles where giver_approved and email is not null;
    c := coalesce(new.ai_review->>'category', '');
    perform public.amn_mail(tos, 'AM Network: new request ' || new.ref || ' · ' || coalesce(new.country, '') || ' ' || new.region,
      'A new request is open for givers: ' || new.ref || E'\n' ||
      coalesce(new.country, '') || ', ' || new.region || coalesce(' · AI hint: ' || nullif(c, ''), '') || E'\n\n' ||
      'Not verified by AM Network — please verify it yourself before helping.' || E'\n' ||
      'Open: https://amnetwork.io/cabinet/#feed', true);
  end if;
  return null;
end $$;
drop trigger if exists amn_listed_mail on public.applications;
create trigger amn_listed_mail after update of listed on public.applications
  for each row execute function public.amn_listed_mail();

-- ── Connect a giver with an applicant (admin, only with the applicant's consent) ──
create or replace function public.connect_offer(p_offer uuid) returns text
language plpgsql security definer set search_path = public as $$
declare o public.offers; a public.applications; g public.profiles; first text; org text; l text;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  select * into o from public.offers where id = p_offer;
  if not found then raise exception 'not found'; end if;
  select * into a from public.applications where id = o.application_id;
  select * into g from public.profiles where id = o.giver_id;
  if not a.contact_consent then return 'no_consent'; end if;
  if a.email is null then return 'no_email'; end if;
  update public.offers set status = 'connected' where id = p_offer;
  first := split_part(trim(a.full_name), ' ', 1);
  org := coalesce(nullif(g.org_name, ''), nullif(g.full_name, ''), 'A donor');
  l := coalesce(a.lang, 'en');
  perform public.amn_mail(array[a.email], replace(public.amn_t(l, 'con_s'), '{ref}', a.ref),
    replace(replace(public.amn_t(l, 'con_b'), '{ref}', a.ref), '{org}', org));
  perform public.amn_mail(array[g.email], 'AM Network: contact for request ' || a.ref,
    'Assalamu alaikum!' || E'\n\n' || 'The applicant agreed to be contacted.' || E'\n' ||
    'Request: ' || a.ref || E'\n' || 'Name: ' || first || E'\n' || 'E-mail: ' || a.email || E'\n\n' ||
    'Please verify the request yourself (documents, a call, a local mosque) and help directly. ' ||
    'Never ask the applicant for money. The request is not verified by AM Network.');
  return 'connected';
end $$;

-- The giver's connections: first name and e-mail only, only with consent, only after "Connect".
create or replace function public.my_connections()
returns table (ref text, first_name text, email text, status text)
language sql stable security definer set search_path = public as $$
  select a.ref, split_part(trim(a.full_name), ' ', 1), a.email, o.status
    from public.offers o join public.applications a on a.id = o.application_id
   where o.giver_id = auth.uid() and o.status in ('connected','helped') and a.contact_consent
   order by o.created_at desc
$$;

-- Admin: delete a test or spam request (not one that already has a recorded payout).
create or replace function public.delete_request(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  if exists (select 1 from public.payouts where application_id = p_id) then raise exception 'has payouts'; end if;
  delete from public.applications where id = p_id;
end $$;

revoke execute on function public.connect_offer(uuid), public.my_connections(), public.delete_request(uuid) from public, anon;
grant  execute on function public.connect_offer(uuid), public.my_connections(), public.delete_request(uuid) to authenticated;
revoke execute on function public.amn_t(text, text) from public, anon, authenticated;
