'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getService } from '@/lib/actions/services'
import { motion } from 'framer-motion'
import {
  FiClock,
  FiCheck,
  FiHeart,
  FiShare2,
  FiMessageSquare,
  FiX,
} from 'react-icons/fi'

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any
  }
}

interface ServiceDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<string>('Standard')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    fetchService()
    loadRazorpay()
  }, [id])

  const loadRazorpay = () => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setRazorpayLoaded(true)
    document.body.appendChild(script)
  }

  const fetchService = async () => {
    setLoading(true)
    setError(null)

    const result = await getService(id)

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setService(result.data)
      // Set first image as selected by default
      if (result.data.thumbnail_url) {
        setSelectedImage(result.data.thumbnail_url)
      }
    }

    setLoading(false)
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    // TODO: Implement like functionality with backend
  }

  const handleContinue = () => {
    setShowReviewModal(true)
  }

  const processPayment = async () => {
    if (!razorpayLoaded) {
      setPaymentError('Payment gateway is loading. Please try again.')
      return
    }

    setIsProcessingPayment(true)
    setPaymentError(null)

    try {
      const plan = getSelectedPlanDetails()
      if (!plan) return

      // TODO: Create order on backend and get order ID
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: parseFloat(plan.price) * 100, // Amount in paise
        currency: 'INR',
        name: 'INNFILL',
        description: `${service.title} - ${plan.tier} Plan`,
        image: '/logo.png',
        handler: function (response: any) {
          // Payment successful
          console.log('Payment successful:', response)
          router.push(`/orders/${response.razorpay_payment_id}`)
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#3b82f6',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      setPaymentError(err.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const getSelectedPlanDetails = () => {
    return service.plans.find((plan: any) => plan.tier === selectedPlan)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Image Skeleton */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="aspect-video w-full bg-white/10 rounded-2xl animate-pulse"
              ></motion.div>

              {/* Thumbnail Gallery Skeleton */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-4 gap-4"
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-video bg-white/10 rounded-lg animate-pulse"
                  ></div>
                ))}
              </motion.div>

              {/* Title Skeleton */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4"
              >
                <div className="h-10 w-3/4 bg-white/10 rounded-lg animate-pulse"></div>
                <div className="flex gap-4">
                  <div className="h-6 w-24 bg-white/10 rounded-full animate-pulse"></div>
                  <div className="h-6 w-32 bg-white/10 rounded-full animate-pulse"></div>
                </div>
              </motion.div>

              {/* Description Skeleton */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-3"
              >
                <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse"></div>
              </motion.div>
            </div>

            {/* Right Column Skeleton - Pricing Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6 sticky top-8"
              >
                <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse"></div>
                <div className="h-12 w-full bg-white/10 rounded-xl animate-pulse"></div>
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-4 w-full bg-white/10 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
                <div className="h-14 w-full bg-white/10 rounded-full animate-pulse"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">{error || "Service not found"}</p>
        <Link
          href="/services"
          className="px-4 py-2 bg-white text-black font-semibold rounded-lg"
        >
          Back to Services
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Description */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white/10">
                <img
                  src={selectedImage || (service.images && service.images[0]) || '/placeholder.jpg'}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {(service.images || []).map(
                  (image: string, index: number) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(image)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 ${
                        selectedImage === image
                          ? "border-white"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  )
                )}
              </div>
            </div>

            {/* Service Description */}
            <div className="modern-card p-6 space-y-6">
              <h1 className="text-3xl font-bold">{service.title}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  {getSelectedPlanDetails()?.delivery_time_days} days delivery
                </span>
                <span>•</span>
                <span>{service.category}</span>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">
                {service.description}
              </p>
            </div>

            {/* Freelancer Profile */}
            <div className="modern-card p-6">
              <div className="flex items-start gap-4">
                <Link href={`/profile/${service.freelancer?.username || ''}`}>
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10">
                    <img
                      src={service.freelancer?.avatar_url || '/avatar-placeholder.png'}
                      alt={service.freelancer?.username || 'Freelancer'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1">
                  <Link
                    href={`/profile/${service.freelancer?.username || ''}`}
                    className="text-xl font-semibold hover:text-gray-300 transition-colors"
                  >
                    @{service.freelancer?.username || 'Unknown'}
                  </Link>
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <span>{service.category}</span>
                  </div>
                  <p className="text-gray-300">{service.freelancer?.bio || 'No bio available'}</p>
                  <div className="flex gap-2 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-white text-black font-semibold rounded-lg"
                    >
                      Contact Me
                    </motion.button>
                    {userRole === 'client' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleLike}
                        className={`p-2 border rounded-lg transition-colors ${
                          isLiked 
                            ? 'border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                            : 'border-white/20 text-white hover:bg-white/10'
                        }`}
                        title={isLiked ? 'Unlike service' : 'Like service'}
                      >
                        <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 border border-white/20 text-white rounded-lg hover:bg-white/10"
                    >
                      <FiShare2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing Plans */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 modern-card p-6 space-y-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              {/* Plan Selector */}
              <div className="grid grid-cols-3 gap-2">
                {["Standard", "Pro", "Premium"].map((tier) => (
                  <motion.button
                    key={tier}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPlan(tier)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      selectedPlan === tier
                        ? "bg-white text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {tier}
                  </motion.button>
                ))}
              </div>

              {/* Selected Plan Details */}
              {getSelectedPlanDetails() && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold">
                      ₹{getSelectedPlanDetails()?.price}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400">
                      <FiClock className="w-4 h-4" />
                      {getSelectedPlanDetails()?.delivery_time_days} days
                    </div>
                  </div>

                  <p className="text-gray-300">
                    {getSelectedPlanDetails()?.description}
                  </p>

                  <div className="space-y-3">
                    {getSelectedPlanDetails()?.deliverables?.map(
                      (deliverable: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-gray-300"
                        >
                          <FiCheck className="w-5 h-5 text-green-400 shrink-0" />
                          <span>{deliverable}</span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinue}
                      className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-white/20 transition-all duration-300"
                    >
                      Continue (₹{getSelectedPlanDetails()?.price})
                    </motion.button>
                  </div>

                  <div className="text-center text-sm text-gray-400">
                    {getSelectedPlanDetails()?.revisions_included} revisions
                    included
                  </div>
                </div>
              )}

              {/* Contact Section */}
              <div className="pt-6 border-t border-white/10">
                <h4 className="font-semibold mb-4">Need help?</h4>
                <div className="space-y-2">
                  <button className="w-full py-2 px-4 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2">
                    <FiMessageSquare className="w-5 h-5" />
                    Message Seller
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Review Your Order</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {service && getSelectedPlanDetails() && (
              <div className="space-y-6">
                {/* Service Summary */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10">
                      <img
                        src={(service.images && service.images[0]) || '/placeholder.jpg'}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{service.title}</h3>
                      <p className="text-gray-400 text-sm">{service.category}</p>
                      <p className="text-gray-400 text-sm">by @{service.freelancer?.username}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{getSelectedPlanDetails()?.tier} Plan</span>
                      <span className="text-green-400 font-bold">₹{getSelectedPlanDetails()?.price}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        {getSelectedPlanDetails()?.delivery_time_days} days delivery
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <FiCheck className="w-4 h-4" />
                        {getSelectedPlanDetails()?.revisions_included} revisions included
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deliverables */}
                <div>
                  <h4 className="font-semibold mb-3">What you'll get:</h4>
                  <div className="space-y-2">
                    {getSelectedPlanDetails()?.deliverables?.map((deliverable: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <FiCheck className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span>{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Error */}
                {paymentError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm mb-2">{paymentError}</p>
                    <button
                      onClick={() => {
                        setPaymentError(null)
                        processPayment()
                      }}
                      className="text-red-400 hover:text-red-300 text-sm underline"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-3 px-4 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={isProcessingPayment || !razorpayLoaded}
                    className="flex-1 py-3 px-4 bg-white text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? 'Processing...' : 
                     !razorpayLoaded ? 'Loading Payment...' : 
                     `Pay ₹{getSelectedPlanDetails()?.price}`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
