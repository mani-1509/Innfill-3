'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalFreelancers: number
  totalClients: number
  totalOrders: number
  activeOrders: number
  completedOrders: number
  cancelledOrders: number
  totalRevenue: number
  pendingPayouts: number
  recentOrders: any[]
  recentUsers: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    const supabase = createClient()

    try {
      // Fetch users stats
      const { data: users } = await supabase
        .from('profiles')
        .select('id, role')
      
      const totalUsers = users?.length || 0
      const totalFreelancers = users?.filter(u => u.role === 'freelancer').length || 0
      const totalClients = users?.filter(u => u.role === 'client').length || 0

      // Fetch orders stats
      const { data: orders } = await supabase
        .from('orders')
        .select('id, status, total_amount')

      const totalOrders = orders?.length || 0
      const activeOrders = orders?.filter(o => 
        ['pending_acceptance', 'pending_payment', 'accepted', 'in_progress', 'delivered'].includes(o.status)
      ).length || 0
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0
      const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0

      // Calculate total revenue (14% commission on completed orders)
      const totalRevenue = orders
        ?.filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.total_amount * 0.14 || 0), 0) || 0

      // Fetch pending payouts
      const { data: pendingPayouts } = await supabase
        .from('payments')
        .select('id')
        .eq('transfer_pending_manual', true)
        .eq('transferred_to_freelancer', false)

      // Fetch recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          client:profiles!orders_client_id_fkey(username, display_name),
          freelancer:profiles!orders_freelancer_id_fkey(username, display_name),
          service_plan:service_plans(title)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, username, display_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalUsers,
        totalFreelancers,
        totalClients,
        totalOrders,
        activeOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        pendingPayouts: pendingPayouts?.length || 0,
        recentOrders: recentOrders || [],
        recentUsers: recentUsers || [],
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-8">
        <p className="text-white/60">Failed to load dashboard data</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      subtext: `${stats.totalFreelancers} freelancers, ${stats.totalClients} clients`
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'from-purple-500 to-pink-500',
      subtext: `${stats.activeOrders} active, ${stats.completedOrders} completed`
    },
    {
      title: 'Platform Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      subtext: '14% commission on completed orders'
    },
    {
      title: 'Pending Payouts',
      value: stats.pendingPayouts,
      icon: AlertCircle,
      color: 'from-yellow-500 to-orange-500',
      subtext: 'Awaiting manual transfer'
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-white/60">Overview of platform performance and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/10 p-4 sm:p-6 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-white/60 mb-1">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white truncate">{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 bg-gradient-to-br ${stat.color} rounded-lg flex-shrink-0 ml-2`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-white/40">{stat.subtext}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            Recent Orders
          </h3>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <p className="text-white/40 text-sm">No orders yet</p>
            ) : (
              stats.recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {order.service_plan?.title || 'Service'}
                    </p>
                    <p className="text-xs text-white/60 truncate">
                      {order.client?.display_name || order.client?.username} → {order.freelancer?.display_name || order.freelancer?.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 sm:ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                      order.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-semibold text-white flex-shrink-0">
                      ₹{order.total_amount?.toLocaleString('en-IN') || '0'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Users */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Recent Users
          </h3>
          <div className="space-y-3">
            {stats.recentUsers.length === 0 ? (
              <p className="text-white/40 text-sm">No users yet</p>
            ) : (
              stats.recentUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user.display_name || 'No name'}
                    </p>
                    <p className="text-xs text-white/60">@{user.username}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'freelancer' ? 'bg-purple-500/20 text-purple-300' :
                    user.role === 'client' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <Card className="mt-4 sm:mt-6 bg-white/5 backdrop-blur-xl border-white/10 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Order Status Breakdown</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.activeOrders}</p>
            <p className="text-xs text-blue-300">Active</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.completedOrders}</p>
            <p className="text-xs text-green-300">Completed</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.cancelledOrders}</p>
            <p className="text-xs text-red-300">Cancelled</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-white">
              {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
            </p>
            <p className="text-xs text-purple-300">Success Rate</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
