-- テストデータ投入スクリプト
-- Supabase SQL Editorで実行してください

-- 注意: このスクリプトを実行する前に、auth.usersテーブルにユーザーを作成しておく必要があります
-- 1. Supabaseダッシュボード > Authentication > Users から手動でユーザーを作成
-- 2. このスクリプトを実行してプロフィールとデータを作成

-- ============================================
-- 1. テストユーザーの作成
-- ============================================
-- ※ Supabaseダッシュボードから手動で作成してください
-- 
-- 管理者: admin@example.com / password: admin123456
-- 企業1: company1@example.com / password: company123
-- 企業2: company2@example.com / password: company123
-- 営業代行1: agency1@example.com / password: agency123
-- 営業代行2: agency2@example.com / password: agency123
-- 営業代行3: agency3@example.com / password: agency123

-- ============================================
-- 2. usersテーブルにロールを設定
-- ============================================

-- 管理者ユーザー
INSERT INTO users (id, email, role)
SELECT 
  id, 
  email,
  'admin'::user_role
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (id) 
DO UPDATE SET role = 'admin'::user_role;

-- 企業ユーザー
INSERT INTO users (id, email, role)
SELECT 
  id, 
  email,
  'company'::user_role
FROM auth.users
WHERE email IN ('company1@example.com', 'company2@example.com')
ON CONFLICT (id) 
DO UPDATE SET role = 'company'::user_role;

-- 営業代行ユーザー
INSERT INTO users (id, email, role)
SELECT 
  id, 
  email,
  'agency'::user_role
FROM auth.users
WHERE email IN ('agency1@example.com', 'agency2@example.com', 'agency3@example.com')
ON CONFLICT (id) 
DO UPDATE SET role = 'agency'::user_role;

-- ============================================
-- 3. 企業プロフィールの作成
-- ============================================

-- 企業1: テクノロジー企業
INSERT INTO company_profiles (user_id, company_name, industry, area, request_content, contact_person, phone_number)
SELECT 
  id,
  '株式会社テックイノベーション',
  'IT・通信',
  '関東',
  '新規SaaS製品の営業代行をお願いしたいです。主にBtoB向けで、中小企業をターゲットにしています。',
  '山田太郎',
  '0312345678'
FROM auth.users
WHERE email = 'company1@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- 企業2: 製造業
INSERT INTO company_profiles (user_id, company_name, industry, area, request_content, contact_person, phone_number)
SELECT 
  id,
  '山本製作所株式会社',
  '製造業',
  '中部',
  '産業用機械の販路拡大を目指しています。既存顧客へのフォローと新規開拓をお願いしたいです。',
  '佐藤花子',
  '0523456789'
FROM auth.users
WHERE email = 'company2@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 4. 営業代行プロフィールの作成
-- ============================================

-- 営業代行1: IT営業特化
INSERT INTO agency_profiles (user_id, name, specialties, areas, bio, phone_number)
SELECT 
  id,
  'セールスマスター合同会社',
  ARRAY['新規開拓営業', 'インサイドセールス', 'IT営業']::text[],
  ARRAY['関東', '中部', 'オンライン対応']::text[],
  'IT業界に特化した営業代行会社です。SaaS製品の販売実績が豊富で、スタートアップから大企業まで幅広く対応しています。インサイドセールスからフィールドセールスまで一貫してサポート可能です。',
  '0367891234'
FROM auth.users
WHERE email = 'agency1@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- 営業代行2: 製造業特化
INSERT INTO agency_profiles (user_id, name, specialties, areas, bio, phone_number)
SELECT 
  id,
  '工業営業プロ株式会社',
  ARRAY['ルート営業', '既存顧客フォロー', 'BtoB営業']::text[],
  ARRAY['中部', '近畿']::text[],
  '製造業向けの営業代行で15年の実績があります。機械・部品メーカーとの取引が多く、技術的な説明も可能な営業担当者が在籍しています。長期的な関係構築を得意としています。',
  '0529876543'
FROM auth.users
WHERE email = 'agency2@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- 営業代行3: テレアポ特化
INSERT INTO agency_profiles (user_id, name, specialties, areas, bio, phone_number)
SELECT 
  id,
  'コールセンター営業株式会社',
  ARRAY['テレアポ', '新規開拓営業', 'インサイドセールス']::text[],
  ARRAY['全国', 'オンライン対応']::text[],
  'テレアポに特化した営業代行サービスを提供しています。経験豊富なオペレーターが在籍し、アポイント獲得率は業界トップクラスです。CRMツールとの連携もスムーズに対応できます。',
  '0698765432'
FROM auth.users
WHERE email = 'agency3@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 5. マッチング申請の作成
-- ============================================

-- 申請1: 企業1 → 営業代行1（ペンディング）
INSERT INTO matching_requests (company_id, agency_id, monthly_budget, request_details, proposal_deadline, status)
SELECT 
  c.id,
  a.id,
  300000,
  '新規SaaS製品「クラウド会計システム」の営業代行をお願いします。ターゲットは従業員数50-300名の中小企業です。月間20社へのアプローチと、5件以上のアポイント獲得を目標としています。',
  CURRENT_DATE + INTERVAL '14 days',
  'pending'::matching_request_status
FROM auth.users c
CROSS JOIN auth.users a
WHERE c.email = 'company1@example.com'
  AND a.email = 'agency1@example.com'
ON CONFLICT DO NOTHING;

