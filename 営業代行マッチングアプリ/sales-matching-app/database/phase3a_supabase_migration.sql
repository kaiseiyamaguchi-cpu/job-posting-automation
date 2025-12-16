-- Phase 3-A (提案デモ用) Supabase DB差分反映SQL
-- 対象: sales-matching-app/database/schema.sql に合わせる
--
-- 注意:
-- - 既存の matching_requests.company_id/agency_id の参照先を users(id) → *_profiles(id) に変更します。
-- - 既にデータが入っている場合、外部キー制約が貼れず失敗する可能性があります。
--   デモ用途のため、ここでは既存データを削除して進めます（必要ならコメントアウトしてください）。

BEGIN;

-- =========================
-- 0) 事前: Extension
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- 1) 既存テーブル差分: matching_requests
-- =========================
-- デモ用途: 既存データがあるとFK貼り替えで失敗しやすいので削除
DELETE FROM messages;
DELETE FROM message_threads;
DELETE FROM matching_requests;

-- rejected_reason 追加
ALTER TABLE matching_requests
  ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

-- 既存FKを削除（参照先を差し替えるため）
ALTER TABLE matching_requests
  DROP CONSTRAINT IF EXISTS matching_requests_company_id_fkey;

ALTER TABLE matching_requests
  DROP CONSTRAINT IF EXISTS matching_requests_agency_id_fkey;

-- 正しいFKを追加（profiles.id参照）
ALTER TABLE matching_requests
  ADD CONSTRAINT matching_requests_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES company_profiles(id)
  ON DELETE CASCADE;

ALTER TABLE matching_requests
  ADD CONSTRAINT matching_requests_agency_id_fkey
  FOREIGN KEY (agency_id)
  REFERENCES agency_profiles(id)
  ON DELETE CASCADE;

-- RLSポリシー差し替え（company_id/agency_id の意味が変わるため）
DROP POLICY IF EXISTS "Companies can create matching requests" ON matching_requests;
DROP POLICY IF EXISTS "Companies can view own requests" ON matching_requests;
DROP POLICY IF EXISTS "Agencies can view and update requests to them" ON matching_requests;
DROP POLICY IF EXISTS "Agencies can update requests to them" ON matching_requests;
-- Admins can view all requests は既存でも問題ないが、念のため残す（重複作成を避ける）

CREATE POLICY "Companies can create matching requests"
  ON matching_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM company_profiles cp
      WHERE cp.id = matching_requests.company_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can view own requests"
  ON matching_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM company_profiles cp
      WHERE cp.id = matching_requests.company_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Agencies can view and update requests to them"
  ON matching_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM agency_profiles ap
      WHERE ap.id = matching_requests.agency_id
      AND ap.user_id = auth.uid()
    )
  );

CREATE POLICY "Agencies can update requests to them"
  ON matching_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM agency_profiles ap
      WHERE ap.id = matching_requests.agency_id
      AND ap.user_id = auth.uid()
    )
  );

-- =========================
-- 2) 既存テーブル差分: message_threads 未読カウント/トリガ
-- =========================
ALTER TABLE message_threads
  ADD COLUMN IF NOT EXISTS company_unread_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE message_threads
  ADD COLUMN IF NOT EXISTS agency_unread_count INTEGER NOT NULL DEFAULT 0;

-- メッセージINSERT時に last_message_at + 未読を更新するトリガ
CREATE OR REPLACE FUNCTION update_thread_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_threads
  SET
    last_message_at = NEW.created_at,
    company_unread_count = CASE
      WHEN NEW.sender_id != company_id THEN company_unread_count + 1
      ELSE company_unread_count
    END,
    agency_unread_count = CASE
      WHEN NEW.sender_id != agency_id THEN agency_unread_count + 1
      ELSE agency_unread_count
    END
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_thread_on_new_message ON messages;
CREATE TRIGGER update_thread_on_new_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_thread_on_new_message();

-- インデックス（存在しなければ追加）
CREATE INDEX IF NOT EXISTS idx_message_threads_company_unread_count
  ON message_threads(company_unread_count) WHERE company_unread_count > 0;

CREATE INDEX IF NOT EXISTS idx_message_threads_agency_unread_count
  ON message_threads(agency_unread_count) WHERE agency_unread_count > 0;

-- =========================
-- 3) 新規テーブル: job_posts / applications / appointments / schedule_requests / payments
-- =========================
CREATE TABLE IF NOT EXISTS job_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT,
  area TEXT,
  appointment_fee INTEGER NOT NULL DEFAULT 50000,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'closed')) DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_post_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agency_profiles(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  proposed_fee INTEGER,
  status TEXT NOT NULL CHECK (status IN ('applied', 'accepted', 'rejected')) DEFAULT 'applied',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_post_id, agency_id)
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_post_id UUID REFERENCES job_posts(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  thread_id UUID REFERENCES message_threads(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agency_profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  meeting_url TEXT,
  appointment_fee INTEGER NOT NULL,
  platform_fee_rate NUMERIC NOT NULL DEFAULT 0.2,
  platform_fee_amount INTEGER NOT NULL,
  agency_amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'paid', 'done', 'accepted', 'cancelled', 'refunded')) DEFAULT 'draft',
  payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid',
  payout_status TEXT NOT NULL CHECK (payout_status IN ('none', 'pending', 'paid', 'reversed')) DEFAULT 'none',
  paid_at TIMESTAMPTZ,
  done_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedule_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  proposed_times TIMESTAMPTZ[] NOT NULL DEFAULT '{}',
  confirmed_time TIMESTAMPTZ,
  meeting_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid',
  mock_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at 自動更新（存在していれば再利用）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_job_posts_updated_at ON job_posts;
