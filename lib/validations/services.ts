import { z } from 'zod'

// Service Categories
export const SERVICE_CATEGORIES = [
  'UI/UX',
  'AI Automations',
  'Video Editing & Animations',
] as const

export type ServiceCategory = typeof SERVICE_CATEGORIES[number]

// Plan Tier Schema
export const planTierSchema = z.object({
  tier: z.enum(['Standard', 'Pro', 'Premium']),
  price: z.string().min(1, 'Price is required'),
  delivery_time_days: z.string().min(1, 'Delivery time is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  deliverables: z.array(z.string()).min(1, 'Add at least one deliverable'),
  revisions_included: z.number().min(0).max(10),
  features: z.array(z.string()).optional(),
})

// Service Creation Schema
export const createServiceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description too long'),
  category: z.enum(SERVICE_CATEGORIES).refine(
    (val) => SERVICE_CATEGORIES.includes(val as ServiceCategory),
    { message: 'Please select a valid category' }
  ),
  thumbnail_url: z.string().optional(),
  portfolio_urls: z.array(z.string()).max(5, 'Maximum 5 portfolio images').optional(),
  plans: z.array(planTierSchema).length(3, 'Must have exactly 3 plans (Standard, Pro, Premium)'),
})

// Service Update Schema (same as create for now)
export const updateServiceSchema = createServiceSchema

export type CreateServiceFormData = z.infer<typeof createServiceSchema>
export type UpdateServiceFormData = z.infer<typeof updateServiceSchema>
export type PlanTierFormData = z.infer<typeof planTierSchema>
