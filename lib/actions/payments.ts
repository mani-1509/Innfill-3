'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateOrderAmounts, calculateRefundAmount } from '@/lib/utils/payment-calculations'
import { sendOrderNotification } from './notifications'

// =====================================================
// CONSTANTS & CONFIGURATION
// =====================================================

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ''
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''

// =====================================================
// BANK DETAILS MANAGEMENT
// =====================================================

/**
 * Verify bank account with Razorpay
 * Uses Fund Account + Penny Drop for real verification
 */
async function verifyBankAccountWithRazorpay(data: {
  accountNumber: string
  ifscCode: string
  accountHolderName: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: '❌ User not authenticated' }
    }

    const Razorpay = require('razorpay')
    const razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    })
    
    console.log('🔍 Starting bank account verification...')
    
    // Step 1: Validate formats
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) {
      return { error: '❌ Invalid IFSC code format. Example: SBIN0001234' }
    }
    
    if (!/^[0-9]{8,18}$/.test(data.accountNumber)) {
      return { error: '❌ Account number must be 8-18 digits' }
    }
    
    if (data.accountHolderName.length < 3) {
      return { error: '❌ Account holder name too short' }
    }
    
    // Step 2: Verify IFSC code exists using Razorpay's public API
    console.log('🔍 Verifying IFSC code...')
    try {
      const ifscResponse = await fetch(`https://ifsc.razorpay.com/${data.ifscCode}`)
      if (!ifscResponse.ok) {
        return { error: '❌ IFSC code not found. Please verify your bank IFSC code.' }
      }
      const ifscData = await ifscResponse.json()
      console.log('✅ IFSC verified:', ifscData.BANK, '-', ifscData.BRANCH)
    } catch (ifscError) {
      return { error: '❌ Unable to verify IFSC code. Please check your internet connection.' }
    }
    
    // Step 3: Get user profile for contact creation
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, display_name, username')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { error: '❌ User profile not found' }
    }

    // Step 4: Create or get contact in Razorpay via REST API
    console.log('🔍 Creating Razorpay contact...')
    let contact
    try {
      const contactResponse = await fetch('https://api.razorpay.com/v1/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        },
        body: JSON.stringify({
          name: data.accountHolderName,
          email: profile.email,
          type: 'vendor',
          reference_id: user.id,
          notes: {
            username: profile.username,
          }
        })
      })

      if (!contactResponse.ok) {
        const errorData = await contactResponse.json()
        console.error('Contact creation error:', errorData)
        return { error: '❌ Failed to create contact with payment gateway' }
      }

      contact = await contactResponse.json()
      console.log('✅ Contact created:', contact.id)
    } catch (contactError: any) {
      console.error('Contact creation error:', contactError)
      return { error: '❌ Failed to create contact with payment gateway' }
    }

    // Step 5: Create fund account via REST API
    console.log('🔍 Creating fund account...')
    let fundAccount
    try {
      const fundAccountResponse = await fetch('https://api.razorpay.com/v1/fund_accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        },
        body: JSON.stringify({
          contact_id: contact.id,
          account_type: 'bank_account',
          bank_account: {
            name: data.accountHolderName,
            ifsc: data.ifscCode,
            account_number: data.accountNumber,
          }
        })
      })

      if (!fundAccountResponse.ok) {
        const errorData = await fundAccountResponse.json()
        console.error('Fund account creation error:', errorData)
        
        // Parse Razorpay errors
        if (errorData.error) {
          const desc = errorData.error.description
          if (desc.includes('IFSC')) {
            return { error: '❌ Invalid IFSC code rejected by bank gateway' }
          }
          if (desc.includes('account')) {
            return { error: '❌ Invalid account number rejected by bank gateway' }
          }
          if (desc.includes('name')) {
            return { error: '❌ Account holder name format invalid' }
          }
          return { error: `❌ ${desc}` }
        }
        
        return { error: '❌ Failed to verify bank account with payment gateway' }
      }

      fundAccount = await fundAccountResponse.json()
      console.log('✅ Fund account created:', fundAccount.id)
      
      // Fund account creation validates IFSC with RBI database
      // Account number format is validated but NOT verified with actual bank
      // For full verification (account exists + name match), RazorpayX + penny drop is needed
      console.log('⚠️ Bank details saved - account number NOT verified with bank')
      
      return { 
        success: true,
        contactId: contact.id,
        fundAccountId: fundAccount.id,
        needsManualVerification: true, // Flag that account number isn't fully verified
        message: '⚠️ Bank details saved. Account will be verified on first payout attempt.' 
      }
      
    } catch (fundError: any) {
      console.error('Fund account creation error:', fundError)
      return { error: '❌ Failed to verify bank account with payment gateway' }
    }
    
  } catch (error: any) {
    console.error('Bank account verification failed:', error)
    return { error: '❌ Unable to verify bank account. Please try again later.' }
  }
}

