-- 外部キー制約の修正
-- 問題: 
--   - matching_requests.company_id が users(id) を参照
--   - matching_requests.agency_id が users(id) を参照
--   - しかし company_profiles.id と agency_profiles.id は別のUUID
--   - APIは company_profiles と agency_profiles とのリレーションを期待

-- ⚠️ 重要: 既に matching_requests テーブルにデータがある場合、
--         この操作は失敗する可能性があります。
--         その場合は、既存データを削除してから実行してください。

-- 1. 既存データを確認（必要に応じて削除）
-- SELECT * FROM matching_requests;  -- 確認用
DELETE FROM matching_requests;     -- データを削除

-- 2. 既存の外部キー制約を削除
ALTER TABLE matching_requests 
  DROP CONSTRAINT IF EXISTS matching_requests_company_id_fkey;

ALTER TABLE matching_requests 
  DROP CONSTRAINT IF EXISTS matching_requests_agency_id_fkey;

-- 3. 正しい外部キー制約を追加
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

