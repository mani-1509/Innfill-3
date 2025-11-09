'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { calculateAcceptDeadline } from '@/lib/utils/order-utils'
import { calculateOrderAmounts, calculateRefundAmount } from '@/lib/utils/payment-calculations'
import { processRefund, transferToFreelancer } from './payments'

/**
 * Generate a signed URL for downloading a file from Supabase Storage
 */
export async function getSignedDownloadUrl(fileUrl: string) {
  try {
    const supabase = await createClient()
    
    // Extract bucket name and file path from the URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    // or: https://[project].supabase.co/storage/v1/object/[bucket]/[path]
    const urlParts = fileUrl.split('/storage/v1/object/')
    if (urlParts.length < 2) {
      return { error: 'Invalid file URL format' }
    }
    
    const pathPart = urlParts[1].replace('public/', '')
    const [bucket, ...pathSegments] = pathPart.split('/')
    const filePath = pathSegments.join('/')
    
    // Generate signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600)
    
    if (error) {
      console.error('Error generating signed URL:', error)
      return { error: error.message }
    }
    
    return { url: data.signedUrl }
  } catch (error) {
    console.error('Error in getSignedDownloadUrl:', error)
    return { error: 'Failed to generate download URL' }
  }
}

/**
 * Create a new order
 */
export async function createOrder(data: {
  serviceId: string
  planTier: 'basic' | 'standard' | 'premium'
  requirements: string
  requirementFiles?: string[]
  requirementLinks?: string[]
}) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get user profile to verify they're a client
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'client') {
    return { error: 'Only clients can create orders' }
  }

  // Get service plan details
  const { data: service, error: serviceError } = await supabase
    .from('service_plans')
    .select('*')
    .eq('id', data.serviceId)
    .single()

  if (serviceError || !service) {
    return { error: 'Service not found' }
  }

  // Get plan details based on tier
  const price = service[`${data.planTier}_price`]
  const deliveryDays = service[`${data.planTier}_delivery_days`]
  const revisionsAllowed = service[`${data.planTier}_revisions`]

  if (!price || !deliveryDays || revisionsAllowed === null) {
    return { error: 'Invalid plan tier' }
  }

  // Calculate payment amounts
  const paymentAmounts = calculateOrderAmounts(price)

  // Calculate accept deadline (48 hours from now)
  const acceptDeadline = calculateAcceptDeadline()

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      client_id: user.id,
      freelancer_id: service.freelancer_id,
      service_plan_id: data.serviceId,
      plan_tier: data.planTier,
      requirements: data.requirements,
      requirement_files: data.requirementFiles || [],
      requirement_links: data.requirementLinks || [],
      price,
      total_amount: paymentAmounts.totalAmount,
      platform_commission: paymentAmounts.platformCommission,
      gst_amount: paymentAmounts.gstAmount,
      delivery_days: deliveryDays,
      revisions_allowed: revisionsAllowed,
      revisions_used: 0,
      status: 'pending_acceptance',
      accept_deadline: acceptDeadline,
    })
    .select()
    .single()

  if (orderError) {
    return { error: orderError.message }
  }

  revalidatePath('/orders')
  return { success: true, orderId: order.id }
}

/**
 * Accept an order (freelancer only)
 */
export async function acceptOrder(orderId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { error: 'Order not found' }
  }

  // Verify user is the freelancer
  if (order.freelancer_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Verify order is pending
  if (order.status !== 'pending_acceptance') {
    return { error: 'Order is not pending acceptance' }
  }

  // Calculate payment deadline (48 hours from now)
  const paymentDeadline = new Date()
  paymentDeadline.setHours(paymentDeadline.getHours() + 48)

  // Update order status to pending_payment (client needs to pay within 48 hours)
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'pending_payment',
      payment_deadline: paymentDeadline.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Create chat room for order
  const { createChatRoom } = await import('./chat')
  const chatResult = await createChatRoom(orderId, order.client_id, order.freelancer_id)
  
  if (!chatResult.success) {
    console.error('Failed to create chat room:', chatResult.error)
    // Don't fail the order acceptance if chat creation fails
  }

  // TODO: Send notification to client

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')
  revalidatePath('/chat')
  return { success: true }
}

/**
 * Decline an order (freelancer only)
 */
export async function declineOrder(orderId: string, reason?: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { error: 'Order not found' }
  }

  // Verify user is the freelancer
  if (order.freelancer_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Verify order is pending
  if (order.status !== 'pending_acceptance') {
    return { error: 'Can only decline pending orders' }
  }

  // Update order status to cancelled
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    return { error: updateError.message }
  }

  // TODO: Process refund (100% to client)
  // TODO: Send notification to client

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')
  return { success: true }
}

/**
 * Mark order as in progress (freelancer only)
 */
export async function markOrderInProgress(orderId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { error: 'Order not found' }
  }

  // Verify user is the freelancer
  if (order.freelancer_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Verify order is accepted
  if (order.status !== 'accepted') {
    return { error: 'Order must be accepted first' }
  }

  // Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')
  return { success: true }
}

/**
 * Submit delivery (freelancer only)
 */
