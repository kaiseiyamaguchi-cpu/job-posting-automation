# 担当者B: UIコンポーネント実装タスク

## 🎯 役割
Reactコンポーネント、フォーム、レイアウトの実装

## 📂 作業ディレクトリ
- `components/`
- `components/ui/`（shadcn/ui拡張）

## ⚠️ 作業禁止ディレクトリ
- `lib/actions/`（担当者Aの領域）
- `app/**/page.tsx`（担当者Cの領域）

---

## 📋 Phase 1: UIコンポーネント実装（5時間30分）

### B1.1 共通レイアウトコンポーネント（1時間）

**ファイル**: 
- `components/layout/DashboardLayout.tsx`
- `components/layout/Header.tsx`
- `components/layout/Sidebar.tsx`

```typescript
// DashboardLayout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: UserRole
}

// ナビゲーションメニュー
// - 企業: ダッシュボード、営業代行検索、申請一覧、メッセージ、プロフィール
// - 営業代行: ダッシュボード、申請一覧、メッセージ、プロフィール
// - 管理者: 専用レイアウト（Phase 2）
```

**チェックリスト**:
- [ ] レスポンシブサイドバー
- [ ] ユーザーアイコン・ドロップダウン
- [ ] ログアウトボタン
- [ ] モバイルメニュー

---

### B1.2 認証フォームコンポーネント（45分）

**ファイル**: 
- `components/auth/LoginForm.tsx`
- `components/auth/RegisterForm.tsx`

```typescript
// LoginForm.tsx
- メールアドレス入力
- パスワード入力
- ログインボタン
- エラー表示

// RegisterForm.tsx
- メールアドレス入力
- パスワード入力
- パスワード確認
- ユーザー種別選択（企業/営業代行）
- 登録ボタン
- エラー表示
```

**チェックリスト**:
- [ ] フォームバリデーション（react-hook-form + zod）
- [ ] ローディング状態
- [ ] エラー表示
- [ ] アクセシビリティ対応

---

### B1.3 プロフィールフォーム（1時間）

**ファイル**: 
- `components/profile/CompanyProfileForm.tsx`
- `components/profile/AgencyProfileForm.tsx`

```typescript
// CompanyProfileForm.tsx
- 会社名、業種、エリア、依頼内容、担当者名、電話番号

// AgencyProfileForm.tsx
- 名前、得意分野（複数選択）、対応エリア（複数選択）、自己PR、電話番号
```

**チェックリスト**:
- [ ] 複数選択フィールド（Checkbox）
- [ ] テキストエリア（自己PR）
- [ ] 保存ボタン
- [ ] バリデーション

---

### B1.4 営業代行カードコンポーネント（30分）

**ファイル**: 
- `components/agency/AgencyCard.tsx`
- `components/agency/AgencyList.tsx`
- `components/agency/SearchBar.tsx`

```typescript
// AgencyCard.tsx
- 名前、得意分野、対応エリア
- 「詳細を見る」ボタン

// AgencyList.tsx
- AgencyCardのグリッド表示
- ローディング・空状態

// SearchBar.tsx
- キーワード検索
- 業種フィルター
- エリアフィルター
```

**チェックリスト**:
- [ ] カードデザイン
- [ ] グリッドレイアウト
- [ ] 検索フォーム
- [ ] フィルター機能

---

### B1.5 マッチング申請コンポーネント（45分）

**ファイル**: 
- `components/matching/RequestCard.tsx`
- `components/matching/RequestModal.tsx`
- `components/matching/RequestList.tsx`

```typescript
// RequestCard.tsx
- 申請情報表示（企業名、営業代行名、予算、ステータス）
- ステータスバッジ

// RequestModal.tsx
- 月予算入力
- 依頼内容入力
- 提案期限選択
- 申請ボタン

// RequestList.tsx
- 企業側: 送信した申請一覧
- 営業代行側: 受信した申請一覧（承認/却下ボタン）
```

**チェックリスト**:
- [ ] ステータス別色分け
- [ ] 承認/却下ボタン
- [ ] モーダルフォーム
- [ ] 日付ピッカー

