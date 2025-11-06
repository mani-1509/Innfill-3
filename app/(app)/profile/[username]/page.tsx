'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Skeleton, SkeletonCircle } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { FiUser, FiUsers, FiDollarSign, FiFileText, FiAward } from 'react-icons/fi'
import { motion } from 'framer-motion'

type TabType = 'profile' | 'services' | 'finance' | 'application' | 'skills'

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="mx-2.5 mt-2.5">
          <div className="relative rounded-full border border-white/20 bg-black px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonCircle size={36} />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2">
              <div className="w-32 h-4 bg-neutral-900/70 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonCircle size={28} />
            </div>
          </div>
        </div>
        <div className="bg-black border-t border-white/10">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <SkeletonCircle size={96} />
            </div>
          </div>
        </div>
        <div className="bg-black border-t border-white/10">
          <div className="container mx-auto px-6">
            <div className="flex gap-3 py-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-t-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-12">
          <Card className="bg-neutral-950 border border-white/10 p-12 space-y-8">
            <div className="flex flex-col items-center">
              <Skeleton className="h-10 w-40 mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Content */}
      <div className="relative">
        {/* User Info Section (pure black background) */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-4 md:mb-8 px-4 md:px-0"
      >
        <div className="h-32 md:h-48 rounded-xl md:rounded-2xl border border-white/10 flex items-end p-4 md:p-8 relative overflow-hidden bg-gradient-to-r from-white/5 to-white/10">
          {/* Banner Image */}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover rounded-xl md:rounded-2xl"
              style={{ zIndex: 0 }}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/5 to-white/10 rounded-xl md:rounded-2xl" />
          )}

          {/* Overlay for darkening */}
          <div
            className="absolute inset-0 bg-black/30 rounded-xl md:rounded-2xl"
            style={{ zIndex: 1 }}
          />

          {/* Profile Image */}
          <div
            className="absolute right-4 md:right-8 bottom-4 md:bottom-8 w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center border-4 border-white/10 bg-gradient-to-br from-white/20 to-white/10"
            style={{ zIndex: 2 }}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <FiUser className="w-8 h-8 md:w-12 md:h-12 text-white" />
            )}
          </div>

          {/* Name Field */}
          <div className="mb-2 relative z-10 pr-20 md:pr-32">
            <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2 truncate">
              {profile.display_name}
            </h1>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <p className="text-gray-400 text-sm md:text-lg">
                {profile.role === "client" ? "Client" : "Freelancer"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

        {/* Tabs Navigation (segmented control style) */}
        <div className="bg-black border-t border-white/10">
          <div className="container mx-auto px-6">
            <div className="flex justify-center py-2">
              <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'profile'
                      ? 'bg-white text-black font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FiUser className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'services'
                      ? 'bg-white text-black font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FiUsers className="w-4 h-4" />
                  <span className="text-sm">Services</span>
                </button>
                <button
                  onClick={() => setActiveTab('finance')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'finance'
                      ? 'bg-white text-black font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FiDollarSign className="w-4 h-4" />
                  <span className="text-sm">Finance</span>
                </button>
                <button
                  onClick={() => setActiveTab('application')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'application'
                      ? 'bg-white text-black font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FiFileText className="w-4 h-4" />
                  <span className="text-sm">Application</span>
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'skills'
                      ? 'bg-white text-black font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FiAward className="w-4 h-4" />
                  <span className="text-sm">Skills</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-6 py-12">
          <Card className="bg-neutral-950 border border-white/10 p-12">
            {/* Profile Tab Content */}
            {activeTab === 'profile' && (
              <div className="text-center">
                <h2 className="text-white text-4xl font-bold mb-8">INFO</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Display Name</label>
                    <p className="text-white text-lg">{profile.display_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Email</label>
                    <p className="text-white text-lg">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Role</label>
                    <p className="text-white text-lg capitalize">{profile.role}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Bio</label>
                    <p className="text-white text-lg">{profile.bio || 'No bio yet'}</p>
                  </div>
                  {profile.portfolio_url && (
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Portfolio</label>
                      <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-lg"
                      >
                        {profile.portfolio_url}
                      </a>
                    </div>
                  )}
                  {profile.location && (
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Location</label>
                      <p className="text-white text-lg">{profile.location}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Services Tab Content */}
            {activeTab === 'services' && (
              <div className="text-center">
                <h2 className="text-white text-4xl font-bold mb-8">SERVICES</h2>
                <p className="text-gray-400 text-lg">Services information coming soon...</p>
              </div>
            )}

            {/* Finance Tab Content */}
            {activeTab === 'finance' && (
              <div className="text-center">
                <h2 className="text-white text-4xl font-bold mb-8">FINANCE</h2>
                <p className="text-gray-400 text-lg">Financial information coming soon...</p>
              </div>
            )}

            {/* Application Tab Content */}
            {activeTab === 'application' && (
              <div className="text-center">
                <h2 className="text-white text-4xl font-bold mb-8">APPLICATION</h2>
                <p className="text-gray-400 text-lg">Application details coming soon...</p>
              </div>
            )}

            {/* Skills Tab Content */}
            {activeTab === 'skills' && (
              <div className="text-center">
                <h2 className="text-white text-4xl font-bold mb-8">SKILLS</h2>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-lg">No skills added yet</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
