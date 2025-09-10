# Database Schema - GymTracker Supabase

Documentazione completa dello schema database PostgreSQL su Supabase con Row Level Security (RLS)

## Overview Database

### Configurazione Supabase
- Project URL: `https://oyetlgzmnhdnjfucdtrj.supabase.co`
- Database: PostgreSQL 15+ con estensioni
- Authentication: Supabase Auth (JWT-based)
- Storage: Supabase Storage per file uploads
- Real-time: Abilitato per aggiornamenti live

### Sicurezza
- Row Level Security (RLS): Abilitato su tutte le tabelle
- API Keys: Anon Key (frontend) + Service Role Key (backend admin)
- Policies: Controllo accesso granulare per ruoli
- JWT Verification: Automatic token validation

## Schema Principale

### auth.users (Supabase Built-in)
```sql
-- Tabella gestita automaticamente da Supabase Auth
-- Non modificabile direttamente, solo via Auth API

auth.users {
  id: uuid (PRIMARY KEY)                 -- ID utente univoco
  email: text (UNIQUE)                   -- Email login
  encrypted_password: text               -- Password criptata
  email_confirmed_at: timestamp          -- Conferma email
  invited_at: timestamp                  -- Data invito
  confirmation_token: text               -- Token conferma
  confirmation_sent_at: timestamp        -- Invio conferma
  recovery_token: text                   -- Token recovery
  recovery_sent_at: timestamp            -- Invio recovery
  email_change_token: text               -- Token cambio email
  email_change: text                     -- Nuova email
  email_change_sent_at: timestamp        -- Invio cambio email
  last_sign_in_at: timestamp             -- Ultimo login
  raw_app_meta_data: jsonb               -- Metadata app
  raw_user_meta_data: jsonb              -- Metadata utente
  is_super_admin: boolean                -- Super admin flag
  created_at: timestamp                  -- Data creazione
  updated_at: timestamp                  -- Ultimo aggiornamento
  phone: text                            -- Telefono (opzionale)
  phone_confirmed_at: timestamp          -- Conferma telefono
  phone_change: text                     -- Cambio telefono
  phone_change_token: text               -- Token cambio telefono
  phone_change_sent_at: timestamp        -- Invio cambio telefono
  confirmed_at: timestamp                -- Data conferma generale
  email_change_confirm_status: integer   -- Status cambio email
  banned_until: timestamp                -- Ban temporaneo
  reauthentication_token: text           -- Token riautenticazione
  reauthentication_sent_at: timestamp    -- Invio riautenticazione
}
```

### Metadata Ruoli (raw_user_meta_data)
```json
{
  "role": "standard|admin",      // Ruolo utente
  "full_name": "Nome Cognome",   // Nome completo
  "avatar_url": "https://...",   // URL avatar
  "provider": "email",           // Provider autenticazione
  "providers": ["email"]         // Lista provider
}
```

## Tabelle Profili e Utenti

