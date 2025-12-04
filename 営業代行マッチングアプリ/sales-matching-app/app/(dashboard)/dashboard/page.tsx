import { requireAuth } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">ダッシュボード</h1>
        <p className="text-slate-400">
          ようこそ、{user.email}さん (Role: {user.role})
        </p>
      </div>
      <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-lg">
        <p className="text-white">テスト表示 - 無限レンダリングが止まったか確認中...</p>
      </div>
    </div>
  )
}
