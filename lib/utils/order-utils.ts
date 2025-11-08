/**
 * Order-related utility functions
 */

// Platform fee percentage (from environment)
const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE || '15')

/**
 * Calculate platform fee and amounts
 */
export function calculateFees(price: number) {
  const platformFee = (price * PLATFORM_FEE_PERCENTAGE) / 100
  const freelancerAmount = price - platformFee
  
  return {
    totalPrice: price,
    platformFee: parseFloat(platformFee.toFixed(2)),
    freelancerAmount: parseFloat(freelancerAmount.toFixed(2)),
  }
}

/**
 * Calculate refund amount (price minus platform fee)
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
