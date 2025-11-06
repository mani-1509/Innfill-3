'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/actions/auth'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 mx-2.5 mt-2.5 bg-black/50 backdrop-blur-md border border-white/20 rounded-full">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/events" className="text-2xl font-bold text-white">
            INNFILL
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/events" className={`transition-colors ${isActive('/events')}`}>
              Events
            </Link>
            <Link href="/orders" className={`transition-colors ${isActive('/orders')}`}>
              Orders
            </Link>
            <Link href="/earnings" className={`transition-colors ${isActive('/earnings')}`}>
              Earnings
            </Link>
            <Link href="/messages" className={`transition-colors ${isActive('/messages')}`}>
              Messages
            </Link>
          </div>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  {user.profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <Link
                        href={`/profile/${user.id}`}
                        className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Orders
                      </Link>
                      <Link
                        href="/earnings"
                        className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Earnings
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <hr className="my-2 border-gray-800" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
