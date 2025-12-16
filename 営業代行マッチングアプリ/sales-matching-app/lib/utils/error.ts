import { UserRole } from '@/types'

/**
 * Supabaseエラーを統一的に処理する
 */
type SupabaseLikeError = { code?: string; message?: string };

function isSupabaseLikeError(error: unknown): error is SupabaseLikeError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'message' in error)
  )
}

export function handleSupabaseError(error: unknown): { error: string } {
  if (!isSupabaseLikeError(error)) {
    console.error('Supabase Error:', error)
    return { error: 'エラーが発生しました。もう一度お試しください。' }
  }

  // PostgreSQLエラーコードの処理
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return { error: 'このデータは既に登録されています' }
      case '23503': // foreign_key_violation
        return { error: '関連するデータが見つかりません' }
      case '23502': // not_null_violation
        return { error: '必須項目が入力されていません' }
      case 'PGRST116': // no rows returned
        return { error: 'データが見つかりません' }
      default:
        break
    }
  }

  // Supabase Auth エラー
  if (error.message) {
    const message = error.message.toLowerCase()
    
    if (message.includes('invalid login credentials')) {
      return { error: 'メールアドレスまたはパスワードが正しくありません' }
    }
    if (message.includes('user already registered')) {
      return { error: 'このメールアドレスは既に登録されています' }
    }
    if (message.includes('email not confirmed')) {
      return { error: 'メールアドレスの確認が完了していません' }
    }
    if (message.includes('not found')) {
      return { error: 'データが見つかりません' }
    }
  }

  // デフォルトエラーメッセージ
  console.error('Supabase Error:', error)
  return { error: 'エラーが発生しました。もう一度お試しください。' }
}

/**
 * 認証状態を検証する
 * @throws Error 未認証の場合
 */
export function validateAuth(userId: string | null | undefined): asserts userId is string {
  if (!userId) {
    throw new Error('認証が必要です。ログインしてください。')
  }
}

/**
 * ユーザーロールを検証する
 * @throws Error 権限がない場合
 */
export function validateRole(userRole: UserRole | null | undefined, allowedRoles: UserRole[]): void {
  if (!userRole) {
    throw new Error('ユーザーロールが設定されていません')
  }
  
  if (!allowedRoles.includes(userRole)) {
    throw new Error('この操作を実行する権限がありません')
  }
}

/**
 * Server Actionsの統一的なエラーハンドリング
 */
export async function handleActionError<T>(
  action: () => Promise<T>
): Promise<T | { error: string }> {
  try {
    return await action()
  } catch (error: unknown) {
    console.error('Action Error:', error)
    
    // カスタムエラーメッセージ
    if (error instanceof Error) {
      return { error: error.message }
    }
    
    // Supabaseエラー
    if (isSupabaseLikeError(error)) {
      return handleSupabaseError(error)
    }
    
    // デフォルト
    return { error: 'エラーが発生しました。もう一度お試しください。' }
  }
}

/**
 * データの存在を検証する
 * @throws Error データが存在しない場合
 */
export function validateExists<T>(data: T | null | undefined, resourceName: string): asserts data is T {
  if (!data) {
    throw new Error(`${resourceName}が見つかりません`)
  }
}

/**
 * 配列が空でないことを検証する
 */
export function validateNotEmpty<T>(array: T[], resourceName: string): void {
  if (array.length === 0) {
    throw new Error(`${resourceName}が見つかりません`)
  }
}

