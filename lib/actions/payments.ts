'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateOrderAmounts, calculateRefundAmount } from '@/lib/utils/payment-calculations'

// =====================================================
// CONSTANTS & CONFIGURATION
// =====================================================

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ''
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''

// =====================================================
// BANK DETAILS MANAGEMENT
// =====================================================

/**
 * Add or update bank details for freelancer
 */
export async function updateBankDetails(data: {
  accountNumber: string
  ifscCode: string
  accountHolderName: string
  panNumber: string
}) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Validate user is a freelancer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'freelancer') {
      return { error: 'Only freelancers can add bank details' }
    }

    // Validate inputs
    if (!data.accountNumber || data.accountNumber.length < 8) {
      return { error: 'Invalid account number' }
    }

    if (!data.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) {
      return { error: 'Invalid IFSC code format' }
    }

    if (!data.accountHolderName || data.accountHolderName.length < 3) {
      return { error: 'Invalid account holder name' }
    }

    if (!data.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber)) {
      return { error: 'Invalid PAN number format' }
    }

    // Update profile with bank details
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        bank_account_number: data.accountNumber,
        bank_ifsc: data.ifscCode.toUpperCase(),
        bank_account_holder_name: data.accountHolderName,
        pan_number: data.panNumber.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating bank details:', updateError)
      return { error: 'Failed to save bank details' }
    }

    revalidatePath('/profile')
    return { success: true, message: 'Bank details saved successfully' }
  } catch (error) {
    console.error('Error in updateBankDetails:', error)
    return { error: 'An error occurred while saving bank details' }
  }
}

/**
 * Get bank details for current user
 */
export async function getBankDetails() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('bank_account_number, bank_ifsc, bank_account_holder_name, pan_number, kyc_verified, razorpay_account_id')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching bank details:', error)
      return { error: 'Failed to fetch bank details' }
    }

    return {
      data: {
        accountNumber: profile.bank_account_number,
        ifscCode: profile.bank_ifsc,
        accountHolderName: profile.bank_account_holder_name,
        panNumber: profile.pan_number,
        kycVerified: profile.kyc_verified,
        linkedAccountId: profile.razorpay_account_id,
      },
    }
  } catch (error) {
    console.error('Error in getBankDetails:', error)
    return { error: 'An error occurred while fetching bank details' }
  }
}

/**
 * Check if freelancer has bank details added
 */
export async function hasCompleteBankDetails(userId: string) {
  try {
    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('bank_account_number, bank_ifsc, bank_account_holder_name, pan_number')
      .eq('id', userId)
      .single()

    if (!profile) {
      return false
    }

    // Check if all required fields are present
    return !!(
      profile.bank_account_number &&
      profile.bank_ifsc &&
      profile.bank_account_holder_name &&
      profile.pan_number
    )
  } catch (error) {
    console.error('Error checking bank details:', error)
    return false
  }
}

// =====================================================
// RAZORPAY ORDER CREATION
// =====================================================

/**
 * Create Razorpay order when freelancer accepts
 * This generates the order ID needed for checkout
 */
export async function createPaymentOrder(orderId: string) {
  try {
    const supabase = await createClient()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, service_plan:service_plans(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return { error: 'Order not found' }
    }

    // Verify order status is pending_payment
    if (order.status !== 'pending_payment') {
      return { error: 'Order is not pending payment' }
    }

    // Check if Razorpay order already exists
    if (order.razorpay_order_id) {
      // If it's a test order ID, clear it and create a new real one
      if (order.razorpay_order_id.startsWith('order_test_')) {
        console.log('Clearing old test order ID:', order.razorpay_order_id)
        await supabase
          .from('orders')
          .update({
            razorpay_order_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)
        // Continue to create new Razorpay order below
      } else {
        // Return existing real Razorpay order
        return {
          data: {
            orderId: order.razorpay_order_id,
            amount: order.total_amount,
            currency: 'INR',
          },
        }
      }
    }

    // Calculate amounts if not already stored
    let totalAmount = order.total_amount
    if (!totalAmount) {
      const amounts = calculateOrderAmounts(order.price)
      totalAmount = amounts.totalAmount
    }

    // Create Razorpay order using SDK
    const Razorpay = require('razorpay')
    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    // Create order on Razorpay
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: orderId,
      notes: {
        order_id: orderId,
        service_name: order.service_plan?.name || 'Service',
      },
    })

    // Update order with Razorpay order ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        razorpay_order_id: razorpayOrder.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order with Razorpay order ID:', updateError)
      return { error: 'Failed to create payment order' }
    }

    return {
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: totalAmount,
        currency: 'INR',
      },
    }
  } catch (error) {
    console.error('Error in createPaymentOrder:', error)
    return { error: 'Failed to create payment order' }
  }
}

