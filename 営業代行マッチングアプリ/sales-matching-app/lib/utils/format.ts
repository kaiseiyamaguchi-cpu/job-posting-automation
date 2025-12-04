/**
 * 日付フォーマット関連のユーティリティ関数
 */

/**
 * 日付を日本語形式でフォーマット
 * @param date - Date オブジェクトまたは ISO 文字列
 * @param format - フォーマット形式
 * @returns フォーマットされた日付文字列
 */
export function formatDate(
  date: Date | string,
  format: 'full' | 'short' | 'relative' = 'full'
): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'relative') {
    return formatRelativeTime(d)
  }

  if (format === 'short') {
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // full
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

/**
 * 日時を日本語形式でフォーマット
 * @param date - Date オブジェクトまたは ISO 文字列
 * @returns フォーマットされた日時文字列
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 相対時間でフォーマット（〜前、〜後）
 * @param date - Date オブジェクトまたは ISO 文字列
 * @returns 相対時間の文字列
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return 'たった今'
  } else if (diffMin < 60) {
    return `${diffMin}分前`
  } else if (diffHour < 24) {
    return `${diffHour}時間前`
  } else if (diffDay < 7) {
    return `${diffDay}日前`
  } else if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7)
    return `${weeks}週間前`
  } else if (diffDay < 365) {
    const months = Math.floor(diffDay / 30)
    return `${months}ヶ月前`
  } else {
    const years = Math.floor(diffDay / 365)
    return `${years}年前`
  }
}

/**
 * 期限までの残り時間を表示
 * @param deadline - 期限の Date オブジェクトまたは ISO 文字列
 * @returns 残り時間の文字列
 */
export function formatDeadline(deadline: Date | string): string {
  const d = typeof deadline === 'string' ? new Date(deadline) : deadline
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDay = Math.floor(diffHour / 24)

  if (diffMs < 0) {
    return '期限切れ'
  } else if (diffHour < 24) {
    return `残り${diffHour}時間`
  } else if (diffDay < 7) {
    return `残り${diffDay}日`
  } else {
    return formatDate(d, 'short')
  }
}

/**
 * 通貨フォーマット関連のユーティリティ関数
 */

/**
 * 金額を日本円形式でフォーマット
 * @param amount - 金額（数値）
 * @param showSymbol - 円記号を表示するか
 * @returns フォーマットされた金額文字列
 */
export function formatCurrency(amount: number, showSymbol: boolean = true): string {
  const formatted = amount.toLocaleString('ja-JP')
  return showSymbol ? `¥${formatted}` : formatted
}

/**
 * 金額を万円単位でフォーマット
 * @param amount - 金額（数値）
 * @returns フォーマットされた金額文字列
 */
export function formatCurrencyInManYen(amount: number): string {
  if (amount >= 10000) {
    const manYen = Math.floor(amount / 10000)
    const remainder = amount % 10000
    if (remainder === 0) {
      return `${manYen}万円`
    } else {
      return `${manYen}.${Math.floor(remainder / 1000)}万円`
    }
  }
  return formatCurrency(amount)
}

/**
 * テキストフォーマット関連のユーティリティ関数
 */

/**
 * テキストを指定文字数で切り詰める
 * @param text - 元のテキスト
 * @param maxLength - 最大文字数
 * @param suffix - 切り詰めた場合の接尾辞
 * @returns 切り詰められたテキスト
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 改行を<br>タグに変換
 * @param text - 元のテキスト
 * @returns HTML文字列
 */
export function nl2br(text: string): string {
  return text.replace(/\n/g, '<br>')
}

/**
 * メールアドレスの一部をマスク
 * @param email - メールアドレス
 * @returns マスクされたメールアドレス
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!domain) return email

  const visibleChars = Math.min(3, Math.floor(localPart.length / 2))
  const maskedLocal = localPart.slice(0, visibleChars) + '***'

  return `${maskedLocal}@${domain}`
}

/**
 * 電話番号をフォーマット（ハイフン付き）
 * @param phone - 電話番号（ハイフンなし）
 * @returns フォーマットされた電話番号
 */
export function formatPhoneNumber(phone: string): string {
  // 数字のみを抽出
  const numbers = phone.replace(/\D/g, '')

  // 携帯電話（11桁）
  if (numbers.length === 11 && numbers.startsWith('0')) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
  }

  // 固定電話（10桁）
  if (numbers.length === 10 && numbers.startsWith('0')) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`
  }

  // それ以外はそのまま返す
  return phone
}

/**
 * ステータス関連のユーティリティ関数
 */

/**
 * マッチング申請ステータスを日本語に変換
 * @param status - ステータス
 * @returns 日本語のステータス
 */
export function formatMatchingStatus(status: 'pending' | 'approved' | 'rejected'): string {
  const statusMap = {
    pending: '審査中',
    approved: '承認済み',
    rejected: '却下',
  }
  return statusMap[status] || status
}

/**
 * ステータスの色を取得（Tailwind CSS用）
 * @param status - ステータス
 * @returns Tailwind CSSのカラークラス
 */
export function getStatusColor(status: 'pending' | 'approved' | 'rejected'): string {
  const colorMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

/**
 * ユーザーロールを日本語に変換
 * @param role - ロール
 * @returns 日本語のロール名
 */
export function formatUserRole(role: 'company' | 'agency' | 'admin'): string {
  const roleMap = {
    company: '企業',
    agency: '営業代行',
    admin: '管理者',
  }
  return roleMap[role] || role
}

/**
 * その他のユーティリティ関数
 */

/**
 * 配列をカンマ区切りの文字列に変換
 * @param items - 配列
 * @param maxItems - 表示する最大項目数
 * @returns カンマ区切りの文字列
 */
export function formatList(items: string[], maxItems?: number): string {
  if (!items || items.length === 0) {
    return '未設定'
  }

  const displayItems = maxItems ? items.slice(0, maxItems) : items
  const result = displayItems.join('、')

  if (maxItems && items.length > maxItems) {
    return `${result} 他${items.length - maxItems}件`
  }

  return result
}

/**
 * パーセンテージをフォーマット
 * @param value - 値（0-100）
 * @param decimals - 小数点以下の桁数
 * @returns フォーマットされたパーセンテージ
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * ファイルサイズをフォーマット
 * @param bytes - バイト数
 * @returns フォーマットされたファイルサイズ
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

