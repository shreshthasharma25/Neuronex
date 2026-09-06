-- ================================================================
-- NeuroNex — Supabase SQL Migration Script
-- Paste this entire block into: Supabase → SQL Editor → Run
-- ================================================================

-- 1. PATIENTS (core profile + settings)
CREATE TABLE IF NOT EXISTS patients (
  id                    TEXT PRIMARY KEY,
  full_name             TEXT,
  preferred_name        TEXT,
  age                   TEXT,
  gender                TEXT DEFAULT 'Female',
  email                 TEXT,
  phone                 TEXT,
  language              TEXT DEFAULT 'English',
  avatar_url            TEXT,

  home_address          TEXT,
  home_city             TEXT,
  safe_zone_radius      INT  DEFAULT 500,
  home_coordinates      JSONB,

  doctor_name           TEXT,
  doctor_phone          TEXT,

  difficulty_level      INT  DEFAULT 1,
  consecutive_high_scores INT DEFAULT 0,
  daily_exercise_done   BOOLEAN DEFAULT FALSE,
  exercise_time         TEXT DEFAULT '10:00 AM',

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FAMILY MEMBERS
CREATE TABLE IF NOT EXISTS family_members (
  id            TEXT PRIMARY KEY,
  patient_id    TEXT REFERENCES patients(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  relation      TEXT,
  phone         TEXT,
  photo_url     TEXT,
  notes         TEXT,
  is_emergency  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_family_patient ON family_members(patient_id);

-- 3. MEDICINES
CREATE TABLE IF NOT EXISTS medicines (
  id            TEXT PRIMARY KEY,
  patient_id    TEXT REFERENCES patients(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  dosage        TEXT,
  time          TEXT,
  instructions  TEXT,
  taken         BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_medicines_patient ON medicines(patient_id);

-- 4. TODOS / DAILY TASKS
CREATE TABLE IF NOT EXISTS todos (
  id            TEXT PRIMARY KEY,
  patient_id    TEXT REFERENCES patients(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  time          TEXT,
  recurrence    TEXT,
  completed     BOOLEAN DEFAULT FALSE,
  active        BOOLEAN DEFAULT TRUE,
  is_med        BOOLEAN DEFAULT FALSE,
  is_exercise   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_todos_patient ON todos(patient_id);

-- 5. MEMORIES
CREATE TABLE IF NOT EXISTS memories (
  id            TEXT PRIMARY KEY,
  patient_id    TEXT REFERENCES patients(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  date          TEXT,
  description   TEXT,
  photo_url     TEXT,
  tags          TEXT[],
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_memories_patient ON memories(patient_id);

-- 6. ALERTS (caregiver safety notifications)
CREATE TABLE IF NOT EXISTS alerts (
  id            TEXT PRIMARY KEY,
  patient_id    TEXT REFERENCES patients(id) ON DELETE CASCADE,
  type          TEXT DEFAULT 'warning',  -- 'warning' | 'success'
  title         TEXT NOT NULL,
  message       TEXT,
  resolved      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_alerts_patient ON alerts(patient_id);

-- 7. COGNITIVE SESSIONS (game history)
CREATE TABLE IF NOT EXISTS cognitive_sessions (
  id            TEXT PRIMARY KEY,
  patient_id    TEXT REFERENCES patients(id) ON DELETE CASCADE,
  game_id       TEXT,
  game_name     TEXT NOT NULL,
  accuracy      INT  NOT NULL,
  time_taken    TEXT,
  difficulty    TEXT,
  category      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_patient ON cognitive_sessions(patient_id);

-- ================================================================
-- ENABLE REAL-TIME for all tables (required for live sync)
-- ================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
ALTER PUBLICATION supabase_realtime ADD TABLE family_members;
ALTER PUBLICATION supabase_realtime ADD TABLE medicines;
ALTER PUBLICATION supabase_realtime ADD TABLE todos;
ALTER PUBLICATION supabase_realtime ADD TABLE memories;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE cognitive_sessions;

-- ================================================================
-- ROW LEVEL SECURITY (Recommended: leave off for hackathon/prototype)
-- In Supabase Dashboard → Authentication → Policies
-- ================================================================
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
-- (Configure after adding user auth policies)
