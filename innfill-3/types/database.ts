export type UserRole = 'freelancer' | 'client' | 'admin'

export type PlanTier = 'basic' | 'standard' | 'premium'

export type OrderStatus =
  | 'pending_acceptance'
  | 'accepted'
  | 'in_progress'
  | 'delivered'
  | 'revision_requested'
  | 'completed'
  | 'cancelled'
  | 'declined'

export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed'

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected'

export type EventType = 'announcement' | 'update' | 'success_story' | 'maintenance' | 'tip'

export type NotificationType =
  | 'order_created'
  | 'order_accepted'
  | 'order_declined'
  | 'new_message'
  | 'delivery_submitted'
  | 'order_completed'
  | 'payment_received'

export interface Profile {
  id: string
  email: string
  role: UserRole
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  company_name: string | null
  skills: string[] | null
  payment_account_type: string | null
  payment_account_details: Record<string, any> | null
  gst_number: string | null
  total_earnings: number
  total_orders: number
  rating: number
  created_at: string
  updated_at: string
}

export interface ServicePlan {
  id: string
  freelancer_id: string
  title: string
  description: string
  category: string
  tags: string[] | null
  images: string[] | null
  is_active: boolean
  basic_price: number | null
  basic_delivery_days: number | null
  basic_revisions: number | null
  basic_features: string[] | null
  standard_price: number | null
  standard_delivery_days: number | null
  standard_revisions: number | null
  standard_features: string[] | null
  premium_price: number | null
  premium_delivery_days: number | null
  premium_revisions: number | null
  premium_features: string[] | null
  total_orders: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  client_id: string
  freelancer_id: string
  service_plan_id: string
  plan_tier: PlanTier
  requirements: string | null
  requirement_files: string[] | null
  price: number
  delivery_days: number
  revisions_allowed: number
  revisions_used: number
  status: OrderStatus
  delivery_message: string | null
  delivery_files: string[] | null
  delivered_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  accept_deadline: string
}

export interface ChatRoom {
  id: string
  order_id: string | null
  participant_1_id: string
  participant_2_id: string
  is_active: boolean
  last_message_at: string | null
  created_at: string
}

export interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string
  attachments: string[] | null
  is_read: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export interface Payment {
  id: string
  order_id: string
  client_id: string
  freelancer_id: string
  amount: number
  platform_fee: number
  freelancer_amount: number
  payment_method: string | null
  payment_gateway_id: string | null
  status: PaymentStatus
  created_at: string
}

export interface Withdrawal {
  id: string
  freelancer_id: string
  amount: number
  status: WithdrawalStatus
  payment_details: Record<string, any> | null
  processed_at: string | null
  created_at: string
}

export interface Event {
  id: string
  title: string
  content: string
  type: EventType
  is_pinned: boolean
  image_url: string | null
  created_by: string
  created_at: string
  published_at: string
  updated_at: string
}