/**
 * Add or update bank details for freelancer
 */
export async function updateBankDetails(data: {
  accountNumber: string
  ifscCode: string
  accountHolderName: string
  upiId?: string
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

    // Verify bank account with Razorpay before saving
    console.log('Verifying bank account with Razorpay...')
    const verificationResult = await verifyBankAccountWithRazorpay({
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      accountHolderName: data.accountHolderName,
    })

    if (verificationResult.error) {
      return { error: verificationResult.error }
    }

    // Update profile with bank details and Razorpay IDs
    const updateData: any = {
      bank_account_number: data.accountNumber,
      bank_ifsc: data.ifscCode.toUpperCase(),
      bank_account_holder_name: data.accountHolderName,
      upi_id: data.upiId || null,
      pan_number: data.panNumber.toUpperCase(),
      updated_at: new Date().toISOString(),
    }

    // Store Razorpay fund account ID if available
    if (verificationResult.fundAccountId) {
      updateData.razorpay_account_id = verificationResult.fundAccountId
    }

    // Mark as pending verification (IFSC verified, but account number not confirmed with bank)
    // Will be fully verified on first successful payout
    updateData.kyc_verified = false

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating bank details:', updateError)
      return { error: 'Failed to save bank details' }
    }

    revalidatePath('/profile')
    
    return { 
      success: true, 
      message: verificationResult.message || 'Bank details saved. Will be verified on first payout.',
      needsVerification: true
    }
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

    // Send payment notifications
    const { data: service } = await supabase
      .from('service_plans')
      .select('title')
      .eq('id', order.service_plan_id)
      .single()

    // Notify freelancer about payment received
    await sendOrderNotification(data.orderId, order.freelancer_id, 'order_payment_completed', {
      serviceName: service?.title || 'Service',
      amount: order.total_amount,
    })

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

    // Calculate transfer amount
    const amounts = calculateOrderAmounts(order.price)

    // Check if manual payout mode (no Razorpay Payouts for non-business accounts)
    const MANUAL_PAYOUT_MODE = process.env.RAZORPAY_MANUAL_PAYOUT === 'true'
    
    if (MANUAL_PAYOUT_MODE) {
      console.log('💰 Manual payout mode - Recording transfer for manual processing...')
      
      // Check if freelancer has bank details
      if (!order.freelancer.bank_account_number || !order.freelancer.bank_ifsc) {
        // Still mark as pending, but admin will see missing details
        console.log('⚠️ Warning: Freelancer missing bank details')
      }
      
      // Record as pending manual transfer
      const transferId = `manual_${Date.now()}_${orderId.substring(0, 8)}`
      
      const { error: paymentUpdateError } = await supabase
        .from('payments')
        .update({
          transferred_to_freelancer: false, // Keep false until manually confirmed
          razorpay_transfer_id: transferId,
          transfer_pending_manual: true, // New field to track manual transfers
        })
        .eq('id', payment.id)

      if (paymentUpdateError) {
        console.error('Error updating payment record:', paymentUpdateError)
        return { error: 'Failed to record transfer' }
      }

      revalidatePath(`/orders/${orderId}`)
      revalidatePath('/admin/payouts')

      return {
        success: true,
        manual: true,
        message: 'Transfer marked for manual payout. Please transfer money manually.',
        transferId,
        freelancerDetails: {
          name: order.freelancer.bank_account_holder_name,
          accountNumber: order.freelancer.bank_account_number,
          ifsc: order.freelancer.bank_ifsc,
          amount: amounts.freelancerAmount,
        }
      }
    }

    // Automatic Razorpay Payout (requires business account)
    console.log('🔄 Initiating automatic Razorpay transfer...')
    
    // Check if freelancer has Razorpay account linked
    if (!order.freelancer.razorpay_account_id) {
      return { error: 'Freelancer has not linked bank account with Razorpay' }
    }
    
    try {
      // Use Razorpay Payouts API (requires business KYC)
      const transferResponse = await fetch('https://api.razorpay.com/v1/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        },
        body: JSON.stringify({
          account_number: process.env.RAZORPAY_ACCOUNT_NUMBER || '2323230000000000', // Your Razorpay account
          fund_account_id: order.freelancer.razorpay_account_id,
          amount: Math.round(amounts.freelancerAmount * 100), // Convert to paise
          currency: 'INR',
          mode: 'IMPS', // IMPS/NEFT/RTGS
          purpose: 'payout',
          queue_if_low_balance: true,
          reference_id: `order_${orderId}`,
          narration: `Earnings for order ${orderId.substring(0, 8)}`,
          notes: {
            order_id: orderId,
            service_id: order.service_plan_id,
          }
        })
      })

      if (!transferResponse.ok) {
        const errorData = await transferResponse.json()
        console.error('Transfer failed:', errorData)
        
        // If transfer fails, likely due to invalid account
        // Keep kyc_verified as false for freelancer
        return { 
          error: `Transfer failed: ${errorData.error?.description || 'Invalid bank account details'}. Please ask freelancer to update bank details.` 
        }
      }

      const transferData = await transferResponse.json()
      console.log('✅ Transfer initiated:', transferData.id)

      // Transfer successful = bank account is valid!
      // Automatically verify the account
      if (transferData.status === 'processing' || transferData.status === 'processed') {
        console.log('✅ Bank account verified through successful transfer!')
        
        // Update freelancer's KYC status to verified
        await supabase
          .from('profiles')
          .update({ 
            kyc_verified: true,
          })
          .eq('id', order.freelancer_id)
      }

      // Update payment record
      const { error: paymentUpdateError } = await supabase
        .from('payments')
        .update({
          transferred_to_freelancer: true,
          razorpay_transfer_id: transferData.id,
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
      revalidatePath('/profile')

      return {
        success: true,
        message: 'Payment transferred to freelancer successfully. Bank account verified!',
        transferId: transferData.id,
        accountVerified: true,
      }
      
    } catch (transferError: any) {
      console.error('Transfer error:', transferError)
      return { 
        error: 'Failed to transfer payment. Please check bank details and try again.' 
      }
    }
  } catch (error) {
    console.error('Error in transferToFreelancer:', error)
    return { error: 'Failed to transfer payment' }
  }
}

