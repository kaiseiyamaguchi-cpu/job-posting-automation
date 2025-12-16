-- usersテーブルのRLSポリシーを全て削除して再作成
-- 問題: "Admins can view all users" ポリシーが users テーブル自身を参照して無限再帰

-- 既存のポリシーを全て削除
DROP POLICY IF EXISTS "Users can view own user data" ON users;
DROP POLICY IF EXISTS "Users can insert own user data" ON users;
DROP POLICY IF EXISTS "Users can update own user data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- 新しいポリシーを作成（シンプルで再帰しない設計）

-- 1. SELECT: ユーザーは自分のデータを見ることができる
CREATE POLICY "Users can view own user data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 2. INSERT: 新規登録時に自分のレコードを作成できる
CREATE POLICY "Users can insert own user data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. UPDATE: 自分のデータを更新できる
CREATE POLICY "Users can update own user data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 注意: 管理者用のポリシーは削除しました
-- 管理者機能が必要な場合は、別の方法（サービスロールキー使用など）で実装してください

