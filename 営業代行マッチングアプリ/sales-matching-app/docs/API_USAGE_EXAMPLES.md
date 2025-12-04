# Server Actions 使用例ガイド

このドキュメントでは、実装済みのServer Actionsの使用例を説明します。  
**担当者B・C向け**: ページやコンポーネントの実装時にこのガイドを参照してください。

---

## 📋 目次

- [認証](#認証)
- [プロフィール管理](#プロフィール管理)
- [営業代行検索](#営業代行検索)
- [マッチング申請](#マッチング申請)
- [メッセージ](#メッセージ)
- [ダッシュボード](#ダッシュボード)
- [管理者機能](#管理者機能)
- [エラーハンドリング](#エラーハンドリング)

---

## 認証

### ログイン

```typescript
'use client'

import { login } from '@/lib/actions/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = await login({ email, password })
    
    if ('error' in result) {
      setError(result.error)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

### 新規登録

```typescript
import { register } from '@/lib/actions/auth'

const result = await register({
  email: 'user@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  role: 'company', // or 'agency'
})

if ('error' in result) {
  console.error(result.error)
} else {
  // 登録成功
}
```

### ログアウト

```typescript
import { logout } from '@/lib/actions/auth'
import { useRouter } from 'next/navigation'

function LogoutButton() {
  const router = useRouter()
  
  const handleLogout = async () => {
    await logout()
    router.push('/')
    router.refresh()
  }
  
  return <button onClick={handleLogout}>ログアウト</button>
}
```

---

## プロフィール管理

### 企業プロフィールの取得（Server Component）

```typescript
import { getCompanyProfile } from '@/lib/actions/profile'
import { getCurrentUser } from '@/lib/auth'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const profile = await getCompanyProfile(user.id)
  
  if ('error' in profile) {
    return <div>プロフィールが見つかりません</div>
  }
  
  return (
    <div>
      <h1>{profile.company_name}</h1>
      <p>{profile.industry}</p>
    </div>
  )
}
```

### 企業プロフィールの作成

```typescript
'use client'

import { createCompanyProfile } from '@/lib/actions/profile'
import { useRouter } from 'next/navigation'

export function CompanyProfileForm({ userId }: { userId: string }) {
  const router = useRouter()
  
  const handleSubmit = async (data: CompanyProfileForm) => {
    const result = await createCompanyProfile(userId, {
      company_name: data.company_name,
      industry: data.industry,
      area: data.area,
      request_content: data.request_content,
      contact_person: data.contact_person,
      phone_number: data.phone_number,
    })
    
    if ('error' in result) {
      alert(result.error)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }
  
  return <form>{/* ... */}</form>
}
```

### 営業代行プロフィールの更新

```typescript
import { updateAgencyProfile } from '@/lib/actions/profile'

const result = await updateAgencyProfile(userId, {
  name: '〇〇営業代行',
  specialties: ['新規開拓営業', 'テレアポ'],
  areas: ['関東', '中部'],
  bio: '10年以上の実績があります',
  phone_number: '09012345678',
})

if ('error' in result) {
  console.error(result.error)
} else {
  console.log('更新成功:', result)
}
```

---

## 営業代行検索

### 営業代行一覧の取得

```typescript
import { getAgencies } from '@/lib/actions/agency'

export default async function AgenciesPage() {
  const agencies = await getAgencies()
  
  if ('error' in agencies) {
    return <div>エラー: {agencies.error}</div>
  }
  
  return (
    <div>
      {agencies.map((agency) => (
        <div key={agency.id}>
          <h3>{agency.name}</h3>
          <p>{agency.specialties.join('、')}</p>
        </div>
      ))}
    </div>
  )
}
```

### フィルタリング付き検索

```typescript
import { getAgencies } from '@/lib/actions/agency'

// 得意分野でフィルター
const result = await getAgencies({ specialty: '新規開拓営業' })

// エリアでフィルター
const result = await getAgencies({ area: '関東' })

// キーワード検索
const result = await getAgencies({ keyword: 'IT営業' })

// 複合フィルター
const result = await getAgencies({
  specialty: '新規開拓営業',
  area: '関東',
  keyword: 'IT',
})
```

### 営業代行の詳細取得

```typescript
import { getAgencyById } from '@/lib/actions/agency'

export default async function AgencyDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const agency = await getAgencyById(params.id)
  
  if ('error' in agency) {
    return <div>営業代行が見つかりません</div>
  }
  
  return (
    <div>
      <h1>{agency.name}</h1>
      <p>得意分野: {agency.specialties.join('、')}</p>
      <p>対応エリア: {agency.areas.join('、')}</p>
      <p>{agency.bio}</p>
    </div>
  )
}
```

---

## マッチング申請

### マッチング申請の作成

```typescript
'use client'

import { createMatchingRequest } from '@/lib/actions/matching'

export function MatchingRequestForm({ 
  companyId, 
  agencyId 
}: { 
  companyId: string
  agencyId: string 
}) {
  const handleSubmit = async (data: MatchingRequestFormData) => {
    const result = await createMatchingRequest(companyId, agencyId, {
      monthly_budget: 200000,
      request_details: '新規開拓営業をお願いしたいです',
      proposal_deadline: '2025-12-31',
    })
    
    if ('error' in result) {
      alert(result.error)
    } else {
      alert('申請を送信しました')
    }
  }
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

### マッチング申請一覧の取得

```typescript
import { getMatchingRequests } from '@/lib/actions/matching'
import { getCurrentUser } from '@/lib/auth'

export default async function MatchingRequestsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const requests = await getMatchingRequests(user.id, user.role)
  
  if ('error' in requests) {
    return <div>エラー: {requests.error}</div>
  }
  
  return (
    <div>
      {requests.map((request) => (
        <div key={request.id}>
          <p>予算: ¥{request.monthly_budget.toLocaleString()}</p>
          <p>ステータス: {request.status}</p>
        </div>
      ))}
    </div>
  )
}
```

### マッチング申請の承認・却下

```typescript
'use client'

import { updateMatchingRequestStatus } from '@/lib/actions/matching'

export function ApprovalButtons({ 
  requestId, 
  agencyId 
}: {
  requestId: string
  agencyId: string
}) {
  const handleApprove = async () => {
    const result = await updateMatchingRequestStatus(
      requestId,
      'approved',
      agencyId
    )
    
    if ('error' in result) {
      alert(result.error)
    } else {
      alert('申請を承認しました')
      // メッセージスレッドが自動作成されます
    }
  }
  
  const handleReject = async () => {
    const result = await updateMatchingRequestStatus(
      requestId,
      'rejected',
      agencyId
    )
    
    if ('error' in result) {
      alert(result.error)
    } else {
      alert('申請を却下しました')
    }
  }
  
  return (
    <>
      <button onClick={handleApprove}>承認</button>
      <button onClick={handleReject}>却下</button>
    </>
  )
}
```

---

## メッセージ

### メッセージスレッド一覧の取得

```typescript
import { getMessageThreads } from '@/lib/actions/message'
import { getCurrentUser } from '@/lib/auth'

export default async function MessagesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const threads = await getMessageThreads(user.id)
  
  if ('error' in threads) {
    return <div>エラー: {threads.error}</div>
  }
  
  return (
    <div>
      {threads.map((thread) => (
        <div key={thread.id}>
          <p>未読: {thread.unread_count}件</p>
          <p>最終更新: {thread.last_message_at}</p>
        </div>
      ))}
    </div>
  )
}
```

### メッセージの送信

```typescript
'use client'

import { sendMessage } from '@/lib/actions/message'
import { useState } from 'react'

export function ChatInput({ 
  threadId, 
  senderId 
}: { 
  threadId: string
  senderId: string 
}) {
  const [content, setContent] = useState('')
  
  const handleSend = async () => {
    if (!content.trim()) return
    
    const result = await sendMessage(threadId, senderId, content)
    
    if ('error' in result) {
      alert(result.error)
    } else {
      setContent('')
      // 画面を更新
    }
  }
  
  return (
    <div>
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
      />
      <button onClick={handleSend}>送信</button>
    </div>
  )
}
```

### メッセージを既読にする

```typescript
'use client'

import { markMessagesAsRead } from '@/lib/actions/message'
import { useEffect } from 'react'

export function ChatWindow({ 
  threadId, 
  userId 
}: { 
  threadId: string
  userId: string 
}) {
  useEffect(() => {
    // ページを開いたら既読にする
    markMessagesAsRead(threadId, userId)
  }, [threadId, userId])
  
  return <div>{/* ... */}</div>
}
```

---

## ダッシュボード

### 企業向けダッシュボード統計

```typescript
import { getCompanyDashboardStats } from '@/lib/actions/dashboard'
import { getCurrentUser } from '@/lib/auth'

export default async function CompanyDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const stats = await getCompanyDashboardStats(user.id)
  
  if ('error' in stats) {
    return <div>エラー: {stats.error}</div>
  }
  
  return (
    <div>
      <div>ペンディング中: {stats.pending_requests}件</div>
      <div>承認済み: {stats.approved_requests}件</div>
      <div>未読メッセージ: {stats.unread_messages}件</div>
    </div>
  )
}
```

### 営業代行向けダッシュボード統計

```typescript
import { getAgencyDashboardStats } from '@/lib/actions/dashboard'

const stats = await getAgencyDashboardStats(userId)

if ('error' in stats) {
  console.error(stats.error)
} else {
  console.log('新着申請:', stats.new_requests)
  console.log('対応中企業:', stats.active_companies)
  console.log('未読メッセージ:', stats.unread_messages)
}
```

---

## 管理者機能

### 全ユーザーの取得

```typescript
import { getAllUsers } from '@/lib/actions/admin/users'
import { getCurrentUser } from '@/lib/auth'

export default async function AdminUsersPage() {
  const admin = await getCurrentUser()
  
  if (!admin || admin.role !== 'admin') {
    redirect('/dashboard')
  }
  
  const users = await getAllUsers(admin.id)
  
  if ('error' in users) {
    return <div>エラー: {users.error}</div>
  }
  
  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>
          <p>{user.email} - {user.role}</p>
        </div>
      ))}
    </div>
  )
}
```

### ユーザーロールの変更

```typescript
'use client'

import { updateUserRole } from '@/lib/actions/admin/users'

export function RoleChangeButton({ 
  adminId, 
  userId 
}: { 
  adminId: string
  userId: string 
}) {
  const handleChange = async (newRole: 'company' | 'agency' | 'admin') => {
    const result = await updateUserRole(adminId, userId, newRole)
    
    if ('error' in result) {
      alert(result.error)
    } else {
      alert('ロールを変更しました')
    }
  }
  
  return <select onChange={(e) => handleChange(e.target.value as any)}>{/* ... */}</select>
}
```

---

## エラーハンドリング

すべてのActionsは統一的なエラーハンドリングを実装しています。

### 基本パターン

```typescript
const result = await someAction(params)

if ('error' in result) {
  // エラー処理
  console.error(result.error)
  setError(result.error) // 画面に表示
} else {
  // 成功処理
  console.log('Success:', result)
}
```

### React Hook Formとの組み合わせ

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/schemas'
import { login } from '@/lib/actions/auth'

export function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })
  
  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data)
    
    if ('error' in result) {
      form.setError('root', { message: result.error })
    } else {
      // 成功処理
    }
  }
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>
}
```

---

## 💡 ベストプラクティス

### 1. Server ComponentsでServer Actionsを使う

```typescript
// ✅ Good: Server Component
export default async function Page() {
  const data = await someAction()
  return <div>{/* ... */}</div>
}
```

### 2. Client ComponentsではuseTransitionを使う

```typescript
// ✅ Good: useTransitionで楽観的更新
'use client'

import { useTransition } from 'react'

export function Button() {
  const [isPending, startTransition] = useTransition()
  
  const handleClick = () => {
    startTransition(async () => {
      await someAction()
    })
  }
  
  return <button disabled={isPending}>{/* ... */}</button>
}
```

### 3. revalidatePathを信頼する

Server Actionsは自動的に`revalidatePath`を実行するため、手動でrefetchする必要はありません。

```typescript
// ❌ Bad: 不要なrefetch
await someAction()
router.refresh() // 不要！

// ✅ Good: Server Actionに任せる
await someAction()
```

---

**更新日**: 2025-12-04

