# API設計書

## 📡 API一覧

### 認証系 API

#### 1. 新規登録
```typescript
POST /api/auth/register

Request:
{
  email: string,
  password: string,
  user_type: 'company' | 'sales_agency'
}

Response (200):
{
  success: true,
  user: {
    id: string,
    email: string,
    user_type: string
  }
}

Error (400):
{
  success: false,
  error: "メールアドレスは既に使用されています"
}
```

#### 2. ログイン
```typescript
POST /api/auth/login

Request:
{
  email: string,
  password: string
}

Response (200):
{
  success: true,
  user: {
    id: string,
    email: string,
    user_type: string
  },
  session: {
    access_token: string,
    refresh_token: string
  }
}

Error (401):
{
  success: false,
  error: "メールアドレスまたはパスワードが正しくありません"
}
```

#### 3. ログアウト
```typescript
POST /api/auth/logout

Response (200):
{
  success: true
}
```

#### 4. セッション確認
```typescript
GET /api/auth/session

Response (200):
{
  user: {
    id: string,
    email: string,
    user_type: string
  } | null
}
```

---

### プロフィール系 API

#### 1. 企業プロフィール取得
```typescript
GET /api/profile/company

Response (200):
{
  id: string,
  user_id: string,
  company_name: string,
  industry: string,
  area: string,
  request_detail: string,
  contact_name: string,
  phone: string
}
```

#### 2. 企業プロフィール更新
```typescript
PUT /api/profile/company

Request:
{
  company_name: string,
  industry: string,
  area: string,
  request_detail: string,
  contact_name: string,
  phone: string
}

Response (200):
{
  success: true,
  company: { ... }
}
```

#### 3. 営業代行プロフィール取得
```typescript
GET /api/profile/agency

Response (200):
{
  id: string,
  user_id: string,
  name: string,
  specialties: string[],
  areas: string[],
  description: string,
  phone: string
}
```

#### 4. 営業代行プロフィール更新
```typescript
PUT /api/profile/agency

Request:
{
  name: string,
  specialties: string[],
  areas: string[],
  description: string,
  phone: string
}

Response (200):
{
  success: true,
  agency: { ... }
}
```

---

### 営業代行検索系 API

#### 1. 営業代行一覧取得
```typescript
GET /api/sales-agencies?keyword=&industry=&area=&page=1&limit=20

Query Parameters:
- keyword: string (optional) - キーワード検索
- industry: string (optional) - 業種フィルター
- area: string (optional) - エリアフィルター
- page: number (optional, default: 1) - ページ番号
- limit: number (optional, default: 20) - 1ページあたりの件数

Response (200):
{
  agencies: [
    {
      id: string,
      user_id: string,
      name: string,
      specialties: string[],
      areas: string[],
      description: string
    }
  ],
  total: number,
  page: number,
  total_pages: number
}
```

#### 2. 営業代行詳細取得
```typescript
GET /api/sales-agencies/[id]

Response (200):
{
  id: string,
  user_id: string,
  name: string,
  specialties: string[],
  areas: string[],
  description: string,
  phone: string
}

Error (404):
{
  error: "営業代行が見つかりません"
}
```

---

### マッチング申請系 API

#### 1. マッチング申請作成（企業側）
```typescript
POST /api/matching-requests

Request:
{
  sales_agency_id: string,
  monthly_budget: number,
  request_detail: string,
  deadline: string  // YYYY-MM-DD
}

Response (201):
{
  success: true,
  request: {
    id: string,
    company_id: string,
    sales_agency_id: string,
    status: 'pending',
    monthly_budget: number,
    request_detail: string,
    deadline: string,
    created_at: string
  }
}

Error (400):
{
  error: "既にこの営業代行への申請が存在します"
}
```

#### 2. 自分の申請一覧取得（企業側）
```typescript
GET /api/matching-requests?status=&page=1

Query Parameters:
- status: 'pending' | 'approved' | 'rejected' (optional)
- page: number (optional, default: 1)

Response (200):
{
  requests: [
    {
      id: string,
      sales_agency: {
        id: string,
        name: string
      },
      status: string,
      monthly_budget: number,
      request_detail: string,
      deadline: string,
      created_at: string
    }
  ],
  total: number,
  page: number
}
```

#### 3. 受信した申請一覧取得（営業代行側）
```typescript
GET /api/matching-requests/received?status=&page=1

Query Parameters:
- status: 'pending' | 'approved' | 'rejected' (optional)
- page: number (optional, default: 1)

Response (200):
{
  requests: [
    {
      id: string,
      company: {
        id: string,
        company_name: string,
        industry: string
      },
      status: string,
      monthly_budget: number,
      request_detail: string,
      deadline: string,
      created_at: string
    }
  ],
  total: number,
  page: number
}
```

