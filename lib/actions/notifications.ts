'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type NotificationType =
  | 'order_created'
  | 'order_accepted'
  | 'order_declined'
  | 'order_payment_completed'
  | 'order_in_progress'
  | 'order_delivered'
  | 'order_revision_requested'
  | 'order_completed'
  | 'order_cancelled'
  | 'message_received'
  | 'rating_received'
  | 'payout_completed'
  | 'payment_received'
  | 'payment_deadline'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      link: link || null,
      is_read: false,
    })

    if (error) {
      console.error('Error creating notification:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Error in createNotification:', error)
    return { success: false, error: error.message }
  }
}

export async function getNotifications(limit: number = 20) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching notifications:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error in getNotifications:', error)
    return { success: false, error: error.message }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Error in markNotificationAsRead:', error)
    return { success: false, error: error.message }
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Error in markAllNotificationsAsRead:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting notification:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteNotification:', error)
    return { success: false, error: error.message }
  }
}

export async function getUnreadCount() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated', count: 0 }
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      return { success: false, error: error.message, count: 0 }
    }

    return { success: true, count: count || 0 }
  } catch (error: any) {
    console.error('Error in getUnreadCount:', error)
    return { success: false, error: error.message, count: 0 }
  }
}

// Helper function to send order notifications
export async function sendOrderNotification(
  orderId: string,
  recipientId: string,
  type: NotificationType,
  orderDetails: {
    serviceName: string
    clientName?: string
    freelancerName?: string
    amount?: number
  }
) {
  const notifications: Record<
    NotificationType,
    { title: string; message: string }
  > = {
    order_created: {
      title: '🎉 New Order Received!',
      message: `${orderDetails.clientName} ordered your service: ${orderDetails.serviceName}`,
    },
    order_accepted: {
      title: '✅ Order Accepted!',
      message: `${orderDetails.freelancerName} accepted your order for ${orderDetails.serviceName}`,
    },
    order_declined: {
      title: '❌ Order Declined',
      message: `${orderDetails.freelancerName} declined your order for ${orderDetails.serviceName}`,
    },
    order_payment_completed: {
      title: '💰 Payment Received!',
      message: `Payment of ₹${orderDetails.amount} received for ${orderDetails.serviceName}`,
    },
    order_in_progress: {
      title: '🚀 Work Started!',
      message: `${orderDetails.freelancerName} started working on ${orderDetails.serviceName}`,
    },
    order_delivered: {
      title: '📦 Order Delivered!',
      message: `${orderDetails.freelancerName} delivered ${orderDetails.serviceName}`,
    },
    order_revision_requested: {
      title: '🔄 Revision Requested',
      message: `${orderDetails.clientName} requested revisions for ${orderDetails.serviceName}`,
    },
    order_completed: {
      title: '🎊 Order Completed!',
      message: `Order for ${orderDetails.serviceName} has been completed`,
    },
    order_cancelled: {
      title: '🚫 Order Cancelled',
      message: `Order for ${orderDetails.serviceName} has been cancelled`,
    },
    payment_received: {
      title: '💵 Payment Received!',
      message: `You'll receive ₹${orderDetails.amount} for ${orderDetails.serviceName} in 2 business days`,
    },
    payment_deadline: {
      title: '⏰ Payment Deadline Approaching!',
      message: `Please complete payment for ${orderDetails.serviceName} within 48 hours`,
    },
    message_received: {
      title: '',
      message: '',
    },
    rating_received: {
      title: '',
      message: '',
    },
    payout_completed: {
      title: '',
      message: '',
    },
  }

  const notificationData = notifications[type]

  if (!notificationData.title) return { success: false }

  return await createNotification({
    userId: recipientId,
    type,
    title: notificationData.title,
    message: notificationData.message,
    link: `/orders/${orderId}`,
  })
}
