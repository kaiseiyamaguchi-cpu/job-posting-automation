'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { User, UserRole } from '@/types'
import { handleActionError, validateAuth, validateRole, validateExists } from '@/lib/utils/error'

/**
 * すべてのユーザーを取得（管理者用）
 * @param adminUserId - 管理者のユーザーID
 * @param filters - フィルター条件
 */
export async function getAllUsers(
  adminUserId: string,
  filters?: { role?: UserRole; keyword?: string }
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
    
    // ユーザー一覧を取得
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    // ロールでフィルタリング
    if (filters?.role) {
      query = query.eq('role', filters.role)
    }
    
    // キーワード検索（メールアドレス）
    if (filters?.keyword) {
      query = query.ilike('email', `%${filters.keyword}%`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return (data as User[]) || []
  })
}

/**
 * ユーザーの詳細情報を取得（プロフィール含む）
 * @param adminUserId - 管理者のユーザーID
 * @param userId - 対象ユーザーのID
 */
export async function getUserDetails(adminUserId: string, userId: string) {
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
    
    // ユーザー基本情報を取得
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (userError) throw userError
    validateExists(user, 'ユーザー')
    
    // ロールに応じてプロフィールを取得
    let profile = null
    let stats = null
    
    if (user.role === 'company') {
      // 企業プロフィールを取得
      const { data: companyProfile } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      profile = companyProfile
      
      // 企業の統計
      const { count: requestCount } = await supabase
        .from('matching_requests')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', userId)
      
      const { count: approvedCount } = await supabase
        .from('matching_requests')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', userId)
        .eq('status', 'approved')
      
      stats = {
        total_requests: requestCount || 0,
        approved_requests: approvedCount || 0,
      }
    } else if (user.role === 'agency') {
      // 営業代行プロフィールを取得
      const { data: agencyProfile } = await supabase
        .from('agency_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      profile = agencyProfile
      
      // 営業代行の統計
      const { count: requestCount } = await supabase
        .from('matching_requests')
        .select('id', { count: 'exact', head: true })
        .eq('agency_id', userId)
      
      const { count: approvedCount } = await supabase
        .from('matching_requests')
        .select('id', { count: 'exact', head: true })
        .eq('agency_id', userId)
        .eq('status', 'approved')
      
      stats = {
        total_requests: requestCount || 0,
        approved_requests: approvedCount || 0,
      }
    }
    
    return {
      user,
      profile,
      stats,
    }
  })
}

/**
 * ユーザーのロールを変更
 * @param adminUserId - 管理者のユーザーID
 * @param userId - 対象ユーザーのID
 * @param newRole - 新しいロール
 */
export async function updateUserRole(
  adminUserId: string,
  userId: string,
  newRole: UserRole
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
    
    // 自分自身のロールは変更できない
    if (adminUserId === userId) {
      throw new Error('自分自身のロールは変更できません')
    }
    
    // ロールを更新
    const { data, error } = await supabase
      .from('users')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${userId}`)
    
    return data as User
  })
}

/**
 * ロール別のユーザー数を取得
 */
export async function getUserCountsByRole(adminUserId: string) {
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
    
    // 各ロールのユーザー数を取得
    const { count: companyCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'company')
    
    const { count: agencyCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'agency')
    
    const { count: adminCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')
    
    return {
      company: companyCount || 0,
      agency: agencyCount || 0,
      admin: adminCount || 0,
    }
  })
}

/**
 * 最近登録されたユーザーを取得
 */
export async function getRecentUsers(adminUserId: string, limit: number = 10) {
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
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return (data as User[]) || []
  })
}

/**
 * ユーザーを検索（メールアドレス）
 */
export async function searchUsers(adminUserId: string, query: string) {
  return handleActionError(async () => {
    validateAuth(adminUserId)
    
    if (!query || query.trim() === '') {
      return []
    }
    
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
      .from('users')
      .select('*')
      .ilike('email', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) throw error
    
    return (data as User[]) || []
  })
}

/**
 * ユーザーのアクティビティサマリーを取得
 */
export async function getUserActivitySummary(adminUserId: string, userId: string) {
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
    
    // ユーザーの基本情報を取得
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (userError) throw userError
    
    // マッチング申請数
    const column = user.role === 'company' ? 'company_id' : 'agency_id'
    const { count: matchingCount } = await supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq(column, userId)
    
    // メッセージ送信数
    const { count: messageCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', userId)
    
    // アクティブなスレッド数
    const { count: threadCount } = await supabase
      .from('message_threads')
      .select('id', { count: 'exact', head: true })
      .or(`company_id.eq.${userId},agency_id.eq.${userId}`)
    
    return {
      matching_requests: matchingCount || 0,
      messages_sent: messageCount || 0,
      active_threads: threadCount || 0,
    }
  })
}

