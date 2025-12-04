import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'

export default async function MessagesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // TODO: 担当者AのActions（A1.4）完成後に置き換え
  // const threads = await getMessageThreads(user.id)

  // メッセージスレッドの取得
  const { data: threads, error } = await supabase
    .from('message_threads')
    .select(`
      *,
      matching_request:matching_requests(
        company_profile:company_profiles!company_id(company_name),
        agency_profile:agency_profiles!agency_id(name)
      ),
      messages(id, is_read, sender_id, created_at)
    `)
    .or(`company_id.eq.${user.id},agency_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  // 未読件数の計算
  const getUnreadCount = (threadMessages: any[]) => {
    return threadMessages.filter(
      m => !m.is_read && m.sender_id !== user.id
    ).length
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">メッセージ</h1>
        <p className="text-gray-600 mt-2">
          マッチング成立後のやり取りを確認できます
        </p>
      </div>

      {/* TODO: 担当者BのThreadList（B1.6）完成後に置き換え */}
      {error ? (
        <Card>
          <CardContent className="py-12 text-center text-red-600">
            エラーが発生しました
          </CardContent>
        </Card>
      ) : threads && threads.length > 0 ? (
        <div className="space-y-3">
          {threads.map((thread) => {
            const partnerName = user.role === 'company'
              ? thread.matching_request?.agency_profile?.name
              : thread.matching_request?.company_profile?.company_name
            
            const unreadCount = thread.messages ? getUnreadCount(thread.messages) : 0
            const lastMessageDate = thread.last_message_at 
              ? new Date(thread.last_message_at).toLocaleDateString('ja-JP')
              : '未送信'

            return (
              <Link key={thread.id} href={`/messages/${thread.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {partnerName?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold truncate">{partnerName}</p>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          最終メッセージ: {lastMessageDate}
                        </p>
                      </div>

                      <div className="text-gray-400">›</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p className="mb-2">メッセージはまだありません</p>
            <p className="text-sm">
              マッチング申請が承認されると、メッセージのやり取りができます
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