### user_profiles
```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informazioni Personali
  full_name text,                        -- Nome completo
  phone text,                            -- Telefono
  date_of_birth date,                    -- Data nascita
  gender text CHECK (gender IN ('male','female','other')), -- Genere
  
  -- Misure Fisiche
  height_cm integer,                     -- Altezza in cm
  weight_kg real,                        -- Peso in kg
  
  -- Fitness & Obiettivi
  fitness_goal text,                     -- Obiettivo fitness
  experience_level text CHECK (experience_level IN ('beginner','intermediate','advanced')),
  
  -- Informazioni Mediche
  medical_notes text,                    -- Note mediche
  emergency_contact text,                -- Contatto emergenza
  
  -- Configurazione Account
  profile_picture_url text,              -- URL foto profilo
  utente_attivo boolean DEFAULT true,    -- Account attivo
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_profiles_active ON user_profiles(utente_attivo);
CREATE INDEX idx_user_profiles_experience ON user_profiles(experience_level);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Utenti possono vedere/modificare solo il proprio profilo
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin possono gestire tutti i profili
CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger per aggiornamento automatico updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Tabelle Allenamenti

### schede (Workout Plans)
```sql
CREATE TABLE schede (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Informazioni Scheda
  titolo text NOT NULL,                  -- Nome scheda
  descrizione text,                      -- Descrizione dettagliata
  autore text DEFAULT 'Trainer Nicola', -- Chi ha creato la scheda
  
  -- Configurazione
  durata_settimane integer DEFAULT 4,   -- Durata in settimane
  sessioni_settimana integer DEFAULT 3, -- Sessioni per settimana
  attiva boolean DEFAULT true,          -- Scheda attiva
  cancellata boolean DEFAULT false,     -- Soft delete
  
  -- Note e Configurazione
  note text,                            -- Note trainer
  livello_difficolta text CHECK (livello_difficolta IN ('beginner','intermediate','advanced')),
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_schede_user ON schede(user_id);
CREATE INDEX idx_schede_active ON schede(attiva, cancellata);
CREATE INDEX idx_schede_created ON schede(created_at);

-- RLS Policies
ALTER TABLE schede ENABLE ROW LEVEL SECURITY;

-- Utenti vedono solo le proprie schede
CREATE POLICY "Users can view own schede" ON schede
  FOR SELECT USING (auth.uid() = user_id);

-- Admin possono gestire tutte le schede
CREATE POLICY "Admins can manage all schede" ON schede
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger updated_at
CREATE TRIGGER trg_schede_updated_at
  BEFORE UPDATE ON schede
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### sessioni (Workout Sessions)
```sql
CREATE TABLE sessioni (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  scheda_id uuid NOT NULL REFERENCES schede(id) ON DELETE CASCADE,
  
  -- Informazioni Sessione
  nome text NOT NULL,                    -- Nome sessione (es: "Push Day", "Legs")
  descrizione text,                      -- Descrizione sessione
  giorno_settimana integer CHECK (giorno_settimana BETWEEN 1 AND 7), -- 1=Lunedì, 7=Domenica
  ordine_nella_scheda integer DEFAULT 1, -- Ordine nella scheda
  
  -- Configurazione
  durata_stimata_minuti integer,         -- Durata prevista
  note text,                            -- Note specifiche
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sessioni_scheda ON sessioni(scheda_id);
CREATE INDEX idx_sessioni_ordine ON sessioni(scheda_id, ordine_nella_scheda);
CREATE INDEX idx_sessioni_giorno ON sessioni(giorno_settimana);

-- RLS Policies
ALTER TABLE sessioni ENABLE ROW LEVEL SECURITY;

-- Utenti vedono sessioni delle proprie schede
CREATE POLICY "Users can view own sessioni" ON sessioni
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM schede 
      WHERE schede.id = sessioni.scheda_id 
      AND schede.user_id = auth.uid()
    )
  );

-- Admin possono gestire tutte le sessioni
CREATE POLICY "Admins can manage all sessioni" ON sessioni
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger updated_at
CREATE TRIGGER trg_sessioni_updated_at
  BEFORE UPDATE ON sessioni
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### exercises (Esercizi)
```sql
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  sessione_id uuid NOT NULL REFERENCES sessioni(id) ON DELETE CASCADE,
  
  -- Informazioni Esercizio
  nome text NOT NULL,                    -- Nome esercizio
  descrizione text,                      -- Descrizione tecnica
  ordine_nella_sessione integer DEFAULT 1, -- Ordine nella sessione
  
  -- Configurazione Esercizio
  series integer NOT NULL DEFAULT 3,    -- Numero serie
  ripetizioni text,                      -- Ripetizioni (es: "8-12", "15", "AMRAP")
  peso_kg real,                          -- Peso suggerito
  recovery_seconds integer DEFAULT 90,   -- Recupero in secondi
  
  -- Nuovi Campi (Migrazione Gennaio 2025)
  intensity integer DEFAULT 0 CHECK (intensity >= 0 AND intensity <= 10), -- Intensità 0-10
  external_url text,                     -- Link video/tutorial
  
  -- Tipologia
  muscle_groups text,                    -- Gruppi muscolari (JSON array come text)
  equipment text,                        -- Attrezzatura necessaria
  
  -- Note
  note text,                            -- Note specifiche
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_exercises_sessione ON exercises(sessione_id);
CREATE INDEX idx_exercises_ordine ON exercises(sessione_id, ordine_nella_sessione);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING gin (to_tsvector('english', muscle_groups));

-- RLS Policies
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Utenti vedono esercizi delle proprie sessioni
CREATE POLICY "Users can view own exercises" ON exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessioni s
      JOIN schede sc ON s.scheda_id = sc.id
      WHERE s.id = exercises.sessione_id 
      AND sc.user_id = auth.uid()
    )
  );

