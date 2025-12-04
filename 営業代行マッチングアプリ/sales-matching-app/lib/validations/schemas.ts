import { z } from 'zod'

/**
 * 認証関連のバリデーションスキーマ
 */

// ログインフォーム
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(6, 'パスワードは6文字以上で入力してください'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// 新規登録フォーム
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'メールアドレスを入力してください')
      .email('有効なメールアドレスを入力してください'),
    password: z
      .string()
      .min(1, 'パスワードを入力してください')
      .min(6, 'パスワードは6文字以上で入力してください')
      .max(100, 'パスワードは100文字以内で入力してください'),
    confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
    role: z.enum(['company', 'agency'], {
      message: 'ユーザー種別を選択してください',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * プロフィール関連のバリデーションスキーマ
 */

// 企業プロフィールフォーム
export const companyProfileSchema = z.object({
  company_name: z
    .string()
    .min(1, '企業名を入力してください')
    .max(100, '企業名は100文字以内で入力してください'),
  industry: z
    .string()
    .min(1, '業種を選択してください')
    .max(50, '業種は50文字以内で入力してください'),
  area: z
    .string()
    .min(1, '地域を選択してください')
    .max(50, '地域は50文字以内で入力してください'),
  request_content: z
    .string()
    .max(1000, '依頼内容は1000文字以内で入力してください')
    .optional(),
  contact_person: z
    .string()
    .min(1, '担当者名を入力してください')
    .max(50, '担当者名は50文字以内で入力してください'),
  phone_number: z
    .string()
    .min(1, '電話番号を入力してください')
    .regex(
      /^0\d{9,10}$/,
      '有効な電話番号を入力してください（ハイフンなし、例: 09012345678）'
    ),
})

export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>

// 営業代行プロフィールフォーム
export const agencyProfileSchema = z.object({
  name: z
    .string()
    .min(1, '営業代行名を入力してください')
    .max(100, '営業代行名は100文字以内で入力してください'),
  specialties: z
    .array(z.string())
    .min(1, '得意分野を1つ以上選択してください')
    .max(10, '得意分野は10個まで選択できます'),
  areas: z
    .array(z.string())
    .min(1, '対応エリアを1つ以上選択してください')
    .max(20, '対応エリアは20個まで選択できます'),
  bio: z
    .string()
    .max(1000, '自己PRは1000文字以内で入力してください')
    .optional(),
  phone_number: z
    .string()
    .min(1, '電話番号を入力してください')
    .regex(
      /^0\d{9,10}$/,
      '有効な電話番号を入力してください（ハイフンなし、例: 09012345678）'
    ),
})

export type AgencyProfileFormData = z.infer<typeof agencyProfileSchema>

/**
 * マッチング申請関連のバリデーションスキーマ
 */

// マッチング申請フォーム
export const matchingRequestSchema = z.object({
  monthly_budget: z
    .number({
      message: '月額予算を入力してください',
    })
    .positive('月額予算は正の数で入力してください')
    .min(10000, '月額予算は10,000円以上で入力してください')
    .max(10000000, '月額予算は10,000,000円以下で入力してください'),
  request_details: z
    .string()
    .min(1, '依頼内容を入力してください')
    .min(10, '依頼内容は10文字以上で入力してください')
    .max(2000, '依頼内容は2000文字以内で入力してください'),
  proposal_deadline: z
    .string()
    .min(1, '提案期限を入力してください')
    .refine((date) => {
      const selected = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selected >= today
    }, '提案期限は今日以降の日付を選択してください'),
})

export type MatchingRequestFormData = z.infer<typeof matchingRequestSchema>

/**
 * メッセージ関連のバリデーションスキーマ
 */

// メッセージ送信フォーム
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'メッセージを入力してください')
    .max(5000, 'メッセージは5000文字以内で入力してください'),
})

export type MessageFormData = z.infer<typeof messageSchema>

/**
 * 検索・フィルター関連のバリデーションスキーマ
 */

// 営業代行検索フィルター
export const agencySearchSchema = z.object({
  specialty: z.string().optional(),
  area: z.string().optional(),
  keyword: z.string().max(100, 'キーワードは100文字以内で入力してください').optional(),
})

export type AgencySearchFormData = z.infer<typeof agencySearchSchema>

/**
 * 管理者関連のバリデーションスキーマ
 */

// ユーザーロール変更
export const updateUserRoleSchema = z.object({
  role: z.enum(['company', 'agency', 'admin'], {
    message: 'ロールを選択してください',
  }),
})

export type UpdateUserRoleFormData = z.infer<typeof updateUserRoleSchema>

/**
 * 共通のバリデーションヘルパー
 */

// メールアドレスのバリデーション
export const emailValidation = z
  .string()
  .min(1, 'メールアドレスを入力してください')
  .email('有効なメールアドレスを入力してください')

// 電話番号のバリデーション（日本）
export const phoneValidation = z
  .string()
  .min(1, '電話番号を入力してください')
  .regex(
    /^0\d{9,10}$/,
    '有効な電話番号を入力してください（ハイフンなし、例: 09012345678）'
  )

// 日付のバリデーション（未来の日付のみ）
export const futureDateValidation = z.string().refine((date) => {
  const selected = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selected >= today
}, '今日以降の日付を選択してください')

// 金額のバリデーション
export const currencyValidation = (min: number = 0, max: number = 100000000) =>
  z
    .number({
      message: '金額を入力してください',
    })
    .positive('金額は正の数で入力してください')
    .min(min, `金額は${min.toLocaleString()}円以上で入力してください`)
    .max(max, `金額は${max.toLocaleString()}円以下で入力してください`)