export async function submitDelivery(data: {
  orderId: string
  message: string
  deliveryFiles?: string[]
  deliveryLinks?: string[]
}) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', data.orderId)
    .single()

  if (orderError || !order) {
    return { error: 'Order not found' }
  }

  // Verify user is the freelancer
  if (order.freelancer_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Verify order is in progress or revision requested
  if (order.status !== 'in_progress' && order.status !== 'revision_requested') {
    return { error: 'Order must be in progress or revision requested' }
  }

  // Update order with delivery
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'delivered',
      delivery_message: data.message,
      delivery_files: data.deliveryFiles || [],
      delivery_links: data.deliveryLinks || [],
      delivered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.orderId)

  if (updateError) {
    return { error: updateError.message }
  }

  // TODO: Send notification to client

  revalidatePath(`/orders/${data.orderId}`)
  revalidatePath('/orders')
  return { success: true }
}

/**
 * Request revision (client only)
 */
export async function requestRevision(orderId: string, revisionMessage: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { error: 'Order not found' }
  }

  // Verify user is the client
  if (order.client_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Verify order is delivered
  if (order.status !== 'delivered') {
    return { error: 'Can only request revision on delivered orders' }
  }

  // Check if revisions are available
  if (order.revisions_used >= order.revisions_allowed) {
    return { error: 'No revisions remaining' }
  }

  // Update order status and temporarily store revision message
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'revision_requested',
      revisions_used: order.revisions_used + 1,
      delivery_message: revisionMessage, // Temporarily store for trigger to pick up
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    return { error: updateError.message }
  }

  // TODO: Send notification to freelancer

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')
  return { success: true }
}

/**
 * Complete order (client only)
 */
export async function completeOrder(orderId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { error: 'Order not found' }
  }

  // Verify user is the client
  if (order.client_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Verify order is delivered
  if (order.status !== 'delivered') {
    return { error: 'Order must be delivered' }
  }

  // Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Update freelancer stats with actual earnings (service price minus 14% commission)
  const freelancerEarnings = calculateOrderAmounts(order.price).freelancerAmount
  await supabase.rpc('increment_freelancer_stats', {
    freelancer_id: order.freelancer_id,
    earnings: freelancerEarnings,
  })

  // Update client stats with total amount paid (service price + GST on commission)
  await supabase.rpc('increment_client_stats', {
    client_id: order.client_id,
    spent: order.total_amount,
  })

  // Schedule chat room to close after 24 hours
  const { scheduleChatRoomClosure } = await import('./chat')
  await scheduleChatRoomClosure(orderId)

  // Transfer payment to freelancer
  const transferResult = await transferToFreelancer(orderId)
  if (!transferResult.success) {
    console.error('Failed to transfer payment to freelancer:', transferResult.error)
    // Don't fail order completion if transfer fails - it will be retried later
  }

  // TODO: Send notification to freelancer

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')
  revalidatePath('/earnings')
  return { success: true }
}

/**
 * Cancel order (client only, before acceptance or in progress)
 */
export async function cancelOrder(orderId: string, reason?: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { error: 'Order not found' }
  }

  // Verify user is the client
  if (order.client_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Can only cancel certain statuses
  if (!['pending_acceptance', 'pending_payment', 'accepted', 'in_progress'].includes(order.status)) {
    return { error: 'Cannot cancel order at this stage' }
  }

  // Check if payment was made (status is accepted or in_progress means payment was completed)
  const paymentMade = ['accepted', 'in_progress'].includes(order.status)

  // Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Process refund if payment was made
  if (paymentMade) {
    const refundResult = await processRefund(orderId, reason || 'Order cancelled by client')
    if (!refundResult.success) {
      console.error('Failed to process refund:', refundResult.error)
      // Don't fail cancellation if refund fails - it can be processed manually
    }
  }

  // TODO: Send notification to freelancer

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')
  return { 
    success: true,
    refundProcessed: paymentMade,
    refundAmount: paymentMade ? (await processRefund(orderId, reason || 'Order cancelled by client')).refundAmount : undefined
  }
}

/**
 * Get orders for current user
 */
export async function getUserOrders(status?: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Build query based on role
  let query = supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(id, username, display_name, avatar_url),
      freelancer:profiles!orders_freelancer_id_fkey(id, username, display_name, avatar_url),
      service:service_plans(id, title, category, images)
    `)
    .order('created_at', { ascending: false })

  // Filter by user role - admins see all orders
  if (profile?.role === 'client') {
    query = query.eq('client_id', user.id)
  } else if (profile?.role === 'freelancer') {
    query = query.eq('freelancer_id', user.id)
  }
  // Admins don't get filtered - they see all orders

  if (status) {
    query = query.eq('status', status)
  }

  const { data: orders, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { orders, role: profile?.role as 'client' | 'freelancer' }
}

/**
 * Get single order details
 */
export async function getOrderDetails(orderId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get user profile to check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(id, username, display_name, avatar_url, email),
      freelancer:profiles!orders_freelancer_id_fkey(id, username, display_name, avatar_url, email),
      service:service_plans(id, title, description, category, images)
    `)
    .eq('id', orderId)
    .single()

  if (error) {
    return { error: error.message }
  }

  // Get delivery history for this order
  const { data: deliveryHistory } = await supabase
    .from('delivery_history')
    .select('*')
    .eq('order_id', orderId)
    .order('version', { ascending: true })

  // Determine user's role in this order
  let userRole: 'client' | 'freelancer' | 'admin' | null = null
  
  if (profile?.role === 'admin') {
    userRole = 'admin' // Admins can view all orders
  } else if (order.client_id === user.id) {
    userRole = 'client'
  } else if (order.freelancer_id === user.id) {
    userRole = 'freelancer'
  }

  return { order, deliveryHistory: deliveryHistory || [], role: userRole }
}
