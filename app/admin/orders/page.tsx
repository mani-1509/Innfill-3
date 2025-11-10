'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Search, ExternalLink } from 'lucide-react'

interface Order {
  id: string
  status: string
  price: number
  total_amount: number
  created_at: string
  plan_tier: string
  client: {
    username: string
    display_name: string
  }
  freelancer: {
    username: string
    display_name: string
  }
  service_plan: {
    title: string
  }
  payment: Array<{
    status: string
    transferred_to_freelancer: boolean
  }>
}

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchQuery, statusFilter, orders])

  async function loadOrders() {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        price,
        total_amount,
        created_at,
        plan_tier,
        client:profiles!orders_client_id_fkey(username, display_name),
        freelancer:profiles!orders_freelancer_id_fkey(username, display_name),
        service_plan:service_plans(title),
        payment:payments(status, transferred_to_freelancer)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading orders:', error)
    } else {
      setOrders(data as any || [])
    }
    setLoading(false)
  }

  function filterOrders() {
    let filtered = orders

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(o =>
        o.id.toLowerCase().includes(query) ||
        o.client?.username?.toLowerCase().includes(query) ||
        o.freelancer?.username?.toLowerCase().includes(query) ||
        o.service_plan?.title?.toLowerCase().includes(query)
      )
    }

    setFilteredOrders(filtered)
  }

  const statusColors: Record<string, string> = {
    'pending_acceptance': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'pending_payment': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'accepted': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'in_progress': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'delivered': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'revision_requested': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'completed': 'bg-green-500/20 text-green-300 border-green-500/30',
    'cancelled': 'bg-red-500/20 text-red-300 border-red-500/30',
    'declined': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  }

  const stats = {
    total: orders.length,
    active: orders.filter(o => ['pending_acceptance', 'pending_payment', 'accepted', 'in_progress', 'delivered'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Orders Management</h1>
        <p className="text-sm sm:text-base text-white/60">Monitor and manage all platform orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-300 mb-1">Total Orders</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-purple-300 mb-1">Active</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.active}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-green-300 mb-1">Completed</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.completed}</p>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-red-300 mb-1">Cancelled</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.cancelled}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-col md:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search by order ID, user, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="all">All Statuses</option>
            <option value="pending_acceptance">Pending Acceptance</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Orders List - Desktop Table */}
      <Card className="hidden lg:block bg-white/5 backdrop-blur-xl border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left">
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Order ID</th>
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Service</th>
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Client</th>
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Freelancer</th>
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Amount</th>
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Status</th>
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Date</th>
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 lg:p-8 text-center text-white/40">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 lg:p-4">
                      <p className="text-xs font-mono text-white/80">{order.id.slice(0, 8)}...</p>
                    </td>
                    <td className="p-3 lg:p-4">
                      <p className="text-xs lg:text-sm font-medium text-white truncate max-w-[150px]">{order.service_plan?.title || 'Unknown'}</p>
                      <Badge className="mt-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize">
                        {order.plan_tier}
                      </Badge>
                    </td>
                    <td className="p-3 lg:p-4">
                      <p className="text-xs lg:text-sm text-white truncate max-w-[120px]">{order.client?.display_name || 'Unknown'}</p>
                      <p className="text-xs text-white/60 truncate">@{order.client?.username}</p>
                    </td>
                    <td className="p-3 lg:p-4">
                      <p className="text-xs lg:text-sm text-white truncate max-w-[120px]">{order.freelancer?.display_name || 'Unknown'}</p>
                      <p className="text-xs text-white/60 truncate">@{order.freelancer?.username}</p>
                    </td>
                    <td className="p-3 lg:p-4">
                      <p className="text-xs lg:text-sm font-semibold text-white">₹{order.total_amount?.toLocaleString('en-IN') || order.price.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="p-3 lg:p-4">
                      <Badge className={`text-xs ${statusColors[order.status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 lg:p-4">
                      <p className="text-xs text-white/60">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="p-3 lg:p-4">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 text-center">
            <p className="text-white/40">No orders found</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="bg-white/5 backdrop-blur-xl border-white/10 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{order.service_plan?.title || 'Unknown'}</p>
                  <p className="text-xs font-mono text-white/60">{order.id.slice(0, 12)}...</p>
                  <Badge className="mt-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize">
                    {order.plan_tier}
                  </Badge>
                </div>
                <Badge className={`text-xs flex-shrink-0 ml-2 ${statusColors[order.status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-white/10">
                <div>
                  <p className="text-xs text-white/40 mb-1">Client</p>
                  <p className="text-xs font-medium text-white truncate">{order.client?.display_name || 'Unknown'}</p>
                  <p className="text-xs text-white/60 truncate">@{order.client?.username}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Freelancer</p>
                  <p className="text-xs font-medium text-white truncate">{order.freelancer?.display_name || 'Unknown'}</p>
                  <p className="text-xs text-white/60 truncate">@{order.freelancer?.username}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs text-white/40">Amount</p>
                  <p className="text-sm font-bold text-white">₹{order.total_amount?.toLocaleString('en-IN') || order.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/60 mb-2">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Results Count */}
      <div className="mt-4 text-center text-xs sm:text-sm text-white/40">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>
    </div>
  )
}
