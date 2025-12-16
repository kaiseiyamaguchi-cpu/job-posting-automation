import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  // middlewareで認証済みなので、ここではユーザー情報を取得するだけ
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>ユーザー情報を取得できませんでした</div>
  }
  
  const supabase = await createClient()

  // 統計データを取得
  let stats = {
    pending_requests: 0,
    approved_requests: 0,
    unread_messages: 0,
  }

  if (user.role === 'company') {
    // 企業向け統計（matching_requests.company_id は company_profiles.id を参照）
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!companyProfile) {
      return <div>企業プロフィールを取得できませんでした</div>
    }

    const { count: pending } = await supabase
      .from('matching_requests')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyProfile.id)
      .eq('status', 'pending')
    
    const { count: approved } = await supabase
      .from('matching_requests')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyProfile.id)
      .eq('status', 'approved')
    
    const { count: unread } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', user.id)
    
    stats = {
      pending_requests: pending || 0,
      approved_requests: approved || 0,
      unread_messages: unread || 0,
    }
  } else if (user.role === 'agency') {
    // 営業代行向け統計（matching_requests.agency_id は agency_profiles.id を参照）
    const { data: agencyProfile } = await supabase
      .from('agency_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!agencyProfile) {
      return <div>営業代行プロフィールを取得できませんでした</div>
    }

    const { count: newRequests } = await supabase
      .from('matching_requests')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyProfile.id)
      .eq('status', 'pending')
    
    const { count: activeCompanies } = await supabase
      .from('matching_requests')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyProfile.id)
      .eq('status', 'approved')
    
    const { count: unread } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', user.id)
    
    stats = {
      pending_requests: newRequests || 0,
      approved_requests: activeCompanies || 0,
      unread_messages: unread || 0,
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">ダッシュボード</h1>
        <p className="text-slate-400">
          {user.role === 'company' 
            ? '営業代行とのマッチング状況を確認できます' 
            : user.role === 'agency'
            ? '企業からの申請を管理できます'
            : '全体の統計情報を確認できます'}
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid gap-6 md:grid-cols-3">
        {user.role === 'company' ? (
          <>
            <Link href="/matching-requests">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <p className="text-sm text-slate-400">申請中</p>
                  <CardTitle className="text-3xl text-white">{stats.pending_requests}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500">承認待ちの申請</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/matching-requests">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <p className="text-sm text-slate-400">承認済み</p>
                  <CardTitle className="text-3xl text-white">{stats.approved_requests}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500">マッチング成立</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/messages">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <p className="text-sm text-slate-400">未読メッセージ</p>
                  <CardTitle className="text-3xl text-white">{stats.unread_messages}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500">新着メッセージ</p>
                </CardContent>
              </Card>
            </Link>
          </>
        ) : user.role === 'agency' ? (
          <>
            <Link href="/matching-requests">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <p className="text-sm text-slate-400">新着申請</p>
                  <CardTitle className="text-3xl text-white">{stats.pending_requests}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500">未対応の申請</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/matching-requests">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <p className="text-sm text-slate-400">対応中企業</p>
                  <CardTitle className="text-3xl text-white">{stats.approved_requests}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500">マッチング中</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/messages">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <p className="text-sm text-slate-400">未読メッセージ</p>
                  <CardTitle className="text-3xl text-white">{stats.unread_messages}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500">新着メッセージ</p>
                </CardContent>
              </Card>
            </Link>
          </>
        ) : null}
      </div>

      {/* クイックアクション */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">クイックアクション</CardTitle>
          <p className="text-sm text-slate-400">よく使う機能へ素早くアクセス</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {user.role === 'company' ? (
              <>
                <Button asChild variant="outline" className="h-auto py-4 border-slate-600 hover:bg-slate-700">
                  <Link href="/agencies" className="flex flex-col items-start">
                    <span className="font-semibold text-white">営業代行を探す</span>
                    <span className="text-xs text-slate-400 mt-1">条件に合う営業代行を検索</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 border-slate-600 hover:bg-slate-700">
                  <Link href="/matching-requests" className="flex flex-col items-start">
                    <span className="font-semibold text-white">申請状況を確認</span>
                    <span className="text-xs text-slate-400 mt-1">送信した申請の状態</span>
                  </Link>
                </Button>
              </>
            ) : user.role === 'agency' ? (
              <>
                <Button asChild variant="outline" className="h-auto py-4 border-slate-600 hover:bg-slate-700">
                  <Link href="/matching-requests" className="flex flex-col items-start">
                    <span className="font-semibold text-white">申請を確認</span>
                    <span className="text-xs text-slate-400 mt-1">企業からの新着申請</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 border-slate-600 hover:bg-slate-700">
                  <Link href="/messages" className="flex flex-col items-start">
                    <span className="font-semibold text-white">メッセージ</span>
                    <span className="text-xs text-slate-400 mt-1">企業とのやり取り</span>
                  </Link>
                </Button>
              </>
            ) : null}
            <Button asChild variant="outline" className="h-auto py-4 border-slate-600 hover:bg-slate-700">
              <Link href="/profile" className="flex flex-col items-start">
                <span className="font-semibold text-white">プロフィール編集</span>
                <span className="text-xs text-slate-400 mt-1">情報を更新</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
