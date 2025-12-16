'use server'

import { createClient } from '@/lib/supabase/server'
import { MessageThread, Message } from '@/types'
import { handleActionError, validateAuth, validateRole, validateExists } from '@/lib/utils/error'

/**
 * すべてのメッセージスレッドを取得（管理者用）
 * @param adminUserId - 管理者のユーザーID
 * @param filters - フィルター条件
 */
export async function getAllThreads(
  adminUserId: string,
  filters?: { hasMessages?: boolean; keyword?: string }
) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // 管理者権限を確認
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (adminError) throw adminError
    validateRole(admin.role, ['admin'])
    
    // スレッド一覧を取得
    const query = supabase
      .from('message_threads')
      .select(`
        *,
        matching_request:matching_requests(
          *,
          company_profile:company_profiles!company_id(company_name),
          agency_profile:agency_profiles!agency_id(name)
        )
      `)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) throw error
    
    let results = data as MessageThread[]
    
    // メッセージがあるスレッドのみ
    if (filters?.hasMessages && results) {
      results = results.filter(thread => thread.last_message_at !== null)
    }
    
    // キーワード検索（企業名または営業代行名）
    if (filters?.keyword && results) {
      const keyword = filters.keyword.toLowerCase()
      results = results.filter((thread) => {
        const companyName = thread.matching_request?.company_profile?.company_name?.toLowerCase() || ''
        const agencyName = thread.matching_request?.agency_profile?.name?.toLowerCase() || ''
        return companyName.includes(keyword) || agencyName.includes(keyword)
      })
    }
    
    // 各スレッドのメッセージ数を取得
    const threadsWithStats = await Promise.all(
      results.map(async (thread) => {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('thread_id', thread.id)
        
        return {
          ...thread,
          message_count: count || 0,
        }
      })
    )
    
    return threadsWithStats
  })
}

/**
 * スレッドの詳細とメッセージを取得（管理者用）
 * @param adminUserId - 管理者のユーザーID
 * @param threadId - スレッドID
 */
export async function getThreadMessages(adminUserId: string, threadId: string) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // 管理者権限を確認
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (adminError) throw adminError
    validateRole(admin.role, ['admin'])
    
    // スレッド情報を取得
    const { data: thread, error: threadError } = await supabase
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
    
    if (threadError) throw threadError
    validateExists(thread, 'メッセージスレッド')
    
    // メッセージを取得
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, email, role)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    
    if (messagesError) throw messagesError
    
    return {
      thread: thread as MessageThread,
      messages: (messages as Message[]) || [],
    }
  })
}

/**
 * アクティブなスレッド数を取得
 */
export async function getActiveThreadsCount(adminUserId: string) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // 管理者権限を確認
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (adminError) throw adminError
    validateRole(admin.role, ['admin'])
    
    // 全スレッド数
    const { count: totalThreads } = await supabase
      .from('message_threads')
      .select('id', { count: 'exact', head: true })
    
    // メッセージがあるスレッド数
    const { count: activeThreads } = await supabase
      .from('message_threads')
      .select('id', { count: 'exact', head: true })
      .not('last_message_at', 'is', null)
    
    // 過去7日間にメッセージがあったスレッド数
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { count: recentActiveThreads } = await supabase
      .from('message_threads')
      .select('id', { count: 'exact', head: true })
      .gte('last_message_at', sevenDaysAgo.toISOString())
    
    return {
      total: totalThreads || 0,
      active: activeThreads || 0,
      recent_active: recentActiveThreads || 0,
    }
  })
}

/**
 * 最近アクティブなスレッドを取得
 */
export async function getRecentActiveThreads(adminUserId: string, limit: number = 10) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // 管理者権限を確認
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (adminError) throw adminError
    validateRole(admin.role, ['admin'])
    
    const { data, error } = await supabase
      .from('message_threads')
      .select(`
        *,
        matching_request:matching_requests(
          *,
          company_profile:company_profiles!company_id(company_name),
          agency_profile:agency_profiles!agency_id(name)
        )
      `)
      .not('last_message_at', 'is', null)
      .order('last_message_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return (data as MessageThread[]) || []
  })
}

/**
 * 総メッセージ数を取得
 */
export async function getTotalMessagesCount(adminUserId: string) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // 管理者権限を確認
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (adminError) throw adminError
    validateRole(admin.role, ['admin'])
    
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
    
    // 今日のメッセージ数
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: todayMessages } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
    
    // 今週のメッセージ数
    const firstDayOfWeek = new Date()
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay())
    firstDayOfWeek.setHours(0, 0, 0, 0)
    
    const { count: thisWeekMessages } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', firstDayOfWeek.toISOString())
    
    return {
      total: totalMessages || 0,
      today: todayMessages || 0,
      this_week: thisWeekMessages || 0,
    }
  })
}

/**
 * 特定のユーザーのスレッドを取得
 */
export async function getThreadsByUser(adminUserId: string, userId: string) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // 管理者権限を確認
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (adminError) throw adminError
    validateRole(admin.role, ['admin'])
    
    const { data, error } = await supabase
      .from('message_threads')
      .select(`
        *,
        matching_request:matching_requests(
          *,
          company_profile:company_profiles!company_id(company_name),
          agency_profile:agency_profiles!agency_id(name)
        )
      `)
      .or(`company_id.eq.${userId},agency_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data as MessageThread[]) || []
  })
}

/**
 * スレッドの統計サマリー
 */
export async function getThreadStatsSummary(adminUserId: string) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // 管理者権限を確認
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (adminError) throw adminError
    validateRole(admin.role, ['admin'])
    
    // スレッド統計
    const threadCounts = await getActiveThreadsCount(adminUserId)
    
    // メッセージ統計
    const messageCounts = await getTotalMessagesCount(adminUserId)
    
    // 平均メッセージ数（スレッドあたり）
    const avgMessagesPerThread = 
      threadCounts && 'active' in threadCounts && threadCounts.active > 0
        ? Math.round((messageCounts && 'total' in messageCounts ? messageCounts.total : 0) / threadCounts.active)
        : 0
    
    return {
      threads: threadCounts,
      messages: messageCounts,
      avg_messages_per_thread: avgMessagesPerThread,
    }
  })
}

/**
 * 最も活発なスレッドを取得（メッセージ数順）
 */
export async function getMostActiveThreads(adminUserId: string, limit: number = 10) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // 管理者権限を確認
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (adminError) throw adminError
    validateRole(admin.role, ['admin'])
    
    // 全スレッドを取得
    const { data: threads, error } = await supabase
      .from('message_threads')
      .select(`
        *,
        matching_request:matching_requests(
          *,
          company_profile:company_profiles!company_id(company_name),
          agency_profile:agency_profiles!agency_id(name)
        )
      `)
    
    if (error) throw error
    
    // 各スレッドのメッセージ数を取得してソート
    const threadsWithCounts = await Promise.all(
      (threads || []).map(async (thread) => {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('thread_id', thread.id)
        
        return {
          ...thread,
          message_count: count || 0,
        }
      })
    )
    
    // メッセージ数でソート
    return threadsWithCounts
      .sort((a, b) => b.message_count - a.message_count)
      .slice(0, limit)
  })
}

