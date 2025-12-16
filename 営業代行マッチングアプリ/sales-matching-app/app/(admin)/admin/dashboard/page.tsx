export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-white">管理者ダッシュボード</h1>
      <p className="text-slate-400">
        提案デモ用の管理者画面です。実データの統計（ユーザー管理/申請管理/スレッド監視）は必要に応じて拡張できます。
      </p>
      <p className="text-slate-400">まずはサイドバーの「マネー一覧」でお金の流れを確認できます。</p>
    </div>
  );
}

