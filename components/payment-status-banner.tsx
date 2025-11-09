'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, AlertCircle } from 'lucide-react'
import { checkPaymentDeadline } from '@/lib/actions/payments'

interface PaymentStatusBannerProps {
  orderId: string
  paymentDeadline: string
  isClient: boolean
  onPayClick?: () => void
}

export function PaymentStatusBanner({
  orderId,
  paymentDeadline,
  isClient,
  onPayClick,
}: PaymentStatusBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const updateCountdown = () => {
      const deadline = new Date(paymentDeadline)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setIsExpired(true)
        setTimeRemaining('Expired')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      // Mark as urgent if less than 6 hours remaining
      setIsUrgent(hours < 6)

      // Format time remaining
      if (hours > 24) {
        const days = Math.floor(hours / 24)
        const remainingHours = hours % 24
        setTimeRemaining(`${days}d ${remainingHours}h remaining`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`)
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s remaining`)
      }
    }

    // Update immediately
    updateCountdown()

    // Update every second
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [paymentDeadline])

  if (isExpired) {
    return (
      <Card className="border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 mb-1">
              Payment Deadline Expired
            </h4>
            <p className="text-sm text-red-700">
              {isClient
                ? 'The payment deadline has passed. This order will be cancelled automatically.'
                : 'The client did not complete payment within 48 hours. This order will be cancelled.'}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (isClient) {
    return (
      <Card
        className={`p-4 ${
          isUrgent
            ? 'border-orange-200 bg-orange-50'
            : 'border-blue-200 bg-blue-50'
        }`}
      >
        <div className="flex items-start gap-3">
          <Clock
            className={`h-5 w-5 mt-0.5 ${
              isUrgent ? 'text-orange-600' : 'text-blue-600'
            }`}
          />
          <div className="flex-1">
            <h4
              className={`font-semibold mb-1 ${
                isUrgent ? 'text-orange-900' : 'text-blue-900'
              }`}
            >
              {isUrgent ? '⚠️ Urgent: Complete Payment' : 'Payment Required'}
            </h4>
            <p
              className={`text-sm mb-3 ${
                isUrgent ? 'text-orange-700' : 'text-blue-700'
              }`}
            >
              The freelancer has accepted your order. Please complete the payment
              within <strong>{timeRemaining}</strong> to proceed.
            </p>
            {onPayClick && (
              <Button
                onClick={onPayClick}
                size="sm"
                className={isUrgent ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                Complete Payment Now
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // For freelancer view
  return (
    <Card className="border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-900 mb-1">
            Awaiting Client Payment
          </h4>
          <p className="text-sm text-amber-700">
            You've accepted this order. The client has <strong>{timeRemaining}</strong> to
            complete payment. If they don't pay, the order will be cancelled automatically.
          </p>
        </div>
      </div>
    </Card>
  )
}
