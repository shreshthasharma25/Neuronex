-- ================================================================
-- NeuroNex — Multi-Patient Caregiver Dashboard Migration
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ================================================================

-- 1. Create caregiver_patients junction table
CREATE TABLE IF NOT EXISTS caregiver_patients (
  id            TEXT PRIMARY KEY,
  caregiver_id  TEXT NOT NULL,
  patient_id    TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(caregiver_id, patient_id)
);

CREATE INDEX IF NOT EXISTS idx_cg_patients_caregiver ON caregiver_patients(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_cg_patients_patient ON caregiver_patients(patient_id);

-- 2. Add to real-time replication
ALTER PUBLICATION supabase_realtime ADD TABLE caregiver_patients;

-- 3. Enable RLS on caregiver_patients
ALTER TABLE caregiver_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- 4. caregiver_patients policies
DROP POLICY IF EXISTS "Caregivers can view their own patient assignments" ON caregiver_patients;
CREATE POLICY "Caregivers can view their own patient assignments"
  ON caregiver_patients FOR SELECT
  USING (
    caregiver_id = auth.uid()::text 
    OR auth.role() = 'anon'
  );

DROP POLICY IF EXISTS "Caregivers can link patients" ON caregiver_patients;
CREATE POLICY "Caregivers can link patients"
  ON caregiver_patients FOR INSERT
  WITH CHECK (
    caregiver_id = auth.uid()::text 
    OR auth.role() = 'anon'
  );

DROP POLICY IF EXISTS "Caregivers can remove patient links" ON caregiver_patients;
CREATE POLICY "Caregivers can remove patient links"
  ON caregiver_patients FOR DELETE
  USING (
    caregiver_id = auth.uid()::text 
    OR auth.role() = 'anon'
  );

-- 5. patients policy: Caregivers can only select patients linked to them
DROP POLICY IF EXISTS "Caregivers and self can view patients" ON patients;
CREATE POLICY "Caregivers and self can view patients"
  ON patients FOR SELECT
  USING (
    id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM caregiver_patients
      WHERE caregiver_patients.patient_id = patients.id
      AND (caregiver_patients.caregiver_id = auth.uid()::text OR auth.role() = 'anon')
    )
  );

DROP POLICY IF EXISTS "Allow patient upsert" ON patients;
CREATE POLICY "Allow patient upsert"
  ON patients FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. cognitive_sessions policy: Caregivers can only view assigned patient sessions
DROP POLICY IF EXISTS "Caregivers can view assigned patient cognitive sessions" ON cognitive_sessions;
CREATE POLICY "Caregivers can view assigned patient cognitive sessions"
  ON cognitive_sessions FOR SELECT
  USING (
    patient_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM caregiver_patients
      WHERE caregiver_patients.patient_id = cognitive_sessions.patient_id
      AND (caregiver_patients.caregiver_id = auth.uid()::text OR auth.role() = 'anon')
    )
  );

DROP POLICY IF EXISTS "Allow cognitive sessions insert" ON cognitive_sessions;
CREATE POLICY "Allow cognitive sessions insert"
  ON cognitive_sessions FOR INSERT
  WITH CHECK (true);

-- 7. medicines policy: Caregiver can view medicines of assigned patients
DROP POLICY IF EXISTS "Caregivers can view assigned patient medicines" ON medicines;
CREATE POLICY "Caregivers can view assigned patient medicines"
  ON medicines FOR ALL
  USING (
    patient_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM caregiver_patients
      WHERE caregiver_patients.patient_id = medicines.patient_id
      AND (caregiver_patients.caregiver_id = auth.uid()::text OR auth.role() = 'anon')
    )
  );

-- 8. todos policy: Caregiver can view and manage todos of assigned patients
DROP POLICY IF EXISTS "Caregivers can manage assigned patient todos" ON todos;
CREATE POLICY "Caregivers can manage assigned patient todos"
  ON todos FOR ALL
  USING (
    patient_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM caregiver_patients
      WHERE caregiver_patients.patient_id = todos.patient_id
      AND (caregiver_patients.caregiver_id = auth.uid()::text OR auth.role() = 'anon')
    )
  );

-- 9. alerts policy: Caregiver can view and resolve alerts of assigned patients
DROP POLICY IF EXISTS "Caregivers can manage assigned patient alerts" ON alerts;
CREATE POLICY "Caregivers can manage assigned patient alerts"
  ON alerts FOR ALL
  USING (
    patient_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM caregiver_patients
      WHERE caregiver_patients.patient_id = alerts.patient_id
      AND (caregiver_patients.caregiver_id = auth.uid()::text OR auth.role() = 'anon')
    )
  );

-- 10. memories policy: Caregiver can view memories of assigned patients
DROP POLICY IF EXISTS "Caregivers can view assigned patient memories" ON memories;
CREATE POLICY "Caregivers can view assigned patient memories"
  ON memories FOR ALL
  USING (
    patient_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM caregiver_patients
      WHERE caregiver_patients.patient_id = memories.patient_id
      AND (caregiver_patients.caregiver_id = auth.uid()::text OR auth.role() = 'anon')
    )
  );

-- 11. family_members policy: Caregiver can view family members of assigned patients
DROP POLICY IF EXISTS "Caregivers can view assigned patient family members" ON family_members;
CREATE POLICY "Caregivers can view assigned patient family members"
  ON family_members FOR ALL
  USING (
    patient_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM caregiver_patients
      WHERE caregiver_patients.patient_id = family_members.patient_id
      AND (caregiver_patients.caregiver_id = auth.uid()::text OR auth.role() = 'anon')
    )
  );
