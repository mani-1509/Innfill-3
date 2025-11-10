'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getOrderDetails,
  acceptOrder,
  declineOrder,
  markOrderInProgress,
  submitDelivery,
  requestRevision,
  completeOrder,
  cancelOrder,
  getSignedDownloadUrl,
} from '@/lib/actions/orders'
import { getChatRoomByOrderId } from '@/lib/actions/chat'
import { getRatingForOrder } from '@/lib/actions/ratings'
import { uploadOrderFiles } from '@/lib/utils/upload-utils'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiClock,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDownload,
  FiLink,
  FiFile,
  FiUpload,
  FiTrash2,
  FiMessageSquare,
  FiX,
  FiDollarSign,
  FiCreditCard,
  FiStar,
} from 'react-icons/fi'
import { PaymentStatusBanner } from '@/components/payment-status-banner'
import { PaymentCheckoutModal } from '@/components/modals/payment-checkout-modal'
import { RatingModal } from '@/components/modals/rating-modal'
import { calculateOrderAmounts } from '@/lib/utils/payment-calculations'

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

type OrderStatus =
  | 'pending_acceptance'
  | 'pending_payment'
  | 'accepted'
  | 'in_progress'
  | 'delivered'
  | 'revision_requested'
  | 'completed'
  | 'cancelled'
  | 'declined'

interface DeliveryHistoryItem {
  id: string
  version: number
  message: string
  delivery_files: string[]
  delivery_links: string[]
  status: 'delivered' | 'revision_requested' | 'approved'
  revision_message: string | null
  created_at: string
}

interface Order {
  id: string
  service: {
    id: string
    title: string
    images?: string[]
  }
  freelancer: {
    id: string
    username: string
    avatar_url: string
  }
  client: {
    id: string
    username: string
    avatar_url: string
  }
  plan_tier: string
  status: OrderStatus
  price: string
  delivery_days: number
  revisions_allowed: number
  revisions_used: number
  requirements: string
  requirement_files: string[]
  requirement_links: string[] | null
  delivery_files: string[] | null
  delivery_links: string[] | null
  accept_deadline: string
  payment_deadline?: string
  total_amount?: number
  platform_commission?: number
  gst_amount?: number
  created_at: string
  delivered_at?: string
  completed_at?: string
}

