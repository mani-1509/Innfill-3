import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ''

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.error('RAZORPAY_WEBHOOK_SECRET not configured')
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

/**
 * Handle Razorpay webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || ''

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse webhook payload
    const payload = JSON.parse(body)
    const event = payload.event
    const eventData = payload.payload

    console.log('Received Razorpay webhook:', event)

    // Handle different webhook events
    switch (event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(eventData)
        break

      case 'payment.captured':
        await handlePaymentCaptured(eventData)
        break

      case 'payment.failed':
        await handlePaymentFailed(eventData)
        break

      case 'transfer.processed':
        await handleTransferProcessed(eventData)
        break

      case 'transfer.failed':
        await handleTransferFailed(eventData)
        break

      case 'refund.processed':
        await handleRefundProcessed(eventData)
        break

      case 'refund.failed':
        await handleRefundFailed(eventData)
        break

      default:
        console.log('Unhandled webhook event:', event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// =====================================================
// PAYMENT EVENT HANDLERS
// =====================================================

/**
 * Handle payment.authorized event
 * Payment was authorized by the customer's bank
 */
async function handlePaymentAuthorized(data: any) {
  console.log('Payment authorized:', data.payment.entity.id)

  const supabase = await createClient()
  const payment = data.payment.entity

  // Find order by razorpay_order_id
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('razorpay_order_id', payment.order_id)
    .single()

  if (!order) {
    console.error('Order not found for payment:', payment.order_id)
    return
  }

  // Log payment authorization (optional)
  console.log('Payment authorized for order:', order.id)
}

/**
 * Handle payment.captured event
 * Payment was successfully captured
 */
async function handlePaymentCaptured(data: any) {
  console.log('Payment captured:', data.payment.entity.id)

  const supabase = await createClient()
  const payment = data.payment.entity

  // Find order by razorpay_order_id
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', payment.order_id)
    .single()

  if (!order) {
    console.error('Order not found for payment:', payment.order_id)
    return
  }

  // Check if payment record already exists
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('razorpay_payment_id', payment.id)
    .single()

  if (existingPayment) {
    console.log('Payment record already exists:', existingPayment.id)
    return
  }

  // Create payment record
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      order_id: order.id,
      client_id: order.client_id,
      freelancer_id: order.freelancer_id,
      amount: payment.amount / 100, // Convert paise to rupees
      platform_fee: order.platform_commission,
      freelancer_amount: order.price,
      payment_method: 'razorpay',
      payment_gateway_id: payment.id,
      razorpay_payment_id: payment.id,
      status: 'completed',
      payment_captured_at: new Date(payment.created_at * 1000).toISOString(),
    })

  if (paymentError) {
    console.error('Error creating payment record:', paymentError)
    return
  }

  // Update order status to accepted
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  if (orderError) {
    console.error('Error updating order status:', orderError)
    return
  }

  // Update freelancer pending balance
  await supabase.rpc('update_freelancer_balance', {
    p_freelancer_id: order.freelancer_id,
    p_amount: order.price,
    p_balance_type: 'pending',
  })

  console.log('Payment captured successfully for order:', order.id)
}

/**
 * Handle payment.failed event
 * Payment failed
 */
async function handlePaymentFailed(data: any) {
  console.log('Payment failed:', data.payment.entity.id)

  const supabase = await createClient()
  const payment = data.payment.entity

  // Find order by razorpay_order_id
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('razorpay_order_id', payment.order_id)
    .single()

  if (!order) {
    console.error('Order not found for payment:', payment.order_id)
    return
  }

  // Create failed payment record
  await supabase
    .from('payments')
    .insert({
      order_id: order.id,
      razorpay_payment_id: payment.id,
      amount: payment.amount / 100,
      status: 'failed',
      payment_method: 'razorpay',
    })

  console.log('Payment failed recorded for order:', order.id)
}

// =====================================================
// TRANSFER EVENT HANDLERS
// =====================================================

/**
 * Handle transfer.processed event
 * Transfer to freelancer was successful
 */
async function handleTransferProcessed(data: any) {
  console.log('Transfer processed:', data.transfer.entity.id)

  const supabase = await createClient()
  const transfer = data.transfer.entity

  // Update payment record with transfer details
  const { error } = await supabase
    .from('payments')
    .update({
      transferred_to_freelancer: true,
      razorpay_transfer_id: transfer.id,
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_payment_id', transfer.source)

  if (error) {
    console.error('Error updating payment with transfer:', error)
    return
  }

  console.log('Transfer processed successfully')
}

/**
 * Handle transfer.failed event
 * Transfer to freelancer failed
 */
async function handleTransferFailed(data: any) {
  console.error('Transfer failed:', data.transfer.entity.id)

  const supabase = await createClient()
  const transfer = data.transfer.entity

  // Log the failure
  console.error('Transfer failed for payment:', transfer.source)
  console.error('Failure reason:', transfer.notes?.failure_reason)

  // TODO: Notify admin to manually process transfer
  // TODO: Create a failed_transfers table to track these
}

// =====================================================
// REFUND EVENT HANDLERS
// =====================================================

/**
 * Handle refund.processed event
 * Refund was successfully processed
 */
async function handleRefundProcessed(data: any) {
  console.log('Refund processed:', data.refund.entity.id)

  const supabase = await createClient()
  const refund = data.refund.entity

  // Update payment record with refund details
  const { error } = await supabase
    .from('payments')
    .update({
      refund_status: 'processed',
      refund_amount: refund.amount / 100, // Convert paise to rupees
      razorpay_refund_id: refund.id,
      refunded_at: new Date(refund.created_at * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_payment_id', refund.payment_id)

  if (error) {
    console.error('Error updating payment with refund:', error)
    return
  }

  console.log('Refund processed successfully')
}

/**
 * Handle refund.failed event
 * Refund failed
 */
async function handleRefundFailed(data: any) {
  console.error('Refund failed:', data.refund.entity.id)

  const supabase = await createClient()
  const refund = data.refund.entity

  // Update payment record with failed refund status
  await supabase
    .from('payments')
    .update({
      refund_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_payment_id', refund.payment_id)

  console.error('Refund failed for payment:', refund.payment_id)
  // TODO: Notify admin to manually process refund
}

/**
 * GET handler for webhook configuration verification
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Razorpay webhook endpoint is ready',
  })
}