#### 4. 申請承認/却下（営業代行側）
```typescript
PUT /api/matching-requests/[id]

Request:
{
  status: 'approved' | 'rejected',
  rejected_reason?: string  // status='rejected'の場合必須
}

Response (200):
{
  success: true,
  request: {
    id: string,
    status: string,
    updated_at: string
  },
  thread_created: boolean  // status='approved'の場合true
}

Error (403):
{
  error: "この申請を更新する権限がありません"
}
```

---

### メッセージ系 API

#### 1. メッセージスレッド一覧取得
```typescript
GET /api/message-threads?page=1

Response (200):
{
  threads: [
    {
      id: string,
      partner: {  // 相手ユーザー情報
        id: string,
        name: string,  // 企業名 or 営業代行名
        user_type: string
      },
      last_message: string | null,
      last_message_at: string | null,
      unread_count: number,
      created_at: string
    }
  ],
  total: number
}
```

#### 2. メッセージ一覧取得
```typescript
GET /api/messages?thread_id={id}&page=1&limit=50

Query Parameters:
- thread_id: string (required)
- page: number (optional, default: 1)
- limit: number (optional, default: 50)

Response (200):
{
  messages: [
    {
      id: string,
      sender_id: string,
      sender_name: string,
      content: string,
      is_read: boolean,
      created_at: string
    }
  ],
  total: number,
  page: number
}

Error (403):
{
  error: "このスレッドにアクセスする権限がありません"
}
```

#### 3. メッセージ送信
```typescript
POST /api/messages

Request:
{
  thread_id: string,
  content: string
}

Response (201):
{
  success: true,
  message: {
    id: string,
    thread_id: string,
    sender_id: string,
    content: string,
    is_read: false,
    created_at: string
  }
}

Error (400):
{
  error: "メッセージ内容が空です"
}
```

#### 4. メッセージ既読マーク
```typescript
PUT /api/messages/mark-read

Request:
{
  thread_id: string
}

Response (200):
{
  success: true,
  updated_count: number
}
```

---

### ダッシュボード系 API

#### 1. ダッシュボード統計（企業・営業代行）
```typescript
GET /api/dashboard/stats

Response (200) - 企業の場合:
{
  pending_requests: number,      // 申請中の件数
  approved_requests: number,     // 承認済みの件数
  active_threads: number,        // アクティブスレッド数
  unread_messages: number,       // 未読メッセージ総数
  recent_activities: [           // 最近のアクティビティ
    {
      type: 'request_approved' | 'message_received',
      content: string,
      created_at: string
    }
  ]
}

Response (200) - 営業代行の場合:
{
  pending_requests: number,      // 新着申請数
  approved_requests: number,     // 対応中企業数
  active_threads: number,        // アクティブスレッド数
  unread_messages: number,       // 未読メッセージ総数
  recent_activities: [...]
}
```

---

### 管理者系 API

#### 1. 管理者ダッシュボード統計
```typescript
GET /api/admin/stats

Response (200):
{
  total_users: number,
  companies_count: number,
  agencies_count: number,
  total_requests: number,
  pending_requests: number,
  approved_requests: number,
  rejected_requests: number,
  approval_rate: number,  // 承認率（%）
  total_threads: number,
  total_messages: number
}
```

#### 2. ユーザー一覧取得
```typescript
GET /api/admin/users?type=&search=&page=1&sort=created_at&order=desc

Query Parameters:
- type: 'company' | 'sales_agency' (optional)
- search: string (optional) - メール・名前で検索
- page: number (optional, default: 1)
- sort: 'created_at' | 'email' (optional)
- order: 'asc' | 'desc' (optional)

Response (200):
{
  users: [
    {
      id: string,
      email: string,
      user_type: string,
      profile: {
        company_name?: string,
        name?: string,
        industry?: string,
        specialties?: string[]
      },
      created_at: string
    }
  ],
  total: number,
  page: number
}
```

#### 3. マッチング申請一覧取得（管理者）
```typescript
GET /api/admin/matching-requests?status=&page=1&sort=created_at&order=desc

Query Parameters:
- status: 'pending' | 'approved' | 'rejected' (optional)
- page: number (optional, default: 1)
- sort: 'created_at' | 'monthly_budget' (optional)
- order: 'asc' | 'desc' (optional)

Response (200):
{
  requests: [
    {
      id: string,
      company: {
        id: string,
        company_name: string
      },
      sales_agency: {
        id: string,
        name: string
      },
      status: string,
      monthly_budget: number,
      request_detail: string,
      created_at: string
    }
  ],
  total: number,
  page: number
}
```

