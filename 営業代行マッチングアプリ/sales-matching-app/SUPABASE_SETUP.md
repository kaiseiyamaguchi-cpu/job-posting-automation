# Supabaseセットアップガイド

このドキュメントでは、営業代行マッチングアプリのSupabaseプロジェクトをセットアップする手順を説明します。

---

## 📋 目次

1. [Supabaseプロジェクトの作成](#1-supabaseプロジェクトの作成)
2. [データベーススキーマの実行](#2-データベーススキーマの実行)
3. [認証設定](#3-認証設定)
4. [Realtime設定](#4-realtime設定)
5. [環境変数の設定](#5-環境変数の設定)
6. [動作確認](#6-動作確認)

---

## 1. Supabaseプロジェクトの作成

### 1.1 Supabaseにサインアップ

1. [Supabase](https://supabase.com/)にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインアップ

### 1.2 新しいプロジェクトを作成

1. ダッシュボードで「New Project」をクリック
2. 以下の情報を入力：
   - **Name**: `sales-matching-app`（任意）
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
   - **Pricing Plan**: `Free` を選択

3. 「Create new project」をクリック
4. プロジェクトの初期化を待つ（1-2分）

---

## 2. データベーススキーマの実行

### 2.1 SQL Editorを開く

1. 左サイドバーから「SQL Editor」をクリック
2. 「New query」をクリック

### 2.2 スキーマを実行

1. `database/schema.sql`ファイルを開く
2. 内容を全てコピー
3. SQL Editorに貼り付け
4. 「Run」ボタンをクリック

### 2.3 実行結果の確認

以下のメッセージが表示されればOK：
```
Success. No rows returned
```

### 2.4 テーブルが作成されたことを確認

1. 左サイドバーから「Table Editor」をクリック
2. 以下のテーブルが表示されることを確認：
   - `users`
   - `company_profiles`
   - `agency_profiles`
   - `matching_requests`
   - `message_threads`
   - `messages`

---

## 3. 認証設定

### 3.1 メール確認をOFFにする

開発環境では、メール確認を無効化して開発をスムーズにします。

1. 左サイドバーから「Authentication」→「Providers」をクリック
2. 「Email」プロバイダーをクリック
3. 「Confirm email」を **OFF** に設定
4. 「Save」をクリック

### 3.2 認証メールテンプレートの設定（オプション）

1. 左サイドバーから「Authentication」→「Email Templates」をクリック
2. 必要に応じてテンプレートをカスタマイズ

---

## 4. Realtime設定

メッセージ機能のリアルタイム更新のための設定です。

### 4.1 Realtimeを有効化

1. 左サイドバーから「Database」→「Replication」をクリック
2. 以下のテーブルでRealtimeを有効化：
   - `messages` → 「Enable」をクリック
   - `message_threads` → 「Enable」をクリック

### 4.2 確認

緑色のチェックマークが表示されればOK。

---

## 5. 環境変数の設定

### 5.1 APIキーを取得

1. 左サイドバーから「Settings」→「API」をクリック
2. 以下の情報をメモ：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...`（長い文字列）

### 5.2 `.env.local`ファイルを作成

プロジェクトのルートディレクトリで以下を実行：

```bash
cp .env.example .env.local
```

### 5.3 `.env.local`を編集

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

**重要**: 
- `xxxxx`を実際のProject URLに置き換え
- `eyJhbG...`を実際のanon public keyに置き換え

---

## 6. 動作確認

### 6.1 開発サーバーを起動

```bash
npm run dev
```

### 6.2 テストユーザーを作成

#### 6.2.1 管理者ユーザーを手動作成

1. Supabaseダッシュボードで「Authentication」→「Users」をクリック
2. 「Add user」→「Create new user」をクリック
3. 以下を入力：
   - **Email**: `admin@example.com`
   - **Password**: `admin123456`
4. 「Create user」をクリック

#### 6.2.2 管理者ロールを付与

1. 「SQL Editor」を開く
2. 以下のSQLを実行：

```sql
-- 管理者ユーザーのメールアドレスを指定
INSERT INTO users (id, email, role)
SELECT 
  id, 
  email,
  'admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';
```

#### 6.2.3 テスト企業ユーザーを作成

アプリの新規登録画面から以下を登録：

- **Email**: `company@example.com`
- **Password**: `company123456`
- **ユーザー種別**: 企業

#### 6.2.4 テスト営業代行ユーザーを作成

アプリの新規登録画面から以下を登録：

- **Email**: `agency@example.com`
- **Password**: `agency123456`
- **ユーザー種別**: 営業代行

### 6.3 ログイン確認

1. `http://localhost:3000/login`にアクセス
2. テストユーザーでログイン
3. ダッシュボードが表示されればOK！

---

## 🎉 セットアップ完了！

これで開発環境が整いました。

---

## 📝 トラブルシューティング

### Q1: スキーマ実行時にエラーが出る

**解決策**:
1. SQL Editorで既存のテーブルを削除
2. スキーマを再実行

```sql
-- すべてのテーブルを削除（注意: データも消えます）
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS message_threads CASCADE;
DROP TABLE IF EXISTS matching_requests CASCADE;
DROP TABLE IF EXISTS agency_profiles CASCADE;
DROP TABLE IF EXISTS company_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

### Q2: 認証エラーが出る

**確認事項**:
1. `.env.local`のキーが正しいか確認
2. Supabaseプロジェクトが起動しているか確認
3. ブラウザのキャッシュをクリア

### Q3: Realtimeが動作しない

**解決策**:
1. Database → Replicationでテーブルが有効化されているか確認
2. ブラウザをリロード
3. 開発サーバーを再起動

### Q4: RLSエラーが出る

**原因**: Row Level Security (RLS) ポリシーが正しく設定されていない

**解決策**:
1. SQL Editorで`database/schema.sql`を再実行
2. すべてのポリシーが作成されていることを確認

---

## 🔒 本番環境への移行

本番環境にデプロイする際の注意点：

### 1. 認証設定を変更

- メール確認を **ON** に戻す
- 認証メールテンプレートをカスタマイズ
- Site URLを本番URLに設定

### 2. 環境変数を設定

Vercelなどのホスティングサービスで環境変数を設定：

```
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

### 3. セキュリティ設定

- データベースパスワードを強力なものに変更
- APIキーを定期的にローテーション
- RLSポリシーを厳密に設定

---

## 📚 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Next.js + Supabase認証](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**更新日**: 2025-12-04

