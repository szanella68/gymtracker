const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Supabase URL or ANON KEY missing');
  return createClient(url, anon, { auth: { persistSession: false } });
}

async function ensureSupabaseSchema() {
  // Optional: create minimal tables if DATABASE_URL (service role) provided
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!databaseUrl) {
    console.log('ℹ Skipping schema ensure: DATABASE_URL not set');
    return;
  }

  const sql = `
  create extension if not exists "uuid-ossp";

  -- Add admin column to auth.users if it doesn't exist
  do $$ 
  begin
    if not exists (select 1 from information_schema.columns where table_schema = 'auth' and table_name = 'users' and column_name = 'admin') then
      alter table auth.users add column admin boolean default false;
    end if;
  end $$;

  create table if not exists user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    phone text,
    date_of_birth date,
    gender text check (gender in ('male','female','other')),
    height_cm integer,
    weight_kg real,
    fitness_goal text,
    experience_level text check (experience_level in ('beginner','intermediate','advanced')),
    medical_notes text,
    emergency_contact text,
    profile_picture_url text,
    created_at timestamp default now(),
    updated_at timestamp default now()
  );

  -- Remove user_type column from user_profiles if it exists (cleanup)
  do $$ 
  begin
    if exists (select 1 from information_schema.columns where table_name = 'user_profiles' and column_name = 'user_type') then
      alter table user_profiles drop column user_type;
    end if;
  end $$;
  create or replace function update_updated_at_column()
  returns trigger as $$
  begin
    new.updated_at = now();
    return new;
  end;$$ language plpgsql;
  drop trigger if exists trg_user_profiles_updated_at on user_profiles;
  create trigger trg_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();

  -- Personal goals table
  create table if not exists user_goals (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references user_profiles(id) on delete cascade,
    title text not null,
    description text,
    target_type text check (target_type in ('weight','reps','time','distance','custom')) default 'custom',
    target_value numeric,
    unit text,
    target_date date,
    status text check (status in ('pending','in_progress','completed','archived')) default 'in_progress',
    progress_value numeric,
    completed_at timestamp,
    created_at timestamp default now(),
    updated_at timestamp default now()
  );
  create index if not exists idx_user_goals_user on user_goals(user_id);
  drop trigger if exists trg_user_goals_updated_at on user_goals;
  create trigger trg_user_goals_updated_at
  before update on user_goals
  for each row execute function update_updated_at_column();

  -- Goal progress logs (weekly or arbitrary cadence)
  create table if not exists user_goal_progress (
    id uuid primary key default uuid_generate_v4(),
    goal_id uuid not null references user_goals(id) on delete cascade,
    log_date date not null default current_date,
    value numeric,
    note text,
    created_at timestamp default now()
  );
  create index if not exists idx_user_goal_progress_goal on user_goal_progress(goal_id, log_date);

  -- Calendar scheduled sessions table (used by trainer calendario)
  create table if not exists scheduled_sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references user_profiles(id) on delete cascade,
    sessione_id uuid not null,
    date date not null,
    created_at timestamp default now(),
    updated_at timestamp default now()
  );
  -- Optional FK to sessioni if table exists
  do $$
  begin
    if exists (select 1 from information_schema.tables where table_name = 'sessioni') then
      begin
        alter table scheduled_sessions
          add constraint fk_scheduled_sessioni foreign key (sessione_id) references sessioni(id) on delete cascade;
      exception when duplicate_object then null; end;
    end if;
  end$$;
  create index if not exists idx_scheduled_sessions_user_date on scheduled_sessions(user_id, date);
  create unique index if not exists uq_scheduled_sessions_user_session_date on scheduled_sessions(user_id, sessione_id, date);
  drop trigger if exists trg_scheduled_sessions_updated_at on scheduled_sessions;
  create trigger trg_scheduled_sessions_updated_at
  before update on scheduled_sessions
  for each row execute function update_updated_at_column();
  `;

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log('✅ Supabase schema ensured (user_profiles)');
  } finally {
    await client.end();
  }
}

module.exports = {
  getSupabaseClient,
  ensureSupabaseSchema,
};
