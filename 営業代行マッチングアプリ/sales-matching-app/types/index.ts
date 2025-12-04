// ユーザー種別
export type UserRole = 'company' | 'agency' | 'admin'

// マッチング申請ステータス
export type MatchingRequestStatus = 'pending' | 'approved' | 'rejected'

// データベース型定義
export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  industry: string
  area: string
  request_content: string | null
  contact_person: string
  phone_number: string
  created_at: string
  updated_at: string
}

export interface AgencyProfile {
  id: string
  user_id: string
  name: string
  specialties: string[] // 得意分野（複数）
  areas: string[] // 対応エリア（複数）
  bio: string | null // 自己PR
  phone_number: string
  created_at: string
  updated_at: string
}

export interface MatchingRequest {
  id: string
  company_id: string
  agency_id: string
  monthly_budget: number
  request_details: string
  proposal_deadline: string
  status: MatchingRequestStatus
  created_at: string
  updated_at: string
  // リレーション
  company_profile?: CompanyProfile
  agency_profile?: AgencyProfile
}

export interface MessageThread {
  id: string
  matching_request_id: string
  company_id: string
  agency_id: string
  last_message_at: string | null
  created_at: string
  updated_at: string
  // リレーション
  matching_request?: MatchingRequest
  messages?: Message[]
  unread_count?: number
}

export interface Message {
  id: string
  thread_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  // リレーション
  sender?: User
}

// フォーム用の型
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}

export interface CompanyProfileForm {
  company_name: string
  industry: string
  area: string
  request_content?: string
  contact_person: string
  phone_number: string
}

export interface AgencyProfileForm {
  name: string
  specialties: string[]
  areas: string[]
  bio?: string
  phone_number: string
}

export interface MatchingRequestForm {
  monthly_budget: number
  request_details: string
  proposal_deadline: string
}

export interface MessageForm {
  content: string
}

// ダッシュボード用の統計データ
export interface CompanyDashboardStats {
  pending_requests: number
  approved_requests: number
  unread_messages: number
}

export interface AgencyDashboardStats {
  new_requests: number
  active_companies: number
  unread_messages: number
}

export interface AdminDashboardStats {
  total_users: number
  total_companies: number
  total_agencies: number
  total_requests: number
  approval_rate: number
  active_threads: number
}

