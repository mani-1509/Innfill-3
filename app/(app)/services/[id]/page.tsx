'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getService } from '@/lib/actions/services'
import { createOrder } from '@/lib/actions/orders'
import { uploadOrderFiles } from '@/lib/utils/upload-utils'
import { createClient } from '@/lib/supabase/client'
import { calculateOrderAmounts } from '@/lib/utils/payment-calculations'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiClock,
  FiCheck,
  FiHeart,
  FiShare2,
  FiMessageSquare,
  FiX,
  FiUpload,
  FiLink,
  FiTrash2,
  FiFile,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi'

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
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  // Order form state
  const [requirements, setRequirements] = useState('')
  const [requirementFiles, setRequirementFiles] = useState<File[]>([])
  const [requirementLinks, setRequirementLinks] = useState<string[]>([''])
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  useEffect(() => {
    fetchService()
  }, [id])

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

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setShowCopyNotification(true)
      setTimeout(() => setShowCopyNotification(false), 3000)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy link')
    }
  }

  const handleContinue = () => {
    setShowOrderModal(true)
    setOrderError(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024
    const invalidFiles = files.filter(file => file.size > maxSize)
    
    if (invalidFiles.length > 0) {
      setOrderError(`Some files exceed 5MB limit: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }
    
    setRequirementFiles(prev => [...prev, ...files])
    setOrderError(null)
  }

  const removeFile = (index: number) => {
    setRequirementFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addLinkField = () => {
    setRequirementLinks(prev => [...prev, ''])
  }

  const updateLink = (index: number, value: string) => {
    setRequirementLinks(prev => prev.map((link, i) => i === index ? value : link))
  }

  const removeLink = (index: number) => {
    setRequirementLinks(prev => prev.filter((_, i) => i !== index))
  }

  const validateLinks = (): boolean => {
    const filledLinks = requirementLinks.filter(link => link.trim())
    
    for (const link of filledLinks) {
      try {
        new URL(link)
      } catch {
        setOrderError('Please enter valid URLs for all links')
        return false
      }
    }
    
    return true
  }

  const createOrderHandler = async () => {
    if (!requirements.trim()) {
      setOrderError('Please provide order requirements')
      return
    }

    if (!validateLinks()) {
      return
    }

    setIsCreatingOrder(true)
    setOrderError(null)

    try {
      const plan = getSelectedPlanDetails()
      if (!plan) {
        setOrderError('Selected plan not found')
        return
      }

      // Get current user ID
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Upload files to Supabase Storage
      let uploadedFileUrls: string[] = []
      
      if (requirementFiles.length > 0) {
        const { urls, errors } = await uploadOrderFiles(requirementFiles, user.id)
        
        if (errors.length > 0) {
          setOrderError(`File upload errors: ${errors.join(', ')}`)
          setIsCreatingOrder(false)
          return
        }
        
        uploadedFileUrls = urls
      }

      // Filter out empty links
      const validLinks = requirementLinks.filter(link => link.trim())

      const result = await createOrder({
        serviceId: service.id,
        planTier: selectedPlan.toLowerCase() as 'basic' | 'standard' | 'premium',
        requirements,
        requirementFiles: uploadedFileUrls,
        requirementLinks: validLinks.length > 0 ? validLinks : undefined,
      })

      if (result.error) {
        setOrderError(result.error)
        return
      }

      // Success! Redirect to order details page
      router.push(`/orders/${result.orderId}`)
    } catch (err: any) {
      setOrderError(err.message || 'Failed to create order')
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const getSelectedPlanDetails = () => {
    // Case-insensitive matching to handle "Standard" vs "standard"
    return service.plans.find((plan: any) => 
      plan.tier.toLowerCase() === selectedPlan.toLowerCase()
    )
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
      {/* Copy Notification */}
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg flex items-center gap-2"
          >
            <FiCheck className="w-5 h-5" />
            <span className="font-semibold">Link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

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
                      onClick={handleShare}
                      className="p-2 border border-white/20 text-white rounded-lg hover:bg-white/10"
                      title="Share service"
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
                {["Basic", "Standard", "Premium"].map((tier) => (
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
            </div>
          </div>
        </div>
      </div>

      {/* Order Creation Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Place Your Order</h2>
              <button
                onClick={() => setShowOrderModal(false)}
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

                {/* Requirements Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Order Requirements *
                    </label>
                    <textarea
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Describe what you need in detail. Include any specific requirements, preferences, or guidelines..."
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                    />
                  </div>

                  {/* File Upload Section */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Attach Files (Optional)
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-white/20 rounded-lg hover:border-white/40 cursor-pointer transition-colors bg-white/5">
                        <FiUpload className="w-5 h-5" />
                        <span className="text-sm">Upload files (Max 5MB each)</span>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.zip"
                        />
                      </label>

                      {/* File Preview */}
                      {requirementFiles.length > 0 && (
                        <div className="space-y-2">
                          {requirementFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <FiFile className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                              <button
                                onClick={() => removeFile(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* External Links Section */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      External Links (Optional)
                    </label>
                    <div className="space-y-2">
                      {requirementLinks.map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="flex-1 relative">
                            <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="url"
                              value={link}
                              onChange={(e) => updateLink(index, e.target.value)}
                              placeholder="https://drive.google.com/... or Dropbox link"
                              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                            />
                          </div>
                          {requirementLinks.length > 1 && (
                            <button
                              onClick={() => removeLink(index)}
                              className="px-3 py-2 text-red-400 hover:text-red-300 border border-red-400/20 rounded-lg hover:bg-red-400/10 transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addLinkField}
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                      >
                        <FiLink className="w-4 h-4" />
                        Add another link
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <FiInfo className="w-5 h-5 text-green-400" />
                    <h4 className="font-semibold text-green-400">Payment Breakdown</h4>
                  </div>

                  {(() => {
                    const servicePrice = parseFloat(getSelectedPlanDetails()?.price || '0')
                    const amounts = calculateOrderAmounts(servicePrice)
                    
                    return (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Service Price</span>
                            <span className="text-white font-semibold">₹{amounts.servicePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400 pl-2">+ GST (18% on 14% commission)</span>
                            <span className="text-gray-400">₹{amounts.gstAmount.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="h-px bg-green-500/20 my-3" />

                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">Total Amount</span>
                          <span className="text-green-400 font-bold text-2xl">
                            ₹{amounts.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3 mt-4 space-y-2">
                          <div className="flex items-start gap-2">
                            <FiAlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                            <div className="text-xs text-gray-300">
                              <p className="font-semibold text-blue-400 mb-1">Payment Process:</p>
                              <ul className="space-y-1 list-disc list-inside text-gray-400">
                                <li>Order created without payment</li>
                                <li>Freelancer has 48 hours to accept</li>
                                <li>You pay only after acceptance</li>
                                <li>48-hour payment window after acceptance</li>
                                <li>Freelancer receives ₹{amounts.freelancerAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (service price minus 14% commission)</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Error Display */}
                {orderError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{orderError}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    disabled={isCreatingOrder}
                    className="flex-1 py-3 px-4 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createOrderHandler}
                    disabled={isCreatingOrder || !requirements.trim()}
                    className="flex-1 py-3 px-4 bg-white text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingOrder ? 'Creating Order...' : 'Place Order'}
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
