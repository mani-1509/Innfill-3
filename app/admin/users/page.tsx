'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, User, Mail, Calendar, TrendingUp } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  username: string
  display_name: string | null
  role: string
  total_earnings: number
  total_spent: number
  total_orders: number
  rating: number
  kyc_verified: boolean
  created_at: string
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchQuery, roleFilter, users])

  async function loadUsers() {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading users:', error)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  function filterUsers() {
    let filtered = users

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(u => 
        u.username?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.display_name?.toLowerCase().includes(query)
      )
    }

    setFilteredUsers(filtered)
  }

  const stats = {
    total: users.length,
    freelancers: users.filter(u => u.role === 'freelancer').length,
    clients: users.filter(u => u.role === 'client').length,
    admins: users.filter(u => u.role === 'admin').length,
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Users Management</h1>
        <p className="text-sm sm:text-base text-white/60">Manage all platform users and their activities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-300 mb-1">Total Users</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-purple-300 mb-1">Freelancers</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.freelancers}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-green-300 mb-1">Clients</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.clients}</p>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-red-300 mb-1">Admins</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.admins}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-col md:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search by username, email, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          {/* Role Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              variant={roleFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('all')}
              className={`flex-shrink-0 ${roleFilter === 'all' ? 'bg-white text-black' : 'border-white/10 text-white hover:bg-white/5'}`}
            >
              All
            </Button>
            <Button
              variant={roleFilter === 'freelancer' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('freelancer')}
              className={`flex-shrink-0 ${roleFilter === 'freelancer' ? 'bg-purple-500 text-white' : 'border-white/10 text-white hover:bg-white/5'}`}
            >
              Freelancers
            </Button>
            <Button
              variant={roleFilter === 'client' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('client')}
              className={`flex-shrink-0 ${roleFilter === 'client' ? 'bg-blue-500 text-white' : 'border-white/10 text-white hover:bg-white/5'}`}
            >
              Clients
            </Button>
          </div>
        </div>
      </Card>

      {/* Users List - Desktop Table */}
      <Card className="hidden md:block bg-white/5 backdrop-blur-xl border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left">
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">User</th>
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Role</th>
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Stats</th>
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Status</th>
                <th className="p-3 lg:p-4 text-xs lg:text-sm font-semibold text-white/60">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 lg:p-8 text-center text-white/40">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 lg:p-4">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs lg:text-sm font-medium text-white truncate">
                            {user.display_name || 'No name'}
                          </p>
                          <p className="text-xs text-white/60 truncate">@{user.username}</p>
                          <p className="text-xs text-white/40 truncate hidden lg:block">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 lg:p-4">
                      <Badge className={`text-xs ${
                        user.role === 'freelancer' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                        user.role === 'client' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                        'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-3 lg:p-4">
                      {user.role === 'freelancer' ? (
                        <div className="text-xs lg:text-sm">
                          <p className="text-white">₹{user.total_earnings.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-white/60">{user.total_orders} orders</p>
                          <p className="text-xs text-yellow-400">★ {user.rating.toFixed(1)}</p>
                        </div>
                      ) : user.role === 'client' ? (
                        <div className="text-xs lg:text-sm">
                          <p className="text-white">₹{user.total_spent.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-white/60">{user.total_orders} orders</p>
                        </div>
                      ) : (
                        <p className="text-xs text-white/40">-</p>
                      )}
                    </td>
                    <td className="p-3 lg:p-4">
                      {user.kyc_verified ? (
                        <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-gray-500/20 text-gray-300 border-gray-500/30">
                          Unverified
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 lg:p-4">
                      <p className="text-xs lg:text-sm text-white/60">
                        {new Date(user.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3 sm:space-y-4">
        {filteredUsers.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 text-center">
            <p className="text-white/40">No users found</p>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white/5 backdrop-blur-xl border-white/10 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.display_name || 'No name'}
                  </p>
                  <p className="text-xs text-white/60 truncate">@{user.username}</p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
                <Badge className={`text-xs flex-shrink-0 ${
                  user.role === 'freelancer' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                  user.role === 'client' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {user.role}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div>
                  {user.role === 'freelancer' ? (
                    <div className="text-xs">
                      <p className="text-white font-semibold">₹{user.total_earnings.toLocaleString('en-IN')}</p>
                      <p className="text-white/60">{user.total_orders} orders • ★ {user.rating.toFixed(1)}</p>
                    </div>
                  ) : user.role === 'client' ? (
                    <div className="text-xs">
                      <p className="text-white font-semibold">₹{user.total_spent.toLocaleString('en-IN')}</p>
                      <p className="text-white/60">{user.total_orders} orders</p>
                    </div>
                  ) : (
                    <p className="text-xs text-white/40">-</p>
                  )}
                </div>
                <div className="text-right">
                  {user.kyc_verified ? (
                    <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30 mb-1">
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="text-xs bg-gray-500/20 text-gray-300 border-gray-500/30 mb-1">
                      Unverified
                    </Badge>
                  )}
                  <p className="text-xs text-white/60">
                    {new Date(user.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Results Count */}
      <div className="mt-4 text-center text-xs sm:text-sm text-white/40">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  )
}
