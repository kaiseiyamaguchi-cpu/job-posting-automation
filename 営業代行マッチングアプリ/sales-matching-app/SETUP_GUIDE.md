# セットアップガイド

このガイドでは、営業代行マッチングアプリの開発環境をゼロから構築する手順を説明します。

## 📋 前提条件

以下のツールがインストールされていることを確認してください：

- **Node.js**: v18.17以上
- **npm**: v9以上
- **Git**
- **Supabaseアカウント**（無料プランでOK）

## 🚀 ステップ1: Supabaseプロジェクトの作成

### 1.1 Supabaseにサインアップ

1. [https://supabase.com](https://supabase.com) にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインイン

### 1.2 新規プロジェクトの作成

1. 「New Project」をクリック
2. 以下の情報を入力：
   - **Name**: `sales-matching-app`（任意）
   - **Database Password**: 強固なパスワードを生成（保存しておく）
   - **Region**: `Tokyo (ap-northeast-1)` を選択
   - **Pricing Plan**: `Free`
3. 「Create new project」をクリック
4. プロジェクトの初期化を待つ（2-3分）

### 1.3 APIキーの取得

1. 左サイドバーの「Settings」→「API」をクリック
2. 以下の情報をメモ：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJI...`（長い文字列）
   - （参考）**service_role**: `eyJhbGciOiJI...`（長い文字列）
     - 本アプリ（デモ/通常運用）は **`anon key` のみ**で動作します
     - `service_role` は **絶対にGitへコミットしない**（漏洩時の影響が大きい）

## 🗄️ ステップ2: データベースのセットアップ

### 2.1 スキーマの実行

1. Supabaseダッシュボードで「SQL Editor」を開く
2. 「New query」をクリック
3. `database/schema.sql` の内容を全てコピー＆ペースト
4. 「Run」をクリックして実行
5. 成功メッセージが表示されることを確認

### 2.2 認証設定

1. 左サイドバーの「Authentication」→「Settings」をクリック
2. 「Email Auth」が有効になっていることを確認
3. 「Enable email confirmations」を**OFF**にする（開発時）
   - ※本番環境では必ずONにすること

### 2.3 Realtime設定（メッセージ機能用）

1. 左サイドバーの「Database」→「Replication」をクリック
2. 以下のテーブルでRealtimeを有効化：
   - `messages`
   - `message_threads`
3. 各テーブルの横のトグルをONにする

## 💻 ステップ3: ローカル開発環境の構築

### 3.1 環境変数の設定

1. `.env.local` ファイルを開く
2. 先ほどメモしたSupabaseの情報を入力：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 依存関係のインストール（既に完了）

```bash
npm install
```

### 3.3 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 👨‍💼 ステップ4: 管理者ユーザーの作成

### 4.1 通常の新規登録

1. `/register` にアクセス
2. 以下の情報で登録：
   - メールアドレス: `admin@example.com`
   - パスワード: 任意の強固なパスワード
   - ユーザー種別: `企業` または `営業代行`（後で変更）

### 4.2 管理者権限の付与

1. Supabaseダッシュボードで「Table Editor」を開く
2. `users` テーブルを選択
3. 先ほど登録したユーザーを探す
4. `role` カラムを `admin` に変更
5. 「Save」をクリック

### 4.3 動作確認

1. ログアウトして再ログイン
2. `/admin/dashboard` にアクセス
3. 管理者ダッシュボードが表示されればOK

## 🧪 ステップ5: テストデータの作成（任意）

### 5.1 企業ユーザーの作成

1. ログアウト
2. `/register` で新規登録
   - ユーザー種別: `企業`
3. プロフィールを入力

### 5.2 営業代行ユーザーの作成

1. ログアウト
2. `/register` で新規登録
   - ユーザー種別: `営業代行`
3. プロフィールを入力

### 5.3 マッチングフローのテスト

1. 企業ユーザーでログイン
2. 営業代行を検索
3. マッチング申請を送信
4. 営業代行ユーザーでログイン
5. 申請を承認
6. メッセージでやり取り

## 🔧 トラブルシューティング

### エラー: "Invalid API key"

- `.env.local` のAPIキーが正しいか確認
- SupabaseダッシュボードでAPIキーを再確認
- 開発サーバーを再起動（`Ctrl+C` → `npm run dev`）

### エラー: "relation does not exist"

- `database/schema.sql` が正しく実行されたか確認
- Supabaseダッシュボードの「Table Editor」でテーブルが存在するか確認
- SQLを再実行

### 認証がうまくいかない

- Supabaseの「Authentication」→「Users」でユーザーが作成されているか確認
- メール確認が無効になっているか確認
- ブラウザのCookieをクリア

### メッセージが送信できない

- Realtimeが有効になっているか確認
- RLSポリシーが正しく設定されているか確認
- マッチング申請のステータスが `approved` か確認

## 📚 次のステップ

セットアップが完了したら、以下のドキュメントを参照してください：

- [README.md](./README.md) - プロジェクト概要
- [要件定義書](../要件定義書_確定版.md) - 機能仕様
- [データベース設計書](../データベース設計書.md) - DB詳細
- [API設計書](../API設計書.md) - API仕様

## 🎉 セットアップ完了！

これで開発環境の準備が整いました。
次は各機能の実装を進めていきましょう！

---

**問題が解決しない場合は、プロジェクトのIssueを作成してください。**

