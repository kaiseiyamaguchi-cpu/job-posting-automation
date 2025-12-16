'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Message } from '@/types'

// TODO: 担当者AのActions（A1.4）とBのコンポーネント（B1.6）完成後に最適化

export default function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const loadMessages = async (userId: string | null) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', id)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
      
      // 既読処理（自分以外のメッセージ）
      const unreadIds = data
        .filter(m => !m.is_read && m.sender_id !== userId)
        .map(m => m.id)
      
      if (unreadIds.length > 0 && userId) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds)
      }
    }
  }

  useEffect(() => {
    let cancelled = false
    
    ;(async () => {
      // ユーザー情報取得
      const { data } = await supabase.auth.getUser()
      const uid = data.user?.id || null
      
      if (cancelled) return
      setCurrentUserId(uid)

      // メッセージ取得
      await loadMessages(uid)
    })()

    // Realtime購読
    const channel = supabase
      .channel(`thread:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [id])

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUserId) return

    setLoading(true)

    // TODO: 担当者AのActions（A1.4）完成後に置き換え
    const { error } = await supabase.from('messages').insert({
      thread_id: id,
      sender_id: currentUserId,
      content: newMessage.trim(),
    })

    if (!error) {
      setNewMessage('')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => router.back()}
      >
        ← メッセージ一覧へ
      </Button>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>メッセージ</CardTitle>
        </CardHeader>

        {/* メッセージ履歴 */}
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_id === currentUserId

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="flex-shrink-0">
                  <AvatarFallback>
                    {isOwn ? 'あ' : '相'}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-md ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.created_at).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>
            )
          })}

          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              まだメッセージがありません。最初のメッセージを送信しましょう。
            </div>
          )}
        </CardContent>

        {/* メッセージ入力 */}
        <CardContent className="border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="メッセージを入力..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={loading}
              rows={2}
              className="resize-none"
            />
            <Button 
              onClick={handleSend} 
              disabled={loading || !newMessage.trim()}
              className="h-auto"
            >
              送信
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter で送信、Shift + Enter で改行
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

