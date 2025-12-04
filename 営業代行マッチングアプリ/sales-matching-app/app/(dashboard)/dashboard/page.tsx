import { requireAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await requireAuth()

  // TODO: 担当者AのActions（A1.5）完成後に統計データ取得
  // const stats = await getCompanyDashboardStats(user.id) or getAgencyDashboardStats(user.id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">
          {user.role === 'company' 
            ? '営業代行とのマッチング状況を確認できます' 
            : user.role === 'agency'
            ? '企業からの申請を管理できます'
            : '全体の統計情報を確認できます'}
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {user.role === 'company' ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>申請中</CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  承認待ちの申請
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>承認済み</CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  マッチング成立
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>未読メッセージ</CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  新着メッセージ
                </p>
              </CardContent>
            </Card>
          </>
        ) : user.role === 'agency' ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>新着申請</CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  未対応の申請
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>対応中企業</CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  マッチング中
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>未読メッセージ</CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  新着メッセージ
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* クイックアクション */}
      <Card>
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
          <CardDescription>
            よく使う機能へ素早くアクセス
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {user.role === 'company' ? (
              <>
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link href="/agencies" className="flex flex-col items-start">
                    <span className="font-semibold">営業代行を探す</span>
                    <span className="text-xs text-gray-500 mt-1">
                      条件に合う営業代行を検索
                    </span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link href="/matching-requests" className="flex flex-col items-start">
                    <span className="font-semibold">申請状況を確認</span>
                    <span className="text-xs text-gray-500 mt-1">
                      送信した申請の状態
                    </span>
                  </Link>
                </Button>
              </>
            ) : user.role === 'agency' ? (
              <>
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link href="/matching-requests" className="flex flex-col items-start">
                    <span className="font-semibold">申請を確認</span>
                    <span className="text-xs text-gray-500 mt-1">
                      企業からの新着申請
                    </span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link href="/messages" className="flex flex-col items-start">
                    <span className="font-semibold">メッセージ</span>
                    <span className="text-xs text-gray-500 mt-1">
                      企業とのやり取り
                    </span>
                  </Link>
                </Button>
              </>
            ) : null}
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/profile" className="flex flex-col items-start">
                <span className="font-semibold">プロフィール編集</span>
                <span className="text-xs text-gray-500 mt-1">
                  情報を更新
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

