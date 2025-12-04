# 担当者C: ページ実装・統合タスク

## 🎯 役割
ページ実装、A・Bのコンポーネント統合、認証フロー、全体調整

## 📂 作業ディレクトリ
- `app/**/page.tsx`
- `app/**/layout.tsx`
- `middleware.ts`
- `types/index.ts`
- `lib/auth.ts`

## ⚠️ 注意事項
- 担当者A・Bの作業完了を待ってから統合作業を開始
- 型定義の追加・変更は担当者Cが一括管理

---

## 📋 Phase 1: ページ実装・統合（5時間45分）

### C1.1 ログイン・新規登録ページ（1時間）

**依存**: B1.2（認証フォーム）

**ファイル**: 
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(auth)/layout.tsx`

```typescript
// login/page.tsx
- LoginFormコンポーネントを使用
- lib/actions/auth.ts のlogin関数を呼び出し
- エラーハンドリング
- 成功時にダッシュボードへリダイレクト

// register/page.tsx
- RegisterFormコンポーネントを使用
- lib/actions/auth.ts のregister関数を呼び出し
- 成功時にプロフィール作成画面へリダイレクト
```

**チェックリスト**:
- [ ] 認証済みユーザーのリダイレクト処理
- [ ] エラーメッセージ表示
- [ ] ローディング状態
- [ ] 型安全な実装

---

### C1.2 プロフィールページ（45分）

**依存**: A1.1（プロフィールActions）、B1.3（プロフィールフォーム）

**ファイル**: `app/(dashboard)/profile/page.tsx`

```typescript
// profile/page.tsx
- ユーザーロールを取得
- 企業の場合: CompanyProfileForm表示
- 営業代行の場合: AgencyProfileForm表示
- プロフィール取得・更新処理
```

**チェックリスト**:
- [ ] 初回登録フロー（setup=true）
- [ ] 既存プロフィール編集
- [ ] 保存成功時のトースト表示
- [ ] バリデーションエラー表示

---

### C1.3 ダッシュボードページ（45分）

**依存**: A1.5（ダッシュボード統計）、B1.7（統計カード）

**ファイル**: `app/(dashboard)/dashboard/page.tsx`

```typescript
// dashboard/page.tsx
- ユーザーロールに応じた統計表示
- 企業: 申請数、承認数、未読数
- 営業代行: 新着申請、対応中企業、未読数
- QuickActionsコンポーネント表示
```

**チェックリスト**:
- [ ] ロール別表示切り替え
- [ ] 統計データの取得
- [ ] クイックアクションボタン
- [ ] ローディング状態

---

### C1.4 営業代行検索ページ（1時間）

**依存**: A1.2（営業代行検索）、B1.4（営業代行コンポーネント）

**ファイル**: `app/(dashboard)/agencies/page.tsx`

```typescript
// agencies/page.tsx
- SearchBarコンポーネント
- AgencyListコンポーネント
- 検索・フィルタリング処理
- ページネーション
```

**チェックリスト**:
- [ ] 検索フォームの状態管理
- [ ] URLパラメータとの同期
- [ ] 検索結果の表示
- [ ] 空状態の表示

---

### C1.5 営業代行詳細ページ（30分）

**依存**: A1.2（営業代行検索）、B1.4（営業代行コンポーネント）

**ファイル**: `app/(dashboard)/agencies/[id]/page.tsx`

```typescript
// agencies/[id]/page.tsx
- 営業代行詳細情報表示
- 「マッチング申請」ボタン
- RequestModalの表示・送信処理
```

**チェックリスト**:
- [ ] 動的ルーティング
- [ ] 詳細情報取得
- [ ] マッチング申請モーダル
- [ ] 企業ユーザーのみアクセス可能

---

### C1.6 マッチング申請ページ（45分）

**依存**: A1.3（マッチング申請）、B1.5（マッチング申請コンポーネント）

**ファイル**: `app/(dashboard)/matching-requests/page.tsx`

```typescript
// matching-requests/page.tsx
- 企業側: 送信した申請一覧
- 営業代行側: 受信した申請一覧 + 承認/却下ボタン
- ステータス別フィルター
```

**チェックリスト**:
- [ ] ロール別表示切り替え
- [ ] 申請一覧取得
- [ ] 承認/却下処理
- [ ] ステータス更新後のリフレッシュ

---

### C1.7 メッセージページ（1時間）

**依存**: A1.4（メッセージActions）、B1.6（メッセージコンポーネント）

**ファイル**: 
- `app/(dashboard)/messages/page.tsx`
- `app/(dashboard)/messages/[id]/page.tsx`

```typescript
// messages/page.tsx
- ThreadListコンポーネント
- スレッド一覧表示
- 未読バッジ

