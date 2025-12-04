# 環境変数設定ガイド

このドキュメントでは、環境変数の詳細な設定方法を説明します。

---

## 📋 必須環境変数

### `.env.local` ファイルの作成

プロジェクトのルートディレクトリで以下を実行：

```bash
# ルートディレクトリに移動
cd /path/to/sales-matching-app

# .env.localファイルを作成
touch .env.local
```

### 必須項目を設定

`.env.local`に以下を記載：

```env
# Supabase設定（必須）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js設定
NODE_ENV=development

# アプリケーションURL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔑 Supabase認証情報の取得

### 1. Supabaseダッシュボードにログイン

[https://app.supabase.com/](https://app.supabase.com/)

### 2. プロジェクトを選択

作成したプロジェクト（例: `sales-matching-app`）を選択

### 3. API設定ページを開く

左サイドバー > **Settings** > **API**

### 4. 必要な情報をコピー

| 項目 | 説明 | 環境変数名 |
|------|------|-----------|
| **Project URL** | `https://xxxxx.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | `eyJhbGc...`（長い文字列） | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

**注意**: `service_role key`は**絶対に使用しないでください**（セキュリティリスク）

---

## 🔒 環境変数の種類

### NEXT_PUBLIC_ プレフィックス

```env
# ✅ クライアントサイドで使用可能
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_APP_URL=...

# ❌ サーバーサイドのみ（秘密情報）
DATABASE_URL=...
SECRET_KEY=...
```

**ルール**:
- `NEXT_PUBLIC_` で始まる変数はブラウザで参照可能
- 秘密情報は `NEXT_PUBLIC_` を付けない
- Supabase の `anon key` は公開されても問題ない（RLSで保護）

---

## 📝 完全な設定例

### 開発環境 (.env.local)

```env
# ==================================================
# Supabase設定
# ==================================================
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE2MTYxNiwiZXhwIjoxOTMxNzM3NjE2fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==================================================
# Next.js設定
# ==================================================
NODE_ENV=development

# ==================================================
# アプリケーション設定
# ==================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_DEBUG_MODE=false

# ==================================================
# セッション設定
# ==================================================
SESSION_MAX_AGE=604800

# ==================================================
# ログ設定
# ==================================================
LOG_LEVEL=info
```

---

## 🚀 本番環境の設定

### Vercelへのデプロイ時

1. **Vercelダッシュボードを開く**
2. プロジェクト > **Settings** > **Environment Variables**
3. 以下の変数を追加：

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` | Production |
| `NODE_ENV` | `production` | Production |

### その他のホスティングサービス

- **Netlify**: Site settings > Build & deploy > Environment
- **Railway**: Project > Variables
- **AWS Amplify**: App settings > Environment variables

---

## 🔧 環境別の設定

### 開発環境

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG_MODE=true
LOG_LEVEL=debug
```

### ステージング環境

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
NEXT_PUBLIC_DEBUG_MODE=false
LOG_LEVEL=info
```

### 本番環境

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_DEBUG_MODE=false
LOG_LEVEL=warn
```

---

## ✅ 設定の確認方法

### 1. 環境変数が読み込まれているか確認

```typescript
// app/test/page.tsx
export default function TestPage() {
  return (
    <div>
      <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      <p>App URL: {process.env.NEXT_PUBLIC_APP_URL}</p>
      <p>Node ENV: {process.env.NODE_ENV}</p>
    </div>
  )
}
```

### 2. 開発サーバーを起動

```bash
npm run dev
```

### 3. ブラウザで確認

`http://localhost:3000/test` にアクセスして環境変数が表示されればOK

---

## 🚨 トラブルシューティング

### Q1: 環境変数が undefined になる

**原因**:
- `.env.local` ファイルが正しい場所にない
- 開発サーバーを再起動していない
- `NEXT_PUBLIC_` プレフィックスが抜けている

**解決策**:
```bash
# 開発サーバーを再起動
npm run dev
```

### Q2: Supabaseに接続できない

**確認事項**:
1. `.env.local` のURLとキーが正しいか
2. Supabaseプロジェクトが起動しているか
3. URLの最後に `/` がないか（不要）

**正しい例**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

**間違った例**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co/  ❌
```

### Q3: 本番環境で環境変数が反映されない

**原因**:
- ホスティングサービスの環境変数が設定されていない
- デプロイ後に環境変数を変更した場合、再デプロイが必要

**解決策**:
1. ホスティングサービスの環境変数を確認
2. 変更後は必ず再デプロイ

---

## 🔐 セキュリティのベストプラクティス

### ✅ やるべきこと

1. `.env.local` を `.gitignore` に追加（既に含まれています）
2. `anon key` のみを使用（`service_role key` は使わない）
3. RLSポリシーでデータアクセスを制限
4. 本番環境では `DEBUG_MODE` を無効化

### ❌ やってはいけないこと

1. `.env.local` をGitにコミット
2. `service_role key` をクライアントサイドで使用
3. APIキーをコード内にハードコード
4. 環境変数を公開リポジトリに含める

---

## 📚 参考情報

### Next.js環境変数ドキュメント

- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [NEXT_PUBLIC_ Prefix](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser)

### Supabase認証情報

- [Supabase API Settings](https://supabase.com/docs/guides/api#api-url-and-keys)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 📋 チェックリスト

設定が完了したら以下を確認：

- [ ] `.env.local` ファイルを作成
- [ ] Supabase URLを設定
- [ ] Supabase anon keyを設定
- [ ] 開発サーバーを起動して動作確認
- [ ] `.env.local` が `.gitignore` に含まれることを確認
- [ ] 本番環境の環境変数を設定（デプロイ時）

---

**更新日**: 2025-12-04

