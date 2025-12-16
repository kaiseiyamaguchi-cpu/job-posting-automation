'use server'

import { createClient } from '@/lib/supabase/server'
import { handleActionError, validateAuth, validateRole } from '@/lib/utils/error'

/**
 * 管理者向けの詳細統計を取得
 */
export async function getAdminStats(adminUserId: string) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // ユーザーロールを確認
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (userError) throw userError
    validateRole(user.role, ['admin'])
    
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
    
    // ステータス別の申請数
    const { count: pendingRequests } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    const { count: approvedRequests } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
    
    const { count: rejectedRequests } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'rejected')
    
    // 承認率の計算
    const approvalRate = totalRequests && totalRequests > 0
      ? Math.round((approvedRequests || 0) / totalRequests * 100)
      : 0
    
    // アクティブなスレッド数
    const { count: activeThreads } = await supabase
      .from('message_threads')
      .select('id', { count: 'exact', head: true })
    
    // 総メッセージ数
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
    
    return {
      total_users: totalUsers || 0,
      total_companies: totalCompanies || 0,
      total_agencies: totalAgencies || 0,
      total_requests: totalRequests || 0,
      pending_requests: pendingRequests || 0,
      approved_requests: approvedRequests || 0,
      rejected_requests: rejectedRequests || 0,
      approval_rate: approvalRate,
      active_threads: activeThreads || 0,
      total_messages: totalMessages || 0,
    }
  })
}

/**
 * ユーザー成長データを取得（月別）
 */
export async function getUserGrowthData(adminUserId: string) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // ユーザーロールを確認
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (userError) throw userError
    validateRole(user.role, ['admin'])
    
    // 過去6ヶ月のユーザー登録数
    const { data: users, error } = await supabase
      .from('users')
      .select('created_at, role')
      .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // 月別にグループ化
    const monthlyData: Record<string, { companies: number; agencies: number; total: number }> = {}
    
    users?.forEach((user) => {
      const month = new Date(user.created_at).toISOString().slice(0, 7) // YYYY-MM
      
      if (!monthlyData[month]) {
        monthlyData[month] = { companies: 0, agencies: 0, total: 0 }
      }
      
      monthlyData[month].total++
      
      if (user.role === 'company') {
        monthlyData[month].companies++
      } else if (user.role === 'agency') {
        monthlyData[month].agencies++
      }
    })
    
    // 配列形式に変換
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }))
  })
}

/**
 * マッチング成功率の推移を取得
 */
export async function getMatchingSuccessRate(adminUserId: string) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // ユーザーロールを確認
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (userError) throw userError
    validateRole(user.role, ['admin'])
    
    // 過去6ヶ月のマッチング申請
    const { data: requests, error } = await supabase
      .from('matching_requests')
      .select('created_at, status')
      .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // 月別にグループ化
    const monthlyData: Record<string, { total: number; approved: number; rejected: number }> = {}
    
    requests?.forEach((request) => {
      const month = new Date(request.created_at).toISOString().slice(0, 7) // YYYY-MM
      
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, approved: 0, rejected: 0 }
      }
      
      monthlyData[month].total++
      
      if (request.status === 'approved') {
        monthlyData[month].approved++
      } else if (request.status === 'rejected') {
        monthlyData[month].rejected++
      }
    })
    
    // 配列形式に変換（承認率も計算）
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      total: data.total,
      approved: data.approved,
      rejected: data.rejected,
      approval_rate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0,
    }))
  })
}

/**
 * 人気の営業代行トップ10を取得（マッチング申請数順）
 */
export async function getTopAgencies(adminUserId: string, limit: number = 10) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // ユーザーロールを確認
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (userError) throw userError
    validateRole(user.role, ['admin'])
    
    // 営業代行ごとのマッチング申請数を集計
    const { data: requests, error } = await supabase
      .from('matching_requests')
      .select(`
        agency_id,
        agency_profile:agency_profiles!agency_id(name)
      `)
    
    if (error) throw error
    
    // 集計
    const agencyCounts: Record<string, { name: string; count: number }> = {}
    
    ;(requests as Array<{ agency_id: string; agency_profile?: { name?: string } | null }> | null | undefined)?.forEach((request) => {
      const agencyId = request.agency_id
      const agencyName = request.agency_profile?.name || '不明'
      
      if (!agencyCounts[agencyId]) {
        agencyCounts[agencyId] = { name: agencyName, count: 0 }
      }
      
      agencyCounts[agencyId].count++
    })
    
    // ソートして上位を返す
    return Object.entries(agencyCounts)
      .map(([agencyId, data]) => ({
        agency_id: agencyId,
        name: data.name,
        request_count: data.count,
      }))
      .sort((a, b) => b.request_count - a.request_count)
      .slice(0, limit)
  })
}

/**
 * 最近のアクティビティを取得（全体）
 */
export async function getRecentAdminActivity(adminUserId: string, limit: number = 20) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    const supabase = await createClient()
    
    // ユーザーロールを確認
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUserId)
      .single()
    
    if (userError) throw userError
    validateRole(user.role, ['admin'])
    
    // 最近のマッチング申請
    const { data: requests, error } = await supabase
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(company_name),
        agency_profile:agency_profiles!agency_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return requests || []
  })
}

