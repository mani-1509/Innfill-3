'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createRating } from '@/lib/actions/ratings'
import { FiStar, FiX } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  toUserId: string
  toUsername: string
  userRole: 'client' | 'freelancer'
}

export function RatingModal({
  isOpen,
  onClose,
  orderId,
  toUserId,
  toUsername,
  userRole,
}: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setSubmitting(true)
    const result = await createRating({
      orderId,
      toUserId,
      rating,
      review,
    })

    if (result.success) {
      alert('Rating submitted successfully! ⭐')
      onClose()
      // Reload the page to show the new rating
      window.location.reload()
    } else {
      alert(result.error || 'Failed to submit rating')
    }
    setSubmitting(false)
  }

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 1:
        return 'Poor'
      case 2:
        return 'Fair'
      case 3:
        return 'Good'
      case 4:
        return 'Very Good'
      case 5:
        return 'Excellent'
      default:
        return 'Select a rating'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Rate your experience
              </h2>
              <p className="text-sm text-white/60">
                How was working with <span className="text-purple-400">@{toUsername}</span>?
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <FiStar
                    className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-lg font-semibold text-white">
              {getRatingLabel(hoverRating || rating)}
            </p>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Share your feedback (optional)
            </label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={`Tell us about your experience working with ${toUsername}...`}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-white/40 mt-1 text-right">
              {review.length}/500
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/5"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                '⭐ Submit Rating'
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </Dialog>
  )
}
