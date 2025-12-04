'use server'

import { createClient } from '@/lib/supabase/server'
import { MatchingRequest, MatchingRequestStatus } from '@/types'
import { handleActionError, validateAuth, validateRole, validateExists } from '@/lib/utils/error'

/**
 * すべてのマッチング申請を取得（管理者用）
 * @param adminUserId - 管理者のユーザーID
 * @param filters - フィルター条件
 */
export async function getAllMatchingRequests(
  adminUserId: string,
  filters?: { status?: MatchingRequestStatus; keyword?: string }
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
    
    // マッチング申請一覧を取得
    let query = supabase
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(*),
        agency_profile:agency_profiles!agency_id(*)
      `)
      .order('created_at', { ascending: false })
    
    // ステータスでフィルタリング
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // キーワード検索（企業名または営業代行名）
    let results = data as MatchingRequest[]
    
    if (filters?.keyword && results) {
      const keyword = filters.keyword.toLowerCase()
      results = results.filter((request) => {
        const companyName = request.company_profile?.company_name?.toLowerCase() || ''
        const agencyName = request.agency_profile?.name?.toLowerCase() || ''
        return companyName.includes(keyword) || agencyName.includes(keyword)
      })
    }
    
    return results || []
  })
}

/**
 * マッチング申請の詳細を取得（管理者用）
 * @param adminUserId - 管理者のユーザーID
 * @param requestId - 申請ID
 */
export async function getMatchingRequestDetails(adminUserId: string, requestId: string) {
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
    
    // マッチング申請を取得
    const { data, error } = await supabase
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(*),
        agency_profile:agency_profiles!agency_id(*)
      `)
      .eq('id', requestId)
      .single()
    
    if (error) throw error
    validateExists(data, 'マッチング申請')
    
    // 関連するメッセージスレッドがあるか確認
    const { data: thread } = await supabase
      .from('message_threads')
      .select('id, last_message_at')
      .eq('matching_request_id', requestId)
      .single()
    
    return {
      request: data as MatchingRequest,
      thread: thread || null,
    }
  })
}

/**
 * ステータス別のマッチング申請数を取得
 */
export async function getMatchingRequestCountsByStatus(adminUserId: string) {
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
    
    // 各ステータスの申請数を取得
    const { count: pendingCount } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    const { count: approvedCount } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
    
    const { count: rejectedCount } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'rejected')
    
    const total = (pendingCount || 0) + (approvedCount || 0) + (rejectedCount || 0)
    
    return {
      pending: pendingCount || 0,
      approved: approvedCount || 0,
      rejected: rejectedCount || 0,
      total,
      approval_rate: total > 0 ? Math.round(((approvedCount || 0) / total) * 100) : 0,
    }
  })
}

/**
 * 最近のマッチング申請を取得
 */
export async function getRecentMatchingRequests(adminUserId: string, limit: number = 10) {
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
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(company_name),
        agency_profile:agency_profiles!agency_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return (data as MatchingRequest[]) || []
  })
}

/**
 * 特定の企業のマッチング申請を取得
 */
export async function getMatchingRequestsByCompany(adminUserId: string, companyId: string) {
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
      .from('matching_requests')
      .select(`
        *,
        agency_profile:agency_profiles!agency_id(name)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data as MatchingRequest[]) || []
  })
}

/**
 * 特定の営業代行のマッチング申請を取得
 */
export async function getMatchingRequestsByAgency(adminUserId: string, agencyId: string) {
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
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(company_name)
      `)
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data as MatchingRequest[]) || []
  })
}

/**
 * 期限切れの申請を取得
 */
export async function getExpiredRequests(adminUserId: string) {
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
    
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(company_name),
        agency_profile:agency_profiles!agency_id(name)
      `)
      .eq('status', 'pending')
      .lt('proposal_deadline', now)
      .order('proposal_deadline', { ascending: false })
    
    if (error) throw error
    
    return (data as MatchingRequest[]) || []
  })
}

/**
 * マッチング申請の統計サマリー
 */
export async function getMatchingStatsSummary(adminUserId: string) {
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
    
    // 今月の申請数
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)
    
    const { count: thisMonthCount } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString())
    
    // 今週の申請数
    const firstDayOfWeek = new Date()
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay())
    firstDayOfWeek.setHours(0, 0, 0, 0)
    
    const { count: thisWeekCount } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', firstDayOfWeek.toISOString())
    
    // 今日の申請数
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: todayCount } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
    
    // 平均承認率
    const statusCounts = await getMatchingRequestCountsByStatus(adminUserId)
    
    return {
      today: todayCount || 0,
      this_week: thisWeekCount || 0,
      this_month: thisMonthCount || 0,
      approval_rate: 'approval_rate' in statusCounts ? statusCounts.approval_rate : 0,
    }
  })
}

