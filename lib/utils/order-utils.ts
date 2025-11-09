/**
 * Order-related utility functions
 */

/**
 * @deprecated Use calculateOrderAmounts from payment-calculations.ts instead
 * This function uses the old payment model and should not be used for new code.
 * 
 * OLD MODEL: Simple 15% platform fee
 * NEW MODEL: 14% commission + 18% GST on commission
 */
export function calculateFees(price: number) {
  const PLATFORM_FEE_PERCENTAGE = 15
  const platformFee = (price * PLATFORM_FEE_PERCENTAGE) / 100
  const freelancerAmount = price - platformFee
  
  return {
    totalPrice: price,
    platformFee: parseFloat(platformFee.toFixed(2)),
    freelancerAmount: parseFloat(freelancerAmount.toFixed(2)),
  }
}

/**
 * @deprecated Use calculateRefundAmount from payment-calculations.ts instead
 */
export function calculateRefund(price: number) {
  const { platformFee } = calculateFees(price)
  const refundAmount = price - platformFee
  
  return {
    originalPrice: price,
    platformFee,
    refundAmount: parseFloat(refundAmount.toFixed(2)),
  }
}

/**
 * Format currency to INR
 */
export function formatCurrency(amount: number) {
  return `₹${amount.toFixed(2)}`
}

/**
 * Calculate order deadline (48 hours from now)
 */
export function calculateAcceptDeadline() {
  const deadline = new Date()
  deadline.setHours(deadline.getHours() + 48)
  return deadline.toISOString()
}
