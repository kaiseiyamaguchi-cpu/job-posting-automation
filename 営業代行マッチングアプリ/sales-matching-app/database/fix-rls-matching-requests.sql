-- matching_requestsテーブルのRLSポリシーを修正
-- 問題: auth.uid() と company_id/agency_id を直接比較しているが、
--       company_id は company_profiles.id を、
--       agency_id は agency_profiles.id を参照している

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Companies can create matching requests" ON matching_requests;
DROP POLICY IF EXISTS "Companies can view own requests" ON matching_requests;
DROP POLICY IF EXISTS "Agencies can view and update requests to them" ON matching_requests;
DROP POLICY IF EXISTS "Agencies can update requests to them" ON matching_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON matching_requests;

-- 新しいポリシーを作成

-- 企業は自分の company_profile を通じて申請を作成可能
CREATE POLICY "Companies can create matching requests"
  ON matching_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_profiles
      WHERE id = company_id AND user_id = auth.uid()
    )
  );

-- 企業は自分の申請を閲覧可能
CREATE POLICY "Companies can view own requests"
  ON matching_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_profiles
      WHERE id = company_id AND user_id = auth.uid()
    )
  );

-- 営業代行は自分宛の申請を閲覧可能
CREATE POLICY "Agencies can view requests to them"
  ON matching_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agency_profiles
      WHERE id = agency_id AND user_id = auth.uid()
    )
  );

-- 営業代行は自分宛の申請を更新可能
CREATE POLICY "Agencies can update requests to them"
  ON matching_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agency_profiles
      WHERE id = agency_id AND user_id = auth.uid()
    )
  );

-- 注意: 管理者ポリシーは削除しました（無限再帰の問題）

