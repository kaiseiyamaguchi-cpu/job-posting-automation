# 担当者A: バックエンド・API実装タスク

## 🎯 役割
Server Actions、データ取得ロジック、エラーハンドリングの実装

## 📂 作業ディレクトリ
- `lib/actions/`
- `lib/utils/`
- `app/api/`（必要に応じて）

## ⚠️ 作業禁止ディレクトリ
- `components/`（担当者Bの領域）
- `app/**/page.tsx`（担当者Cの領域）

---

## 📋 Phase 1: Server Actions実装（4時間45分）

### A1.1 プロフィール取得・更新Actions（45分）

**ファイル**: `lib/actions/profile.ts`

```typescript
// 実装する関数:
- getCompanyProfile(userId: string)
- updateCompanyProfile(userId: string, data: CompanyProfileForm)
- getAgencyProfile(userId: string)
- updateAgencyProfile(userId: string, data: AgencyProfileForm)
- createCompanyProfile(userId: string, data: CompanyProfileForm)
- createAgencyProfile(userId: string, data: AgencyProfileForm)
```

**チェックリスト**:
- [ ] Supabaseクライアントのインポート
- [ ] エラーハンドリング実装
- [ ] 型定義の使用（types/index.ts）
- [ ] revalidatePath実装

---

### A1.2 営業代行検索Actions（45分）

**ファイル**: `lib/actions/agency.ts`

```typescript
// 実装する関数:
- getAgencies(filters?: { specialty?: string, area?: string, keyword?: string })
- getAgencyById(id: string)
- searchAgencies(query: string)
```

**チェックリスト**:
- [ ] 検索フィルター実装
- [ ] ページネーション対応
- [ ] キーワード検索（ILIKE）
- [ ] specialties・areasの配列フィルタリング

---

### A1.3 マッチング申請Actions（1時間）

**ファイル**: `lib/actions/matching.ts`

```typescript
// 実装する関数:
- createMatchingRequest(data: MatchingRequestForm, agencyId: string)
- getMatchingRequests(userId: string, userRole: UserRole)
- getMatchingRequestById(id: string)
- updateMatchingRequestStatus(id: string, status: MatchingRequestStatus)
- createMessageThreadOnApproval(matchingRequestId: string) // 承認時のスレッド作成
```

**チェックリスト**:
- [ ] 企業側: 申請作成・一覧取得
- [ ] 営業代行側: 受信申請取得・承認/却下
- [ ] ステータス更新時のバリデーション
- [ ] 承認時のスレッド自動作成

---

### A1.4 メッセージActions（45分）

**ファイル**: `lib/actions/message.ts`

```typescript
// 実装する関数:
- getMessageThreads(userId: string)
- getMessageThread(threadId: string)
- getMessages(threadId: string)
- sendMessage(threadId: string, content: string)
- markMessagesAsRead(threadId: string, userId: string)
- getUnreadCount(userId: string)
```

**チェックリスト**:
- [ ] スレッド一覧取得（未読カウント含む）
- [ ] メッセージ送信
- [ ] 既読管理
- [ ] Realtime用のデータ構造

---

### A1.5 ダッシュボード統計Actions（30分）

**ファイル**: `lib/actions/dashboard.ts`

```typescript
// 実装する関数:
- getCompanyDashboardStats(userId: string)
- getAgencyDashboardStats(userId: string)
- getAdminDashboardStats()
```

**チェックリスト**:
- [ ] 企業向け統計（申請数、承認数、未読数）
- [ ] 営業代行向け統計（新着申請、対応中企業、未読数）
- [ ] 管理者向け統計（全体数、承認率など）

---

### A1.6 エラーハンドリングユーティリティ（30分）

**ファイル**: `lib/utils/error.ts`

```typescript
// 実装する関数:
- handleSupabaseError(error: any): { error: string }
- validateAuth(userId: string | null): void
- validateRole(userRole: UserRole, allowedRoles: UserRole[]): void
```

**チェックリスト**:
- [ ] Supabaseエラーの統一的な処理
- [ ] 認証エラーのハンドリング
- [ ] ロールベースのバリデーション

---

## 📋 Phase 2: 管理者API実装（2時間15分）

### A2.1 管理者統計API（30分）

**ファイル**: `lib/actions/admin/stats.ts`

```typescript
- getAdminStats()
- getUserGrowthData()
- getMatchingSuccessRate()
```

---

### A2.2 ユーザー管理API（45分）

**ファイル**: `lib/actions/admin/users.ts`

```typescript
- getAllUsers(filters?: { role?: UserRole })
- getUserDetails(userId: string)
- updateUserRole(userId: string, role: UserRole)
```

---

### A2.3 マッチング管理API（30分）

**ファイル**: `lib/actions/admin/matching.ts`

```typescript
- getAllMatchingRequests(filters?: { status?: MatchingRequestStatus })
- getMatchingRequestDetails(id: string)
```

---

### A2.4 スレッド管理API（30分）

**ファイル**: `lib/actions/admin/threads.ts`

```typescript
- getAllThreads()
- getThreadMessages(threadId: string)
```

---

## 📋 Phase 3: 最終調整（1時間）

### F1 エラーハンドリング強化（30分）
- グローバルエラーハンドラー実装

### F4 テストデータ作成（30分）
- ダミーデータ投入スクリプト作成

### F7 Vercelデプロイ（30分）
- 環境変数設定
- ビルド確認
- デプロイ実行

---

## 🔧 開発コマンド

```bash
# ブランチ作成
git checkout -b feature/担当者A-actions

# 型チェック
npm run type-check

# 開発サーバー起動
npm run dev

# コミット
git add lib/actions/
git commit -m "feat: implement profile actions"
```

---

## ✅ 完了チェック

### Phase 1
- [ ] A1.1 プロフィールActions
- [ ] A1.2 営業代行検索Actions
- [ ] A1.3 マッチング申請Actions
- [ ] A1.4 メッセージActions
- [ ] A1.5 ダッシュボード統計Actions
- [ ] A1.6 エラーハンドリング

### Phase 2
- [ ] A2.1 管理者統計API
- [ ] A2.2 ユーザー管理API
- [ ] A2.3 マッチング管理API
- [ ] A2.4 スレッド管理API

### Phase 3
- [ ] F1 エラーハンドリング強化
- [ ] F4 テストデータ作成
- [ ] F7 Vercelデプロイ

---

**推定工数**: 8時間（Phase 1: 4.75h, Phase 2: 2.25h, Phase 3: 1h）