// =====================================================
// PAYMENT VERIFICATION & CAPTURE
// =====================================================

/**
 * Verify payment signature from Razorpay
 */
export async function verifyPayment(data: {
  orderId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}) {
  try {
    const crypto = require('crypto')
    
    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest('hex')

    if (generatedSignature !== data.razorpaySignature) {
      console.error('Signature verification failed')
      return { error: 'Invalid payment signature' }
    }
    
    const supabase = await createClient()

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', data.orderId)
      .single()

    if (orderError || !order) {
      return { error: 'Order not found' }
    }

    // Verify Razorpay order ID matches
    if (order.razorpay_order_id !== data.razorpayOrderId) {
      return { error: 'Order ID mismatch' }
    }

    // Create payment record
    const amounts = calculateOrderAmounts(order.price)
    
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: data.orderId,
        client_id: order.client_id,
        freelancer_id: order.freelancer_id,
        amount: order.total_amount || amounts.totalAmount,
        platform_fee: order.platform_commission || amounts.platformCommission,
        freelancer_amount: amounts.freelancerAmount,
        payment_method: 'razorpay',
        payment_gateway_id: data.razorpayPaymentId,
        razorpay_payment_id: data.razorpayPaymentId,
        gateway_fee: amounts.gatewayFee,
        status: 'completed',
        payment_captured_at: new Date().toISOString(),
      })

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      return { error: 'Failed to record payment' }
    }

    // Update order status to accepted
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.orderId)

    if (updateError) {
      console.error('Error updating order status:', updateError)
      return { error: 'Failed to update order status' }
    }

    // Update freelancer pending balance
    const { error: balanceError } = await supabase.rpc('update_freelancer_balance', {
      p_freelancer_id: order.freelancer_id,
      p_amount: amounts.freelancerAmount,
      p_balance_type: 'pending',
    })

    if (balanceError) {
      console.error('Error updating freelancer balance:', balanceError)
    }

    revalidatePath(`/orders/${data.orderId}`)
    revalidatePath('/orders')
    
    return {
      success: true,
      message: 'Payment verified successfully',
    }
  } catch (error) {
    console.error('Error in verifyPayment:', error)
    return { error: 'Failed to verify payment' }
  }
}

// =====================================================
// TRANSFER TO FREELANCER (ON ORDER COMPLETION)
// =====================================================

/**
 * Transfer payment to freelancer when order is completed
 * This uses Razorpay Route to split the payment
 */
export async function transferToFreelancer(orderId: string) {
  try {
    const supabase = await createClient()

    // Get order with payment details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, payment:payments(*), freelancer:profiles!orders_freelancer_id_fkey(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return { error: 'Order not found' }
    }

    // Verify order is completed
    if (order.status !== 'completed') {
      return { error: 'Order must be completed before transfer' }
    }

    // Check if payment exists
    const payment = order.payment?.[0]
    if (!payment) {
      return { error: 'Payment not found for this order' }
    }

    // Check if already transferred
    if (payment.transferred_to_freelancer) {
      return { error: 'Payment already transferred to freelancer' }
    }

    // Check if freelancer has bank details
    if (!order.freelancer.razorpay_account_id) {
      return { error: 'Freelancer has not linked bank account' }
    }

    // Calculate transfer amount
    const amounts = calculateOrderAmounts(order.price)

    // TODO: Create Razorpay transfer using Route API
    // For now, simulate transfer in test mode
    const transferId = `transfer_test_${Date.now()}_${orderId.substring(0, 8)}`

    // Update payment record
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        transferred_to_freelancer: true,
        razorpay_transfer_id: transferId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    if (paymentUpdateError) {
      console.error('Error updating payment record:', paymentUpdateError)
      return { error: 'Failed to record transfer' }
    }

    // Move from pending to available balance
    const { error: releaseError } = await supabase.rpc('release_pending_balance', {
      p_freelancer_id: order.freelancer_id,
      p_amount: amounts.freelancerAmount,
    })

    if (releaseError) {
      console.error('Error releasing pending balance:', releaseError)
      return { error: 'Failed to update freelancer balance' }
    }

    revalidatePath(`/orders/${orderId}`)
    revalidatePath('/earnings')

    return {
      success: true,
      message: 'Payment transferred to freelancer successfully',
      transferId,
    }
  } catch (error) {
    console.error('Error in transferToFreelancer:', error)
    return { error: 'Failed to transfer payment' }
  }
}

