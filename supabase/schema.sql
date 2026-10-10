-- Termin Futbolli — run once in Supabase SQL Editor (fresh install).

drop table if exists ratings cascade;
drop table if exists match_players cascade;
drop table if exists people cascade;
drop table if exists matches cascade;

create table matches (
  id text primary key,
  code text unique not null,
  organizer_id text not null,
  organizer_token text not null,
  manager_person_ids text[] not null default '{}',
  manager_device_keys text[] not null default '{}',
  title text not null default 'Termin',
  starts_at timestamptz not null,
  location text not null default '',
  notes text not null default '',
  field_type text not null check (field_type in ('small', 'large')),
  bench_size int not null default 2,
  status text not null default 'open' check (status in ('open', 'closed', 'played')),
  formation_a text not null,
  formation_b text not null,
  created_at timestamptz not null default now()
);

create table people (
  id text primary key,
  name text not null,
  is_gk boolean not null default false
);

create table match_players (
  id text primary key,
  match_id text not null references matches(id) on delete cascade,
  person_id text not null references people(id),
  name text not null,
  is_gk boolean not null default false,
  device_key text,
  team text not null default 'unassigned',
  slot_index int,
  status text not null check (status in ('in', 'waitlist', 'out', 'removed')),
  joined_at bigint not null
);

create table ratings (
  rater_key text not null,
  ratee_id text not null references people(id) on delete cascade,
  score int not null check (score between 1 and 10),
  primary key (rater_key, ratee_id)
);

create index match_players_match_id on match_players (match_id);
create index matches_code on matches (code);

alter table matches enable row level security;
alter table people enable row level security;
alter table match_players enable row level security;
alter table ratings enable row level security;

create policy "matches_all" on matches for all using (true) with check (true);
create policy "people_all" on people for all using (true) with check (true);
create policy "mp_all" on match_players for all using (true) with check (true);
create policy "ratings_all" on ratings for all using (true) with check (true);

do $$ begin
  alter publication supabase_realtime add table matches;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table match_players;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table ratings;
exception when duplicate_object then null;
end $$;
