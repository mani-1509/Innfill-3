/**
 * File Upload Utilities for INNFILL
 * Handles file uploads to Supabase Storage with proper validation and error handling
 */

import { createClient } from '@/lib/supabase/client'

// Maximum file sizes in bytes
export const MAX_FILE_SIZE = {
  ORDER_FILE: 50 * 1024 * 1024, // 50MB
  AVATAR: 5 * 1024 * 1024, // 5MB
  CHAT_ATTACHMENT: 50 * 1024 * 1024, // 50MB
}

// Allowed MIME types
export const ALLOWED_MIME_TYPES = {
  ORDER_FILE: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
  ],
  AVATAR: ['image/jpeg', 'image/png', 'image/webp'],
  CHAT_ATTACHMENT: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
  ],
}

export type UploadResult = {
  success: boolean
  url?: string
  error?: string
}

/**
 * Validates a file before upload
 */
export function validateFile(
  file: File,
  maxSize: number,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`,
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    }
  }

  return { valid: true }
}

/**
 * Generates a unique file name with timestamp
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  const nameWithoutExt = originalName.replace(`.${extension}`, '')
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_')
  
  return `${sanitized}_${timestamp}_${randomStr}.${extension}`
}

/**
 * Upload a file to order-files bucket
 * Path structure: userId/orderId/filename
 */
export async function uploadOrderFile(
  file: File,
  userId: string,
  orderId?: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(
      file,
      MAX_FILE_SIZE.ORDER_FILE,
      ALLOWED_MIME_TYPES.ORDER_FILE
    )

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const supabase = createClient()
    const fileName = generateFileName(file.name)
    const folderPath = orderId ? `${userId}/${orderId}` : `${userId}/temp`
    const filePath = `${folderPath}/${fileName}`

    // Upload file
    const { data, error } = await supabase.storage
      .from('order-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('order-files')
      .getPublicUrl(data.path)

    return { success: true, url: urlData.publicUrl }
  } catch (err: any) {
    console.error('Upload exception:', err)
    return { success: false, error: err.message || 'Upload failed' }
  }
}

/**
 * Upload multiple files to order-files bucket
 */
export async function uploadOrderFiles(
  files: File[],
  userId: string,
  orderId?: string
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = []
  const errors: string[] = []

  for (const file of files) {
    const result = await uploadOrderFile(file, userId, orderId)
    
    if (result.success && result.url) {
      urls.push(result.url)
    } else {
      errors.push(`${file.name}: ${result.error}`)
    }
  }

  return { urls, errors }
}

/**
 * Upload a profile avatar
 * Path structure: userId/avatar.ext
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(
      file,
      MAX_FILE_SIZE.AVATAR,
      ALLOWED_MIME_TYPES.AVATAR
    )

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const supabase = createClient()
    const extension = file.name.split('.').pop()
    const filePath = `${userId}/avatar.${extension}`

    // Upload file (upsert to replace old avatar)
    const { data, error } = await supabase.storage
      .from('profile-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-avatars')
      .getPublicUrl(data.path)

    return { success: true, url: urlData.publicUrl }
  } catch (err: any) {
    console.error('Upload exception:', err)
    return { success: false, error: err.message || 'Upload failed' }
  }
}

/**
 * Upload a chat attachment
 * Path structure: userId/roomId/filename
 */
export async function uploadChatAttachment(
  file: File,
  userId: string,
  roomId: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(
      file,
      MAX_FILE_SIZE.CHAT_ATTACHMENT,
      ALLOWED_MIME_TYPES.CHAT_ATTACHMENT
    )

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const supabase = createClient()
    const fileName = generateFileName(file.name)
    const filePath = `${userId}/${roomId}/${fileName}`

    // Upload file
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(data.path)

    return { success: true, url: urlData.publicUrl }
  } catch (err: any) {
    console.error('Upload exception:', err)
    return { success: false, error: err.message || 'Upload failed' }
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: 'order-files' | 'profile-avatars' | 'chat-attachments',
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Delete exception:', err)
    return { success: false, error: err.message || 'Delete failed' }
  }
}

/**
 * Get file info from URL
 */
export function parseStorageUrl(url: string): {
  bucket: string
  path: string
} | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    
    // Expected format: /storage/v1/object/public/{bucket}/{path}
    if (pathParts[1] === 'storage' && pathParts[2] === 'v1') {
      const bucket = pathParts[5]
      const path = pathParts.slice(6).join('/')
      return { bucket, path }
    }
    
    return null
  } catch {
    return null
  }
}
