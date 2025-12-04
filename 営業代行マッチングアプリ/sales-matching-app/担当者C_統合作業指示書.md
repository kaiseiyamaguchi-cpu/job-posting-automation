# 担当者C - 統合作業指示書

**作成日**: 2025-12-04  
**フェーズ**: Phase 1 統合作業  
**推定所要時間**: 4-7時間

---

## 📋 現在の状況

### ✅ 完了済み

- **担当者A**: バックエンド実装完了
  - Server Actions (`lib/actions/`)
  - エラーハンドリング
  - データベースCRUD処理

- **担当者B**: UIコンポーネント完成（24ファイル、2,336行）
  - マッチング申請コンポーネント
  - 営業代行カードコンポーネント
  - 共通レイアウト
  - UIコンポーネント

- **担当者C**: ページの基本構造完成（11ファイル、1,407行）
  - 認証ページ
  - ダッシュボードページ
  - 各種機能ページ

### ⚠️ 現在の問題

ユーザーが `app/(dashboard)/matching-requests/page.tsx` を修正し、以下のAPI Routesを呼び出すようにしたが、**これらのAPIがまだ存在しない**：

- `/api/auth/session` - GET
- `/api/matching-requests` - GET
- `/api/matching-requests/received` - GET
- `/api/matching-requests/[id]` - PUT

---

## 🎯 統合作業の目標

1. **API Routesの作成** - 担当者AのServer Actionsをラップ
2. **ページの統合** - 担当者BのUIコンポーネントを各ページに組み込む
3. **動作確認** - 全フローのテスト

---

## 📝 作業タスク一覧

### 🔴 優先度：最高（今すぐ必要）

#### タスク1: API Routes の作成（所要時間: 1-2時間）

**必要なAPI Routes**:

1. `app/api/auth/session/route.ts` - ユーザーセッション取得
2. `app/api/matching-requests/route.ts` - 申請一覧・作成
3. `app/api/matching-requests/received/route.ts` - 受信申請一覧
4. `app/api/matching-requests/[id]/route.ts` - 申請の承認/却下
5. `app/api/agencies/route.ts` - 営業代行一覧取得（検索含む）
6. `app/api/agencies/[id]/route.ts` - 営業代行詳細取得

**実装方針**:
- 担当者AのServer Actions (`lib/actions/`) を呼び出すラッパー
- エラーハンドリングを統一
- レスポンス形式を統一（`{ success, data, error }`）

---

#### タスク2: 営業代行検索ページの統合（所要時間: 45分）

**対象ファイル**: `app/(dashboard)/agencies/page.tsx`

**統合内容**:
- `SearchBar` コンポーネントを使用
- `AgencyList` コンポーネントを使用
- 検索機能の実装
- API Routeとの接続

**参考**: `matching-requests/page.tsx`（ユーザーが修正済み）

---

#### タスク3: 営業代行詳細ページの統合（所要時間: 30分）

**対象ファイル**: `app/(dashboard)/agencies/[id]/page.tsx`

**統合内容**:
- `RequestModal` コンポーネントを使用
- マッチング申請機能の実装
- API Routeとの接続

---

### 🟡 優先度：高（基本機能に必要）

#### タスク4: レイアウトの統合（所要時間: 30分）

**対象ファイル**: `app/(dashboard)/layout.tsx`

**統合内容**:
- `DashboardLayout` コンポーネントを使用
- ナビゲーションメニュー
- ユーザー情報表示

---

#### タスク5: プロフィールページの統合（所要時間: 1時間）

**対象ファイル**: `app/(dashboard)/profile/page.tsx`

**統合内容**:
- `CompanyProfileForm` / `AgencyProfileForm` コンポーネントを使用
- 担当者BがこれらのFormコンポーネントを作成する必要がある場合は先に作成
- API Routeとの接続

---

#### タスク6: ダッシュボードページの統合（所要時間: 45分）

**対象ファイル**: `app/(dashboard)/dashboard/page.tsx`

**統合内容**:
- 統計データの取得
- `StatsCard` コンポーネントの使用（必要に応じて作成）

---

#### タスク7: メッセージページの統合（所要時間: 1時間）

**対象ファイル**: 
- `app/(dashboard)/messages/page.tsx`
- `app/(dashboard)/messages/[id]/page.tsx`