const statusTimeline = [
  { status: 'pending_acceptance', label: 'Order Placed', icon: FiClock },
  { status: 'accepted', label: 'Accepted', icon: FiCheckCircle },
  { status: 'in_progress', label: 'In Progress', icon: FiPackage },
  { status: 'delivered', label: 'Delivered', icon: FiCheckCircle },
  { status: 'completed', label: 'Completed', icon: FiCheckCircle },
]

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'client' | 'freelancer' | 'admin' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [chatRoomId, setChatRoomId] = useState<string | null>(null)

  // Delivery modal state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([])
  const [deliveryLinks, setDeliveryLinks] = useState<string[]>([''])

  // Revision modal state
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [revisionMessage, setRevisionMessage] = useState('')

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Chat closure notification state
  const [showChatClosureNotice, setShowChatClosureNotice] = useState(false)

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [ratingLoading, setRatingLoading] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
    fetchChatRoom()
    checkIfRated()
  }, [id])

  const checkIfRated = async () => {
    setRatingLoading(true)
    const result = await getRatingForOrder(id)
    if (result.success && result.data) {
      setHasRated(true)
    }
    setRatingLoading(false)
  }

  const fetchOrderDetails = async () => {
    setLoading(true)
    setError(null)

    const result = await getOrderDetails(id)

    if (result.error) {
      setError(result.error)
    } else if (result.order) {
      // Check if user has access to this order
      if (!result.role) {
        setError('You do not have permission to view this order')
        setLoading(false)
        return
      }
      
      setOrder(result.order)
      setDeliveryHistory(result.deliveryHistory || [])
      setUserRole(result.role)
    }

    setLoading(false)
  }

  const fetchChatRoom = async () => {
    const result = await getChatRoomByOrderId(id)
    if (result.success && result.data) {
      setChatRoomId(result.data.id)
    }
  }

  const handleAccept = async () => {
    setActionLoading(true)
    setActionError(null)

    const result = await acceptOrder(id)

    if (result.error) {
      setActionError(result.error)
    } else {
      await fetchOrderDetails()
      await fetchChatRoom() // Fetch chat room after accepting order
    }

    setActionLoading(false)
  }

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this order? The client will receive a full refund.')) {
      return
    }

    setActionLoading(true)
    setActionError(null)

    const result = await declineOrder(id)

    if (result.error) {
      setActionError(result.error)
    } else {
      await fetchOrderDetails()
    }

    setActionLoading(false)
  }

  const handleMarkInProgress = async () => {
    setActionLoading(true)
    setActionError(null)

    const result = await markOrderInProgress(id)

    if (result.error) {
      setActionError(result.error)
    } else {
      await fetchOrderDetails()
    }

    setActionLoading(false)
  }

  const handleDeliverySubmit = async () => {
    if (deliveryFiles.length === 0 && !deliveryLinks.some(link => link.trim())) {
      setActionError('Please provide at least one delivery file or link')
      return
    }

    setActionLoading(true)
    setActionError(null)

    try {
      // Get current user ID
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Upload files to Supabase Storage
      let uploadedFileUrls: string[] = []
      
      if (deliveryFiles.length > 0) {
        const { urls, errors } = await uploadOrderFiles(deliveryFiles, user.id, id)
        
        if (errors.length > 0) {
          setActionError(`File upload errors: ${errors.join(', ')}`)
          setActionLoading(false)
          return
        }
        
        uploadedFileUrls = urls
      }

      // Filter out empty links
      const validLinks = deliveryLinks.filter(link => link.trim())

      const result = await submitDelivery({
        orderId: id,
        message: 'Delivery submitted', // Default message
        deliveryFiles: uploadedFileUrls,
        deliveryLinks: validLinks.length > 0 ? validLinks : undefined,
      })

      if (result.error) {
        setActionError(result.error)
      } else {
        setShowDeliveryModal(false)
        setDeliveryFiles([])
        setDeliveryLinks([''])
        await fetchOrderDetails()
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit delivery')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRevisionRequest = async () => {
    if (!revisionMessage.trim()) {
      setActionError('Please provide revision details')
      return
    }

    setActionLoading(true)
    setActionError(null)

    const result = await requestRevision(id, revisionMessage)

    if (result.error) {
      setActionError(result.error)
    } else {
      setShowRevisionModal(false)
      setRevisionMessage('')
      await fetchOrderDetails()
    }

    setActionLoading(false)
  }

  const handleComplete = async () => {
    if (!confirm('Are you sure you want to mark this order as complete? Payment will be released to the freelancer.')) {
      return
    }

    setActionLoading(true)
    setActionError(null)

    const result = await completeOrder(id)

    if (result.error) {
      setActionError(result.error)
    } else {
      await fetchOrderDetails()
      // Show chat closure notification
      setShowChatClosureNotice(true)
    }

    setActionLoading(false)
  }

  const handleCancel = async () => {
    setActionLoading(true)
    setActionError(null)

    const result = await cancelOrder(id, cancelReason || undefined)

    if (result.error) {
      setActionError(result.error)
    } else {
      setShowCancelModal(false)
      setCancelReason('')
      await fetchOrderDetails()
    }

    setActionLoading(false)
  }

  const handleDownloadFile = async (fileUrl: string, index: number) => {
    try {
      // Get signed URL from server
      const result = await getSignedDownloadUrl(fileUrl);
      
      if (result.error || !result.url) {
        throw new Error(result.error || 'Failed to get download URL');
      }
      
      // Download using signed URL
      const response = await fetch(result.url);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `file-${index + 1}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Could not download the file. Please try again.');
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIndex = (status: OrderStatus) => {
    if (status === 'revision_requested') return 3 // Same as delivered
    if (status === 'cancelled') return -1
    return statusTimeline.findIndex((s) => s.status === status)
  }

  const addDeliveryLink = () => {
    setDeliveryLinks(prev => [...prev, ''])
  }

  const updateDeliveryLink = (index: number, value: string) => {
    setDeliveryLinks(prev => prev.map((link, i) => i === index ? value : link))
  }

  const removeDeliveryLink = (index: number) => {
    setDeliveryLinks(prev => prev.filter((_, i) => i !== index))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024
    const invalidFiles = files.filter(file => file.size > maxSize)
    
    if (invalidFiles.length > 0) {
      setActionError(`Some files exceed 5MB limit: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }
    
    setDeliveryFiles(prev => [...prev, ...files])
    setActionError(null)
  }

  const removeFile = (index: number) => {
    setDeliveryFiles(prev => prev.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-white/10 rounded-lg animate-pulse"></div>
          <div className="bg-white/5 rounded-2xl p-6 space-y-4">
            <div className="h-40 bg-white/10 rounded-lg animate-pulse"></div>
            <div className="h-6 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <FiAlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-red-400 text-xl mb-4">{error || 'Order not found'}</p>
        <Link
          href="/orders"
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          Back to Orders
        </Link>
      </div>
    )
  }

  const currentStatusIndex = getStatusIndex(order.status)
  const otherUser = userRole === 'client' ? order.freelancer : order.client

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Chat Closure Notice Popup */}
      <AnimatePresence>
        {showChatClosureNotice && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowChatClosureNotice(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
            >
              <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-full">
                        <FiAlertCircle className="w-6 h-6 text-orange-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Order Completed!</h3>
                    </div>
                    <button
                      onClick={() => setShowChatClosureNotice(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <p className="text-gray-300">
                    The order has been marked as complete. The chat room will automatically close in 24 hours.
                  </p>
                  
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FiClock className="w-4 h-4" />
                      <span>Chat will remain active for 24 hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FiMessageSquare className="w-4 h-4" />
                      <span>You can still send messages until then</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    {chatRoomId && (
                      <Link 
                        href={`/chat/${chatRoomId}`}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold text-center"
                        onClick={() => setShowChatClosureNotice(false)}
                      >
                        Go to Chat
                      </Link>
                    )}
                    <button
                      onClick={() => setShowChatClosureNotice(false)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders" className="text-gray-400 hover:text-white mb-4 inline-block">
            ← Back to Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-gray-400">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="text-2xl font-bold text-green-400">₹{order.price}</div>
          </div>
        </div>

        {/* Error Display */}
        {actionError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400">{actionError}</p>
          </div>
        )}

        {/* Payment Status Banner */}
        {order.status === 'pending_payment' && order.payment_deadline && (
          <div className="mb-6">
            <PaymentStatusBanner
              orderId={order.id}
              paymentDeadline={order.payment_deadline}
              isClient={userRole === 'client'}
              onPayClick={() => setShowPaymentModal(true)}
            />
          </div>
        )}

        {/* Status Timeline */}
        {order.status !== 'cancelled' && (
          <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Order Status</h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10"></div>
              <div
                className="absolute top-5 left-0 h-0.5 bg-green-400 transition-all duration-500"
                style={{
                  width: `${(currentStatusIndex / (statusTimeline.length - 1)) * 100}%`,
                }}
              ></div>

              {/* Timeline Steps */}
              <div className="relative flex justify-between">
                {statusTimeline.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = index <= currentStatusIndex
                  const isCurrent = index === currentStatusIndex

                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${
                          isCompleted
                            ? 'bg-green-400 border-green-400 text-black'
                            : 'bg-black border-white/20 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-green-400/20' : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <span
                        className={`text-xs text-center max-w-20 ${
                          isCompleted ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Info */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex gap-4">
                <img
                  src={order.service.images?.[0] || '/placeholder.jpg'}
                  alt={order.service.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <Link href={`/services/${order.service.id}`} className="hover:underline">
                    <h3 className="text-xl font-semibold mb-2">{order.service.title}</h3>
                  </Link>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span className="capitalize">{order.plan_tier} Plan</span>
                    <span>•</span>
                    <span>{order.delivery_days} days delivery</span>
                    <span>•</span>
                    <span>
                      {order.revisions_used}/{order.revisions_allowed} revisions used
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            {(order.status === 'pending_payment' || order.total_amount) && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FiDollarSign className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold">Payment Details</h3>
                </div>

                {(() => {
                  const amounts = calculateOrderAmounts(parseFloat(order.price))
                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-300">
                        <span>Service Price</span>
                        <span>₹{amounts.servicePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-gray-300 text-sm">
                        <span className="text-gray-400">GST (18% on 14% commission)</span>
                        <span className="text-gray-400">₹{amounts.gstAmount.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-white/10 my-2" />
                      <div className="flex justify-between text-white font-semibold text-lg">
                        <span>Total Amount (Client Pays)</span>
                        <span className="text-green-400">₹{amounts.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      {userRole === 'freelancer' && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <p className="text-sm text-gray-300 mb-2">Your Earnings:</p>
                            <p className="text-2xl font-bold text-green-400">₹{amounts.freelancerAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Service price minus 14% platform commission (₹{amounts.platformCommission.toFixed(2)})
                            </p>
                          </div>
                        </div>
                      )}

                      {order.status === 'pending_payment' && userRole === 'client' && (
                        <div className="mt-4">
                          <button
                            onClick={() => setShowPaymentModal(true)}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
                          >
                            <FiCreditCard className="w-5 h-5" />
                            Pay Now
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Requirements */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Requirements</h3>
              <p className="text-gray-300 whitespace-pre-wrap mb-4">{order.requirements}</p>

              {/* Requirement Files */}
              {order.requirement_files && order.requirement_files.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2 text-gray-400">Attached Files:</h4>
                  <div className="space-y-2">
                    {order.requirement_files.map((file, index) => (
                      <button
                        key={index}
                        onClick={() => handleDownloadFile(file, index)}
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <FiDownload className="w-4 h-4" />
                        Requirement File {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirement Links */}
              {order.requirement_links && order.requirement_links.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-400">External Links:</h4>
                  <div className="space-y-2">
                    {order.requirement_links.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 break-all"
                      >
                        <FiLink className="w-4 h-4 shrink-0" />
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Revision Requested Alert - Show prominently for freelancer */}
            {order.status === 'revision_requested' && userRole === 'freelancer' && deliveryHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-2xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-full flex-shrink-0">
                    <FiAlertCircle className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">
                      ⚠️ Revision Requested
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      The client has requested changes to your delivery. Please review their feedback below:
                    </p>
                    
                    <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                        <FiMessageSquare className="w-4 h-4" />
                        Client's Feedback:
                      </p>
                      <p className="text-white whitespace-pre-wrap">
                        {(() => {
                          // Find the latest delivery with revision message
                          const latestRevision = [...deliveryHistory]
                            .reverse()
                            .find(d => d.revision_message && d.status === 'revision_requested')
                          return latestRevision?.revision_message || 'No revision message provided'
                        })()}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                      <FiClock className="w-4 h-4" />
                      <span>
                        Revisions used: {order.revisions_used} / {order.revisions_allowed}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowDeliveryModal(true)}
                      className="mt-4 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                      <FiUpload className="w-5 h-5" />
                      Submit Updated Work
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Delivery (if delivered) */}
            {(order.status === 'delivered' || order.status === 'revision_requested' || order.status === 'completed') && deliveryHistory.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {deliveryHistory.length > 1 ? 'Delivery History' : 'Delivery'}
                  {deliveryHistory.length > 1 && (
                    <span className="text-sm text-gray-400 ml-2">({deliveryHistory.length} submissions)</span>
                  )}
                </h3>

                {/* Show all deliveries in reverse chronological order (latest first) */}
                <div className="space-y-6">
                  {[...deliveryHistory].reverse().map((delivery, index) => {
                    const isLatest = index === 0
                    const actualVersion = deliveryHistory.length - index

                    return (
                      <div
                        key={delivery.id}
                        className={`border border-white/10 rounded-xl p-4 ${
                          isLatest ? 'bg-white/5' : 'bg-white/[0.02]'
                        }`}
                      >
                        {/* Delivery Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-300">
                              Version {actualVersion}
                              {isLatest && (
                                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                  Latest
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(delivery.created_at)}
                            </span>
                          </div>
                          <div>
                            {delivery.status === 'approved' && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex items-center gap-1">
                                <FiCheckCircle className="w-3 h-3" />
                                Approved
                              </span>
                            )}
                            {delivery.status === 'revision_requested' && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded flex items-center gap-1">
                                <FiAlertCircle className="w-3 h-3" />
                                Revision Requested
                              </span>
                            )}
                            {delivery.status === 'delivered' && isLatest && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded flex items-center gap-1">
                                <FiPackage className="w-3 h-3" />
                                Pending Review
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delivery Message */}
                        {delivery.message && (
                          <p className="text-sm text-gray-300 mb-3">{delivery.message}</p>
                        )}

                        {/* Delivery Files */}
                        {delivery.delivery_files && delivery.delivery_files.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold mb-2 text-gray-400">Files:</h4>
                            <div className="space-y-1">
                              {delivery.delivery_files.map((file, fileIndex) => (
                                <button
                                  key={fileIndex}
                                  onClick={() => handleDownloadFile(file, fileIndex)}
                                  className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                                >
                                  <FiDownload className="w-4 h-4" />
                                  Delivery File {fileIndex + 1}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery Links */}
                        {delivery.delivery_links && delivery.delivery_links.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold mb-2 text-gray-400">Links:</h4>
                            <div className="space-y-1">
                              {delivery.delivery_links.map((link, linkIndex) => (
                                <a
                                  key={linkIndex}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 break-all"
                                >
                                  <FiLink className="w-4 h-4 shrink-0" />
                                  {link}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Revision Feedback (if applicable) */}
                        {delivery.revision_message && delivery.status === 'revision_requested' && (
                          <div className="mt-3 pt-3 border-t border-yellow-500/20">
                            <h4 className="text-xs font-semibold mb-1 text-yellow-400 flex items-center gap-1">
                              <FiAlertCircle className="w-3 h-3" />
                              Client Feedback:
                            </h4>
                            <p className="text-sm text-gray-300">{delivery.revision_message}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Other User Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">
                {userRole === 'client' ? 'Freelancer' : 'Client'}
              </h3>
              <Link href={`/profile/${otherUser.username}`} className="group">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={otherUser.avatar_url || 'https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small/profile-icon-design-free-vector.jpg'}
                    alt={otherUser.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold group-hover:text-gray-300">@{otherUser.username}</p>
                  </div>
                </div>
              </Link>
              {chatRoomId ? (
                <Link 
                  href={`/chat/${chatRoomId}`}
                  className="w-full py-2 px-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <FiMessageSquare className="w-4 h-4" />
                  Send Message
                </Link>
              ) : (
                <button 
                  disabled
                  className="w-full py-2 px-4 bg-white/5 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                  title="Chat will be available once order is accepted"
                >
                  <FiMessageSquare className="w-4 h-4" />
                  Send Message
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Actions</h3>

              {/* Admin View - No Actions */}
              {userRole === 'admin' && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">Viewing as Admin</p>
                  <p className="text-xs text-gray-500 mt-1">Read-only access</p>
                </div>
              )}

              {/* Order Completed */}
              {order.status === 'completed' && userRole !== 'admin' && (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <div className="mb-3">
                      <FiCheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                    </div>
                    <p className="text-lg font-semibold text-green-400 mb-1">Order Completed</p>
                    <p className="text-sm text-gray-400">
                      {userRole === 'freelancer' 
                        ? `Payment of ₹${calculateOrderAmounts(parseFloat(order.price)).freelancerAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} released to you`
                        : 'Thank you for your business!'}
                    </p>
                  </div>

                  {/* Rating Button */}
                  {!ratingLoading && (
                    <div className="pt-2 border-t border-white/10">
                      {hasRated ? (
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-yellow-400 mb-1">
                            <FiStar className="w-5 h-5 fill-current" />
                            <p className="font-semibold">You've rated this order</p>
                          </div>
                          <p className="text-xs text-gray-400">
                            Thank you for your feedback!
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowRatingModal(true)}
                          className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          <FiStar className="w-5 h-5" />
                          Rate {userRole === 'client' ? 'Freelancer' : 'Client'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Order Cancelled */}
              {order.status === 'cancelled' && userRole !== 'admin' && (
                <div className="text-center py-6">
                  <div className="mb-3">
                    <FiXCircle className="w-12 h-12 text-red-400 mx-auto" />
                  </div>
                  <p className="text-lg font-semibold text-red-400 mb-1">Order Cancelled</p>
                  <p className="text-sm text-gray-400">
                    {userRole === 'client' 
                      ? `Refund of ₹${parseFloat(order.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} processed (GST non-refundable)`
                      : 'This order has been cancelled'}
                  </p>
                </div>
              )}

              {/* Order Declined */}
              {order.status === 'declined' && userRole !== 'admin' && (
                <div className="text-center py-6">
                  <div className="mb-3">
                    <FiXCircle className="w-12 h-12 text-red-400 mx-auto" />
                  </div>
                  <p className="text-lg font-semibold text-red-400 mb-1">Order Declined</p>
                  <p className="text-sm text-gray-400">
                    {userRole === 'client' 
                      ? 'Full refund has been processed'
                      : 'You declined this order'}
                  </p>
                </div>
              )}

              {/* Freelancer Actions */}
              {userRole === 'freelancer' && order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'declined' && (
                <>
                  {order.status === 'pending_acceptance' && (
                    <>
                      <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Your Earnings:</p>
                        <p className="text-lg font-bold text-blue-400">
                          ₹{calculateOrderAmounts(parseFloat(order.price)).freelancerAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Service price (₹{parseFloat(order.price).toLocaleString('en-IN')}) minus 14% platform commission
                        </p>
                      </div>
                      <button
                        onClick={handleAccept}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? 'Processing...' : 'Accept Order'}
                      </button>
                      <button
                        onClick={handleDecline}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-red-500/10 border border-red-500/20 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? 'Processing...' : 'Decline Order'}
                      </button>
                    </>
                  )}

                  {order.status === 'pending_payment' && (
                    <div className="text-center py-4">
                      <div className="mb-2">
                        <FiClock className="w-8 h-8 text-yellow-400 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-400">Waiting for client payment</p>
                      <p className="text-xs text-gray-500 mt-1">Client has 48 hours to complete payment</p>
                      <div className="mt-3 p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">You'll earn:</p>
                        <p className="text-lg font-bold text-green-400">
                          ₹{calculateOrderAmounts(parseFloat(order.price)).freelancerAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === 'accepted' && (
                    <button
                      onClick={handleMarkInProgress}
                      disabled={actionLoading}
                      className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Processing...' : 'Start Working'}
                    </button>
                  )}

                  {(order.status === 'in_progress' || order.status === 'revision_requested') && (
                    <button
                      onClick={() => setShowDeliveryModal(true)}
                      disabled={actionLoading}
                      className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Delivery
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <div className="text-center py-4">
                      <div className="mb-2">
                        <FiClock className="w-8 h-8 text-blue-400 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-400">Waiting for client review</p>
                      <p className="text-xs text-gray-500 mt-1">Client can approve or request revisions</p>
                    </div>
                  )}
                </>
              )}

              {/* Client Actions */}
              {userRole === 'client' && order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'declined' && (
                <>
                  {order.status === 'delivered' && (
                    <>
                      <button
                        onClick={handleComplete}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? 'Processing...' : 'Approve & Complete'}
                      </button>
                      {order.revisions_used < order.revisions_allowed && (
                        <button
                          onClick={() => setShowRevisionModal(true)}
                          disabled={actionLoading}
                          className="w-full py-3 px-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-semibold rounded-lg hover:bg-yellow-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Request Revision ({order.revisions_allowed - order.revisions_used} left)
                        </button>
                      )}
                      <div className="mt-3 p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-gray-400">Upon completion:</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Freelancer receives ₹{calculateOrderAmounts(parseFloat(order.price)).freelancerAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </>
                  )}

                  {(order.status === 'pending_acceptance' || order.status === 'accepted' || order.status === 'in_progress') && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={actionLoading}
                      className="w-full py-3 px-4 bg-red-500/10 border border-red-500/20 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel Order
                    </button>
                  )}

                  {order.status === 'pending_acceptance' && (
                    <div className="text-center py-2 mt-2">
                      <p className="text-xs text-gray-500">Waiting for freelancer to accept</p>
                    </div>
                  )}

                  {order.status === 'in_progress' && (
                    <div className="text-center py-4">
                      <div className="mb-2">
                        <FiPackage className="w-8 h-8 text-blue-400 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-400">Freelancer is working</p>
                      <p className="text-xs text-gray-500 mt-1">You'll be notified when delivery is submitted</p>
                    </div>
                  )}

                  {order.status === 'revision_requested' && (
                    <div className="text-center py-4">
                      <div className="mb-2">
                        <FiAlertCircle className="w-8 h-8 text-yellow-400 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-400">Revision requested</p>
                      <p className="text-xs text-gray-500 mt-1">Waiting for freelancer to resubmit</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Modal */}
      <AnimatePresence>
        {showDeliveryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Submit Delivery</h2>
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Upload Files</label>
                  <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-white/20 rounded-lg hover:border-white/40 cursor-pointer transition-colors bg-white/5">
                    <FiUpload className="w-5 h-5" />
                    <span className="text-sm">Upload delivery files (Max 5MB each)</span>
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                  </label>

                  {deliveryFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {deliveryFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2">
                            <FiFile className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-300">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Links */}
                <div>
                  <label className="block text-sm font-semibold mb-2">External Links</label>
                  <div className="space-y-2">
                    {deliveryLinks.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => updateDeliveryLink(index, e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                        {deliveryLinks.length > 1 && (
                          <button
                            onClick={() => removeDeliveryLink(index)}
                            className="px-3 py-2 text-red-400 hover:text-red-300 border border-red-400/20 rounded-lg"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={addDeliveryLink} className="text-sm text-gray-400 hover:text-white">
                      + Add another link
                    </button>
                  </div>
                </div>

                {actionError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{actionError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeliverySubmit}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-white text-black font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Delivery'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Revision Modal */}
      <AnimatePresence>
        {showRevisionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Request Revision</h2>
                <button
                  onClick={() => setShowRevisionModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <textarea
                  value={revisionMessage}
                  onChange={(e) => setRevisionMessage(e.target.value)}
                  placeholder="Explain what changes you need..."
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                />

                {actionError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{actionError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRevisionModal(false)}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRevisionRequest}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Requesting...' : 'Request Revision'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Cancel Order</h2>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Are you sure you want to cancel this order?
                </p>
                
                {order.status === 'accepted' || order.status === 'in_progress' ? (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-sm text-blue-400 font-semibold mb-1">Refund Information:</p>
                    <p className="text-xs text-gray-400">
                      You'll receive ₹{parseFloat(order.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} back (service price only)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      GST amount (₹{calculateOrderAmounts(parseFloat(order.price)).gstAmount.toFixed(2)}) is non-refundable
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm text-green-400 font-semibold mb-1">No Payment Made</p>
                    <p className="text-xs text-gray-400">
                      Order can be cancelled without any charges
                    </p>
                  </div>
                )}

                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation (optional)"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                />

                {actionError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{actionError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Checkout Modal */}
      {showPaymentModal && order && (
        <PaymentCheckoutModal
          orderId={order.id}
          servicePrice={parseFloat(order.price)}
          serviceName={order.service.title}
          freelancerName={order.freelancer.username}
          open={showPaymentModal}
          onOpenChange={(open) => {
            setShowPaymentModal(open)
            if (!open) {
              fetchOrderDetails()
            }
          }}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && order && userRole && (userRole === 'client' || userRole === 'freelancer') && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false)
            checkIfRated()
          }}
          orderId={order.id}
          toUserId={userRole === 'client' ? order.freelancer.id : order.client.id}
          toUsername={userRole === 'client' ? order.freelancer.username : order.client.username}
          userRole={userRole}
        />
      )}
    </div>
  )
}
