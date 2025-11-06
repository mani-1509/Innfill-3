'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getService } from '@/lib/actions/services'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import {
  FiClock,
  FiStar,
  FiUser,
  FiCheck,
  FiArrowLeft,
  FiImage,
  FiRefreshCw,
  FiPackage,
} from 'react-icons/fi'

interface ServiceDetailPageProps {
  params: {
    id: string
  }
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const router = useRouter()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedTier, setSelectedTier] = useState<'Standard' | 'Pro' | 'Premium'>('Standard')

  useEffect(() => {
    fetchService()
  }, [params.id])

  const fetchService = async () => {
    setLoading(true)
    setError(null)

    const result = await getService(params.id)

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setService(result.data)
    }

    setLoading(false)
  }

  const handleOrderNow = () => {
    if (!service) return
    const plan = service.plans.find((p: any) => p.tier === selectedTier)
    if (plan) {
      router.push(`/orders/create?service=${service.id}&tier=${selectedTier}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || 'Service not found'}</p>
          <Button onClick={() => router.push('/services')} variant="outline">
            Back to Services
          </Button>
        </div>
      </div>
    )
  }

  const images = [service.thumbnail_url, ...(service.portfolio_urls || [])].filter(Boolean)

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Service Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="bg-gray-900/80 border-gray-700 overflow-hidden">
              {images.length > 0 ? (
                <>
                  <div className="relative aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                    <img
                      src={images[selectedImage]}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImage === idx
                              ? 'border-blue-500'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${service.title} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                  <FiImage className="w-24 h-24 text-gray-600" />
                </div>
              )}
            </Card>

            {/* Service Info */}
            <Card className="bg-gray-900/80 border-gray-700 p-6">
              <div className="mb-4">
                <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
                  {service.category}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">{service.title}</h1>

              {/* Freelancer Info */}
              <Link
                href={`/profile/${service.freelancer?.username}`}
                className="flex items-center gap-3 mb-6 hover:bg-gray-800/50 p-3 rounded-lg transition-colors"
              >
                <Avatar className="w-12 h-12">
                  {service.freelancer?.avatar_url ? (
                    <img src={service.freelancer.avatar_url} alt={service.freelancer.display_name} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <FiUser className="w-6 h-6 text-white" />
                    </div>
                  )}
                </Avatar>
                <div>
                  <p className="text-white font-medium">{service.freelancer?.display_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    {service.freelancer?.rating > 0 && (
                      <>
                        <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{service.freelancer.rating.toFixed(1)}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{service.freelancer?.total_orders || 0} orders</span>
                  </div>
                </div>
              </Link>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-white mb-3">About this service</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{service.description}</p>
              </div>
            </Card>

            {/* Plan Comparison */}
            <Card className="bg-gray-900/80 border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Compare Plans</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {service.plans.map((plan: any) => (
                  <motion.div
                    key={plan.tier}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-lg border-2 transition-colors cursor-pointer ${
                      selectedTier === plan.tier
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedTier(plan.tier)}
                  >
                    <h3 className="text-lg font-bold text-white mb-2">{plan.tier}</h3>
                    <p className="text-3xl font-bold text-white mb-1">₹{plan.price}</p>
                    <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <FiClock className="w-4 h-4 text-blue-400" />
                        <span>{plan.delivery_time_days} days delivery</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <FiRefreshCw className="w-4 h-4 text-blue-400" />
                        <span>
                          {plan.revisions_included === 0
                            ? 'No revisions'
                            : plan.revisions_included === -1
                            ? 'Unlimited revisions'
                            : `${plan.revisions_included} revisions`}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4 mb-4">
                      <p className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                        <FiPackage className="w-4 h-4" />
                        What's included:
                      </p>
                      <ul className="space-y-2">
                        {plan.deliverables.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <FiCheck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Order Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <Card className="bg-gray-900/80 border-gray-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Order Now</h3>

                {/* Tier Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Select Plan
                  </label>
                  <div className="space-y-2">
                    {service.plans.map((plan: any) => (
                      <button
                        key={plan.tier}
                        onClick={() => setSelectedTier(plan.tier)}
                        className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                          selectedTier === plan.tier
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{plan.tier}</span>
                          <span className="text-lg font-bold text-white">₹{plan.price}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{plan.delivery_time_days} days</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Plan Details */}
                {(() => {
                  const plan = service.plans.find((p: any) => p.tier === selectedTier)
                  return plan ? (
                    <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">Price</span>
                        <span className="text-2xl font-bold text-white">₹{plan.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Delivery Time</span>
                        <span className="text-gray-300">{plan.delivery_time_days} days</span>
                      </div>
                    </div>
                  ) : null
                })()}

                <Button
                  onClick={handleOrderNow}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-semibold"
                >
                  Order Now (₹{service.plans.find((p: any) => p.tier === selectedTier)?.price})
                </Button>

                <p className="text-center text-gray-400 text-sm mt-4">
                  You won't be charged yet
                </p>
              </Card>

              {/* Additional Info */}
              <Card className="bg-gray-900/80 border-gray-700 p-6">
                <h4 className="font-semibold text-white mb-4">Service Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Category</span>
                    <span className="text-gray-200">{service.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Orders</span>
                    <span className="text-gray-200">{service.total_orders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Listed</span>
                    <span className="text-gray-200">
                      {new Date(service.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
