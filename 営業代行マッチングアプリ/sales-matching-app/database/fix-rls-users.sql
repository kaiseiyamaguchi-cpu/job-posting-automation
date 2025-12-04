-- ============================================
-- RLS修正: usersテーブルにINSERTポリシーを追加
-- ============================================

-- 新規ユーザーが自分のレコードを作成できるようにする
CREATE POLICY "Users can insert own user data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 自分のユーザー情報を更新可能にする
CREATE POLICY "Users can update own user data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