#### 4. メッセージスレッド一覧取得（管理者）
```typescript
GET /api/admin/threads?page=1&sort=last_message_at&order=desc

Query Parameters:
- page: number (optional, default: 1)
- sort: 'last_message_at' | 'created_at' (optional)
- order: 'asc' | 'desc' (optional)

Response (200):
{
  threads: [
    {
      id: string,
      company: {
        id: string,
        company_name: string
      },
      sales_agency: {
        id: string,
        name: string
      },
      last_message: string,
      last_message_at: string,
      total_messages: number,
      created_at: string
    }
  ],
  total: number,
  page: number
}
```

---

## 🔐 認証・認可

### ヘッダー
全ての認証が必要なAPIリクエストには、以下のヘッダーを含める：

```
Authorization: Bearer {access_token}
```

### エラーレスポンス
```typescript
401 Unauthorized:
{
  error: "認証が必要です"
}

403 Forbidden:
{
  error: "この操作を実行する権限がありません"
}
```

---

## 🔄 Realtime購読（Supabase）

### メッセージのリアルタイム受信

```typescript
// クライアント側
const channel = supabase
  .channel(`thread:${threadId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `thread_id=eq.${threadId}`
    },
    (payload) => {
      // 新着メッセージをUIに追加
      const newMessage = payload.new;
      addMessageToUI(newMessage);
    }
  )
  .subscribe();
```

### 未読カウントのリアルタイム更新

```typescript
const channel = supabase
  .channel(`user:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'message_threads',
      filter: `company_id=eq.${userId}`
    },
    (payload) => {
      // 未読カウントを更新
      updateUnreadCount(payload.new);
    }
  )
  .subscribe();
```

---

## 🎨 レスポンスフォーマット

### 成功レスポンス
```typescript
{
  success: true,
  data: { ... },
  message?: string  // オプション
}
```

### エラーレスポンス
```typescript
{
  success: false,
  error: string,
  details?: any  // 詳細情報（開発環境のみ）
}
```

### ページネーション
```typescript
{
  data: [...],
  pagination: {
    total: number,
    page: number,
    limit: number,
    total_pages: number,
    has_next: boolean,
    has_prev: boolean
  }
}
```

---

## 🚦 HTTPステータスコード

| コード | 意味 | 使用例 |
|--------|------|--------|
| 200 | OK | GET成功、PUT成功 |
| 201 | Created | POST成功（新規作成） |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 権限エラー |
| 404 | Not Found | リソースが見つからない |
| 500 | Internal Server Error | サーバーエラー |

---

## 📊 バリデーションルール

### 共通
- メールアドレス: RFC 5322準拠
- パスワード: 8文字以上
- テキストフィールド: 最大10,000文字

### 企業プロフィール
- company_name: 必須、2-200文字
- industry: 任意、1-100文字
- area: 任意、1-100文字
- contact_name: 必須、2-100文字
- phone: 任意、10-15文字

### 営業代行プロフィール
- name: 必須、2-100文字
- specialties: 任意、配列、最大10件
- areas: 任意、配列、最大10件
- description: 任意、最大2,000文字
- phone: 任意、10-15文字

### マッチング申請
- sales_agency_id: 必須、UUID形式
- monthly_budget: 任意、0-100,000,000
- request_detail: 必須、10-2,000文字
- deadline: 任意、YYYY-MM-DD形式、未来の日付

### メッセージ
- thread_id: 必須、UUID形式
- content: 必須、1-5,000文字

---

## 🔍 検索仕様

### 営業代行検索

```sql
-- キーワード検索（name, description）
WHERE (
  name ILIKE '%{keyword}%'
  OR description ILIKE '%{keyword}%'
)

-- 業種フィルター（specialties配列内検索）
AND '{industry}' = ANY(specialties)

-- エリアフィルター（areas配列内検索）
AND '{area}' = ANY(areas)

-- ソート
ORDER BY created_at DESC

-- ページネーション
LIMIT {limit} OFFSET {(page - 1) * limit}
```

---

## 📈 パフォーマンス最適化

### キャッシュ戦略
- 営業代行一覧: クライアント側で5分間キャッシュ
- プロフィール: クライアント側で10分間キャッシュ
- メッセージ: リアルタイム、キャッシュなし

### データベース最適化
- 適切なインデックス設定
- N+1問題の回避（JOIN使用）
- ページネーション必須

### レート制限
- 認証API: 5回/分
- メッセージ送信: 30回/分
- その他API: 100回/分

---

**作成日**: 2025-12-04  
**バージョン**: 1.0