-- 申請2: 企業2 → 営業代行2（承認済み）
INSERT INTO matching_requests (company_id, agency_id, monthly_budget, request_details, proposal_deadline, status)
SELECT 
  c.id,
  a.id,
  250000,
  '産業用機械の既存顧客フォローと新規開拓をお願いします。既存顧客は約50社あり、定期的な訪問とアフターフォローをお願いしたいです。新規は月間10社程度のアプローチを想定しています。',
  CURRENT_DATE + INTERVAL '7 days',
  'approved'::matching_request_status
FROM auth.users c
CROSS JOIN auth.users a
WHERE c.email = 'company2@example.com'
  AND a.email = 'agency2@example.com'
ON CONFLICT DO NOTHING;

-- 申請3: 企業1 → 営業代行3（承認済み）
INSERT INTO matching_requests (company_id, agency_id, monthly_budget, request_details, proposal_deadline, status)
SELECT 
  c.id,
  a.id,
  150000,
  'テレアポによる見込み顧客の発掘をお願いします。1日50コール程度で、興味を示した企業のリスト作成とアポイント調整をお願いしたいです。',
  CURRENT_DATE + INTERVAL '10 days',
  'approved'::matching_request_status
FROM auth.users c
CROSS JOIN auth.users a
WHERE c.email = 'company1@example.com'
  AND a.email = 'agency3@example.com'
ON CONFLICT DO NOTHING;

-- 申請4: 企業2 → 営業代行1（却下）
INSERT INTO matching_requests (company_id, agency_id, monthly_budget, request_details, proposal_deadline, status)
SELECT 
  c.id,
  a.id,
  100000,
  'IT製品の営業をお願いしたいです。',
  CURRENT_DATE - INTERVAL '5 days',
  'rejected'::matching_request_status
FROM auth.users c
CROSS JOIN auth.users a
WHERE c.email = 'company2@example.com'
  AND a.email = 'agency1@example.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. メッセージスレッドの作成（承認済み申請用）
-- ============================================

-- スレッド1: 企業2 ⇄ 営業代行2
INSERT INTO message_threads (matching_request_id, company_id, agency_id, last_message_at)
SELECT 
  mr.id,
  c.id,
  a.id,
  NOW() - INTERVAL '1 hour'
FROM matching_requests mr
JOIN auth.users c ON c.id = mr.company_id AND c.email = 'company2@example.com'
JOIN auth.users a ON a.id = mr.agency_id AND a.email = 'agency2@example.com'
WHERE mr.status = 'approved'::matching_request_status
ON CONFLICT DO NOTHING;

-- スレッド2: 企業1 ⇄ 営業代行3
INSERT INTO message_threads (matching_request_id, company_id, agency_id, last_message_at)
SELECT 
  mr.id,
  c.id,
  a.id,
  NOW() - INTERVAL '30 minutes'
FROM matching_requests mr
JOIN auth.users c ON c.id = mr.company_id AND c.email = 'company1@example.com'
JOIN auth.users a ON a.id = mr.agency_id AND a.email = 'agency3@example.com'
WHERE mr.status = 'approved'::matching_request_status
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. メッセージの作成
-- ============================================

-- スレッド1のメッセージ
INSERT INTO messages (thread_id, sender_id, content, is_read)
SELECT 
  mt.id,
  c.id,
  'はじめまして。マッチング申請を承認いただきありがとうございます。早速ですが、来週火曜日に詳細のお打ち合わせをさせていただけますでしょうか？',
  true
FROM message_threads mt
JOIN auth.users c ON c.id = mt.company_id AND c.email = 'company2@example.com'
JOIN auth.users a ON a.id = mt.agency_id AND a.email = 'agency2@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
SELECT 
  mt.id,
  a.id,
  'ご連絡ありがとうございます。来週火曜日、14時からでいかがでしょうか？オンライン会議でお願いいたします。',
  true,
  NOW() - INTERVAL '45 minutes'
FROM message_threads mt
JOIN auth.users c ON c.id = mt.company_id AND c.email = 'company2@example.com'
JOIN auth.users a ON a.id = mt.agency_id AND a.email = 'agency2@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
SELECT 
  mt.id,
  c.id,
  '14時で問題ございません。Zoomのリンクを後ほどお送りします。',
  false,
  NOW() - INTERVAL '30 minutes'
FROM message_threads mt
JOIN auth.users c ON c.id = mt.company_id AND c.email = 'company2@example.com'
JOIN auth.users a ON a.id = mt.agency_id AND a.email = 'agency2@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- スレッド2のメッセージ
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
SELECT 
  mt.id,
  a.id,
  'この度はマッチングいただきありがとうございます。テレアポ業務について詳細をお聞かせください。対象となるリストはご用意されていますでしょうか？',
  false,
  NOW() - INTERVAL '15 minutes'
FROM message_threads mt
JOIN auth.users c ON c.id = mt.company_id AND c.email = 'company1@example.com'
JOIN auth.users a ON a.id = mt.agency_id AND a.email = 'agency3@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- 完了！
-- ============================================

-- テストデータの投入が完了しました
SELECT 'テストデータの投入が完了しました' AS message;

-- 確認用クエリ
SELECT 
  'ユーザー数' AS item,
  COUNT(*) AS count
FROM users
UNION ALL
SELECT 
  '企業プロフィール数',
  COUNT(*)
FROM company_profiles
UNION ALL
SELECT 
  '営業代行プロフィール数',
  COUNT(*)
FROM agency_profiles
UNION ALL
SELECT 
  'マッチング申請数',
  COUNT(*)
FROM matching_requests
UNION ALL
SELECT 
  'メッセージスレッド数',
  COUNT(*)
FROM message_threads
UNION ALL
SELECT 
  'メッセージ数',
  COUNT(*)
FROM messages;

