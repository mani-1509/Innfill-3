'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Skeleton, SkeletonCircle } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { 
  FiUser, 
  FiUsers, 
  FiDollarSign, 
  FiFileText, 
  FiAward,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiStar
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import { ServiceModal } from '@/components/modals/service-modal'
import { 
  getFreelancerServices, 
  deleteService as deleteServiceAction,
  toggleServiceVisibility as toggleServiceVisibilityAction
} from '@/lib/actions/services'

type TabType = 'profile' | 'services' | 'finance' | 'application' | 'skills'

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  
  // Service modal states
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [serviceToEdit, setServiceToEdit] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [servicesPage, setServicesPage] = useState(1)
  const [servicesHasMore, setServicesHasMore] = useState(false)
  
  // Edit profile modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    display_name: '',
    bio: '',
    company_name: '',
    location: '',
    portfolio_url: '',
    skills: [] as string[],
    avatar_url: '',
    banner_url: '',
  })
  const [newSkill, setNewSkill] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
    fetchCurrentUser()
  }, [username])

  useEffect(() => {
    if (profile?.id) {
      fetchServices(profile.id, 1)
      setIsOwnProfile(currentUser?.id === profile.id)
      // Pre-fill edit form
      setEditFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        company_name: profile.company_name || '',
        location: profile.location || '',
        portfolio_url: profile.portfolio_url || '',
        skills: profile.skills || [],
        avatar_url: profile.avatar_url || '',
        banner_url: profile.banner_url || '',
      })
      setAvatarPreview(profile.avatar_url || null)
      setBannerPreview(profile.banner_url || null)
    }
  }, [profile, currentUser])

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setCurrentUser(profileData)
    }
  }

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

  const fetchServices = async (freelancerId: string, page: number) => {
    setServicesLoading(true)
    setServicesError(null)

    const result = await getFreelancerServices(freelancerId, page, 6)

    if (result.error) {
      setServicesError(result.error)
    } else if (result.data) {
      if (page === 1) {
        setServices(result.data)
      } else {
        setServices(prev => [...prev, ...result.data])
      }
      setServicesHasMore(result.hasMore || false)
    }

    setServicesLoading(false)
  }

  const deleteService = async (serviceId: string) => {
    const result = await deleteServiceAction(serviceId)
    if (result.error) {
      setServicesError(result.error)
    } else {
      // Refresh services
      if (profile?.id) {
        setServicesPage(1)
        fetchServices(profile.id, 1)
      }
    }
  }

  const toggleVisibility = async (serviceId: string) => {
    const result = await toggleServiceVisibilityAction(serviceId)
    if (result.error) {
      setServicesError(result.error)
    } else {
      // Refresh services
      if (profile?.id) {
        setServicesPage(1)
        fetchServices(profile.id, 1)
      }
    }
  }

  const handleServiceSuccess = () => {
    if (profile?.id) {
      setServicesPage(1)
      fetchServices(profile.id, 1)
    }
  }

  const handleUpdateProfile = async () => {
    setIsSaving(true)
    setEditError(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editFormData.display_name,
          bio: editFormData.bio,
          company_name: editFormData.company_name,
          location: editFormData.location,
          portfolio_url: editFormData.portfolio_url,
          skills: editFormData.skills,
          avatar_url: editFormData.avatar_url,
          banner_url: editFormData.banner_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile?.id)

      if (error) throw error

      // Refresh profile
      await fetchProfile()
      setShowEditModal(false)
    } catch (error: any) {
      setEditError(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setEditError('Avatar image must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setEditError('Please upload an image file')
      return
    }

    setUploadingAvatar(true)
    setEditError(null)

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile?.id}-avatar-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      setEditFormData({ ...editFormData, avatar_url: publicUrl })
      setAvatarPreview(publicUrl)
    } catch (error: any) {
      setEditError(error.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setEditError('Banner image must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setEditError('Please upload an image file')
      return
    }

    setUploadingBanner(true)
    setEditError(null)

    try {
      // Upload banner to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile?.id}-banner-${Date.now()}.${fileExt}`
      const filePath = `banners/${fileName}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      // Update form data and preview
      setEditFormData({ ...editFormData, banner_url: publicUrl })
      setBannerPreview(publicUrl)
    } catch (error: any) {
      setEditError(error.message || 'Failed to upload banner')
    } finally {
      setUploadingBanner(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !editFormData.skills.includes(newSkill.trim())) {
      setEditFormData({
        ...editFormData,
        skills: [...editFormData.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setEditFormData({
      ...editFormData,
      skills: editFormData.skills.filter(skill => skill !== skillToRemove)
    })
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
      <div className="relative px-2">
        {/* User Info Section (pure black background) */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-4 md:mb-8 px-4 md:px-0"
      >
        <div className="h-32 md:h-48 rounded-xl md:rounded-2xl border border-white/10 flex items-end p-4 m-5 md:p-8 relative overflow-hidden bg-gradient-to-r from-white/5 to-white/10">
          {/* Banner Image */}
          {profile.banner_url ? (
            <img
              src={profile.banner_url}
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
        <div className="bg-black border-t border-white/10 pt-4">
          <div className="container mx-auto px-6">
            <div className="flex justify-center py-2">
              <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-white text-3xl font-bold">PROFILE INFO</h2>
                  {isOwnProfile && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Pre-fill the form with current profile data
                        setEditFormData({
                          display_name: profile.display_name || '',
                          bio: profile.bio || '',
                          company_name: profile.company_name || '',
                          location: profile.location || '',
                          portfolio_url: profile.portfolio_url || '',
                          skills: profile.skills || [],
                          avatar_url: profile.avatar_url || '',
                          banner_url: profile.banner_url || '',
                        })
                        setAvatarPreview(profile.avatar_url || null)
                        setBannerPreview(profile.banner_url || null)
                        setShowEditModal(true)
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-black bg-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-white/20"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit Profile
                    </motion.button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Username */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                  >
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Username</label>
                    <p className="text-white text-lg font-medium">@{profile.username}</p>
                  </motion.div>

                  {/* Bio - Full Width */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-2 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                  >
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Bio</label>
                    <p className="text-white text-lg leading-relaxed">{profile.bio || 'No bio added yet'}</p>
                  </motion.div>

                  {/* Portfolio URL */}
                  {profile.portfolio_url && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                    >
                      <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Portfolio</label>
                      <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-lg font-medium break-all flex items-center gap-2 group"
                      >
                        <span className="underline">{profile.portfolio_url}</span>
                        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </motion.div>
                  )}

                  {/* Location */}
                  {profile.location && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                    >
                      <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Location</label>
                      <p className="text-white text-lg font-medium">{profile.location}</p>
                    </motion.div>
                  )}

                  {/* Company Name */}
                  {profile.company_name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                    >
                      <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Company</label>
                      <p className="text-white text-lg font-medium">{profile.company_name}</p>
                    </motion.div>
                  )}

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                  >
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Total Orders</label>
                    <p className="text-white text-lg font-medium">{profile.total_orders}</p>
                  </motion.div>

                  {profile.role === 'freelancer' && (
                    <>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                      >
                        <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Rating</label>
                        <div className="flex items-center gap-2">
                          <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          <p className="text-white text-lg font-medium">{profile.rating.toFixed(1)}</p>
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Services Tab Content */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-3xl font-bold">SERVICES</h2>
                  {isOwnProfile && profile?.role === 'freelancer' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setServiceToEdit(null)
                        setShowServiceModal(true)
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-black bg-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-white/20"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Service
                    </motion.button>
                  )}
                </div>

                {servicesError && (
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
                    {servicesError}
                  </div>
                )}

                {servicesLoading && servicesPage === 1 ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-6 bg-white/5 rounded-lg border border-white/10">
                        <Skeleton className="h-6 w-64 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[...Array(3)].map((_, j) => (
                            <Skeleton key={j} className="h-32 w-full" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-12">
                    <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-4">
                      {isOwnProfile ? 'No services listed yet.' : 'No services available.'}
                    </p>
                    {isOwnProfile && profile?.role === 'freelancer' && (
                      <button
                        onClick={() => {
                          setServiceToEdit(null)
                          setShowServiceModal(true)
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Create your first service
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {services.map((service: any) => (
                      <div
                        key={service.id}
                        className="p-6 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <Link 
                                  href={`/services/${service.id}`}
                                  className="text-xl font-semibold text-white mb-2 hover:text-gray-300 transition-colors block"
                                >
                                  {service.title}
                                </Link>
                                <p className="text-gray-300 mb-3 line-clamp-2">
                                  {service.description}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap mb-4">
                              {service.category && (
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                  {service.category}
                                </span>
                              )}
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                service.is_active 
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}>
                                {service.is_active ? "Active" : "Hidden"}
                              </span>
                            </div>

                            {/* Service Plans */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {service.plans?.map((plan: any) => (
                                <div
                                  key={plan.tier}
                                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                                >
                                  <h4 className="font-semibold text-white mb-2 flex items-center justify-between">
                                    <span>{plan.tier}</span>
                                    <span className="text-green-400">₹{plan.price}</span>
                                  </h4>
                                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                                    {plan.description}
                                  </p>
                                  <div className="space-y-2">
                                    {plan.deliverables?.slice(0, 2).map((item: string, index: number) => (
                                      <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                                        <FiCheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        <span className="line-clamp-1">{item}</span>
                                      </div>
                                    ))}
                                    {plan.deliverables?.length > 2 && (
                                      <p className="text-xs text-gray-400">
                                        +{plan.deliverables.length - 2} more
                                      </p>
                                    )}
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-white/10 text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                      <FiClock className="w-4 h-4" />
                                      <span>{plan.delivery_time_days} days</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <FiArrowRight className="w-4 h-4" />
                                      <span>{plan.revisions_included} revisions</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Edit/Delete Actions - Only for own profile */}
                          {isOwnProfile && profile?.role === 'freelancer' && (
                            <div className="flex lg:flex-col items-center gap-2">
                              <button
                                onClick={() => {
                                  setServiceToEdit(service)
                                  setShowServiceModal(true)
                                }}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Edit Service"
                              >
                                <FiEdit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => toggleVisibility(service.id)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title={service.is_active ? "Hide Service" : "Show Service"}
                              >
                                {service.is_active ? (
                                  <FiEyeOff className="w-5 h-5" />
                                ) : (
                                  <FiEye className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
                                    deleteService(service.id)
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                title="Delete Service"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Load More Button */}
                    {servicesHasMore && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={() => {
                            const nextPage = servicesPage + 1
                            setServicesPage(nextPage)
                            if (profile?.id) fetchServices(profile.id, nextPage)
                          }}
                          disabled={servicesLoading}
                          className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {servicesLoading ? 'Loading...' : 'Load more'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-white text-3xl font-bold">SKILLS</h2>
                  {isOwnProfile && (
                    <p className="text-gray-400 text-sm">Edit your skills in the profile settings</p>
                  )}
                </div>
                
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {profile.skills.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative"
                      >
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300">
                          <div className="flex items-center justify-center">
                            <FiAward className="w-5 h-5 text-blue-400 mr-2" />
                            <span className="text-white font-medium">{skill}</span>
                          </div>
                        </div>
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 rounded-lg bg-blue-500/0 group-hover:bg-blue-500/5 blur-xl transition-all duration-300 -z-10" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiAward className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-4">
                      {isOwnProfile ? 'No skills added yet.' : 'No skills to display.'}
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => {
                          setEditFormData({
                            display_name: profile.display_name || '',
                            bio: profile.bio || '',
                            company_name: profile.company_name || '',
                            location: profile.location || '',
                            portfolio_url: profile.portfolio_url || '',
                            skills: profile.skills || [],
                            avatar_url: profile.avatar_url || '',
                            banner_url: profile.banner_url || '',
                          })
                          setAvatarPreview(profile.avatar_url || null)
                          setBannerPreview(profile.banner_url || null)
                          setShowEditModal(true)
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Add your first skill
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Service Modal */}
        <ServiceModal
          isOpen={showServiceModal}
          onClose={() => {
            setShowServiceModal(false)
            setServiceToEdit(null)
          }}
          onSuccess={handleServiceSuccess}
          serviceToEdit={serviceToEdit}
        />

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-white/20 rounded-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-neutral-950 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {editError && (
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
                    {editError}
                  </div>
                )}

                {/* Profile Images Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Picture */}
                  <div>
                    <label className="text-gray-400 text-sm uppercase tracking-wider mb-2 block">
                      Profile Picture
                    </label>
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto rounded-full bg-white/5 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <FiUser className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <label className="mt-3 block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="hidden"
                        />
                        <div className="cursor-pointer text-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors">
                          {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Banner Image */}
                  <div>
                    <label className="text-gray-400 text-sm uppercase tracking-wider mb-2 block">
                      Banner Image
                    </label>
                    <div className="relative">
                      <div className="w-full h-32 rounded-lg bg-white/5 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                        {bannerPreview ? (
                          <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                          <FiUser className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <label className="mt-3 block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerUpload}
                          disabled={uploadingBanner}
                          className="hidden"
                        />
                        <div className="cursor-pointer text-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors">
                          {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 my-6"></div>

                {/* Display Name */}
                <div>
                  <label className="text-gray-400 text-sm uppercase tracking-wider mb-2 block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.display_name}
                    onChange={(e) => setEditFormData({ ...editFormData, display_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="Your display name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-gray-400 text-sm uppercase tracking-wider mb-2 block">
                    Bio
                  </label>
                  <textarea
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="text-gray-400 text-sm uppercase tracking-wider mb-2 block">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.company_name}
                    onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="Your company name (optional)"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-gray-400 text-sm uppercase tracking-wider mb-2 block">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="City, Country"
                  />
                </div>

                {/* Portfolio URL */}
                <div>
                  <label className="text-gray-400 text-sm uppercase tracking-wider mb-2 block">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.portfolio_url}
                    onChange={(e) => setEditFormData({ ...editFormData, portfolio_url: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="text-gray-400 text-sm uppercase tracking-wider mb-2 block">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="Add a skill..."
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <FiPlus className="w-5 h-5" />
                    </button>
                  </div>
                  {editFormData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editFormData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="hover:text-white transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-neutral-950 border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={isSaving}
                  className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
