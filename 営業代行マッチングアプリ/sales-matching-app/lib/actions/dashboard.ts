'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  CompanyDashboardStats, 
  AgencyDashboardStats, 
  AdminDashboardStats 
} from '@/types'
import { handleActionError, validateAuth } from '@/lib/utils/error'

/**
 * 企業向けダッシュボード統計を取得
 * @param userId - 企業のユーザーID
 */
export async function getCompanyDashboardStats(userId: string) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    // ペンディング中の申請数
    const { count: pendingCount } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', userId)
      .eq('status', 'pending')
    
    // 承認された申請数
    const { count: approvedCount } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', userId)
      .eq('status', 'approved')
    
    // 未読メッセージ数
    // スレッドを取得
    const { data: threads } = await supabase
      .from('message_threads')
      .select('id')
      .eq('company_id', userId)
    
    let unreadCount = 0
    if (threads && threads.length > 0) {
      const threadIds = threads.map(t => t.id)
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('thread_id', threadIds)
        .neq('sender_id', userId)
        .eq('is_read', false)
      
      unreadCount = count || 0
    }
    
    const stats: CompanyDashboardStats = {
      pending_requests: pendingCount || 0,
      approved_requests: approvedCount || 0,
      unread_messages: unreadCount,
    }
    
    return stats
  })
}

/**
 * 営業代行向けダッシュボード統計を取得
 * @param userId - 営業代行のユーザーID
 */
export async function getAgencyDashboardStats(userId: string) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    // 新着申請数（ペンディング中）
    const { count: newRequestsCount } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', userId)
      .eq('status', 'pending')
    
    // 対応中の企業数（承認済み）
    const { count: activeCompaniesCount } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', userId)
      .eq('status', 'approved')
    
    // 未読メッセージ数
    // スレッドを取得
    const { data: threads } = await supabase
      .from('message_threads')
      .select('id')
      .eq('agency_id', userId)
    
    let unreadCount = 0
    if (threads && threads.length > 0) {
      const threadIds = threads.map(t => t.id)
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('thread_id', threadIds)
        .neq('sender_id', userId)
        .eq('is_read', false)
      
      unreadCount = count || 0
    }
    
    const stats: AgencyDashboardStats = {
      new_requests: newRequestsCount || 0,
      active_companies: activeCompaniesCount || 0,
      unread_messages: unreadCount,
    }
    
    return stats
  })
}

/**
 * 管理者向けダッシュボード統計を取得
 */
export async function getAdminDashboardStats() {
  return handleActionError(async () => {
    const supabase = await createClient()
    
    // 総ユーザー数
    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
    
    // 企業数
    const { count: totalCompanies } = await supabase
      .from('company_profiles')
      .select('id', { count: 'exact', head: true })
    
    // 営業代行数
    const { count: totalAgencies } = await supabase
      .from('agency_profiles')
      .select('id', { count: 'exact', head: true })
    
    // 総申請数
    const { count: totalRequests } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
    
    // 承認率の計算
    const { count: approvedRequests } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
    
    const approvalRate = totalRequests && totalRequests > 0
      ? Math.round((approvedRequests || 0) / totalRequests * 100)
      : 0
    
    // アクティブなスレッド数
    const { count: activeThreads } = await supabase
      .from('message_threads')
      .select('id', { count: 'exact', head: true })
    
    const stats: AdminDashboardStats = {
      total_users: totalUsers || 0,
      total_companies: totalCompanies || 0,
      total_agencies: totalAgencies || 0,
      total_requests: totalRequests || 0,
      approval_rate: approvalRate,
      active_threads: activeThreads || 0,
    }
    
    return stats
  })
}

/**
 * 企業の最近のマッチング申請を取得
 */
export async function getRecentMatchingRequests(userId: string, limit: number = 5) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('matching_requests')
      .select(`
        *,
        agency_profile:agency_profiles!agency_id(name)
      `)
      .eq('company_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return data || []
  })
}

/**
 * 営業代行の最近の新着申請を取得
 */
export async function getRecentNewRequests(userId: string, limit: number = 5) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(company_name)
      `)
      .eq('agency_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return data || []
  })
}

/**
 * 最近のアクティビティを取得（スレッドの最終メッセージ時刻でソート）
 */
export async function getRecentActivity(userId: string, limit: number = 5) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
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
      .not('last_message_at', 'is', null)
      .order('last_message_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return data || []
  })
}

