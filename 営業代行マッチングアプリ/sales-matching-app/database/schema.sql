-- ============================================
-- 営業代行マッチングアプリ - データベーススキーマ
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ユーザーテーブル
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('company', 'agency', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. 企業プロフィールテーブル
-- ============================================
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  area TEXT NOT NULL,
  request_content TEXT,
  contact_person TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 3. 営業代行プロフィールテーブル
-- ============================================
CREATE TABLE agency_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}', -- 得意分野（複数）
  areas TEXT[] NOT NULL DEFAULT '{}', -- 対応エリア（複数）
  bio TEXT,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 4. マッチング申請テーブル
-- ============================================
CREATE TABLE matching_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- NOTE: company_id/agency_id は「users.id」ではなく「*_profiles.id」を参照する
  --       （API実装が company_profiles.id / agency_profiles.id を保存する前提のため）
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agency_profiles(id) ON DELETE CASCADE,
  monthly_budget INTEGER NOT NULL,
  request_details TEXT NOT NULL,
  proposal_deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  rejected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 5. メッセージスレッドテーブル
-- ============================================
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matching_request_id UUID NOT NULL REFERENCES matching_requests(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  -- 未読件数（スレッド単位）
  company_unread_count INTEGER NOT NULL DEFAULT 0,
  agency_unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(matching_request_id)
);

-- ============================================
-- 6. メッセージテーブル
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. 案件募集（企業）テーブル
-- ============================================
CREATE TABLE job_posts (
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

-- ============================================
-- 8. 応募（営業代行）テーブル
-- ============================================
CREATE TABLE applications (
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

-- ============================================
-- 9. 取引（アポ＝お金の単位）テーブル
-- ============================================
CREATE TABLE appointments (
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

-- ============================================
-- 10. 日程調整テーブル（候補→確定）
-- ============================================
CREATE TABLE schedule_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  proposed_times TIMESTAMPTZ[] NOT NULL DEFAULT '{}',
  confirmed_time TIMESTAMPTZ,
  meeting_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 11. 支払い（モック）テーブル
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid',
  mock_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- インデックス
-- ============================================

-- ユーザー検索用
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 営業代行検索用
CREATE INDEX idx_agency_profiles_specialties ON agency_profiles USING GIN(specialties);
CREATE INDEX idx_agency_profiles_areas ON agency_profiles USING GIN(areas);

-- マッチング申請検索用
CREATE INDEX idx_matching_requests_company_id ON matching_requests(company_id);
CREATE INDEX idx_matching_requests_agency_id ON matching_requests(agency_id);
CREATE INDEX idx_matching_requests_status ON matching_requests(status);
CREATE INDEX idx_matching_requests_created_at ON matching_requests(created_at DESC);

-- メッセージスレッド検索用
CREATE INDEX idx_message_threads_company_id ON message_threads(company_id);
CREATE INDEX idx_message_threads_agency_id ON message_threads(agency_id);
CREATE INDEX idx_message_threads_last_message_at ON message_threads(last_message_at DESC);
CREATE INDEX idx_message_threads_company_unread_count ON message_threads(company_unread_count) WHERE company_unread_count > 0;
CREATE INDEX idx_message_threads_agency_unread_count ON message_threads(agency_unread_count) WHERE agency_unread_count > 0;

-- メッセージ検索用
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;

-- 案件募集検索用
CREATE INDEX idx_job_posts_company_id ON job_posts(company_id);
CREATE INDEX idx_job_posts_status ON job_posts(status);
CREATE INDEX idx_job_posts_created_at ON job_posts(created_at DESC);

-- 応募検索用
CREATE INDEX idx_applications_job_post_id ON applications(job_post_id);
CREATE INDEX idx_applications_agency_id ON applications(agency_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- 取引（アポ）検索用
CREATE INDEX idx_appointments_company_id ON appointments(company_id);
CREATE INDEX idx_appointments_agency_id ON appointments(agency_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);

-- 日程調整検索用
CREATE INDEX idx_schedule_requests_appointment_id ON schedule_requests(appointment_id);
CREATE INDEX idx_schedule_requests_status ON schedule_requests(status);

-- 支払い検索用
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- トリガー: updated_at自動更新
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON company_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_profiles_updated_at BEFORE UPDATE ON agency_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matching_requests_updated_at BEFORE UPDATE ON matching_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON message_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_posts_updated_at BEFORE UPDATE ON job_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_requests_updated_at BEFORE UPDATE ON schedule_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- トリガー: メッセージスレッドの最終メッセージ時刻を更新
-- ============================================

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

CREATE TRIGGER update_thread_on_new_message AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_thread_on_new_message();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS ポリシー: users
-- ============================================

-- 自分のユーザー情報は読み取り可能
CREATE POLICY "Users can view own user data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 管理者は全ユーザーを閲覧可能
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS ポリシー: company_profiles
-- ============================================

-- 企業は自分のプロフィールを作成・更新可能
CREATE POLICY "Companies can manage own profile"
  ON company_profiles FOR ALL
  USING (auth.uid() = user_id);

-- 営業代行と管理者は企業プロフィールを閲覧可能
CREATE POLICY "Agencies and admins can view company profiles"
  ON company_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('agency', 'admin')
    )
  );

-- ============================================
-- RLS ポリシー: agency_profiles
-- ============================================

-- 営業代行は自分のプロフィールを作成・更新可能
CREATE POLICY "Agencies can manage own profile"
  ON agency_profiles FOR ALL
  USING (auth.uid() = user_id);

-- 全ユーザーは営業代行プロフィールを閲覧可能（検索用）
CREATE POLICY "All authenticated users can view agency profiles"
  ON agency_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS ポリシー: matching_requests
-- ============================================

-- 企業は自分の申請を作成可能
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

-- 企業は自分の申請を閲覧可能
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

-- 営業代行は自分宛の申請を閲覧・更新可能
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

-- 管理者は全申請を閲覧可能
CREATE POLICY "Admins can view all requests"
  ON matching_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS ポリシー: message_threads
-- ============================================

-- 承認されたマッチングのスレッドを作成可能
CREATE POLICY "Create thread for approved matching"
  ON message_threads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matching_requests
      WHERE id = matching_request_id
      AND status = 'approved'
      AND (company_id = auth.uid() OR agency_id = auth.uid())
    )
  );

