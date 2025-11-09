// =====================================================
// PAYMENT CALCULATION UTILITIES
// =====================================================
// Pure functions for payment calculations
// No database access, no side effects

/**
 * Calculate payment breakdown for an order
 * 
 * PAYMENT MODEL:
 * For a service listed at ₹10,000:
 * - Service Price: ₹10,000
 * - Platform Commission (14% of ₹10,000): ₹1,400
 * - GST (18% on commission): ₹252
 * - Client pays: ₹10,000 + ₹252 = ₹10,252
 * - Freelancer gets: ₹10,000 - ₹1,400 = ₹8,600
 * - Platform keeps: ₹1,400 (commission only)
 * 
 * Note: 
 * - Client pays service price + GST (on commission)
 * - Freelancer pays 14% commission from service price
 * - Platform keeps commission, GST goes to government
 * - Razorpay fee handled separately by payment gateway
 */
export function calculateOrderAmounts(servicePrice: number) {
  // Round to 2 decimal places
  const round = (num: number) => Math.round(num * 100) / 100

  // Platform commission: 14% of service price (deducted from freelancer)
  const platformCommission = round(servicePrice * 0.14)
  
  // GST: 18% on the commission (charged to client)
  const gstAmount = round(platformCommission * 0.18)
  
  // Client pays: service price + GST on commission
  const totalAmount = round(servicePrice + gstAmount)
  
  // Freelancer receives: service price - commission
  const freelancerAmount = round(servicePrice - platformCommission)
  
  // Platform revenue: just the commission (GST goes to government)
  const platformNetRevenue = platformCommission
  
  // Gateway fee not calculated separately (handled by Razorpay)
  const gatewayFee = 0

  return {
    servicePrice, // Listed price (what freelancer set)
    platformCommission, // 14% of service price (deducted from freelancer)
    gatewayFee, // Not shown separately
    gstAmount, // 18% of commission (paid by client)
    totalAmount, // What client pays (service + GST)
    platformNetRevenue, // Commission kept by platform
    freelancerAmount, // Service price - commission
  }
}

/**
 * Calculate refund amount when order is cancelled after payment
 * Client gets back: service price (₹10,000)
 * Platform may keep GST if already paid to government
 */
export function calculateRefundAmount(totalAmount: number, platformCommission: number, gstAmount: number) {
  const round = (num: number) => Math.round(num * 100) / 100
  
  // Client gets refund of service price only (GST non-refundable)
  const refundAmount = round(totalAmount - gstAmount)
  
  // Platform loses commission revenue
  const platformNetRevenue = 0
  
  return {
    totalAmount,
    platformCommission,
    gstAmount,
    platformNetRevenue,
    refundAmount,
  }
}