-- Admin possono gestire tutti gli esercizi
CREATE POLICY "Admins can manage all exercises" ON exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger updated_at
CREATE TRIGGER trg_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Tabelle Tracking e Progressi

### workout_logs (Log Allenamenti)
```sql
CREATE TABLE workout_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sessione_id uuid NOT NULL REFERENCES sessioni(id) ON DELETE CASCADE,
  
  -- Data Allenamento
  workout_date date NOT NULL DEFAULT current_date,
  start_time timestamp,                  -- Inizio esercizio
  end_time timestamp,                    -- Fine esercizio
  
  -- Performance
  series_completed integer DEFAULT 0,    -- Serie completate
  ripetizioni_completate text,           -- Ripetizioni per serie (JSON: ["12","10","8"])
  peso_utilizzato real,                  -- Peso realmente usato
  recovery_time_seconds integer,         -- Recupero effettivo
  
  -- Qualità e Feedback
  rpe integer CHECK (rpe BETWEEN 1 AND 10), -- Rate of Perceived Exertion
  difficulty_rating integer CHECK (difficulty_rating BETWEEN 1 AND 5), -- Difficoltà percepita
  form_quality integer CHECK (form_quality BETWEEN 1 AND 5), -- Qualità esecuzione
  
  -- Note
  note text,                            -- Note utente
  
  -- Timestamp
  created_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, workout_date);
CREATE INDEX idx_workout_logs_exercise ON workout_logs(exercise_id);
CREATE INDEX idx_workout_logs_sessione ON workout_logs(sessione_id, workout_date);

-- RLS Policies
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Utenti vedono solo i propri log
CREATE POLICY "Users can view own workout_logs" ON workout_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout_logs" ON workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout_logs" ON workout_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin possono vedere tutti i log
CREATE POLICY "Admins can view all workout_logs" ON workout_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

## Tabelle Obiettivi e Pianificazione

### user_goals (Obiettivi Utente)
```sql
CREATE TABLE user_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Informazioni Obiettivo
  title text NOT NULL,                   -- Titolo obiettivo
  description text,                      -- Descrizione dettagliata
  
  -- Tipologia e Target
  target_type text CHECK (target_type IN ('weight','reps','time','distance','custom')) DEFAULT 'custom',
  target_value numeric,                  -- Valore target
  unit text,                            -- Unità di misura
  target_date date,                     -- Data target
  
  -- Status e Progresso
  status text CHECK (status IN ('pending','in_progress','completed','archived')) DEFAULT 'in_progress',
  progress_value numeric DEFAULT 0,      -- Valore attuale
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Completamento
  completed_at timestamp,               -- Data completamento
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_goals_user ON user_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_goals(status);
CREATE INDEX idx_user_goals_target_date ON user_goals(target_date);