**統合内容**:
- メッセージコンポーネントの使用
- Realtime機能の確認
- API Routeとの接続

---

### 🟢 優先度：中（後で対応可能）

#### タスク8: 認証ページの統合（所要時間: 30分）

**対象ファイル**: 
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`

**統合内容**:
- `LoginForm` / `RegisterForm` コンポーネントを使用（必要に応じて）
- 現在の実装で問題なければスキップ可

---

#### タスク9: 動作確認・デバッグ（所要時間: 1-2時間）

**テストフロー**:
1. 新規登録 → プロフィール作成
2. 営業代行検索 → 詳細表示 → マッチング申請
3. 営業代行側でログイン → 申請確認 → 承認
4. メッセージのやり取り

**確認項目**:
- エラーハンドリング
- ローディング状態
- レスポンシブ対応

---

## 📂 作業ディレクトリ

```
担当者Cの作業範囲:
├── app/api/                    ← 【NEW】API Routes作成
│   ├── auth/
│   │   └── session/route.ts
│   ├── matching-requests/
│   │   ├── route.ts
│   │   ├── received/route.ts
│   │   └── [id]/route.ts
│   └── agencies/
│       ├── route.ts
│       └── [id]/route.ts
├── app/(dashboard)/           ← 【UPDATE】既存ページの統合
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── profile/page.tsx
│   ├── agencies/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── matching-requests/page.tsx  ← ユーザーが修正済み
│   └── messages/
│       ├── page.tsx
│       └── [id]/page.tsx
└── app/(auth)/                ← 【OPTIONAL】必要に応じて
    ├── login/page.tsx
    └── register/page.tsx
```

---

## 📋 詳細な実装ガイド

### 1️⃣ API Route: `/api/auth/session/route.ts`

**目的**: 現在のユーザー情報を取得

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    // ユーザー情報を取得（roleを含む）
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { success: false, error: 'ユーザー情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error) {
    console.error('Session API Error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500 }
    )
  }
}
```

---

### 2️⃣ API Route: `/api/matching-requests/route.ts`

**目的**: マッチング申請の一覧取得・作成

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: 申請一覧取得（企業側）
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    let query = supabase
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(company_name),
        agency_profile:agency_profiles!agency_id(name)
      `)
      .eq('company_id', user.id)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      requests: data || [],
      total: data?.length || 0,
    })
  } catch (error) {
    console.error('Matching Requests API Error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500 }
    )
  }
}

// POST: 新規申請作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('matching_requests')
      .insert({
        company_id: user.id,
        agency_id: body.agency_id,
        monthly_budget: body.monthly_budget,
        request_details: body.request_details,
        proposal_deadline: body.proposal_deadline,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      request: data,
    })
  } catch (error) {
    console.error('Create Request API Error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500 }
    )
  }
}
```

---

### 3️⃣ API Route: `/api/matching-requests/received/route.ts`

**目的**: 受信した申請一覧取得（営業代行側）

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    let query = supabase
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(company_name),
        agency_profile:agency_profiles!agency_id(name)
      `)
      .eq('agency_id', user.id)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      requests: data || [],
      total: data?.length || 0,
    })
  } catch (error) {
    console.error('Received Requests API Error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500 }
    )
  }
}
```

---

### 4️⃣ API Route: `/api/matching-requests/[id]/route.ts`

