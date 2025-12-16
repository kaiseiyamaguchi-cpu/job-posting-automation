// ユーザー種別
export type UserRole = 'company' | 'agency' | 'admin'

// マッチング申請ステータス
export type MatchingRequestStatus = 'pending' | 'approved' | 'rejected'

// 案件募集ステータス
export type JobPostStatus = 'draft' | 'published' | 'closed'

// 応募ステータス
export type ApplicationStatus = 'applied' | 'accepted' | 'rejected'

// 取引（アポ）ステータス
export type AppointmentStatus =
  | 'draft'
  | 'scheduled'
  | 'paid'
  | 'done'
  | 'accepted'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type PayoutStatus = 'none' | 'pending' | 'paid' | 'reversed'

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
  company_profile?: CompanyProfile
  agency_profile?: AgencyProfile
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

export interface JobPost {
  id: string
  company_id: string // company_profiles.id
  title: string
  description: string
  industry: string | null
  area: string | null
  appointment_fee: number
  status: JobPostStatus
  created_at: string
  updated_at: string
  company_profile?: CompanyProfile
}

export interface Application {
  id: string
  job_post_id: string
  agency_id: string // agency_profiles.id
  pitch: string
  proposed_fee: number | null
  status: ApplicationStatus
  created_at: string
  updated_at: string
  job_post?: JobPost
  agency_profile?: AgencyProfile
}

export interface Appointment {
  id: string
  job_post_id: string | null
  application_id: string | null
  thread_id: string | null
  company_id: string // company_profiles.id
  agency_id: string // agency_profiles.id
  scheduled_at: string | null
  meeting_url: string | null
  appointment_fee: number
  platform_fee_rate: number
  platform_fee_amount: number
  agency_amount: number
  status: AppointmentStatus
  payment_status: PaymentStatus
  payout_status: PayoutStatus
  paid_at: string | null
  done_at: string | null
  accepted_at: string | null
  created_at: string
  updated_at: string
  job_post?: JobPost
  application?: Application
  company_profile?: CompanyProfile
  agency_profile?: AgencyProfile
}

export interface ScheduleRequest {
  id: string
  appointment_id: string
  proposed_times: string[]
  confirmed_time: string | null
  meeting_url: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  appointment_id: string
  amount: number
  status: PaymentStatus
  mock_payment_id: string | null
  created_at: string
  updated_at: string
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

