import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User, UserRole } from '@/types'

/**
 * サーバーサイドで現在のユーザー情報を取得
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // データベースからユーザー情報を取得
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !userData) {
    return null
  }

  return userData as User
}

/**
 * 認証が必要なページで使用
 * 未認証の場合はログインページにリダイレクト
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

/**
 * 特定のロールが必要なページで使用
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard')
  }
  
  return user
}

/**
 * 管理者権限が必要なページで使用
 */
export async function requireAdmin(): Promise<User> {
  return requireRole(['admin'])
}

/**
 * 企業ユーザー専用ページで使用
 */
export async function requireCompany(): Promise<User> {
  return requireRole(['company'])
}

/**
 * 営業代行ユーザー専用ページで使用
 */
export async function requireAgency(): Promise<User> {
  return requireRole(['agency'])
}