// =====================================================
// REFUND PROCESSING
// =====================================================

/**
 * Process refund when order is cancelled after payment
 */
export async function processRefund(orderId: string, reason: string) {
  try {
    const supabase = await createClient()

    // Get order with payment
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, payment:payments(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return { error: 'Order not found' }
    }

    // Check if payment exists
    const payment = order.payment?.[0]
    if (!payment) {
      return { error: 'No payment found for this order' }
    }

    // Check if already refunded
    if (payment.refund_status === 'processed') {
      return { error: 'Payment already refunded' }
    }

    // Calculate refund amount
    const totalAmount = payment.amount
    const platformCommission = order.platform_commission || 0
    const gstAmount = order.gst_amount || 0
    const refundCalc = calculateRefundAmount(totalAmount, platformCommission, gstAmount)

    // TODO: Create Razorpay refund
    // For now, simulate refund in test mode
    const refundId = `refund_test_${Date.now()}_${orderId.substring(0, 8)}`

    // Update payment with refund details
    const { error: refundError } = await supabase
      .from('payments')
      .update({
        refund_status: 'processed',
        refund_amount: refundCalc.refundAmount,
        razorpay_refund_id: refundId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    if (refundError) {
      console.error('Error updating payment with refund:', refundError)
      return { error: 'Failed to process refund' }
    }

    // Update order status to cancelled
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (orderUpdateError) {
      console.error('Error updating order status:', orderUpdateError)
    }

    // If payment was already in freelancer's pending balance, remove it
    if (payment.transferred_to_freelancer === false) {
      const amounts = calculateOrderAmounts(order.price)
      await supabase.rpc('update_freelancer_balance', {
        p_freelancer_id: order.freelancer_id,
        p_amount: -amounts.freelancerAmount, // Negative to subtract
        p_balance_type: 'pending',
      })
    }

    revalidatePath(`/orders/${orderId}`)
    revalidatePath('/orders')

    return {
      success: true,
      message: 'Refund processed successfully',
      refundAmount: refundCalc.refundAmount,
      refundId,
    }
  } catch (error) {
    console.error('Error in processRefund:', error)
    return { error: 'Failed to process refund' }
  }
}

// =====================================================
// EARNINGS & TRANSACTION HISTORY
// =====================================================

/**
 * Get earnings summary for freelancer
 */
export async function getEarningsSummary(userId?: string) {
  try {
    const supabase = await createClient()

    let freelancerId = userId
    if (!freelancerId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'Not authenticated' }
      }
      freelancerId = user.id
    }

    // Get freelancer profile with balances
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('pending_balance, available_balance, total_earnings')
      .eq('id', freelancerId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return { error: 'Failed to fetch earnings data' }
    }

    // Get total earnings from completed payments
    const { data: completedPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('freelancer_amount')
      .eq('freelancer_id', freelancerId)
      .eq('status', 'completed')

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
    }

    const totalEarnings = completedPayments?.reduce(
      (sum, payment) => sum + (payment.freelancer_amount || 0),
      0
    ) || 0

    // Get pending earnings (orders accepted but not completed)
    const { data: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('price')
      .eq('freelancer_id', freelancerId)
      .in('status', ['accepted', 'in_progress'])

    if (pendingError) {
      console.error('Error fetching pending orders:', pendingError)
    }

    const pendingEarnings = pendingOrders?.reduce(
      (sum, order) => sum + (order.price || 0),
      0
    ) || 0

    // Get this month's earnings
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { data: monthPayments, error: monthError } = await supabase
      .from('payments')
      .select('freelancer_amount')
      .eq('freelancer_id', freelancerId)
      .eq('status', 'completed')
      .gte('created_at', firstDayOfMonth.toISOString())

    if (monthError) {
      console.error('Error fetching month payments:', monthError)
    }

    const thisMonthEarnings = monthPayments?.reduce(
      (sum, payment) => sum + (payment.freelancer_amount || 0),
      0
    ) || 0

    return {
      data: {
        pendingBalance: profile.pending_balance || 0,
        availableBalance: profile.available_balance || 0,
        totalEarnings: profile.total_earnings || totalEarnings,
        pendingEarnings,
        thisMonthEarnings,
      },
    }
  } catch (error) {
    console.error('Error in getEarningsSummary:', error)
    return { error: 'Failed to fetch earnings summary' }
  }
}

/**
 * Get transaction history for user
 */
export async function getTransactionHistory(limit: number = 20, offset: number = 0) {
  try {
    const supabase = await createClient()

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

    if (!profile) {
      return { error: 'Profile not found' }
    }

    // Build query based on user role
    let query = supabase
      .from('payments')
      .select(`
        *,
        order:orders(
          id,
          price,
          status,
          service_plan:service_plans(title)
        ),
        client:profiles!payments_client_id_fkey(display_name, username),
        freelancer:profiles!payments_freelancer_id_fkey(display_name, username)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by user role
    if (profile.role === 'freelancer') {
      query = query.eq('freelancer_id', user.id)
    } else {
      query = query.eq('client_id', user.id)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return { error: 'Failed to fetch transaction history' }
    }

    return {
      data: transactions || [],
    }
  } catch (error) {
    console.error('Error in getTransactionHistory:', error)
    return { error: 'Failed to fetch transaction history' }
  }
}

/**
 * Get single payment details
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const supabase = await createClient()

    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        order:orders(
          id,
          price,
          status,
          requirements,
          service_plan:service_plans(title, description)
        ),
        client:profiles!payments_client_id_fkey(display_name, username, avatar_url),
        freelancer:profiles!payments_freelancer_id_fkey(display_name, username, avatar_url)
      `)
      .eq('id', paymentId)
      .single()

    if (error) {
      console.error('Error fetching payment details:', error)
      return { error: 'Payment not found' }
    }

    return { data: payment }
  } catch (error) {
    console.error('Error in getPaymentDetails:', error)
    return { error: 'Failed to fetch payment details' }
  }
}

// =====================================================
// PAYMENT DEADLINE & AUTO-CANCELLATION
// =====================================================

/**
 * Check if payment deadline has passed for an order
 */
export async function checkPaymentDeadline(orderId: string) {
  try {
    const supabase = await createClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('payment_deadline, status')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return { error: 'Order not found' }
    }

    if (order.status !== 'pending_payment') {
      return { data: { expired: false } }
    }

    const deadline = new Date(order.payment_deadline)
    const now = new Date()
    const expired = now > deadline

    return {
      data: {
        expired,
        deadline: order.payment_deadline,
        hoursRemaining: Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))),
      },
    }
  } catch (error) {
    console.error('Error in checkPaymentDeadline:', error)
    return { error: 'Failed to check payment deadline' }
  }
}

/**
 * Manually trigger auto-cancellation of unpaid orders
 * This is called by a cron job or can be triggered manually
 */
export async function triggerAutoCancellation() {
  try {
    const supabase = await createClient()

    // Call the database function that auto-cancels expired orders
    const { data, error } = await supabase.rpc('auto_cancel_unpaid_orders')

    if (error) {
      console.error('Error triggering auto-cancellation:', error)
      return { error: 'Failed to auto-cancel orders' }
    }

    revalidatePath('/orders')
    
    return {
      success: true,
      cancelledCount: data || 0,
    }
  } catch (error) {
    console.error('Error in triggerAutoCancellation:', error)
    return { error: 'Failed to trigger auto-cancellation' }
  }
}
