-- 事後ラー Web Ver.6
-- Google Place ID + Chain Prior（アプリ側）+ User Feedback
-- Googleの店舗名・住所・評価はDBへ保存しません。Place IDだけを照合キーとして使用します。

create extension if not exists pgcrypto;

create table if not exists public.jigo_user_feedback_v6 (
  id uuid primary key default gen_random_uuid(),
  google_place_id text not null,
  user_id uuid not null default auth.uid(),
  pair_score smallint not null check (pair_score between 1 and 5),
  conversation_score smallint not null check (conversation_score between 1 and 5),
  comfort_score smallint not null check (comfort_score between 1 and 5),
  ease_score smallint not null check (ease_score between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists jigo_feedback_v6_place_idx
  on public.jigo_user_feedback_v6 (google_place_id, created_at desc);

create unique index if not exists jigo_feedback_v6_one_per_day_idx
  on public.jigo_user_feedback_v6 (google_place_id, user_id, ((created_at at time zone 'UTC')::date));

create table if not exists public.jigo_feedback_stats_v6 (
  google_place_id text primary key,
  avg_pair_rating numeric(7,4) not null check (avg_pair_rating between 1 and 5),
  avg_conversation_rating numeric(7,4) not null check (avg_conversation_rating between 1 and 5),
  avg_comfort_rating numeric(7,4) not null check (avg_comfort_rating between 1 and 5),
  avg_ease_rating numeric(7,4) not null check (avg_ease_rating between 1 and 5),
  sample_count integer not null default 0 check (sample_count >= 0),
  last_feedback_at timestamptz
);

create or replace function public.recompute_jigo_feedback_stats_v6(p_google_place_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
  a_pair numeric;
  a_conversation numeric;
  a_comfort numeric;
  a_ease numeric;
  last_at timestamptz;
begin
  select count(*), avg(pair_score), avg(conversation_score), avg(comfort_score), avg(ease_score), max(created_at)
    into n, a_pair, a_conversation, a_comfort, a_ease, last_at
  from public.jigo_user_feedback_v6
  where google_place_id = p_google_place_id;

  if n = 0 then
    delete from public.jigo_feedback_stats_v6 where google_place_id = p_google_place_id;
    return;
  end if;

  insert into public.jigo_feedback_stats_v6 (
    google_place_id, avg_pair_rating, avg_conversation_rating, avg_comfort_rating,
    avg_ease_rating, sample_count, last_feedback_at
  ) values (
    p_google_place_id, a_pair, a_conversation, a_comfort, a_ease, n, last_at
  ) on conflict (google_place_id) do update set
    avg_pair_rating = excluded.avg_pair_rating,
    avg_conversation_rating = excluded.avg_conversation_rating,
    avg_comfort_rating = excluded.avg_comfort_rating,
    avg_ease_rating = excluded.avg_ease_rating,
    sample_count = excluded.sample_count,
    last_feedback_at = excluded.last_feedback_at;
end;
$$;

create or replace function public.after_jigo_feedback_v6()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recompute_jigo_feedback_stats_v6(new.google_place_id);
  return new;
end;
$$;

drop trigger if exists trg_jigo_feedback_v6 on public.jigo_user_feedback_v6;
create trigger trg_jigo_feedback_v6
after insert on public.jigo_user_feedback_v6
for each row execute function public.after_jigo_feedback_v6();

alter table public.jigo_user_feedback_v6 enable row level security;
alter table public.jigo_feedback_stats_v6 enable row level security;

grant usage on schema public to anon, authenticated;
revoke all on public.jigo_user_feedback_v6 from anon, authenticated;
revoke all on public.jigo_feedback_stats_v6 from anon, authenticated;
grant insert on public.jigo_user_feedback_v6 to authenticated;
grant select on public.jigo_feedback_stats_v6 to anon, authenticated;

drop policy if exists "jigo_feedback_v6_own_insert" on public.jigo_user_feedback_v6;
create policy "jigo_feedback_v6_own_insert"
on public.jigo_user_feedback_v6
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "jigo_stats_v6_public_read" on public.jigo_feedback_stats_v6;
create policy "jigo_stats_v6_public_read"
on public.jigo_feedback_stats_v6
for select to anon, authenticated
using (true);