-- RLS Policies
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Utenti gestiscono solo i propri obiettivi
CREATE POLICY "Users can manage own goals" ON user_goals
  FOR ALL USING (auth.uid() = user_id);

-- Admin possono vedere tutti gli obiettivi
CREATE POLICY "Admins can view all goals" ON user_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger updated_at
CREATE TRIGGER trg_user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### scheduled_sessions (Sessioni Calendarizzate)
```sql
CREATE TABLE scheduled_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  sessione_id uuid NOT NULL REFERENCES sessioni(id) ON DELETE CASCADE,
  
  -- Pianificazione
  scheduled_date date NOT NULL,          -- Data pianificata
  scheduled_time time,                   -- Ora pianificata (opzionale)
  
  -- Status
  status text CHECK (status IN ('scheduled','completed','skipped','rescheduled')) DEFAULT 'scheduled',
  completed_at timestamp,               -- Data completamento effettivo
  
  -- Note
  note text,                            -- Note specifiche
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_scheduled_sessions_user_date ON scheduled_sessions(user_id, scheduled_date);
CREATE INDEX idx_scheduled_sessions_status ON scheduled_sessions(status);
CREATE UNIQUE INDEX uq_scheduled_sessions_user_session_date 
  ON scheduled_sessions(user_id, sessione_id, scheduled_date);

-- RLS Policies
ALTER TABLE scheduled_sessions ENABLE ROW LEVEL SECURITY;

-- Utenti gestiscono solo le proprie sessioni pianificate
CREATE POLICY "Users can manage own scheduled sessions" ON scheduled_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Admin possono vedere tutte le sessioni pianificate
CREATE POLICY "Admins can view all scheduled sessions" ON scheduled_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger updated_at
CREATE TRIGGER trg_scheduled_sessions_updated_at
  BEFORE UPDATE ON scheduled_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Views e Query Utili

### View: User Workout Statistics
```sql
CREATE OR REPLACE VIEW user_workout_stats AS
SELECT 
  up.id as user_id,
  up.full_name,
  COUNT(DISTINCT wl.workout_date) as total_workout_days,
  COUNT(wl.id) as total_exercises_logged,
  AVG(wl.rpe) as avg_rpe,
  MAX(wl.workout_date) as last_workout_date,
  COUNT(DISTINCT CASE WHEN wl.workout_date >= current_date - interval '30 days' THEN wl.workout_date END) as workouts_last_30_days
FROM user_profiles up
LEFT JOIN workout_logs wl ON up.id = wl.user_id
GROUP BY up.id, up.full_name;
```

### View: Exercise Progress
```sql
CREATE OR REPLACE VIEW exercise_progress AS
SELECT 
  wl.user_id,
  e.nome as exercise_name,
  wl.workout_date,
  wl.peso_utilizzato,
  LAG(wl.peso_utilizzato) OVER (PARTITION BY wl.user_id, wl.exercise_id ORDER BY wl.workout_date) as previous_weight,
  wl.peso_utilizzato - LAG(wl.peso_utilizzato) OVER (PARTITION BY wl.user_id, wl.exercise_id ORDER BY wl.workout_date) as weight_progress
FROM workout_logs wl
JOIN exercises e ON wl.exercise_id = e.id
WHERE wl.peso_utilizzato IS NOT NULL
ORDER BY wl.user_id, e.nome, wl.workout_date;
```

## Operazioni di Manutenzione

### Script Verifica Integrità
```sql
-- Verifica esistenza tabelle principali
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'schede', 'sessioni', 'exercises', 'workout_logs');

-- Conteggio record per tabella
SELECT 
  'user_profiles' as table_name, COUNT(*) as record_count FROM user_profiles
UNION ALL
SELECT 'schede', COUNT(*) FROM schede
UNION ALL
SELECT 'sessioni', COUNT(*) FROM sessioni
UNION ALL
SELECT 'exercises', COUNT(*) FROM exercises
UNION ALL
SELECT 'workout_logs', COUNT(*) FROM workout_logs;

