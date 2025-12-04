import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            営業代行マッチングアプリ
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            営業代行を探す企業と営業代行パートナーをつなぐプラットフォーム
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">新規登録</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">ログイン</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>🏢 企業向け</CardTitle>
              <CardDescription>営業代行を簡単に検索・依頼</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>業種・エリアで絞り込み検索</li>
                <li>詳細プロフィールで比較</li>
                <li>マッチング申請でスムーズな依頼</li>
                <li>1対1メッセージで直接やり取り</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💼 営業代行向け</CardTitle>
              <CardDescription>企業からの依頼を受注</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>プロフィールで強みをアピール</li>
                <li>企業からの申請を確認</li>
                <li>承認・却下を柔軟に管理</li>
                <li>チャットで詳細を相談</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔒 安心・安全</CardTitle>
              <CardDescription>セキュアな環境を提供</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>メール認証による本人確認</li>
                <li>承認制のマッチングシステム</li>
                <li>プライベートなメッセージング</li>
                <li>管理者による全体監視</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">ご利用の流れ</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">新規登録</h3>
                <p className="text-gray-600">
                  メールアドレスとパスワードで登録。企業または営業代行を選択します。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">プロフィール作成</h3>
                <p className="text-gray-600">
                  会社情報や得意分野など、詳細なプロフィールを入力します。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">マッチング</h3>
                <p className="text-gray-600">
                  企業は営業代行を検索して申請。営業代行は申請を承認します。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">メッセージでやり取り</h3>
                <p className="text-gray-600">
                  承認後、1対1のチャットで詳細を相談できます。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">今すぐ始めましょう</h2>
          <p className="text-gray-600 mb-8">
            無料で登録して、最適なパートナーを見つけましょう
          </p>
          <Button asChild size="lg">
            <Link href="/register">無料で新規登録</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 営業代行マッチングアプリ. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Powered by Next.js 15 + Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
