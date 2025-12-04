import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function MatchingRequestsPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // TODO: 担当者AのActions（A1.3）完成後に置き換え
  // const requests = await getMatchingRequests(user.id, user.role)

  // マッチング申請の取得
  let query = supabase
    .from('matching_requests')
    .select(`
      *,
      company_profile:company_profiles!company_id(company_name),
      agency_profile:agency_profiles!agency_id(name)
    `)
    .order('created_at', { ascending: false })

  // ユーザーロールに応じてフィルター
  if (user.role === 'company') {
    query = query.eq('company_id', user.id)
  } else if (user.role === 'agency') {
    query = query.eq('agency_id', user.id)
  }

  const { data: requests, error } = await query

  const pendingRequests = requests?.filter(r => r.status === 'pending') || []
  const approvedRequests = requests?.filter(r => r.status === 'approved') || []
  const rejectedRequests = requests?.filter(r => r.status === 'rejected') || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">申請中</Badge>
      case 'approved':
        return <Badge className="bg-green-600">承認済み</Badge>
      case 'rejected':
        return <Badge variant="destructive">却下</Badge>
      default:
        return null
    }
  }

  const RequestCard = ({ request }: { request: any }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {user.role === 'company' 
              ? request.agency_profile?.name 
              : request.company_profile?.company_name}
          </CardTitle>
          {getStatusBadge(request.status)}
        </div>
        <CardDescription>
          申請日: {new Date(request.created_at).toLocaleDateString('ja-JP')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700">月予算</p>
          <p className="text-lg font-semibold">
            ¥{request.monthly_budget.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700">依頼内容</p>
          <p className="text-sm text-gray-600 line-clamp-3">
            {request.request_details}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700">提案期限</p>
          <p className="text-sm text-gray-600">
            {new Date(request.proposal_deadline).toLocaleDateString('ja-JP')}
          </p>
        </div>

        {/* 営業代行側で申請中の場合は承認/却下ボタン */}
        {user.role === 'agency' && request.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            {/* TODO: 担当者AのActions（A1.3）完成後に実装 */}
            <Button variant="outline" className="flex-1" disabled>
              却下
            </Button>
            <Button className="flex-1" disabled>
              承認
            </Button>
          </div>
        )}

        {/* 承認済みの場合はメッセージへのリンク */}
        {request.status === 'approved' && (
          <Button asChild className="w-full">
            <a href={`/messages/${request.id}`}>
              メッセージを見る
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">マッチング申請</h1>
        <p className="text-gray-600 mt-2">
          {user.role === 'company' 
            ? '送信した申請の状態を確認できます' 
            : '企業からの申請を管理できます'}
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            申請中 ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            承認済み ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            却下 ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingRequests.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                申請中の案件はありません
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedRequests.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {approvedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                承認済みの案件はありません
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedRequests.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {rejectedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                却下された案件はありません
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

