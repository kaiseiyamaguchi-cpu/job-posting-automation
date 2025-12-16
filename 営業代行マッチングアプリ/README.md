# 営業代行マッチングアプリ（MVP版）

営業代行を探す企業と営業代行パートナーをつなぐマッチングプラットフォーム

## 📋 プロジェクト概要

| 項目 | 内容 |
|------|------|
| **クライアント** | 鬼ニカナ社 |
| **技術スタック** | Next.js 15 + Supabase + TypeScript |
| **開発期間** | 2-3日（20-24時間想定） |
| **デプロイ先** | Vercel + Supabase Cloud |

## 🎯 主要機能

### ✅ MVP版に含まれる機能

1. **認証機能**
   - メール + パスワードログイン
   - 新規登録（企業/営業代行）

2. **営業代行検索機能**（企業側）
   - 営業代行一覧表示
   - 検索・フィルタリング（業種/エリア/キーワード）
   - 詳細プロフィール表示

3. **マッチング申請機能**
   - 申請作成（企業 → 営業代行）
   - 申請承認/却下（営業代行）
   - ステータス管理（申請中/承認済み/却下）

4. **1対1メッセージ機能**
   - リアルタイムチャット
   - 未読管理
   - スレッド一覧

5. **ダッシュボード**
   - 企業向け、営業代行向け、管理者向け

6. **プロフィール管理**
   - 企業プロフィール編集
   - 営業代行プロフィール編集

7. **管理者機能**
   - ユーザー管理
   - マッチング申請管理
   - スレッド監視

### ❌ フェーズ2以降

- 日程調整機能
- Google Calendar連携
- 書類アップロード・本人確認
- SMS認証
- 通知機能

## 🏗️ 技術スタック

```
Frontend
├── Next.js 15 (App Router)
├── TypeScript
├── Tailwind CSS
└── shadcn/ui

Backend
├── Supabase
│   ├── Database (PostgreSQL)
│   ├── Authentication
│   ├── Realtime
│   └── Row Level Security

Deployment
├── Vercel (Frontend)
└── Supabase Cloud (Backend)
```

## 📂 プロジェクト構造

```
sales-agency-matching/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # 認証前画面
│   │   ├── (dashboard)/    # 認証後画面（企業・営業代行）
│   │   ├── (admin)/        # 管理者画面
│   │   └── api/            # API Routes
│   ├── components/         # Reactコンポーネント
│   ├── hooks/              # カスタムフック
│   ├── lib/                # ライブラリ・ユーティリティ
│   └── types/              # 型定義
├── supabase/
│   └── migrations/         # DBマイグレーション
└── public/                 # 静的ファイル
```

## 🚀 セットアップ手順

### 1. リポジトリクローン

```bash
git clone <repository-url>
cd sales-agency-matching
```

### 2. 依存パッケージインストール

```bash
npm install
```

### 3. Supabaseプロジェクト作成

1. https://supabase.com にアクセス
2. 「New Project」をクリック
3. プロジェクト名: `sales-agency-matching`
4. Database Password設定
5. Region: `Tokyo`

### 4. 環境変数設定

`.env.local` ファイルを作成：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Supabase Dashboard → Settings → API から取得。

### 5. データベースマイグレーション実行

Supabase Dashboard → SQL Editor で以下を順番に実行：

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_matching_schema.sql`
3. `supabase/migrations/003_message_schema.sql`

### 6. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

## 🧪 テスト用アカウント

### 企業アカウント
```
メール: company@example.com
パスワード: password123
```

### 営業代行アカウント
```
メール: agency@example.com
パスワード: password123
```

### 管理者アカウント
```
メール: admin@example.com
パスワード: password123
```

## 📚 ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| `要件定義書_確定版.md` | プロジェクト要件・スコープ |
| `データベース設計書.md` | テーブル定義・ER図 |
| `API設計書.md` | API仕様・エンドポイント一覧 |
| `画面設計書.md` | 画面レイアウト・UI設計 |
| `タスク一覧_詳細版.md` | 開発タスクの詳細分解 |
| `技術仕様書.md` | 技術仕様・実装パターン |
| `タスク管理.csv` | タスク進捗管理（CSV） |

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番環境でローカル起動
npm start

# Lint実行
npm run lint

# フォーマット
npm run format
```

## 🚀 デプロイ

### Vercelデプロイ

```bash
# Vercel CLIインストール
npm i -g vercel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

### 環境変数設定

Vercel Dashboard → Settings → Environment Variables で設定：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 👥 ユーザーフロー

### 企業側
```
登録 → プロフィール入力 → 営業代行検索 → 詳細閲覧 
→ マッチング申請 → 承認待ち → メッセージ開始
```

### 営業代行側
```
登録 → プロフィール入力 → 新着申請確認 → 内容確認 
→ 承認/却下 → メッセージ開始
```

### 管理者側
```
ログイン → ダッシュボード → ユーザー管理 
→ 申請管理 → スレッド監視
```

## 🔒 セキュリティ

- Supabase Authentication（JWT）
- Row Level Security (RLS)
- XSS対策（React自動エスケープ）
- CSRF対策（Next.js標準）
- 環境変数による機密情報管理

## 📈 想定スケジュール

### Day 1（8時間）
- Phase 0: 環境構築（2時間）
- Phase 1-A/B/C: 基盤構築（6時間、並行）

### Day 2（8時間）
- Phase 2-A/B/C/D/E: コア機能（6時間、並行）
- Phase 3: 管理者機能（2時間）

### Day 3（4-8時間）
- Phase 4: 仕上げ・デプロイ（2-3時間）
- 最終確認・バグ修正（2-5時間）

**合計: 20-24時間（2-3日）**

## 🤝 開発体制

| 担当者 | 主な担当領域 |
|--------|-------------|
| 担当者A | バックエンド、営業代行検索、管理者機能 |
| 担当者B | マッチング申請機能 |
| 担当者C | 認証、メッセージ機能 |
| 担当者D | ダッシュボード |
| 担当者E | 共通UI、プロフィール |

## 📞 サポート

**開発者**: 山口快生

## 📝 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2025-12-04 | v1.0 | 初版作成（Next.js + Supabase版） |

---

**Status**: 設計完了 → 開発準備完了  
**Next Action**: Phase 0（環境構築）開始

