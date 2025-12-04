'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { 
  CompanyProfile, 
  AgencyProfile, 
  CompanyProfileForm, 
  AgencyProfileForm 
} from '@/types'
import { 
  handleActionError, 
  validateAuth, 
  validateExists 
} from '@/lib/utils/error'

/**
 * 企業プロフィールを取得
 */
export async function getCompanyProfile(userId: string) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    
    return data as CompanyProfile
  })
}

/**
 * 企業プロフィールを作成
 */
export async function createCompanyProfile(userId: string, formData: CompanyProfileForm) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('company_profiles')
      .insert({
        user_id: userId,
        company_name: formData.company_name,
        industry: formData.industry,
        area: formData.area,
        request_content: formData.request_content || null,
        contact_person: formData.contact_person,
        phone_number: formData.phone_number,
      })
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath('/dashboard')
    revalidatePath('/profile')
    
    return data as CompanyProfile
  })
}

/**
 * 企業プロフィールを更新
 */
export async function updateCompanyProfile(userId: string, formData: CompanyProfileForm) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('company_profiles')
      .update({
        company_name: formData.company_name,
        industry: formData.industry,
        area: formData.area,
        request_content: formData.request_content || null,
        contact_person: formData.contact_person,
        phone_number: formData.phone_number,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath('/dashboard')
    revalidatePath('/profile')
    
    return data as CompanyProfile
  })
}

/**
 * 営業代行プロフィールを取得
 */
export async function getAgencyProfile(userId: string) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('agency_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    
    return data as AgencyProfile
  })
}

/**
 * 営業代行プロフィールを作成
 */
export async function createAgencyProfile(userId: string, formData: AgencyProfileForm) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('agency_profiles')
      .insert({
        user_id: userId,
        name: formData.name,
        specialties: formData.specialties,
        areas: formData.areas,
        bio: formData.bio || null,
        phone_number: formData.phone_number,
      })
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath('/dashboard')
    revalidatePath('/profile')
    
    return data as AgencyProfile
  })
}

/**
 * 営業代行プロフィールを更新
 */
export async function updateAgencyProfile(userId: string, formData: AgencyProfileForm) {
  return handleActionError(async () => {
    validateAuth(userId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('agency_profiles')
      .update({
        name: formData.name,
        specialties: formData.specialties,
        areas: formData.areas,
        bio: formData.bio || null,
        phone_number: formData.phone_number,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath('/dashboard')
    revalidatePath('/profile')
    
    return data as AgencyProfile
  })
}

/**
 * ユーザーIDから営業代行プロフィールを取得（公開情報）
 */
export async function getPublicAgencyProfile(userId: string) {
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