CREATE TRIGGER update_job_posts_updated_at BEFORE UPDATE ON job_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedule_requests_updated_at ON schedule_requests;
CREATE TRIGGER update_schedule_requests_updated_at BEFORE UPDATE ON schedule_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- インデックス（存在しなければ追加）
CREATE INDEX IF NOT EXISTS idx_job_posts_company_id ON job_posts(company_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_status ON job_posts(status);
CREATE INDEX IF NOT EXISTS idx_job_posts_created_at ON job_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_job_post_id ON applications(job_post_id);
CREATE INDEX IF NOT EXISTS idx_applications_agency_id ON applications(agency_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_company_id ON appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_agency_id ON appointments(agency_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_schedule_requests_appointment_id ON schedule_requests(appointment_id);
CREATE INDEX IF NOT EXISTS idx_schedule_requests_status ON schedule_requests(status);

CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =========================
-- 4) RLS: 有効化
-- =========================
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- =========================
-- 5) RLS: job_posts
-- =========================
DROP POLICY IF EXISTS "Companies can create own job posts" ON job_posts;
DROP POLICY IF EXISTS "Companies can update own job posts" ON job_posts;
DROP POLICY IF EXISTS "All users can view published job posts" ON job_posts;
DROP POLICY IF EXISTS "Companies can view own job posts" ON job_posts;
DROP POLICY IF EXISTS "Admins can view all job posts" ON job_posts;

CREATE POLICY "Companies can create own job posts"
  ON job_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_profiles cp
      WHERE cp.id = job_posts.company_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update own job posts"
  ON job_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_profiles cp
      WHERE cp.id = job_posts.company_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "All users can view published job posts"
  ON job_posts FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'published');

CREATE POLICY "Companies can view own job posts"
  ON job_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_profiles cp
      WHERE cp.id = job_posts.company_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all job posts"
  ON job_posts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- 6) RLS: applications
-- =========================
DROP POLICY IF EXISTS "Agencies can create applications" ON applications;
DROP POLICY IF EXISTS "Agencies can view own applications" ON applications;
DROP POLICY IF EXISTS "Companies can manage applications to own job posts" ON applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;

CREATE POLICY "Agencies can create applications"
  ON applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agency_profiles ap
      WHERE ap.id = applications.agency_id AND ap.user_id = auth.uid()
    )
  );

CREATE POLICY "Agencies can view own applications"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agency_profiles ap
      WHERE ap.id = applications.agency_id AND ap.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can manage applications to own job posts"
  ON applications FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM job_posts jp
      JOIN company_profiles cp ON cp.id = jp.company_id
      WHERE jp.id = applications.job_post_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all applications"
  ON applications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- 7) RLS: appointments
-- =========================
DROP POLICY IF EXISTS "Participants can view appointments" ON appointments;
DROP POLICY IF EXISTS "Participants can update appointments" ON appointments;
DROP POLICY IF EXISTS "Companies can create appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can update all appointments" ON appointments;

CREATE POLICY "Participants can view appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM company_profiles cp WHERE cp.id = appointments.company_id AND cp.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM agency_profiles ap WHERE ap.id = appointments.agency_id AND ap.user_id = auth.uid())
  );

CREATE POLICY "Participants can update appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM company_profiles cp WHERE cp.id = appointments.company_id AND cp.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM agency_profiles ap WHERE ap.id = appointments.agency_id AND ap.user_id = auth.uid())
  );

CREATE POLICY "Companies can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM company_profiles cp WHERE cp.id = appointments.company_id AND cp.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all appointments"
  ON appointments FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update all appointments"
  ON appointments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- =========================
-- 8) RLS: schedule_requests
-- =========================
DROP POLICY IF EXISTS "Participants can view schedule requests" ON schedule_requests;
DROP POLICY IF EXISTS "Participants can manage schedule requests" ON schedule_requests;
DROP POLICY IF EXISTS "Admins can view all schedule requests" ON schedule_requests;

CREATE POLICY "Participants can view schedule requests"
  ON schedule_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM appointments a
      JOIN company_profiles cp ON cp.id = a.company_id
      WHERE a.id = schedule_requests.appointment_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM appointments a
      JOIN agency_profiles ap ON ap.id = a.agency_id
      WHERE a.id = schedule_requests.appointment_id AND ap.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can manage schedule requests"
  ON schedule_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM appointments a
      JOIN company_profiles cp ON cp.id = a.company_id
      WHERE a.id = schedule_requests.appointment_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM appointments a
      JOIN agency_profiles ap ON ap.id = a.agency_id
      WHERE a.id = schedule_requests.appointment_id AND ap.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all schedule requests"
  ON schedule_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- =========================
-- 9) RLS: payments
-- =========================
DROP POLICY IF EXISTS "Participants can view payments" ON payments;
DROP POLICY IF EXISTS "Companies can manage payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;

CREATE POLICY "Participants can view payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM appointments a
      JOIN company_profiles cp ON cp.id = a.company_id
      WHERE a.id = payments.appointment_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM appointments a
      JOIN agency_profiles ap ON ap.id = a.agency_id
      WHERE a.id = payments.appointment_id AND ap.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can manage payments"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM appointments a
      JOIN company_profiles cp ON cp.id = a.company_id
      WHERE a.id = payments.appointment_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

COMMIT;