// messages/[id]/page.tsx
- ChatWindowコンポーネント
- メッセージ履歴表示
- MessageInputコンポーネント
- リアルタイム更新（Supabase Realtime）
- 既読処理
```

**チェックリスト**:
- [ ] スレッド一覧取得
- [ ] メッセージ送信
- [ ] Realtime購読設定
- [ ] 既読状態の更新
- [ ] 自動スクロール

---

## 📋 Phase 2: 管理者ページ実装（2時間30分）

### C2.1 管理者ダッシュボード（45分）

**依存**: A2.1（管理者統計）、B2.1（管理者レイアウト）

**ファイル**: `app/admin/dashboard/page.tsx`

```typescript
- 全体統計表示
- ユーザー数、申請数、承認率など
```

---

### C2.2 ユーザー管理ページ（45分）

**依存**: A2.2（ユーザー管理API）、B2.2（ユーザー管理テーブル）

**ファイル**: `app/admin/users/page.tsx`

```typescript
- ユーザー一覧表示
- ロール別フィルター
- 検索機能
```

---

### C2.3 マッチング管理ページ（30分）

**依存**: A2.3（マッチング管理API）、B2.3（マッチング管理テーブル）

**ファイル**: `app/admin/matching-requests/page.tsx`

```typescript
- 全マッチング申請表示
- ステータス別フィルター
```

---

### C2.4 スレッド監視ページ（30分）

**依存**: A2.4（スレッド管理API）、B2.4（スレッド監視コンポーネント）

**ファイル**: `app/admin/threads/page.tsx`

```typescript
- 全スレッド表示
- メッセージ履歴閲覧
```

---

## 📋 Phase 3: 最終調整・統合（1時間45分）

### F3 レスポンシブ対応確認（45分）
- デスクトップ・タブレット・モバイル確認
- CSSの調整

### F6 動作確認（1時間）
- 企業ユーザーフロー
  1. 新規登録
  2. プロフィール作成
  3. 営業代行検索
  4. マッチング申請
  5. 承認待ち
  6. メッセージ送信
  
- 営業代行ユーザーフロー
  1. 新規登録
  2. プロフィール作成
  3. 申請受信
  4. 承認
  5. メッセージ返信
  
- 管理者フロー
  1. ダッシュボード確認
  2. ユーザー管理
  3. マッチング管理
  4. スレッド監視

---

## 🔧 共通ファイル管理

### types/index.ts
- 新しい型が必要な場合に追加
- A・Bからの型追加リクエストを統合

### middleware.ts
- 認証チェック
- ロールベースのアクセス制御

### lib/auth.ts
- 認証ヘルパー関数（既存）
- 必要に応じて拡張

---

## 📝 Realtime実装メモ

### messages/[id]/page.tsx でのRealtime設定

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MessagePage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([])
  const supabase = createClient()

  useEffect(() => {
    // リアルタイム購読
    const channel = supabase
      .channel(`thread:${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${params.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id])

  // ...
}
```

---

## 🔧 開発コマンド

```bash
# ブランチ作成
git checkout -b feature/担当者C-pages

# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# コミット
git add app/
git commit -m "feat: implement login and register pages"
```

---

## ✅ 完了チェック

### Phase 1
- [ ] C1.1 ログイン・新規登録ページ
- [ ] C1.2 プロフィールページ
- [ ] C1.3 ダッシュボードページ
- [ ] C1.4 営業代行検索ページ
- [ ] C1.5 営業代行詳細ページ
- [ ] C1.6 マッチング申請ページ
- [ ] C1.7 メッセージページ

### Phase 2
- [ ] C2.1 管理者ダッシュボード
- [ ] C2.2 ユーザー管理ページ
- [ ] C2.3 マッチング管理ページ
- [ ] C2.4 スレッド監視ページ

### Phase 3
- [ ] F3 レスポンシブ対応確認
- [ ] F6 動作確認（全フロー）

---

**推定工数**: 10時間（Phase 1: 5.75h, Phase 2: 2.5h, Phase 3: 1.75h）

---

## 🚨 重要な注意事項

1. **A・Bの完了を待つ**
   - A1.1完了後 → C1.2着手可能
   - A1.2完了後 → C1.4着手可能
   - など、依存関係を確認

2. **型定義の追加**
   - A・Bから型の追加リクエストがあれば `types/index.ts` に追加

3. **エラーハンドリング**
   - 全ページでエラー境界を考慮
   - ローディング状態の表示

4. **認証チェック**
   - 各ページで適切な認証チェック
   - ロールベースのアクセス制御