---

### B1.6 メッセージコンポーネント（1時間）

**ファイル**: 
- `components/messages/ThreadList.tsx`
- `components/messages/ChatWindow.tsx`
- `components/messages/MessageBubble.tsx`
- `components/messages/MessageInput.tsx`

```typescript
// ThreadList.tsx
- スレッド一覧（相手名、最終メッセージ、未読バッジ）

// ChatWindow.tsx
- メッセージ履歴表示
- 自動スクロール
- リアルタイム更新

// MessageBubble.tsx
- 送信者・受信者別デザイン
- タイムスタンプ
- 既読表示

// MessageInput.tsx
- テキスト入力
- 送信ボタン
- Enterキーで送信
```

**チェックリスト**:
- [ ] チャットUI
- [ ] 自動スクロール
- [ ] 未読バッジ
- [ ] リアルタイム対応の準備

---

### B1.7 ダッシュボード統計カード（30分）

**ファイル**: 
- `components/dashboard/StatsCard.tsx`
- `components/dashboard/QuickActions.tsx`

```typescript
// StatsCard.tsx
- アイコン、タイトル、数値、説明

// QuickActions.tsx
- クイックアクションボタン
- 「営業代行を探す」「申請を確認」など
```

**チェックリスト**:
- [ ] カードデザイン
- [ ] アイコン表示
- [ ] アクションボタン

---

## 📋 Phase 2: 管理者UIコンポーネント（2時間15分）

### B2.1 管理者レイアウト（30分）

**ファイル**: `components/admin/AdminLayout.tsx`

```typescript
- 管理者専用サイドバー
- 統計サマリー
```

---

### B2.2 ユーザー管理テーブル（45分）

**ファイル**: `components/admin/UserTable.tsx`

```typescript
- ユーザー一覧テーブル
- ロール別フィルター
- 検索機能
```

---

### B2.3 マッチング管理テーブル（30分）

**ファイル**: `components/admin/MatchingTable.tsx`

```typescript
- マッチング申請一覧
- ステータス別フィルター
```

---

### B2.4 スレッド監視コンポーネント（30分）

**ファイル**: `components/admin/ThreadMonitor.tsx`

```typescript
- スレッド一覧
- メッセージ履歴閲覧
```

---

## 📋 Phase 3: 最終調整（1時間）

### F2 ローディング状態実装（30分）
- スケルトンローダー
- スピナーコンポーネント

### F5 アクセシビリティ対応（30分）
- ARIA属性追加
- キーボード操作対応

---

## 🎨 デザインガイドライン

### カラーパレット
```typescript
// プライマリー: 青系
// セカンダリー: グレー系
// ステータス:
//   - pending: 黄色
//   - approved: 緑
//   - rejected: 赤
```

### コンポーネント設計原則
1. 単一責任の原則
2. Props型定義必須
3. エラー境界の考慮
4. ローディング状態の表示

---

## 🔧 開発コマンド

```bash
# ブランチ作成
git checkout -b feature/担当者B-components

# Storybookで確認（オプション）
# npm run storybook

# 開発サーバー起動
npm run dev

# コミット
git add components/
git commit -m "feat: implement layout components"
```

---

## ✅ 完了チェック

### Phase 1
- [ ] B1.1 レイアウトコンポーネント
- [ ] B1.2 認証フォーム
- [ ] B1.3 プロフィールフォーム
- [ ] B1.4 営業代行コンポーネント
- [ ] B1.5 マッチング申請コンポーネント
- [ ] B1.6 メッセージコンポーネント
- [ ] B1.7 統計カード

### Phase 2
- [ ] B2.1 管理者レイアウト
- [ ] B2.2 ユーザー管理テーブル
- [ ] B2.3 マッチング管理テーブル
- [ ] B2.4 スレッド監視コンポーネント

### Phase 3
- [ ] F2 ローディング状態
- [ ] F5 アクセシビリティ対応

---

**推定工数**: 8.75時間（Phase 1: 5.5h, Phase 2: 2.25h, Phase 3: 1h）

