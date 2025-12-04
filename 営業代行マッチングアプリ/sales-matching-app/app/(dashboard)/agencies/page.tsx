import { requireCompany } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function AgenciesPage({
  searchParams,
}: {
  searchParams: { keyword?: string; specialty?: string; area?: string }
}) {
  // 企業ユーザーのみアクセス可能
  await requireCompany()

  const supabase = await createClient()

  // 営業代行の検索
  // TODO: 担当者AのActions（A1.2）完成後に置き換え
  let query = supabase
    .from('agency_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // キーワード検索
  if (searchParams.keyword) {
    query = query.or(`name.ilike.%${searchParams.keyword}%,bio.ilike.%${searchParams.keyword}%`)
  }

  // 得意分野フィルター
  if (searchParams.specialty) {
    query = query.contains('specialties', [searchParams.specialty])
  }

  // エリアフィルター
  if (searchParams.area) {
    query = query.contains('areas', [searchParams.area])
  }

  const { data: agencies, error } = await query

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">営業代行を探す</h1>
        <p className="text-gray-600 mt-2">
          条件に合う営業代行パートナーを見つけましょう
        </p>
      </div>

      {/* 検索フォーム */}
      {/* TODO: 担当者BのSearchBar（B1.4）完成後に置き換え */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>検索条件</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="space-y-4">
            <div>
              <Input
                name="keyword"
                placeholder="キーワードで検索..."
                defaultValue={searchParams.keyword}
              />
            </div>
            <div className="flex gap-2">
              <Input
                name="specialty"
                placeholder="得意分野"
                defaultValue={searchParams.specialty}
              />
              <Input
                name="area"
                placeholder="対応エリア"
                defaultValue={searchParams.area}
              />
              <Button type="submit">検索</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 営業代行一覧 */}
      {/* TODO: 担当者BのAgencyList（B1.4）完成後に置き換え */}
      {error ? (
        <div className="text-red-600">エラーが発生しました</div>
      ) : agencies && agencies.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agencies.map((agency) => (
            <Card key={agency.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{agency.name}</CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {agency.specialties.slice(0, 3).map((specialty: string) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">対応エリア</p>
                    <p className="text-sm text-gray-600">
                      {agency.areas.slice(0, 3).join(', ')}
                      {agency.areas.length > 3 && '...'}
                    </p>
                  </div>
                  
                  {agency.bio && (
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {agency.bio}
                      </p>
                    </div>
                  )}

                  <Button asChild className="w-full">
                    <Link href={`/agencies/${agency.id}`}>
                      詳細を見る
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            該当する営業代行が見つかりませんでした
          </CardContent>
        </Card>
      )}
    </div>
  )
}

