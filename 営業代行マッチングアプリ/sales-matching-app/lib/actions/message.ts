'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { MessageThread, Message } from '@/types'
import { 
  handleActionError, 
  validateAuth, 
  validateExists 
} from '@/lib/utils/error'

/**
 * ユーザーのメッセージスレッド一覧を取得
 * @param userId - 現在のユーザーID
 */
export async function getMessageThreads(userId: string) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    // ユーザーが企業または営業代行として参加しているスレッドを取得
    const { data, error } = await supabase
      .from('message_threads')
      .select(`
        *,
        matching_request:matching_requests(
          *,
          company_profile:company_profiles!company_id(*),
          agency_profile:agency_profiles!agency_id(*)
        )
      `)
      .or(`company_id.eq.${userId},agency_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // 各スレッドの未読メッセージ数を取得
    const threadsWithUnread = await Promise.all(
      (data || []).map(async (thread) => {
        const unreadCount = await getUnreadCountForThread(thread.id, userId)
        return {
          ...thread,
          unread_count: unreadCount,
        } as MessageThread
      })
    )
    
    return threadsWithUnread
  })
}

/**
 * 特定のスレッドを取得
 * @param threadId - スレッドID
 * @param userId - 現在のユーザーID（権限チェック用）
 */
export async function getMessageThread(threadId: string, userId: string) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('message_threads')
      .select(`
        *,
        matching_request:matching_requests(
          *,
          company_profile:company_profiles!company_id(*),
          agency_profile:agency_profiles!agency_id(*)
        )
      `)
      .eq('id', threadId)
      .single()
    
    if (error) throw error
    validateExists(data, 'メッセージスレッド')
    
    // 権限チェック: ユーザーがこのスレッドの参加者か確認
    if (data.company_id !== userId && data.agency_id !== userId) {
      throw new Error('このスレッドにアクセスする権限がありません')
    }
    
    return data as MessageThread
  })
}

/**
 * スレッド内のメッセージを取得
 * @param threadId - スレッドID
 * @param userId - 現在のユーザーID（権限チェック用）
 */
export async function getMessages(threadId: string, userId: string) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    // スレッドの権限チェック
    const thread = await getMessageThread(threadId, userId)
    if ('error' in thread) {
      throw new Error(thread.error)
    }
    
    // メッセージを取得
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, email, role)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    return (data as Message[]) || []
  })
}

/**
 * メッセージを送信
 * @param threadId - スレッドID
 * @param senderId - 送信者ID
 * @param content - メッセージ内容
 */
export async function sendMessage(threadId: string, senderId: string, content: string) {
  return handleActionError(async () => {
    validateAuth(senderId)
    
    if (!content || content.trim() === '') {
      throw new Error('メッセージ内容を入力してください')
    }
    
    const supabase = await createClient()
    
    // スレッドの権限チェック
    const thread = await getMessageThread(threadId, senderId)
    if ('error' in thread) {
      throw new Error(thread.error)
    }
    
    // メッセージを作成
    const { data, error } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: senderId,
        content: content.trim(),
        is_read: false,
      })
      .select()
      .single()
    
    if (error) throw error
    
    // スレッドの最終メッセージ時刻を更新
    await supabase
      .from('message_threads')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId)
    
    revalidatePath('/messages')
    revalidatePath(`/messages/${threadId}`)
    
    return data as Message
  })
}

/**
 * メッセージを既読にする
 * @param threadId - スレッドID
 * @param userId - 現在のユーザーID
 */
export async function markMessagesAsRead(threadId: string, userId: string) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    // スレッドの権限チェック
    const thread = await getMessageThread(threadId, userId)
    if ('error' in thread) {
      throw new Error(thread.error)
    }
    
    // 自分が送信者でないメッセージを既読にする
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('thread_id', threadId)
      .neq('sender_id', userId)
      .eq('is_read', false)
    
    if (error) throw error
    
    revalidatePath('/messages')
    revalidatePath(`/messages/${threadId}`)
    
    return { success: true }
  })
}

/**
 * ユーザーの未読メッセージ数を取得
 * @param userId - ユーザーID
 */
export async function getUnreadCount(userId: string) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    // ユーザーが参加しているスレッドを取得
    const { data: threads, error: threadsError } = await supabase
      .from('message_threads')
      .select('id')
      .or(`company_id.eq.${userId},agency_id.eq.${userId}`)
    
    if (threadsError) throw threadsError
    
    if (!threads || threads.length === 0) {
      return 0
    }
    
    const threadIds = threads.map(t => t.id)
    
    // 未読メッセージ数を集計
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('thread_id', threadIds)
      .neq('sender_id', userId)
      .eq('is_read', false)
    
    if (error) throw error
    
    return count || 0
  })
}

/**
 * 特定のスレッドの未読メッセージ数を取得（内部使用）
 */
async function getUnreadCountForThread(threadId: string, userId: string): Promise<number> {
  try {
    const supabase = await createClient()
    
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('thread_id', threadId)
      .neq('sender_id', userId)
      .eq('is_read', false)
    
    if (error) throw error
    
    return count || 0
  } catch (error) {
    console.error('Error getting unread count for thread:', error)
    return 0
  }
}

/**
 * スレッド内の最新メッセージを取得
 */
export async function getLatestMessage(threadId: string) {
  return handleActionError(async () => {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    
    return data as Message | null
  })
}

