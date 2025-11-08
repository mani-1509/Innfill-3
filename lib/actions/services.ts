'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateServiceFormData, UpdateServiceFormData } from '@/lib/validations/services'

/**
 * Create a new service plan
 */
export async function createService(data: CreateServiceFormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to create a service' }
  }

  // Verify user is a freelancer
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'freelancer') {
    return { error: 'Only freelancers can create services' }
  }

  try {
    // Combine thumbnail and portfolio URLs into images array
    const images = [
      data.thumbnail_url,
      ...(data.portfolio_urls || [])
    ].filter(url => url && url.trim() !== '')

    console.log('📸 Service Images Debug:')
    console.log('  - thumbnail_url:', data.thumbnail_url)
    console.log('  - portfolio_urls:', data.portfolio_urls)
    console.log('  - combined images:', images)

    // Create the service plan
    const { data: service, error: serviceError } = await supabase
      .from('service_plans')
      .insert({
        freelancer_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        images: images,
        is_active: true,
        // Map plans to database columns
        basic_price: parseFloat(data.plans[0].price),
        basic_delivery_days: parseInt(data.plans[0].delivery_time_days),
        basic_revisions: data.plans[0].revisions_included,
        basic_features: data.plans[0].deliverables,
        standard_price: parseFloat(data.plans[1].price),
        standard_delivery_days: parseInt(data.plans[1].delivery_time_days),
        standard_revisions: data.plans[1].revisions_included,
        standard_features: data.plans[1].deliverables,
        premium_price: parseFloat(data.plans[2].price),
        premium_delivery_days: parseInt(data.plans[2].delivery_time_days),
        premium_revisions: data.plans[2].revisions_included,
        premium_features: data.plans[2].deliverables,
      })
      .select()
      .single()

    if (serviceError) {
      console.error('Service creation error:', serviceError)
      return { error: serviceError.message }
    }

    revalidatePath('/services')
    revalidatePath(`/profile/${profile}`)
    
    return { success: true, data: service }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Failed to create service. Please try again.' }
  }
}

/**
 * Update an existing service plan
 */
export async function updateService(serviceId: string, data: UpdateServiceFormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to update a service' }
  }

  // Verify ownership
  const { data: service } = await supabase
    .from('service_plans')
    .select('freelancer_id')
    .eq('id', serviceId)
    .single()

  if (service?.freelancer_id !== user.id) {
    return { error: 'You can only edit your own services' }
  }

  try {
    // Combine thumbnail and portfolio URLs into images array
    const images = [
      data.thumbnail_url,
      ...(data.portfolio_urls || [])
    ].filter(url => url && url.trim() !== '')

    const { data: updatedService, error: updateError } = await supabase
      .from('service_plans')
      .update({
        title: data.title,
        description: data.description,
        category: data.category,
        images: images,
        basic_price: parseFloat(data.plans[0].price),
        basic_delivery_days: parseInt(data.plans[0].delivery_time_days),
        basic_revisions: data.plans[0].revisions_included,
        basic_features: data.plans[0].deliverables,
        standard_price: parseFloat(data.plans[1].price),
        standard_delivery_days: parseInt(data.plans[1].delivery_time_days),
        standard_revisions: data.plans[1].revisions_included,
        standard_features: data.plans[1].deliverables,
        premium_price: parseFloat(data.plans[2].price),
        premium_delivery_days: parseInt(data.plans[2].delivery_time_days),
        premium_revisions: data.plans[2].revisions_included,
        premium_features: data.plans[2].deliverables,
      })
      .eq('id', serviceId)
      .select()
      .single()

    if (updateError) {
      console.error('Service update error:', updateError)
      return { error: updateError.message }
    }

    revalidatePath('/services')
    revalidatePath(`/services/${serviceId}`)
    
    return { success: true, data: updatedService }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Failed to update service. Please try again.' }
  }
}

/**
 * Delete a service plan
 */
export async function deleteService(serviceId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to delete a service' }
  }

  // Verify ownership
  const { data: service } = await supabase
    .from('service_plans')
    .select('freelancer_id')
    .eq('id', serviceId)
    .single()

  if (service?.freelancer_id !== user.id) {
    return { error: 'You can only delete your own services' }
  }

  const { error } = await supabase
    .from('service_plans')
    .delete()
    .eq('id', serviceId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/services')
  return { success: true }
}

/**
 * Toggle service visibility (active/hidden)
 */
