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

