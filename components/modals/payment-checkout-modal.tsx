'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { calculateOrderAmounts } from '@/lib/utils/payment-calculations'
import { createPaymentOrder, verifyPayment } from '@/lib/actions/payments'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentCheckoutModalProps {
  orderId: string
  servicePrice: number
  serviceName: string
  freelancerName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentCheckoutModal({
  orderId,
  servicePrice,
  serviceName,
  freelancerName,
  open,
  onOpenChange,
}: PaymentCheckoutModalProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [paymentAmounts, setPaymentAmounts] = useState<ReturnType<typeof calculateOrderAmounts>>()

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setIsScriptLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Calculate payment amounts
  useEffect(() => {
    if (servicePrice) {
      const amounts = calculateOrderAmounts(servicePrice)
      setPaymentAmounts(amounts)
    }
  }, [servicePrice])

  async function handlePayment() {
    if (!isScriptLoaded) {
      alert('Payment system is loading. Please try again in a moment.')
      return
    }

    setIsProcessing(true)

    try {
      // Create Razorpay order
      const orderResult = await createPaymentOrder(orderId)

      if (orderResult.error || !orderResult.data) {
        alert(orderResult.error || 'Failed to create payment order')
        setIsProcessing(false)
        return
      }

      const { orderId: razorpayOrderId, amount, currency } = orderResult.data

      // Check if we have a valid Razorpay key
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!razorpayKey || razorpayKey === '') {
        alert('⚠️ Payment gateway not configured. Please contact support.')
        setIsProcessing(false)
        return
      }

      // Configure Razorpay options
      const options = {
        key: razorpayKey,
        amount: amount * 100, // Convert to paise
        currency: currency,
        name: 'INNFILL',
        description: `Payment for ${serviceName}`,
        order_id: razorpayOrderId,
        // Don't prefill customer details - let Razorpay handle it
        // This allows QR code payments to work without email/contact
        notes: {
          order_id: orderId,
          freelancer_name: freelancerName,
        },
        theme: {
          color: '#10b981',
        },
        handler: async function (response: any) {
          // Payment successful, verify on backend
          setIsProcessing(true)

          const verifyResult = await verifyPayment({
            orderId: orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })

          if (verifyResult.error) {
            alert('Payment verification failed: ' + verifyResult.error)
            setIsProcessing(false)
            return
          }

          // Success!
          alert('✅ Payment successful! Order is now active.')
          onOpenChange(false)
          router.refresh()
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
          },
        },
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', function (response: any) {
        alert('Payment failed: ' + response.error.description)
        setIsProcessing(false)
      })

      // Close the dialog before opening Razorpay to avoid z-index conflicts
      onOpenChange(false)
      
      // Small delay to ensure dialog closes smoothly
      setTimeout(() => {
        razorpay.open()
      }, 100)
    } catch (error) {
      console.error('Payment error:', error)
      alert('An error occurred while processing payment')
      setIsProcessing(false)
    }
  }

  if (!paymentAmounts) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[650px] bg-gray-900 border-white/10 text-white overflow-y-auto ">
        <DialogHeader>
          <DialogTitle className="text-white">Complete Payment</DialogTitle>
          <DialogDescription className="text-gray-400">
            Review the payment details and complete the transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order Info */}
          <Card className="p-4 bg-white/5 border-white/10">
            <h4 className="font-medium mb-2 text-white">Order Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="font-medium text-white">{serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Freelancer:</span>
                <span className="text-gray-300">{freelancerName}</span>
              </div>
            </div>
          </Card>

          {/* Payment Breakdown */}
          <Card className="p-4 bg-white/5 border-white/10">
            <h4 className="font-medium mb-3 text-white">Payment Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Service Price</span>
                <span className="font-semibold text-white">₹{paymentAmounts.servicePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="pl-4 text-gray-500">+ GST (18% on 14% commission)</span>
                <span className="text-gray-400">₹{paymentAmounts.gstAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
                <span className="text-white">Total Amount</span>
                <span className="text-lg text-green-400">₹{paymentAmounts.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </Card>

          {/* Payment Note */}
          <div className="rounded-md bg-blue-500/10 border border-blue-500/20 p-3 text-sm">
            <p className="font-medium text-blue-400 mb-1">💡 How it works</p>
            <ul className="text-gray-300 text-xs space-y-1">
              <li>• Payment held securely until work is delivered and approved</li>
              <li>• Freelancer receives ₹{paymentAmounts.freelancerAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} upon completion (service price minus 14% commission)</li>
              <li>• GST charged on platform commission only (not full service price)</li>
              <li>• Service price (₹{paymentAmounts.servicePrice.toLocaleString('en-IN')}) refundable if cancelled, GST non-refundable</li>
            </ul>
          </div>

          {/* Security Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p className="flex items-center gap-2">
              <span>🔒</span>
              <span>Secured by Razorpay • PCI DSS Compliant</span>
            </p>
            <p className="flex items-center gap-2">
              <span>💳</span>
              <span>Accepts all major cards, UPI, NetBanking</span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !isScriptLoaded}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isProcessing
              ? 'Processing...'
              : !isScriptLoaded
              ? 'Loading...'
              : `Pay ₹${paymentAmounts.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