**目的**: 申請の承認/却下

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id } = params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 申請を更新
    const { data: updatedRequest, error: updateError } = await supabase
      .from('matching_requests')
      .update({
        status: body.status,
        rejected_reason: body.rejected_reason || null,
      })
      .eq('id', id)
      .eq('agency_id', user.id) // 自分宛の申請のみ更新可能
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    // 承認の場合、メッセージスレッドを作成
    if (body.status === 'approved') {
      const { error: threadError } = await supabase
        .from('message_threads')
        .insert({
          matching_request_id: id,
          company_id: updatedRequest.company_id,
          agency_id: updatedRequest.agency_id,
        })

      if (threadError && threadError.code !== '23505') {
        // 23505 = unique violation (既に存在する場合はOK)
        console.error('Thread creation error:', threadError)
      }
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    })
  } catch (error) {
    console.error('Update Request API Error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500 }
    )
  }
}
```

---

### 5️⃣ API Route: `/api/agencies/route.ts`

**目的**: 営業代行一覧取得・検索

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const keyword = searchParams.get('keyword')
    const specialty = searchParams.get('specialty')
    const area = searchParams.get('area')

    let query = supabase
      .from('agency_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // キーワード検索
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,bio.ilike.%${keyword}%`)
    }

    // 得意分野フィルター
    if (specialty) {
      query = query.contains('specialties', [specialty])
    }

    // エリアフィルター
    if (area) {
      query = query.contains('areas', [area])
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      agencies: data || [],
      total: data?.length || 0,
    })
  } catch (error) {
    console.error('Agencies API Error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500 }
    )
  }
}
```

---

### 6️⃣ API Route: `/api/agencies/[id]/route.ts`

**目的**: 営業代行詳細取得

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from('agency_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: '営業代行が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      agency: data,
    })
  } catch (error) {
    console.error('Agency Detail API Error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラー' },
      { status: 500 }
    )
  }
}
```

---

## ✅ チェックリスト

### Phase 1: API Routes作成

- [ ] `app/api/auth/session/route.ts` 作成
- [ ] `app/api/matching-requests/route.ts` 作成（GET, POST）
- [ ] `app/api/matching-requests/received/route.ts` 作成
- [ ] `app/api/matching-requests/[id]/route.ts` 作成（PUT）
- [ ] `app/api/agencies/route.ts` 作成
- [ ] `app/api/agencies/[id]/route.ts` 作成
- [ ] 各APIの動作確認（Postmanまたはブラウザ）

### Phase 2: ページ統合

- [ ] `app/(dashboard)/agencies/page.tsx` 統合
- [ ] `app/(dashboard)/agencies/[id]/page.tsx` 統合
- [ ] `app/(dashboard)/layout.tsx` 統合
- [ ] `app/(dashboard)/profile/page.tsx` 統合
- [ ] `app/(dashboard)/dashboard/page.tsx` 統合
- [ ] `app/(dashboard)/messages/page.tsx` 統合
- [ ] `app/(dashboard)/messages/[id]/page.tsx` 統合

### Phase 3: 動作確認

- [ ] 企業ユーザーフロー確認
- [ ] 営業代行ユーザーフロー確認
- [ ] エラーハンドリング確認
- [ ] ローディング状態確認
- [ ] レスポンシブ対応確認

---

## ⚠️ 注意事項

1. **型の整合性**
   - API Routeのレスポンス型は `types/index.ts` に合わせる
   - フロントエンドでの型定義と一致させる

2. **エラーハンドリング**
   - すべてのAPI Routeで統一的なエラーレスポンス
   - `try-catch` でラップ
   - コンソールログを残す

3. **認証チェック**
   - すべてのAPI Routeで `supabase.auth.getUser()` を呼ぶ
   - 未認証の場合は 401 を返す

4. **RLS（Row Level Security）**
   - Supabaseのポリシーが正しく設定されているか確認
   - データが意図しないユーザーに見えないか確認

5. **Realtime機能**
   - メッセージページでSupabase Realtimeが動作するか確認
   - 購読解除を忘れずに（`useEffect`のクリーンアップ）

---

## 🚀 作業開始の手順

1. **ブランチを確認**
   ```bash
   git branch  # feature/担当者C-pages にいることを確認
   ```

2. **API Routesから作成開始**
   - タスク1の6つのAPIを順番に作成
   - 1つ作成したらコミット

3. **ページ統合**
   - `matching-requests/page.tsx`（ユーザーが修正済み）を参考に
   - 同じパターンで他のページも統合

4. **動作確認**
   - `npm run dev` で開発サーバー起動
   - ブラウザで各機能をテスト

5. **コミット**
   - こまめにコミット
   - 1機能ごとにコミットメッセージを書く

---

## 📞 サポート

不明点があれば：
- `担当者A_タスクリスト.md` で Server Actions の実装を確認
- `担当者B_タスクリスト.md` で UIコンポーネントの使い方を確認
- `database/schema.sql` でテーブル構造を確認

---

**準備完了！統合作業を開始してください！** 🚀

