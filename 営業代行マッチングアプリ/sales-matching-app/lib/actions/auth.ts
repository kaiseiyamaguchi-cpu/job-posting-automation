'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { LoginForm, RegisterForm } from '@/types'

/**
 * ログイン処理
 */
export async function login(formData: LoginForm) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * 新規登録処理
 */
export async function register(formData: RegisterForm) {
  const supabase = await createClient()

  // パスワード確認
  if (formData.password !== formData.confirmPassword) {
    return { error: 'パスワードが一致しません' }
  }

  // Supabase Authでユーザー作成
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'ユーザー登録に失敗しました' }
  }

  // usersテーブルにロール情報を保存
  const { error: insertError } = await supabase.from('users').insert({
    id: data.user.id,
    email: data.user.email,
    role: formData.role,
  })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/', 'layout')
  redirect('/profile?setup=true')
}

/**
 * ログアウト処理
 */
export async function logout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

