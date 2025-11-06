'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, 
  FiCheckCircle, 
  FiTrash2, 
  FiPlus,
  FiClock,
  FiArrowRight,
  FiImage,
  FiUpload
} from 'react-icons/fi'
import { createService, updateService } from '@/lib/actions/services'
import { SERVICE_CATEGORIES } from '@/lib/validations/services'

interface ServicePlan {
  tier: 'Standard' | 'Pro' | 'Premium'
  price: string
  delivery_time_days: string
  description: string
  deliverables: string[]
  revisions_included: number
  newDeliverable?: string
}

interface ServiceFormData {
  title: string
  description: string
  category: string
  thumbnail_url: string
  portfolio_urls: string[]
  plans: ServicePlan[]
}

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  serviceToEdit?: any
}

const initialServiceData: ServiceFormData = {
  title: '',
  description: '',
  category: '',
  thumbnail_url: '',
  portfolio_urls: [],
  plans: [
    {
      tier: 'Standard',
      price: '',
      delivery_time_days: '',
      description: '',
      deliverables: [],
      revisions_included: 1,
      newDeliverable: ''
    },
    {
      tier: 'Pro',
      price: '',
      delivery_time_days: '',
      description: '',
      deliverables: [],
      revisions_included: 2,
      newDeliverable: ''
    },
    {
      tier: 'Premium',
      price: '',
      delivery_time_days: '',
      description: '',
      deliverables: [],
      revisions_included: 3,
      newDeliverable: ''
    }
  ]
}

