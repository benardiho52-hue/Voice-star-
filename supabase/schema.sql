-- VoiceStar Supabase schema
-- Run this in Supabase SQL editor

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  full_name text,
  artist_name text,
  bio text,
  avatar_url text,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artists (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  genre text,
  followers integer not null default 0,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  artist_name text not null,
  genre text not null default 'Afrobeats',
  description text,
  audio_url text,
  cover_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.followers (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  artist_id uuid references public.artists(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(profile_id, artist_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  room_name text not null default 'voice-star-room',
  sender_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.live_rooms (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  room_name text not null,
  is_live boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_groups (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  family_name text not null,
  role text not null default 'Member',
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  task_id text not null,
  title text not null,
  description text,
  reward integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, task_id)
);

create table if not exists public.gifts (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  sender_name text not null,
  message text,
  points integer not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  notifications_enabled boolean not null default true,
  private_profile boolean not null default false,
  owner_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id)
);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

create trigger artists_updated_at
before update on public.artists
for each row execute procedure public.handle_updated_at();

create trigger songs_updated_at
before update on public.songs
for each row execute procedure public.handle_updated_at();

create trigger live_rooms_updated_at
before update on public.live_rooms
for each row execute procedure public.handle_updated_at();

create trigger family_groups_updated_at
before update on public.family_groups
for each row execute procedure public.handle_updated_at();

create trigger tasks_updated_at
before update on public.tasks
for each row execute procedure public.handle_updated_at();

create trigger user_settings_updated_at
before update on public.user_settings
for each row execute procedure public.handle_updated_at();

-- Example RLS policies (must be enabled in Supabase)
-- If using auth, configure policies based on profile ownership.

alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.songs enable row level security;
alter table public.followers enable row level security;
alter table public.chat_messages enable row level security;
alter table public.live_rooms enable row level security;
alter table public.family_groups enable row level security;
alter table public.tasks enable row level security;
alter table public.gifts enable row level security;
alter table public.user_settings enable row level security;

-- Basic example policies for public read access on artists and songs
create policy "Artists are viewable by everyone"
on public.artists for select
using (true);

create policy "Songs are viewable by everyone"
on public.songs for select
using (true);

create policy "Anyone can insert chat messages"
on public.chat_messages for insert
with check (true);

create policy "Anyone can view chat messages"
on public.chat_messages for select
using (true);
