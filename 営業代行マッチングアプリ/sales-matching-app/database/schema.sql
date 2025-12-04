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
  company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monthly_budget INTEGER NOT NULL,
  request_details TEXT NOT NULL,
  proposal_deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
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

-- メッセージ検索用
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;

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

-- ============================================
-- トリガー: メッセージスレッドの最終メッセージ時刻を更新
-- ============================================

CREATE OR REPLACE FUNCTION update_thread_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_threads
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_on_new_message AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_thread_last_message_at();

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
  WITH CHECK (auth.uid() = company_id);

-- 企業は自分の申請を閲覧可能
CREATE POLICY "Companies can view own requests"
  ON matching_requests FOR SELECT
  USING (auth.uid() = company_id);

-- 営業代行は自分宛の申請を閲覧・更新可能
CREATE POLICY "Agencies can view and update requests to them"
  ON matching_requests FOR SELECT
  USING (auth.uid() = agency_id);

CREATE POLICY "Agencies can update requests to them"
  ON matching_requests FOR UPDATE
  USING (auth.uid() = agency_id);

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
-- サンプルデータ（開発用）
-- ============================================

-- 管理者ユーザー（手動で作成後、以下を実行）
-- INSERT INTO users (id, email, role) VALUES ('管理者のUUID', 'admin@example.com', 'admin');

