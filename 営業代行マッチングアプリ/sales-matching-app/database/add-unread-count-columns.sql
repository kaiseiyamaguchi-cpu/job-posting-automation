-- message_threadsテーブルに未読カウントカラムを追加

ALTER TABLE message_threads 
ADD COLUMN IF NOT EXISTS company_unread_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE message_threads 
ADD COLUMN IF NOT EXISTS agency_unread_count INTEGER NOT NULL DEFAULT 0;

