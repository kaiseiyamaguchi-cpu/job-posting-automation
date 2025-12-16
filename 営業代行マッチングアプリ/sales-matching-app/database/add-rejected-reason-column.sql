-- matching_requestsテーブルにrejected_reasonカラムを追加

ALTER TABLE matching_requests 
ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

