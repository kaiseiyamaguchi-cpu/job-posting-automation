'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { 
  MatchingRequest, 
  MatchingRequestForm, 
  MatchingRequestStatus,
  UserRole 
} from '@/types'
import { 
  handleActionError, 
  validateAuth, 
  validateExists,
  validateRole 
} from '@/lib/utils/error'

/**
 * マッチング申請を作成（企業が営業代行に申請）
 */
export async function createMatchingRequest(
  companyId: string,
  agencyId: string,
  formData: MatchingRequestForm
) {
  return handleActionError(async () => {
    validateAuth(companyId)
    
    const supabase = await createClient()
    
    // 重複申請のチェック
    const { data: existingRequest } = await supabase
      .from('matching_requests')
      .select('id')
      .eq('company_id', companyId)
      .eq('agency_id', agencyId)
      .in('status', ['pending', 'approved'])
      .single()
    
    if (existingRequest) {
      throw new Error('既に申請が存在するか、承認済みです')
    }
    
    const { data, error } = await supabase
      .from('matching_requests')
      .insert({
        company_id: companyId,
        agency_id: agencyId,
        monthly_budget: formData.monthly_budget,
        request_details: formData.request_details,
        proposal_deadline: formData.proposal_deadline,
        status: 'pending',
      })
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath('/dashboard')
    revalidatePath('/matching-requests')
    
    return data as MatchingRequest
  })
}

/**
 * マッチング申請一覧を取得
 * @param userId - ユーザーID
 * @param userRole - ユーザーロール（company or agency）
 */
export async function getMatchingRequests(userId: string, userRole: UserRole) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    let query = supabase
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(*),
        agency_profile:agency_profiles!agency_id(*)
      `)
      .order('created_at', { ascending: false })
    
    // ロールに応じてフィルタリング
    if (userRole === 'company') {
      query = query.eq('company_id', userId)
    } else if (userRole === 'agency') {
      query = query.eq('agency_id', userId)
    } else {
      throw new Error('無効なユーザーロールです')
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return (data as MatchingRequest[]) || []
  })
}

/**
 * マッチング申請の詳細を取得
 */
export async function getMatchingRequestById(id: string) {
  return handleActionError(async () => {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(*),
        agency_profile:agency_profiles!agency_id(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    validateExists(data, 'マッチング申請')
    
    return data as MatchingRequest
  })
}

/**
 * マッチング申請のステータスを更新
 * @param id - 申請ID
 * @param status - 新しいステータス
 * @param agencyId - 営業代行ID（権限チェック用）
 */
export async function updateMatchingRequestStatus(
  id: string,
  status: MatchingRequestStatus,
  agencyId: string
) {
  return handleActionError(async () => {
    validateAuth(agencyId)
    
    const supabase = await createClient()
    
    // 申請を取得して権限チェック
    const { data: request, error: fetchError } = await supabase
      .from('matching_requests')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    validateExists(request, 'マッチング申請')
    
    // 営業代行のみが承認・却下できる
    if (request.agency_id !== agencyId) {
      throw new Error('この申請を操作する権限がありません')
    }
    
    // pendingからのみ変更可能
    if (request.status !== 'pending') {
      throw new Error('この申請は既に処理されています')
    }
    
    // ステータス更新
    const { data, error } = await supabase
      .from('matching_requests')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    // 承認された場合はメッセージスレッドを作成
    if (status === 'approved') {
      await createMessageThreadOnApproval(id, request.company_id, request.agency_id)
    }
    
    revalidatePath('/dashboard')
    revalidatePath('/matching-requests')
    revalidatePath(`/matching-requests/${id}`)
    
    return data as MatchingRequest
  })
}

/**
 * 承認時にメッセージスレッドを自動作成
 */
export async function createMessageThreadOnApproval(
  matchingRequestId: string,
  companyId: string,
  agencyId: string
) {
  return handleActionError(async () => {
    const supabase = await createClient()
    
    // 既にスレッドが存在しないかチェック
    const { data: existingThread } = await supabase
      .from('message_threads')
      .select('id')
      .eq('matching_request_id', matchingRequestId)
      .single()
    
    if (existingThread) {
      return existingThread // 既存のスレッドを返す
    }
    
    // 新しいスレッドを作成
    const { data, error } = await supabase
      .from('message_threads')
      .insert({
        matching_request_id: matchingRequestId,
        company_id: companyId,
        agency_id: agencyId,
      })
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath('/messages')
    
    return data
  })
}

/**
 * 企業IDからマッチング申請を取得
 */
export async function getMatchingRequestsByCompanyId(companyId: string) {
  return handleActionError(async () => {
    validateAuth(companyId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('matching_requests')
      .select(`
        *,
        agency_profile:agency_profiles!agency_id(*)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data as MatchingRequest[]) || []
  })
}

/**
 * 営業代行IDからマッチング申請を取得
 */
export async function getMatchingRequestsByAgencyId(agencyId: string) {
  return handleActionError(async () => {
    validateAuth(agencyId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('matching_requests')
      .select(`
        *,
        company_profile:company_profiles!company_id(*)
      `)
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data as MatchingRequest[]) || []
  })
}

/**
 * ペンディング中の申請数を取得
 */
export async function getPendingRequestsCount(userId: string, userRole: UserRole) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    let query = supabase
      .from('matching_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    if (userRole === 'company') {
      query = query.eq('company_id', userId)
    } else if (userRole === 'agency') {
      query = query.eq('agency_id', userId)
    }
    
    const { count, error } = await query
    
    if (error) throw error
    
    return count || 0
  })
}

