-- message_threadsテーブルのRLSポリシーを修正

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Create thread for approved matching" ON message_threads;
DROP POLICY IF EXISTS "Participants can view threads" ON message_threads;
DROP POLICY IF EXISTS "Admins can view all threads" ON message_threads;

-- 新しいポリシーを作成

-- 承認されたマッチングのスレッドを作成可能
-- matching_requests の company_id/agency_id は profiles を参照しているので、
-- user_id を経由してチェック
CREATE POLICY "Create thread for approved matching"
  ON message_threads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matching_requests mr
      LEFT JOIN company_profiles cp ON mr.company_id = cp.id
      LEFT JOIN agency_profiles ap ON mr.agency_id = ap.id
      WHERE mr.id = matching_request_id
      AND mr.status = 'approved'
      AND (cp.user_id = auth.uid() OR ap.user_id = auth.uid())
    )
  );

-- 関係者（企業・営業代行）はスレッドを閲覧可能
-- message_threads の company_id/agency_id は users.id を参照
CREATE POLICY "Participants can view threads"
  ON message_threads FOR SELECT
  USING (
    auth.uid() = company_id OR auth.uid() = agency_id
  );

-- 注意: 管理者ポリシーは削除しました（無限再帰の問題）