export function ServiceModal({ isOpen, onClose, onSuccess, serviceToEdit }: ServiceModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ServiceFormData>(initialServiceData)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  // Pre-fill form when editing
  useEffect(() => {
    if (serviceToEdit && isOpen) {
      // Convert service data to form format
      const editFormData: ServiceFormData = {
        title: serviceToEdit.title || '',
        description: serviceToEdit.description || '',
        category: serviceToEdit.category || '',
        thumbnail_url: serviceToEdit.thumbnail_url || '',
        portfolio_urls: serviceToEdit.portfolio_urls || [],
        plans: serviceToEdit.plans ? serviceToEdit.plans.map((p: any) => ({
          tier: p.tier,
          price: p.price?.toString() || '',
          delivery_time_days: p.delivery_time_days?.toString() || '',
          description: p.description || '',
          deliverables: p.deliverables || [],
          revisions_included: p.revisions_included || 0,
          newDeliverable: ''
        })) : initialServiceData.plans
      }
      
      setFormData(editFormData)
      
      // Set images
      const images = [
        serviceToEdit.thumbnail_url,
        ...(serviceToEdit.portfolio_urls || [])
      ].filter(Boolean)
      setImageUrls(images)
    } else if (!serviceToEdit && isOpen) {
      // Reset to initial state for new service
      resetForm()
    }
  }, [serviceToEdit, isOpen])

  const resetForm = () => {
    setFormData(initialServiceData)
    setCurrentStep(1)
    setError(null)
    setImageUrls([])
    setNewImageUrl('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      if (imageUrls.length >= 5) {
        setError('Maximum 5 images allowed')
        return
      }
      setImageUrls([...imageUrls, newImageUrl.trim()])
      setNewImageUrl('')
      setError(null)
    }
  }

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const addDeliverable = (planIndex: number) => {
    const plan = formData.plans[planIndex]
    if (plan.newDeliverable?.trim()) {
      const newPlans = [...formData.plans]
      newPlans[planIndex] = {
        ...plan,
        deliverables: [...plan.deliverables, plan.newDeliverable.trim()],
        newDeliverable: ''
      }
      setFormData({ ...formData, plans: newPlans })
    }
  }

  const removeDeliverable = (planIndex: number, delIndex: number) => {
    const newPlans = [...formData.plans]
    newPlans[planIndex] = {
      ...formData.plans[planIndex],
      deliverables: formData.plans[planIndex].deliverables.filter((_, i) => i !== delIndex)
    }
    setFormData({ ...formData, plans: newPlans })
  }

  const updatePlan = (planIndex: number, field: string, value: any) => {
    const newPlans = [...formData.plans]
    newPlans[planIndex] = { ...newPlans[planIndex], [field]: value }
    setFormData({ ...formData, plans: newPlans })
  }

  const validateStep = (step: number): boolean => {
    setError(null)

    if (step === 1) {
      if (!formData.title.trim()) {
        setError('Service title is required')
        return false
      }
      if (formData.title.length < 5 || formData.title.length > 100) {
        setError('Title must be between 5 and 100 characters')
        return false
      }
      if (!formData.description.trim()) {
        setError('Description is required')
        return false
      }
      if (formData.description.length < 20 || formData.description.length > 1000) {
        setError('Description must be between 20 and 1000 characters')
        return false
      }
      if (!formData.category) {
        setError('Please select a category')
        return false
      }
      if (!SERVICE_CATEGORIES.includes(formData.category as any)) {
        setError('Invalid category selected')
        return false
      }
    }

    if (step === 2) {
      for (const plan of formData.plans) {
        if (!plan.price || parseFloat(plan.price) <= 0) {
          setError(`${plan.tier} plan price is required and must be greater than 0`)
          return false
        }
        if (!plan.delivery_time_days || parseInt(plan.delivery_time_days) <= 0) {
          setError(`${plan.tier} plan delivery time is required`)
          return false
        }
        if (!plan.description.trim()) {
          setError(`${plan.tier} plan description is required`)
          return false
        }
        if (plan.deliverables.length === 0) {
          setError(`${plan.tier} plan must have at least one deliverable`)
          return false
        }
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return

    setLoading(true)
    setError(null)

    try {
      const [thumbnail, ...portfolioUrls] = imageUrls
      
      console.log('🖼️ ServiceModal Images Debug:')
      console.log('  - imageUrls:', imageUrls)
      console.log('  - thumbnail:', thumbnail)
      console.log('  - portfolioUrls:', portfolioUrls)
      
      const serviceData = {
        title: formData.title,
        description: formData.description,
        category: formData.category as "UI/UX" | "AI Automations" | "Video Editing & Animations",
        thumbnail_url: thumbnail || '',
        portfolio_urls: portfolioUrls,
        plans: formData.plans.map(plan => ({
          tier: plan.tier,
          price: plan.price,
          delivery_time_days: plan.delivery_time_days,
          description: plan.description,
          deliverables: plan.deliverables,
          revisions_included: plan.revisions_included
        }))
      }

      console.log('📤 Service Data being sent:', serviceData)

      let result
      if (serviceToEdit) {
        result = await updateService(serviceToEdit.id, serviceData)
      } else {
        result = await createService(serviceData)
      }

      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
        handleClose()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save service')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-black/90 rounded-lg border border-white/10 overflow-hidden shadow-2xl max-h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-semibold text-white">
              {serviceToEdit ? 'Edit Service' : 'Create New Service'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-center gap-4">
              {['Basic Info', 'Plans', 'Review'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 ${
                      currentStep > index + 1
                        ? 'text-green-400'
                        : currentStep === index + 1
                        ? 'text-blue-400'
                        : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        currentStep > index + 1
                          ? 'border-green-400 bg-green-400/20'
                          : currentStep === index + 1
                          ? 'border-blue-400 bg-blue-400/20'
                          : 'border-gray-400 bg-gray-400/20'
                      }`}
                    >
                      {currentStep > index + 1 ? (
                        <FiCheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">{step}</span>
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-12 md:w-16 h-0.5 mx-2 ${
                        currentStep > index + 1 ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-[350px] overflow-y-auto">
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Service Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="E.g., Professional UI/UX Design for Mobile Apps"
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-400 mt-1">{formData.title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your service in detail. What makes it unique? What problems does it solve?"
                    rows={5}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-400 mt-1">{formData.description.length}/1000 characters</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {SERVICE_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setFormData({ ...formData, category })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          formData.category === category
                            ? 'border-blue-500 bg-blue-500/10 text-white'
                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <span className="font-medium">{category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Service Images (Max 5)
                  </label>
                  
                  {/* Existing Images */}
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Service image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiTrash2 className="w-4 h-4 text-white" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                              Thumbnail
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Image URL */}
                  {imageUrls.length < 5 && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Enter image URL..."
                        className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addImageUrl()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FiPlus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {imageUrls.length === 0 && 'First image will be used as thumbnail.'}
                    {imageUrls.length > 0 && `${imageUrls.length}/5 images added`}
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {formData.plans.map((plan, index) => (
                  <div key={index} className="p-4 md:p-5 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-blue-400' : index === 1 ? 'bg-purple-400' : 'bg-green-400'
                      }`} />
                      {plan.tier} Plan
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Price (₹) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) => updatePlan(index, 'price', e.target.value)}
                          placeholder="Enter price"
                          min="0"
                          step="0.01"
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Delivery Time (days) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          value={plan.delivery_time_days}
                          onChange={(e) => updatePlan(index, 'delivery_time_days', e.target.value)}
                          placeholder="Days to deliver"
                          min="1"
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Revisions Included <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={plan.revisions_included}
                        onChange={(e) => updatePlan(index, 'revisions_included', parseInt(e.target.value) || 0)}
                        placeholder="Number of revisions"
                        min="0"
                        max="10"
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Plan Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={plan.description}
                        onChange={(e) => updatePlan(index, 'description', e.target.value)}
                        placeholder="Describe what's included in this plan"
                        rows={3}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Deliverables <span className="text-red-400">*</span>
                      </label>
                      <div className="space-y-2">
                        {plan.deliverables.map((deliverable, delIndex) => (
                          <div key={delIndex} className="flex items-center gap-2">
                            <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white flex items-center gap-2">
                              <FiCheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              <span className="flex-1">{deliverable}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDeliverable(index, delIndex)}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                              title="Remove"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add a deliverable..."
                            value={plan.newDeliverable || ''}
                            onChange={(e) => updatePlan(index, 'newDeliverable', e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addDeliverable(index)
                              }
                            }}
                            className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => addDeliverable(index)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Service Details */}
                <div className="p-5 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4">Service Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-400">Title</span>
                      <p className="text-white font-medium">{formData.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Description</span>
                      <p className="text-white">{formData.description}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Category</span>
                      <p className="text-white">{formData.category}</p>
                    </div>
                    {imageUrls.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-400 block mb-2">Images ({imageUrls.length})</span>
                        <div className="flex gap-2 overflow-x-auto">
                          {imageUrls.map((url, i) => (
                            <img key={i} src={url} alt={`Preview ${i + 1}`} className="w-20 h-20 object-cover rounded" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Plans Review */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Service Plans</h4>
                  {formData.plans.map((plan, index) => (
                    <div key={index} className="p-5 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-white">{plan.tier} Plan</h5>
                        <span className="text-xl font-bold text-green-400">₹{plan.price}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{plan.description}</p>
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          <span>{plan.delivery_time_days} days</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiArrowRight className="w-4 h-4" />
                          <span>{plan.revisions_included} revisions</span>
                        </div>
                      </div>
                      {plan.deliverables.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-200 mb-2">Deliverables:</p>
                          <ul className="space-y-1">
                            {plan.deliverables.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                <FiCheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <button
              onClick={currentStep === 1 ? handleClose : handleBack}
              className="px-4 py-2 text-white hover:text-gray-300 transition-colors"
              disabled={loading}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : currentStep === 3 ? (
                serviceToEdit ? 'Save Changes' : 'Create Service'
              ) : (
                <>
                  Next
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
