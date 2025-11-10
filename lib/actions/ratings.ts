'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CreateRatingParams {
  orderId: string
  toUserId: string
  rating: number
  review?: string
}

export async function createRating({
  orderId,
  toUserId,
  rating,
  review,
}: CreateRatingParams) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify order exists and is completed
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, client_id, freelancer_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.status !== 'completed') {
      return { success: false, error: 'Can only rate completed orders' }
    }

    // Verify user is part of the order
    if (order.client_id !== user.id && order.freelancer_id !== user.id) {
      return { success: false, error: 'Not authorized to rate this order' }
    }

    // Check if rating already exists
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('order_id', orderId)
      .eq('from_user_id', user.id)
      .single()

    if (existingRating) {
      return { success: false, error: 'You have already rated this order' }
    }

    // Create the rating
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        order_id: orderId,
        from_user_id: user.id,
        to_user_id: toUserId,
        rating,
        review: review || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating rating:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/orders/${orderId}`)
    revalidatePath(`/profile/${toUserId}`)

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in createRating:', error)
    return { success: false, error: error.message }
  }
}

export async function getRatingForOrder(orderId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('order_id', orderId)
      .eq('from_user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Error fetching rating:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || null }
  } catch (error: any) {
    console.error('Error in getRatingForOrder:', error)
    return { success: false, error: error.message }
  }
}

export async function getUserRatings(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        from_user:profiles!ratings_from_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        ),
        order:orders(
          id,
          service_plan:service_plans(title)
        )
      `)
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user ratings:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error in getUserRatings:', error)
    return { success: false, error: error.message }
  }
}

export async function updateRating({
  ratingId,
  rating,
  review,
}: {
  ratingId: string
  rating: number
  review?: string
}) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Update the rating
    const { data, error } = await supabase
      .from('ratings')
      .update({
        rating,
        review: review || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ratingId)
      .eq('from_user_id', user.id) // Ensure user owns the rating
      .select()
      .single()

    if (error) {
      console.error('Error updating rating:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in updateRating:', error)
    return { success: false, error: error.message }
  }
}
