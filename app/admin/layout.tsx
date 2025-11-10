import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard/freelancer')
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
    { name: 'Users', href: '/admin/users', icon: 'Users' },
    { name: 'Orders', href: '/admin/orders', icon: 'ShoppingBag' },
    { name: 'Payouts', href: '/admin/payouts', icon: 'Wallet' },
    { name: 'Events', href: '/admin/events', icon: 'Calendar' },
    { name: 'Settings', href: '/admin/settings', icon: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="flex">
        {/* Sidebar Component */}
        <AdminSidebar navItems={navItems} />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