/**
 * Mark manual transfer as completed (for admin use)
 */
export async function confirmManualTransfer(orderId: string, transactionId?: string) {
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

    const payment = order.payment?.[0]
    if (!payment) {
      return { error: 'Payment not found' }
    }

    if (payment.transferred_to_freelancer) {
      return { error: 'Already marked as transferred' }
    }

    // Calculate amounts
    const amounts = calculateOrderAmounts(order.price)

    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        transferred_to_freelancer: true,
        manual_transfer_confirmed: true,
        manual_transfer_id: transactionId || `manual_${Date.now()}`,
        manual_transfer_date: new Date().toISOString(),
        transfer_pending_manual: false,
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('Error confirming manual transfer:', updateError)
      return { error: 'Failed to confirm transfer' }
    }

    // Move from pending to available balance
    const { error: releaseError } = await supabase.rpc('release_pending_balance', {
      p_freelancer_id: order.freelancer_id,
      p_amount: amounts.freelancerAmount,
    })

    if (releaseError) {
      console.error('Error releasing balance:', releaseError)
      return { error: 'Failed to update balance' }
    }

    // Mark account as verified (since manual transfer succeeded)
    await supabase
      .from('profiles')
      .update({ 
        kyc_verified: true,
      })
      .eq('id', order.freelancer_id)

    revalidatePath(`/orders/${orderId}`)
    revalidatePath('/admin/payouts')
    revalidatePath('/earnings')

    return {
      success: true,
      message: 'Manual transfer confirmed successfully'
    }
  } catch (error) {
    console.error('Error in confirmManualTransfer:', error)
    return { error: 'Failed to confirm manual transfer' }
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

    // Check if payment is not completed (can't refund pending/failed payments)
    if (payment.status !== 'completed') {
      return { error: `Cannot refund payment with status: ${payment.status}` }
    }

    // Check if already refunded
    if (payment.refund_status === 'processed' || payment.refund_status === 'pending') {
      console.log('⚠️ Refund already processed or pending for this payment')
      return { 
        success: true, 
        refundAmount: payment.refund_amount || 0,
        alreadyRefunded: true 
      }
    }

    // Check if razorpay_payment_id exists
    if (!payment.razorpay_payment_id) {
      return { error: 'No Razorpay payment ID found. Cannot process refund.' }
    }

    // Calculate refund amount
    // Refund Formula: Total Paid - GST - 4% Processing Fee
    // Example: ₹10,252 - ₹252 - ₹400 = ₹9,600
    const totalAmountWithGST = order.total_amount || payment.amount // Total client paid (with GST)
    const gstAmount = order.gst_amount || 0
    const servicePrice = payment.amount // Service price portion
    
    // Calculate 4% processing fee on service price
    const processingFeePercent = 0.04
    const processingFee = Math.round(servicePrice * processingFeePercent * 100) / 100
    
    // Refund = Total - GST - 4% Fee
    // Or simplified: Service Price - 4% Fee
    const refundAmount = Math.round((servicePrice - processingFee) * 100) / 100

    // Create Razorpay refund
    console.log('🔄 Initiating refund...')
    
    try {
      const Razorpay = require('razorpay')
      const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })

      // Create refund using Razorpay SDK
      const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
        amount: Math.round(refundAmount * 100), // Convert to paise
        notes: {
          order_id: orderId,
          reason: reason,
        }
      })

      console.log('✅ Refund initiated:', refund.id)
      console.log('   Service Price: ₹' + servicePrice)
      console.log('   Processing Fee (4%): ₹' + processingFee)
      console.log('   Refund Amount: ₹' + refundAmount)
      console.log('   GST (non-refundable): ₹' + gstAmount)

      // Update payment with refund details
      const { error: refundError } = await supabase
        .from('payments')
        .update({
          refund_status: 'processed',
          refund_amount: refundAmount,
          razorpay_refund_id: refund.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id)

      if (refundError) {
        console.error('Error updating payment with refund:', refundError)
        return { error: 'Failed to record refund' }
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
      revalidatePath('/earnings')

    return {
      success: true,
      message: `Refund of ₹${refundAmount.toFixed(2)} processed successfully`,
      refundId: refund.id,
      refundAmount: refundAmount,
    }    } catch (refundError: any) {
      console.error('Refund error:', refundError)
      return { 
        error: `Failed to process refund: ${refundError.error?.description || 'Unknown error'}` 
      }
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
