'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/actions/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiDollarSign, FiTrendingUp, FiSettings, FiLogOut, FiHome, FiUsers, FiMessageSquare, FiBell, FiMenu, FiX } from 'react-icons/fi'
import logo from '../../public/logo.png'
import { NotificationBell } from './notification-bell'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setUser({ ...user, profile })
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-400' : 'text-gray-300 hover:text-white'
  }

  const getProfileImg = () => user?.profile?.avatar_url || null

  const navigationItems = [
    { href: '/events', label: 'Events', icon: FiHome },
    { href: '/services', label: 'Services', icon: FiUsers },
    { href: '/sync', label: 'Sync', icon: FiMessageSquare }
  ]

  return (
    <header className="sticky top-0 z-50 bg-transparent p-5">
      <nav className="bg-black/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 ">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <Link href="/events" className="text-2xl font-bold text-white">
                <img src={logo.src} alt="Innfill Logo" className="h-8 w-auto rounded" />
              </Link>
              </motion.div>

            {/* Navigation Links */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hidden md:flex items-center gap-6"
            >
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 transition-colors duration-300 group ${isActive(item.href)}`}
                >
                  <item.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span>{item.label}</span>
                </Link>
              ))}
              </motion.div>

            {/* Right side */}
            {user ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative flex items-center gap-3">
                {/* Notification bell */}
                <NotificationBell />

                {/* Profile button */}
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
                  {getProfileImg() ? (
                    <img src={getProfileImg()} alt="U" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      {(user.profile?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  </button>

                {/* Profile dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl shadow-black/40 z-50"
                      >
                        <div className="p-4 border-b border-white/10">
                          <div className="flex items-center gap-3">
                          {getProfileImg() ? (
                            <img src={getProfileImg()!} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-white/10" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                              <FiUser className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-semibold">{user?.profile?.display_name || user?.email?.split('@')[0] || 'User'}</p>
                            <p className="text-gray-400 text-sm">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link href={`/profile/${user.profile?.username}`} onClick={() => setIsDropdownOpen(false)}>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-white/5 rounded-lg transition-all duration-300">
                            <FiUser className="w-4 h-4" />
                            <span>Profile</span>
                          </motion.button>
                        </Link>

                        {user?.profile?.role === 'admin' && (
                          <Link href="/admin/dashboard" onClick={() => setIsDropdownOpen(false)}>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-white/5 rounded-lg transition-all duration-300">
                              <FiUser className="w-4 h-4" />
                              <span>Admin Dashboard</span>
                            </motion.button>
                          </Link>
                        )}

                        <div className="border-t border-white/10 my-2" />

                        <Link href="/orders" onClick={() => setIsDropdownOpen(false)}>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-white/5 rounded-lg transition-all duration-300">
                            <FiDollarSign className="w-4 h-4" />
                            <span>Orders</span>
                          </motion.button>
                        </Link>

                        {user?.profile?.role === 'freelancer' && (
                          <Link href="/earnings" onClick={() => setIsDropdownOpen(false)}>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-white/5 rounded-lg transition-all duration-300">
                              <FiTrendingUp className="w-4 h-4" />
                              <span>Earnings</span>
                            </motion.button>
                          </Link>
                        )}

                        <Link href="/settings" onClick={() => setIsDropdownOpen(false)}>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-white/5 rounded-lg transition-all duration-300">
                            <FiSettings className="w-4 h-4" />
                            <span>Settings</span>
                          </motion.button>
                        </Link>

                        <div className="border-t border-white/10 my-2" />

                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300">
                          <FiLogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Mobile menu toggle */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all" aria-label="Toggle menu">
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all" aria-label="Toggle menu">
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </motion.div>
          )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="mt-2 bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
            <div className="p-2">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 rounded-lg transition-colors">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
              <div className="border-t border-white/10 my-2" />
              {user ? (
                <>
                  <Link href={`/profile/${user.profile?.username}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 rounded-lg transition-colors">
                      <FiUser className="w-4 h-4" />
                      <span>Profile</span>
                    </div>
                  </Link>
                  {user?.profile?.role === 'admin' && (
                    <Link href="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 rounded-lg transition-colors">
                        <FiUser className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </div>
                    </Link>
                  )}
                  <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 rounded-lg transition-colors">
                      <FiDollarSign className="w-4 h-4" />
                      <span>Orders</span>
                    </div>
                  </Link>
                  {user?.profile?.role === 'freelancer' && (
                    <Link href="/earnings" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 rounded-lg transition-colors">
                        <FiTrendingUp className="w-4 h-4" />
                        <span>Earnings</span>
                      </div>
                    </Link>
                  )}
                  <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 rounded-lg transition-colors">
                      <FiSettings className="w-4 h-4" />
                      <span>Settings</span>
                    </div>
                  </Link>
                  <div className="border-t border-white/10 my-2" />
                  <button onClick={() => { setIsMobileMenuOpen(false); handleLogout() }} className="w-full text-left flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <FiLogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                    <div className="text-center px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10">Sign In</div>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                    <div className="text-center px-4 py-2 bg-white text-black rounded-lg">Get Started</div>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
