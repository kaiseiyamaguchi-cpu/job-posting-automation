/**
 * アプリケーション全体で使用する定数定義
 */

/**
 * 業種の選択肢
 */
export const INDUSTRIES = [
  'IT・通信',
  '製造業',
  '建設・不動産',
  '小売・卸売',
  '飲食・サービス',
  '医療・福祉',
  '教育',
  '金融・保険',
  'コンサルティング',
  'その他',
] as const

/**
 * 対応エリアの選択肢
 */
export const AREAS = [
  '北海道',
  '東北',
  '関東',
  '中部',
  '近畿',
  '中国',
  '四国',
  '九州・沖縄',
  '全国',
  'オンライン対応',
] as const

/**
 * 営業代行の得意分野
 */
export const SPECIALTIES = [
  '新規開拓営業',
  'ルート営業',
  'インサイドセールス',
  'テレアポ',
  '商談代行',
  'クロージング',
  '既存顧客フォロー',
  'BtoB営業',
  'BtoC営業',
  'IT営業',
  '不動産営業',
  '人材営業',
  '広告営業',
  'その他',
] as const

/**
 * マッチング申請ステータス
 */
export const MATCHING_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export const MATCHING_STATUS_LABELS = {
  [MATCHING_STATUSES.PENDING]: '審査中',
  [MATCHING_STATUSES.APPROVED]: '承認済み',
  [MATCHING_STATUSES.REJECTED]: '却下',
} as const

/**
 * ユーザーロール
 */
export const USER_ROLES = {
  COMPANY: 'company',
  AGENCY: 'agency',
  ADMIN: 'admin',
} as const

export const USER_ROLE_LABELS = {
  [USER_ROLES.COMPANY]: '企業',
  [USER_ROLES.AGENCY]: '営業代行',
  [USER_ROLES.ADMIN]: '管理者',
} as const

/**
 * ページネーション設定
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const

/**
 * バリデーション制約
 */
export const VALIDATION_LIMITS = {
  // テキストフィールド
  COMPANY_NAME_MAX: 100,
  AGENCY_NAME_MAX: 100,
  INDUSTRY_MAX: 50,
  AREA_MAX: 50,
  CONTACT_PERSON_MAX: 50,
  
  // テキストエリア
  REQUEST_CONTENT_MAX: 1000,
  BIO_MAX: 1000,
  REQUEST_DETAILS_MAX: 2000,
  MESSAGE_CONTENT_MAX: 5000,
  
  // 配列
  SPECIALTIES_MIN: 1,
  SPECIALTIES_MAX: 10,
  AREAS_MIN: 1,
  AREAS_MAX: 20,
  
  // 数値
  MONTHLY_BUDGET_MIN: 10000,
  MONTHLY_BUDGET_MAX: 10000000,
  
  // パスワード
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 100,
} as const

/**
 * 日時フォーマット
 */
export const DATE_FORMATS = {
  FULL: 'YYYY年M月D日（ddd）',
  SHORT: 'YYYY/MM/DD',
  DATETIME: 'YYYY/MM/DD HH:mm',
  TIME: 'HH:mm',
} as const

/**
 * エラーメッセージ
 */
export const ERROR_MESSAGES = {
  // 認証
  AUTH_REQUIRED: '認証が必要です。ログインしてください。',
  INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません。',
  EMAIL_ALREADY_EXISTS: 'このメールアドレスは既に登録されています。',
  
  // 権限
  PERMISSION_DENIED: 'この操作を実行する権限がありません。',
  ADMIN_ONLY: '管理者のみが実行できます。',
  COMPANY_ONLY: '企業ユーザーのみが実行できます。',
  AGENCY_ONLY: '営業代行ユーザーのみが実行できます。',
  
  // データ
  NOT_FOUND: 'データが見つかりません。',
  ALREADY_EXISTS: 'このデータは既に登録されています。',
  
  // 汎用
  UNKNOWN_ERROR: 'エラーが発生しました。もう一度お試しください。',
  NETWORK_ERROR: 'ネットワークエラーが発生しました。',
} as const

/**
 * 成功メッセージ
 */
export const SUCCESS_MESSAGES = {
  // 認証
  LOGIN_SUCCESS: 'ログインしました。',
  LOGOUT_SUCCESS: 'ログアウトしました。',
  REGISTER_SUCCESS: '会員登録が完了しました。',
  
  // プロフィール
  PROFILE_CREATED: 'プロフィールを作成しました。',
  PROFILE_UPDATED: 'プロフィールを更新しました。',
  
  // マッチング
  REQUEST_SENT: 'マッチング申請を送信しました。',
  REQUEST_APPROVED: 'マッチング申請を承認しました。',
  REQUEST_REJECTED: 'マッチング申請を却下しました。',
  
  // メッセージ
  MESSAGE_SENT: 'メッセージを送信しました。',
  
  // 管理者
  ROLE_UPDATED: 'ユーザーロールを変更しました。',
} as const

/**
 * ルート定義
 */
export const ROUTES = {
  // 公開
  HOME: '/',
  
  // 認証
  LOGIN: '/login',
  REGISTER: '/register',
  
  // ダッシュボード
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  
  // 営業代行
  AGENCIES: '/agencies',
  AGENCY_DETAIL: (id: string) => `/agencies/${id}`,
  
  // マッチング
  MATCHING_REQUESTS: '/matching-requests',
  MATCHING_REQUEST_DETAIL: (id: string) => `/matching-requests/${id}`,
  
  // メッセージ
  MESSAGES: '/messages',
  MESSAGE_THREAD: (id: string) => `/messages/${id}`,
  
  // 管理者
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}`,
  ADMIN_MATCHING: '/admin/matching-requests',
  ADMIN_THREADS: '/admin/threads',
} as const

/**
 * APIエンドポイント（必要に応じて）
 */
export const API_ENDPOINTS = {
  // 認証
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
  
  // プロフィール
  PROFILE: '/api/profile',
  
  // 営業代行
  AGENCIES: '/api/agencies',
  
  // マッチング
  MATCHING_REQUESTS: '/api/matching-requests',
  
  // メッセージ
  MESSAGES: '/api/messages',
  
  // 管理者
  ADMIN_STATS: '/api/admin/stats',
  ADMIN_USERS: '/api/admin/users',
} as const

/**
 * ローカルストレージのキー
 */
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recent_searches',
} as const

/**
 * クッキーの設定
 */
export const COOKIE_OPTIONS = {
  MAX_AGE: 60 * 60 * 24 * 7, // 7日間
  PATH: '/',
  SECURE: process.env.NODE_ENV === 'production',
  SAME_SITE: 'lax' as const,
} as const

/**
 * 環境変数のキー
 */
export const ENV_KEYS = {
  SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  NODE_ENV: 'NODE_ENV',
} as const

