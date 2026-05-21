-- AIWatch Database Schema
-- Run this in the Supabase SQL editor to set up all tables

-- Incidents table (AI Incident Feed)
create table if not exists incidents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  summary text not null,
  source_url text not null,
  source_name text not null,
  published_at timestamptz not null,
  incident_type text not null default 'other',
  severity text not null default 'medium',
  country text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- News items table (Today's AI News)
create table if not exists news_items (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  summary text not null,
  source_url text unique not null,
  source_name text not null,
  published_at timestamptz not null,
  category text not null default 'general',
  created_at timestamptz default now()
);

-- Tools table (New Tools This Week)
create table if not exists tools (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  url text unique not null,
  category text not null default 'general',
  launched_at timestamptz not null,
  created_at timestamptz default now()
);

-- Graveyard table (AI Graveyard)
create table if not exists graveyard (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  shutdown_date date not null,
  reason text not null default 'shutdown',
  acquired_by text,
  notes text not null default '',
  source_url text unique,
  created_at timestamptz default now()
);

-- Hype items table (Hype vs Reality Board)
create table if not exists hype_items (
  id uuid default gen_random_uuid() primary key,
  prediction text not null,
  predicted_by text not null,
  predicted_at date not null,
  reality text,
  status text not null default 'pending',
  verdict_date date,
  confidence_score integer,
  source_url text unique,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists incidents_published_at_idx on incidents(published_at desc);
create index if not exists incidents_severity_idx on incidents(severity);
create index if not exists incidents_type_idx on incidents(incident_type);
create index if not exists news_items_published_at_idx on news_items(published_at desc);
create index if not exists tools_launched_at_idx on tools(launched_at desc);

-- Enable Row Level Security
alter table incidents enable row level security;
alter table news_items enable row level security;
alter table tools enable row level security;
alter table graveyard enable row level security;
alter table hype_items enable row level security;

-- Public read access (anon key can read all tables)
create policy "Public read incidents" on incidents for select using (true);
create policy "Public read news_items" on news_items for select using (true);
create policy "Public read tools" on tools for select using (true);
create policy "Public read graveyard" on graveyard for select using (true);
create policy "Public read hype_items" on hype_items for select using (true);

-- Service role has full access (used by GitHub Actions fetch script)
-- No extra policies needed — service role bypasses RLS by default
