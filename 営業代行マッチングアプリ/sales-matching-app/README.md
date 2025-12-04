# 営業代行マッチングアプリ（MVP版）

営業代行を探す企業と営業代行パートナーをつなぐマッチングプラットフォーム

## 🎯 プロジェクト概要

- **クライアント**: 鬼ニカナ社（発注元：株式会社ReeDot）
- **目的**: 営業代行と企業のマッチング業務の効率化
- **開発期間**: 集中開発（1-2日想定）

## 📚 技術スタック

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (UIコンポーネント)

### Backend
- **Supabase**
  - Database (PostgreSQL)
  - Authentication
  - Realtime (メッセージ用)
  - Row Level Security

### Deployment
- **Vercel** (フロントエンド)
- **Supabase Cloud** (バックエンド)

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd sales-matching-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトのURL、Anon Key、Service Role Keyを取得
3. `.env.local`に設定

### 5. データベーススキーマのセットアップ

Supabaseのダッシュボードで以下のSQLを実行してください：

```sql
-- データベース設計書.mdを参照
-- または、プロジェクトの /database/schema.sql を実行
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📁 プロジェクト構造

```
sales-matching-app/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 認証関連ページ
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # ダッシュボード
│   │   ├── agencies/        # 営業代行検索・詳細
│   │   ├── matching-requests/ # マッチング申請
│   │   ├── messages/        # メッセージ
│   │   └── profile/         # プロフィール
│   ├── admin/               # 管理者画面
│   └── api/                 # API Routes
├── components/              # Reactコンポーネント
│   ├── ui/                  # shadcn/ui コンポーネント
│   ├── auth/                # 認証コンポーネント
│   ├── dashboard/           # ダッシュボードコンポーネント
│   ├── matching/            # マッチングコンポーネント
│   └── messages/            # メッセージコンポーネント
├── lib/                     # ユーティリティ・ヘルパー
│   ├── supabase/            # Supabaseクライアント
│   ├── actions/             # Server Actions
│   └── utils.ts             # 汎用ユーティリティ
├── types/                   # TypeScript型定義
│   └── index.ts             # 共通型定義
└── middleware.ts            # Next.js Middleware (認証)
```

## 👥 ユーザー種別

1. **企業** (`company`)
   - 営業代行を検索・申請
   - メッセージでやり取り

2. **営業代行** (`agency`)
   - 申請を承認・却下
   - メッセージでやり取り

3. **管理者** (`admin`)
   - 全体管理・監視

## ✅ MVP機能一覧

### 実装済み機能
- [ ] 認証機能（メール + パスワード）
- [ ] 営業代行検索機能
- [ ] マッチング申請機能
- [ ] 1対1メッセージ機能
- [ ] ダッシュボード（3種類）
- [ ] プロフィール管理
- [ ] 管理者機能

### フェーズ2以降の機能
- 日程調整機能
- Google Calendar / Meet連携
- 書類アップロード・本人確認
- SMS認証
- メール/プッシュ通知
- 評価・レビュー
- 決済機能

## 🔐 セキュリティ

- Supabase Authenticationによる認証
- JWTトークンによるセッション管理
- Row Level Security (RLS) によるデータアクセス制御
- 環境変数による機密情報管理

## 📊 データベース設計

詳細は `データベース設計書.md` を参照してください。

### 主要テーブル
- `users` - ユーザー基本情報
- `company_profiles` - 企業プロフィール
- `agency_profiles` - 営業代行プロフィール
- `matching_requests` - マッチング申請
- `message_threads` - メッセージスレッド
- `messages` - メッセージ

## 🛠️ 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint

# 型チェック
npm run type-check
```

## 📝 開発時の注意事項

1. **型安全性の確保**
   - 必ず `types/index.ts` で型を定義してから実装
   - `any` の使用は避ける

2. **認証・認可**
   - サーバーサイドでは `lib/auth.ts` のヘルパー関数を使用
   - クライアントサイドでは `lib/supabase/client.ts` を使用

3. **データ取得**
   - Server Componentsでは直接Supabaseクライアント使用
   - Client Componentsでは Server Actions 経由でデータ取得

4. **スタイリング**
   - Tailwind CSSを使用
   - shadcn/uiコンポーネントを積極的に活用

## 🔄 デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

```bash
# Vercel CLIを使用する場合
npm install -g vercel
vercel
```

## 📚 関連ドキュメント

- [要件定義書](../要件定義書_確定版.md)
- [データベース設計書](../データベース設計書.md)
- [API設計書](../API設計書.md)
- [MVP機能一覧](../MVP機能一覧.md)

## 🤝 サポート

問題や質問がある場合は、プロジェクトの Issue を作成してください。

---

**最終更新**: 2025-12-04  
**開発者**: 山口快生  
**ステータス**: セットアップ完了
