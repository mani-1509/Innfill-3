'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUserOrders } from '@/lib/actions/orders'
import { calculateOrderAmounts } from '@/lib/utils/payment-calculations'
import { motion } from 'framer-motion'
import {
  FiClock,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFilter,
  FiSearch,
} from 'react-icons/fi'

type OrderStatus =
  | 'pending_acceptance'
  | 'pending_payment'
  | 'accepted'
  | 'in_progress'
  | 'delivered'
  | 'revision_requested'
  | 'completed'
  | 'cancelled'

interface Order {
  id: string
  service: {
    id: string
    title: string
    images?: string[]
  }
  freelancer?: {
    username: string
    avatar_url: string
  }
  client?: {
    username: string
    avatar_url: string
  }
  plan_tier: string
  status: OrderStatus
  price: string
  delivery_days: number
  accept_deadline: string
  created_at: string
  delivered_at?: string
  completed_at?: string
  // Payment fields
  payment_deadline?: string
  total_amount?: number
  platform_commission?: number
  gst_amount?: number
}

const statusConfig = {
  pending_acceptance: {
    label: 'Pending Acceptance',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    icon: FiClock,
  },
  pending_payment: {
    label: 'Awaiting Payment',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    icon: FiAlertCircle,
  },
  accepted: {
    label: 'Accepted',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    icon: FiCheckCircle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    icon: FiPackage,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
    icon: FiCheckCircle,
  },
  revision_requested: {
    label: 'Revision Requested',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    icon: FiAlertCircle,
  },
  completed: {
    label: 'Completed',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: FiCheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    icon: FiXCircle,
  },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'client' | 'freelancer' | 'admin' | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)

    const result = await getUserOrders()

    if (result.error) {
      setError(result.error)
    } else if (result.orders) {
      setOrders(result.orders)
      setUserRole(result.role || null)
    }

    setLoading(false)
  }

  const getFilteredOrders = () => {
    let filtered = orders

    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter((order) =>
        ['pending_acceptance', 'pending_payment', 'accepted', 'in_progress', 'delivered', 'revision_requested'].includes(order.status)
      )
    } else if (activeTab === 'completed') {
      filtered = filtered.filter((order) => order.status === 'completed')
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter((order) => order.status === 'cancelled')
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.service.title.toLowerCase().includes(query) ||
          order.freelancer?.username.toLowerCase().includes(query) ||
          order.client?.username.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const calculateTimeRemaining = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h remaining`
    
    const days = Math.floor(hours / 24)
    return `${days}d remaining`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-48 bg-white/10 rounded-lg animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 space-y-4">
                <div className="h-40 bg-white/10 rounded-lg animate-pulse"></div>
                <div className="h-6 bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <FiAlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-red-400 text-xl mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          Try Again
        </button>
      </div>
    )
  }

  const filteredOrders = getFilteredOrders()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {userRole === 'admin' 
                ? 'All Orders (Admin)' 
                : userRole === 'client' 
                ? 'My Orders' 
                : 'Orders Received'}
            </h1>
            <p className="text-gray-400">
              {userRole === 'admin'
                ? 'View and monitor all platform orders'
                : userRole === 'client'
                ? 'Track and manage your service orders'
                : 'Manage orders from your clients'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All Orders', count: orders.length },
            {
              key: 'active',
              label: 'Active',
              count: orders.filter((o) =>
                ['pending_acceptance', 'pending_payment', 'accepted', 'in_progress', 'delivered', 'revision_requested'].includes(o.status)
              ).length,
            },
            {
              key: 'completed',
              label: 'Completed',
              count: orders.filter((o) => o.status === 'completed').length,
            },
            {
              key: 'cancelled',
              label: 'Cancelled',
              count: orders.filter((o) => o.status === 'cancelled').length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : activeTab === 'all'
                ? userRole === 'client'
                  ? "You haven't placed any orders yet"
                  : userRole === 'admin'
                  ? "No orders in the system yet"
                  : "You haven't received any orders yet"
                : `No ${activeTab} orders`}
            </p>
            {userRole === 'client' && !searchQuery && activeTab === 'all' && (
              <Link
                href="/services"
                className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Browse Services
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon

              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer group"
                  >
                    {/* Service Image */}
                    <div className="aspect-video w-full bg-white/10 overflow-hidden">
                      <img
                        src={order.service.images?.[0] || '/placeholder.jpg'}
                        alt={order.service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Title */}
                      <h3 className="font-semibold text-lg line-clamp-2">{order.service.title}</h3>

                      {/* Status Badge */}
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[order.status].bg} ${statusConfig[order.status].border} ${statusConfig[order.status].color} border`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig[order.status].label}
                      </div>

                      {/* Order Details */}
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center justify-between">
                          <span>Order ID:</span>
                          <span className="text-white font-mono">{order.id.slice(0, 8)}</span>
                        </div>
                        {userRole === 'admin' ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span>Client:</span>
                              <span className="text-white">@{order.client?.username}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Freelancer:</span>
                              <span className="text-white">@{order.freelancer?.username}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>{userRole === 'client' ? 'Freelancer:' : 'Client:'}</span>
                            <span className="text-white">@{userRole === 'client' ? order.freelancer?.username : order.client?.username}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>Plan:</span>
                          <span className="text-white capitalize">{order.plan_tier}</span>
                        </div>
                        
                        {/* Payment Information */}
                        {order.status === 'pending_payment' && userRole === 'client' && order.total_amount ? (
                          <>
                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                              <span className="font-semibold text-orange-400">Amount to Pay:</span>
                              <span className="text-orange-400 font-bold text-lg">₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span>Service + GST on commission</span>
                              <span className="text-gray-500">Base: ₹{parseFloat(order.price).toLocaleString('en-IN')}</span>
                            </div>
                          </>
                        ) : order.status === 'pending_payment' && userRole === 'freelancer' ? (
                          <>
                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                              <span className="font-semibold text-yellow-400">Awaiting Payment</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">You'll earn:</span>
                              <span className="text-green-400 font-semibold">₹{(() => {
                                const amounts = calculateOrderAmounts(parseFloat(order.price))
                                return amounts.freelancerAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                              })()}</span>
                            </div>
                          </>
                        ) : order.total_amount && ['completed', 'in_progress', 'delivered', 'accepted'].includes(order.status) ? (
                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <span>{userRole === 'client' ? 'Paid:' : 'Earnings:'}</span>
                            <span className="text-green-400 font-bold">
                              ₹{userRole === 'client' 
                                ? order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : (() => {
                                    const amounts = calculateOrderAmounts(parseFloat(order.price))
                                    return amounts.freelancerAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                                  })()
                              }
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>Price:</span>
                            <span className="text-green-400 font-bold">₹{parseFloat(order.price).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>

                      {/* Pay Now Button */}
                      {order.status === 'pending_payment' && userRole === 'client' && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            window.location.href = `/orders/${order.id}`
                          }}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
                        >
                          Pay Now - ₹{order.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </button>
                      )}

                      {/* Timeline */}
                      <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Created:</span>
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        {order.status === 'pending_acceptance' && (
                          <div className="flex items-center justify-between">
                            <span>Acceptance deadline:</span>
                            <span className={`font-semibold ${
                              calculateTimeRemaining(order.accept_deadline) === 'Expired'
                                ? 'text-red-400'
                                : 'text-yellow-400'
                            }`}>
                              {calculateTimeRemaining(order.accept_deadline)}
                            </span>
                          </div>
                        )}
                        {order.status === 'pending_payment' && order.payment_deadline && (
                          <div className="flex items-center justify-between">
                            <span>Payment deadline:</span>
                            <span className={`font-semibold ${
                              calculateTimeRemaining(order.payment_deadline) === 'Expired'
                                ? 'text-red-400'
                                : 'text-orange-400'
                            }`}>
                              {calculateTimeRemaining(order.payment_deadline)}
                            </span>
                          </div>
                        )}
                        {order.delivered_at && (
                          <div className="flex items-center justify-between">
                            <span>Delivered:</span>
                            <span>{formatDate(order.delivered_at)}</span>
                          </div>
                        )}
                        {order.completed_at && (
                          <div className="flex items-center justify-between">
                            <span>Completed:</span>
                            <span>{formatDate(order.completed_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
