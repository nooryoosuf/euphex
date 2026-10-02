-- ─────────────────────────────────────────────────────────────
-- EUPHEX Supabase schema.
-- Run once: Supabase dashboard → SQL Editor → New query → paste → Run.
-- Then create the admin user: Authentication → Add user → email+password
-- (check "Auto Confirm User").
-- RLS: public read for everyone, writes for logged-in users only.
-- ─────────────────────────────────────────────────────────────

-- PLAYERS
create table if not exists players (
  slug text primary key,
  gamertag text not null,
  real_name text not null default '',
  role text not null,
  secondary_role text,
  team_slug text not null default '',
  country text not null default '',
  country_code text not null default '',
  joined text not null default '',
  matches integer not null default 0,
  win_rate numeric not null default 0,
  mvps integer not null default 0,
  quote text not null default '',
  playstyle text not null default '',
  signature_move text not null default '',
  favorite_hero text not null default '',
  hue integer not null default 220,
  number integer not null default 0,
  hero_pool jsonb not null default '[]',
  achievements jsonb not null default '[]',
  banner jsonb,
  avatar jsonb,
  updated_at timestamptz not null default now()
);

-- TEAMS
create table if not exists teams (
  slug text primary key,
  name text not null,
  short_name text not null default '',
  tier text not null default 'SECOND',
  index text not null default '',
  verb text not null default '',
  tagline text not null default '',
  description text not null default '',
  playstyle text[] not null default '{}',
  hue integer not null default 220,
  founded integer not null default 2026,
  wins integer not null default 0,
  losses integer not null default 0,
  championships integer not null default 0,
  achievements jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- MATCHES
create table if not exists matches (
  id text primary key,
  tournament_slug text not null default '',
  tournament_name text not null default '',
  stage text not null default '',
  team_slug text not null default '',
  opponent text not null default '',
  opponent_short text not null default '',
  date text not null default '',
  status text not null default 'upcoming',
  score_us integer,
  score_them integer,
  result text,
  games jsonb,
  stat_lines jsonb,
  venue text,
  updated_at timestamptz not null default now()
);

-- TOURNAMENTS
create table if not exists tournaments (
  slug text primary key,
  name text not null,
  stage text not null default '',
  status text not null default 'UPCOMING',
  date text not null default '',
  end_date text,
  prize_pool text,
  venue text,
  format text,
  team_slugs text[] not null default '{}',
  placement text,
  mvp text,
  hue integer not null default 220,
  description text not null default '',
  journey jsonb,
  standings jsonb,
  updated_at timestamptz not null default now()
);

-- NEWS
create table if not exists news (
  slug text primary key,
  category text not null default 'TEAM',
  title text not null,
  excerpt text not null default '',
  date text not null default '',
  read_minutes integer not null default 3,
  hue integer not null default 220,
  body text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- MEDIA
create table if not exists media (
  id text primary key,
  category text not null default 'TEAM',
  title text not null default '',
  hue integer not null default 220,
  tall boolean not null default false,
  updated_at timestamptz not null default now()
);

-- TIMELINE
create table if not exists timeline (
  id serial primary key,
  year text not null,
  title text not null,
  text text not null default '',
  updated_at timestamptz not null default now()
);

-- ── Row Level Security: public read, authenticated write ──
alter table players enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table tournaments enable row level security;
alter table news enable row level security;
alter table media enable row level security;
alter table timeline enable row level security;

do $$
declare t text;
begin
  foreach t in array array['players','teams','matches','tournaments','news','media','timeline'] loop
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('drop policy if exists "auth write" on %I', t);
    execute format('create policy "auth write" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')', t);
  end loop;
end $$;
