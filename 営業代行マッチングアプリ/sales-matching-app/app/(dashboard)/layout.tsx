import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 認証チェック
  const user = await requireAuth()

  // TODO: 担当者Bのレイアウトコンポーネント完成後に統合
  // import { DashboardLayout } from '@/components/layout/DashboardLayout'
  // return <DashboardLayout userRole={user.role}>{children}</DashboardLayout>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 仮のナビゲーション */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">営業代行マッチング</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {user.role === 'company' ? '企業' : user.role === 'agency' ? '営業代行' : '管理者'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