-- 関係者（企業・営業代行）はスレッドを閲覧可能
CREATE POLICY "Participants can view threads"
  ON message_threads FOR SELECT
  USING (
    auth.uid() = company_id OR auth.uid() = agency_id
  );

-- 管理者は全スレッドを閲覧可能
CREATE POLICY "Admins can view all threads"
  ON message_threads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS ポリシー: messages
-- ============================================

-- スレッドの参加者はメッセージを作成可能
CREATE POLICY "Thread participants can create messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE id = thread_id
      AND (company_id = auth.uid() OR agency_id = auth.uid())
    )
  );

-- スレッドの参加者はメッセージを閲覧可能
CREATE POLICY "Thread participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE id = thread_id
      AND (company_id = auth.uid() OR agency_id = auth.uid())
    )
  );

-- メッセージの受信者は既読状態を更新可能
CREATE POLICY "Recipients can update read status"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE id = thread_id
      AND (company_id = auth.uid() OR agency_id = auth.uid())
      AND sender_id != auth.uid()
    )
  );

-- 管理者は全メッセージを閲覧可能
CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS ポリシー: job_posts
-- ============================================

-- 企業は自社の案件を作成可能
CREATE POLICY "Companies can create own job posts"
  ON job_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_profiles cp
      WHERE cp.id = job_posts.company_id
      AND cp.user_id = auth.uid()
    )
  );

-- 企業は自社の案件を更新可能
CREATE POLICY "Companies can update own job posts"
  ON job_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_profiles cp
      WHERE cp.id = job_posts.company_id
      AND cp.user_id = auth.uid()
    )
  );

-- 認証済みユーザーは公開案件を閲覧可能
CREATE POLICY "All users can view published job posts"
  ON job_posts FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'published');

-- 企業は自社の案件を閲覧可能（下書き含む）
CREATE POLICY "Companies can view own job posts"
  ON job_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_profiles cp
      WHERE cp.id = job_posts.company_id
      AND cp.user_id = auth.uid()
    )
  );

-- 管理者は全案件を閲覧可能
CREATE POLICY "Admins can view all job posts"
  ON job_posts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- RLS ポリシー: applications
-- ============================================

-- 営業代行は自分の応募を作成可能
CREATE POLICY "Agencies can create applications"
  ON applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agency_profiles ap
      WHERE ap.id = applications.agency_id
      AND ap.user_id = auth.uid()
    )
  );

-- 営業代行は自分の応募を閲覧可能
CREATE POLICY "Agencies can view own applications"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agency_profiles ap
      WHERE ap.id = applications.agency_id
      AND ap.user_id = auth.uid()
    )
  );

-- 企業は自社案件への応募を閲覧・更新（採用/却下）可能
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

-- 管理者は全応募を閲覧可能
CREATE POLICY "Admins can view all applications"
  ON applications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- RLS ポリシー: appointments
-- ============================================

-- 参加者（企業・営業代行）は取引を閲覧可能
CREATE POLICY "Participants can view appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_profiles cp
      WHERE cp.id = appointments.company_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM agency_profiles ap
      WHERE ap.id = appointments.agency_id AND ap.user_id = auth.uid()
    )
  );

-- 参加者は取引を更新可能（モック運用のため広め）
CREATE POLICY "Participants can update appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_profiles cp
      WHERE cp.id = appointments.company_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM agency_profiles ap
      WHERE ap.id = appointments.agency_id AND ap.user_id = auth.uid()
    )
  );

-- 企業は取引を作成可能
CREATE POLICY "Companies can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_profiles cp
      WHERE cp.id = appointments.company_id AND cp.user_id = auth.uid()
    )
  );

-- 管理者は全取引を閲覧可能
CREATE POLICY "Admins can view all appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 管理者は全取引を更新可能（デモ用）
CREATE POLICY "Admins can update all appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- RLS ポリシー: schedule_requests
-- ============================================

-- 参加者は日程調整を閲覧可能
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

-- 参加者は日程調整を作成・更新可能（モック運用のため広め）
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

-- 管理者は全日程調整を閲覧可能
CREATE POLICY "Admins can view all schedule requests"
  ON schedule_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- RLS ポリシー: payments
-- ============================================

-- 参加者は支払いを閲覧可能
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

-- 企業は支払いを作成・更新可能（モック決済）
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

-- 管理者は全支払いを閲覧可能
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- サンプルデータ（開発用）
-- ============================================

-- 管理者ユーザー（手動で作成後、以下を実行）
-- INSERT INTO users (id, email, role) VALUES ('管理者のUUID', 'admin@example.com', 'admin');