-- Verifica RLS abilitato
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'schede', 'sessioni', 'exercises', 'workout_logs');
```

### Cleanup Dati Vecchi
```sql
-- Rimuovi log workout più vecchi di 2 anni
DELETE FROM workout_logs 
WHERE workout_date < current_date - interval '2 years';

-- Soft delete schede non utilizzate da più di 6 mesi
UPDATE schede 
SET cancellata = true 
WHERE updated_at < current_date - interval '6 months' 
AND attiva = false
AND id NOT IN (
  SELECT DISTINCT scheda_id 
  FROM sessioni s 
  JOIN workout_logs wl ON s.id = wl.sessione_id 
  WHERE wl.workout_date > current_date - interval '6 months'
);
```

### Statistiche Performance
```sql
-- Query più lente (richiede pg_stat_statements)
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
WHERE query LIKE '%user_profiles%' OR query LIKE '%workout_logs%'
ORDER BY mean_time DESC 
LIMIT 10;

-- Dimensioni tabelle
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Migrazione e Backup

### Script Backup Completo
```bash
#!/bin/bash
# backup_gymtracker.sh

# Configurazione
SUPABASE_PROJECT="oyetlgzmnhdnjfucdtrj"
BACKUP_DIR="/backups/gymtracker"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup schema
pg_dump "postgresql://postgres:[PASSWORD]@db.${SUPABASE_PROJECT}.supabase.co:5432/postgres" \
  --schema-only \
  --no-owner \
  --no-privileges \
  > "${BACKUP_DIR}/schema_${DATE}.sql"

# Backup dati
pg_dump "postgresql://postgres:[PASSWORD]@db.${SUPABASE_PROJECT}.supabase.co:5432/postgres" \
  --data-only \
  --no-owner \
  --no-privileges \
  --table=user_profiles \
  --table=schede \
  --table=sessioni \
  --table=exercises \
  --table=workout_logs \
  > "${BACKUP_DIR}/data_${DATE}.sql"

echo "Backup completato: ${BACKUP_DIR}/{schema,data}_${DATE}.sql"
```

### Migration Patches
```sql
-- Patch 2025.01.15: Aggiungi campi intensity e external_url
ALTER TABLE exercises 
  ADD COLUMN IF NOT EXISTS intensity integer DEFAULT 0 CHECK (intensity >= 0 AND intensity <= 10),
  ADD COLUMN IF NOT EXISTS external_url text;

-- Patch 2025.01.20: Migliora indicizzazione workout_logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_logs_user_exercise_date 
  ON workout_logs(user_id, exercise_id, workout_date);

-- Patch 2025.01.25: Aggiungi campo completion_percentage a user_goals
ALTER TABLE user_goals 
  ADD COLUMN IF NOT EXISTS completion_percentage integer DEFAULT 0 
  CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
```

## Monitoring e Alerting

### Query Monitoraggio
```sql
-- Utenti attivi ultimi 7 giorni
SELECT COUNT(DISTINCT user_id) as active_users_7d
FROM workout_logs 
WHERE workout_date >= current_date - interval '7 days';

-- Schede create negli ultimi 30 giorni
SELECT COUNT(*) as new_schede_30d
FROM schede 
WHERE created_at >= current_date - interval '30 days';

-- Errori di integrità referenziale
SELECT 'Orphaned workout_logs' as issue, COUNT(*) as count
FROM workout_logs wl
LEFT JOIN user_profiles up ON wl.user_id = up.id
WHERE up.id IS NULL
UNION ALL
SELECT 'Orphaned exercises' as issue, COUNT(*) as count
FROM exercises e
LEFT JOIN sessioni s ON e.sessione_id = s.id
WHERE s.id IS NULL;
```

Questo schema database rappresenta la base solida e scalabile per il sistema GymTracker, progettato per crescere con le esigenze del business.