export async function toggleServiceVisibility(serviceId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Get current service
  const { data: service } = await supabase
    .from('service_plans')
    .select('freelancer_id, is_active')
    .eq('id', serviceId)
    .single()

  if (service?.freelancer_id !== user.id) {
    return { error: 'You can only toggle your own services' }
  }

  // Toggle the is_active status
  const { error } = await supabase
    .from('service_plans')
    .update({ is_active: !service.is_active })
    .eq('id', serviceId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/services')
  return { success: true, isActive: !service.is_active }
}

/**
 * Get a single service by ID
 */
export async function getService(serviceId: string) {
  const supabase = await createClient()

  const { data: service, error } = await supabase
    .from('service_plans')
    .select(`
      *,
      freelancer:profiles!service_plans_freelancer_id_fkey(
        id,
        username,
        display_name,
        avatar_url,
        rating,
        total_orders
      )
    `)
    .eq('id', serviceId)
    .single()

  if (error) {
    return { error: error.message }
  }

  // Transform the data to match your UI structure
  const transformedService = {
    ...service,
    plans: [
      {
        id: `${service.id}-basic`,
        tier: 'Basic',
        price: service.basic_price,
        delivery_time_days: service.basic_delivery_days,
        description: service.description,
        deliverables: service.basic_features || [],
        revisions_included: service.basic_revisions,
        features: service.basic_features || [],
      },
      {
        id: `${service.id}-standard`,
        tier: 'Standard',
        price: service.standard_price,
        delivery_time_days: service.standard_delivery_days,
        description: service.description,
        deliverables: service.standard_features || [],
        revisions_included: service.standard_revisions,
        features: service.standard_features || [],
      },
      {
        id: `${service.id}-premium`,
        tier: 'Premium',
        price: service.premium_price,
        delivery_time_days: service.premium_delivery_days,
        description: service.description,
        deliverables: service.premium_features || [],
        revisions_included: service.premium_revisions,
        features: service.premium_features || [],
      },
    ],
  }

  return { success: true, data: transformedService }
}

/**
 * Get all services with optional filters
 */
export async function getServices(filters?: {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'popular'
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 12
  const offset = (page - 1) * limit

  let query = supabase
    .from('service_plans')
    .select(`
      *,
      freelancer:profiles!service_plans_freelancer_id_fkey(
        id,
        username,
        display_name,
        avatar_url,
        rating,
        total_orders
      )
    `, { count: 'exact' })
    .eq('is_active', true)

  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // Sorting
  switch (filters?.sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'price_low':
      query = query.order('basic_price', { ascending: true })
      break
    case 'price_high':
      query = query.order('basic_price', { ascending: false })
      break
    case 'popular':
      query = query.order('total_orders', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data: services, error, count } = await query

  if (error) {
    return { error: error.message }
  }

  // Transform services to include plans
  const transformedServices = services.map(service => ({
    ...service,
    plans: [
      {
        id: `${service.id}-basic`,
        tier: 'Standard',
        price: service.basic_price,
        delivery_time_days: service.basic_delivery_days,
        description: service.description,
        deliverables: service.basic_features || [],
        revisions_included: service.basic_revisions,
      },
      {
        id: `${service.id}-standard`,
        tier: 'Pro',
        price: service.standard_price,
        delivery_time_days: service.standard_delivery_days,
        description: service.description,
        deliverables: service.standard_features || [],
        revisions_included: service.standard_revisions,
      },
      {
        id: `${service.id}-premium`,
        tier: 'Premium',
        price: service.premium_price,
        delivery_time_days: service.premium_delivery_days,
        description: service.description,
        deliverables: service.premium_features || [],
        revisions_included: service.premium_revisions,
      },
    ],
  }))

  return {
    success: true,
    data: transformedServices,
    count,
    hasMore: count ? offset + limit < count : false,
  }
}

/**
 * Get services by freelancer ID
 */
export async function getFreelancerServices(freelancerId: string, page = 1, limit = 10) {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  const { data: services, error, count } = await supabase
    .from('service_plans')
    .select('*', { count: 'exact' })
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return { error: error.message }
  }

  // Transform services
  const transformedServices = services.map(service => ({
    ...service,
    plans: [
      {
        id: `${service.id}-basic`,
        tier: 'Standard',
        price: service.basic_price,
        delivery_time_days: service.basic_delivery_days,
        description: service.description,
        deliverables: service.basic_features || [],
        revisions_included: service.basic_revisions,
      },
      {
        id: `${service.id}-standard`,
        tier: 'Pro',
        price: service.standard_price,
        delivery_time_days: service.standard_delivery_days,
        description: service.description,
        deliverables: service.standard_features || [],
        revisions_included: service.standard_revisions,
      },
      {
        id: `${service.id}-premium`,
        tier: 'Premium',
        price: service.premium_price,
        delivery_time_days: service.premium_delivery_days,
        description: service.description,
        deliverables: service.premium_features || [],
        revisions_included: service.premium_revisions,
      },
    ],
  }))

  return {
    success: true,
    data: transformedServices,
    count,
    hasMore: count ? offset + limit < count : false,
  }
}
