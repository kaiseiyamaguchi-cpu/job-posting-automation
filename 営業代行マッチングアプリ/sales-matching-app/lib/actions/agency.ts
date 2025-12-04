'use server'

import { createClient } from '@/lib/supabase/server'
import { AgencyProfile } from '@/types'
import { handleActionError, validateExists } from '@/lib/utils/error'

interface AgencyFilters {
  specialty?: string
  area?: string
  keyword?: string
}

/**
 * 営業代行を検索・フィルタリング
 */
export async function getAgencies(filters?: AgencyFilters) {
  return handleActionError(async () => {
    const supabase = await createClient()
    
    let query = supabase
      .from('agency_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    // 得意分野でフィルター（配列に含まれるかチェック）
    if (filters?.specialty) {
      query = query.contains('specialties', [filters.specialty])
    }
    
    // エリアでフィルター（配列に含まれるかチェック）
    if (filters?.area) {
      query = query.contains('areas', [filters.area])
    }
    
    // キーワード検索（名前・自己PR）
    if (filters?.keyword) {
      query = query.or(
        `name.ilike.%${filters.keyword}%,bio.ilike.%${filters.keyword}%`
      )
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return (data as AgencyProfile[]) || []
  })
}

/**
 * 営業代行の詳細情報を取得
 */
export async function getAgencyById(id: string) {
  return handleActionError(async () => {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('agency_profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    validateExists(data, '営業代行')
    
    return data as AgencyProfile
  })
}

/**
 * 営業代行をキーワードで検索
 */
export async function searchAgencies(query: string) {
  return handleActionError(async () => {
    if (!query || query.trim() === '') {
      return []
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('agency_profiles')
      .select('*')
      .or(`name.ilike.%${query}%,bio.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) throw error
    
    return (data as AgencyProfile[]) || []
  })
}

/**
 * user_idから営業代行プロフィールを取得
 */
export async function getAgencyByUserId(userId: string) {
  return handleActionError(async () => {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('agency_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    validateExists(data, '営業代行プロフィール')
    
    return data as AgencyProfile
  })
}

/**
 * すべての営業代行を取得（管理者用）
 */
export async function getAllAgencies() {
  return handleActionError(async () => {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('agency_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data as AgencyProfile[]) || []
  })
}

/**
 * おすすめの営業代行を取得（トップページ用）
 */
export async function getFeaturedAgencies(limit: number = 6) {
  return handleActionError(async () => {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('agency_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return (data as AgencyProfile[]) || []
  })
}

