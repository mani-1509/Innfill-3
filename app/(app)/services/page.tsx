'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
  FiImage,
  FiStar,
  FiUser
} from 'react-icons/fi'
import { getServices } from '@/lib/actions/services'
import { SERVICE_CATEGORIES } from '@/lib/validations/services'

type ViewMode = 'grid' | 'list'
type SortField = 'price' | 'delivery_time_days' | 'created_at'
type SortDirection = 'asc' | 'desc'

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  
  // UI States
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filter States
  const [filter, setFilter] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    deliveryTime: ''
  })
  
  // Sort States
  const [sort, setSort] = useState<{
    field: SortField
    direction: SortDirection
  }>({
    field: 'created_at',
    direction: 'desc'
  })

  useEffect(() => {
    fetchServices()
  }, [currentPage, sort])

  const fetchServices = async () => {
    setLoading(true)
    setError(null)

    // Map sort field to API format
    let sortBy: 'newest' | 'price_low' | 'price_high' | 'popular' = 'newest'
    if (sort.field === 'price') {
      sortBy = sort.direction === 'asc' ? 'price_low' : 'price_high'
    } else if (sort.field === 'created_at') {
      sortBy = 'newest'
    }

    const result = await getServices({
      category: filter.category || undefined,
      search: searchTerm || undefined,
      minPrice: filter.minPrice ? parseFloat(filter.minPrice) : undefined,
      maxPrice: filter.maxPrice ? parseFloat(filter.maxPrice) : undefined,
      sortBy,
      page: currentPage,
      limit: 20,
    })

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      let filteredServices = result.data

      // Client-side filter for delivery time
      if (filter.deliveryTime) {
        const maxDelivery = parseInt(filter.deliveryTime)
        filteredServices = filteredServices.filter(
          (s: any) => s.delivery_time_days <= maxDelivery
        )
      }

      // Client-side sort for delivery time
      if (sort.field === 'delivery_time_days') {
        filteredServices = [...filteredServices].sort((a, b) => {
          const comparison = a.delivery_time_days - b.delivery_time_days
          return sort.direction === 'asc' ? comparison : -comparison
        })
      }

      setServices(filteredServices)
      setTotalCount(result.data.length)
    }

    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchServices()
  }

  const toggleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilter({
      category: '',
      minPrice: '',
      maxPrice: '',
      deliveryTime: ''
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  const getLowestPrice = (plans: any[]) => {
    if (!plans || plans.length === 0) return 0
    return Math.min(...plans.map(p => parseFloat(p.price) || 0))
  }

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8"
        >
          <div className="h-48 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl border border-white/10 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="h-12 bg-white/10 rounded w-96 mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-white/10 rounded w-64 mx-auto animate-pulse"></div>
            </div>
          </div>
        </motion.div>

        {/* Search Bar Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-7xl mx-auto px-6 mb-8"
        >
          <div className="modern-card p-6">
            <div className="h-12 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
        </motion.div>

        {/* Services Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="modern-card p-6"
              >
                <div className="aspect-video w-full bg-white/10 rounded-lg mb-4 animate-pulse">
                  <svg className="aspect-video w-full h-full text-gray-200 dark:text-gray-600 rounded-lg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                  </svg>
                </div>
                <div className="h-6 bg-white/10 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 mb-4 animate-pulse"></div>
                <div className="h-10 bg-white/10 rounded w-full animate-pulse"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8"
      >
        <div className="h-48 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl border border-white/10 flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Browse Services
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Find the perfect service for your project
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search, Filters, and View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-7xl mx-auto px-6 mb-8"
      >
        <div className="modern-card p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                />
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  <FiFilter className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="px-4 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  {viewMode === "grid" ? (
                    <FiList className="w-5 h-5" />
                  ) : (
                    <FiGrid className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filter.category}
                    onChange={(e) =>
                      setFilter((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                  >
                    <option value="">All Categories</option>
                    {SERVICE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filter.minPrice}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          minPrice: e.target.value,
                        }))
                      }
                      className="w-1/2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filter.maxPrice}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          maxPrice: e.target.value,
                        }))
                      }
                      className="w-1/2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Delivery Time (days)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 7"
                    value={filter.deliveryTime}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        deliveryTime: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    Clear
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-white/20 transition-all duration-300"
                  >
                    Apply
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Sort Buttons */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => toggleSort("price")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                sort.field === "price"
                  ? "bg-white text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              <FiDollarSign className="w-4 h-4" />
              Price
              {sort.field === "price" && (
                <span>
                  {sort.direction === "asc" ? (
                    <FiArrowUp className="w-4 h-4" />
                  ) : (
                    <FiArrowDown className="w-4 h-4" />
                  )}
                </span>
              )}
            </button>
            <button
              onClick={() => toggleSort("delivery_time_days")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                sort.field === "delivery_time_days"
                  ? "bg-white text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              <FiClock className="w-4 h-4" />
              Delivery Time
              {sort.field === "delivery_time_days" && (
                <span>
                  {sort.direction === "asc" ? (
                    <FiArrowUp className="w-4 h-4" />
                  ) : (
                    <FiArrowDown className="w-4 h-4" />
                  )}
                </span>
              )}
            </button>
            <button
              onClick={() => toggleSort("created_at")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                sort.field === "created_at"
                  ? "bg-white text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              <FiTrendingUp className="w-4 h-4" />
              Latest
              {sort.field === "created_at" && (
                <span>
                  {sort.direction === "asc" ? (
                    <FiArrowUp className="w-4 h-4" />
                  ) : (
                    <FiArrowDown className="w-4 h-4" />
                  )}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Services Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        <div className="max-w-7xl mx-auto px-6 mb-12">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchServices}
                className="px-4 py-2 bg-white text-black font-semibold rounded-lg"
              >
                Try Again
              </motion.button>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No services found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }
            >
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className={`modern-card border rounded-lg border-white/10 p-6 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 ${
                    viewMode === "list" ? "flex gap-6" : ""
                  }`}
                >
                  {/* Service Thumbnail */}
                  <div className={viewMode === "list" ? "w-48 shrink-0" : "mb-4"}>
                    <div className="aspect-video w-full bg-white/10 rounded-lg overflow-hidden">
                      {service.images.length > 0 ? (
                        <img
                          src={service.images[0]}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiImage className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {service.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <Link
                            href={`/profile/${service.freelancer?.username}`}
                            className="hover:text-white transition-colors"
                          >
                            {service.freelancer?.display_name || service.freelancer?.username}
                          </Link>
                          <span>•</span>
                          <span>{service.category}</span>
                        </div>
                        {service.freelancer?.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-yellow-400">
                            <FiStar className="w-4 h-4 fill-yellow-400" />
                            <span>{service.freelancer.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">
                          From ₹{getLowestPrice(service.plans)}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/services/${service.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-white text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-white/20 transition-all duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!error && services.length > 0 && totalCount > 20 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? 'bg-white/5 text-gray-400'
                    : 'bg-white/10 text-white hover:bg-white/20'
                } transition-all duration-300`}
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-white/5 rounded-lg text-white">
                Page {currentPage} of {Math.ceil(totalCount / 20)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / 20), prev + 1))}
                disabled={currentPage >= Math.ceil(totalCount / 20)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage >= Math.ceil(totalCount / 20)
                    ? 'bg-white/5 text-gray-400'
                    : 'bg-white/10 text-white hover:bg-white/20'
                } transition-all duration-300`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
