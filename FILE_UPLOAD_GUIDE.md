# File Upload System - Setup & Usage Guide

## Overview
The INNFILL platform now has a complete file upload system using Supabase Storage. Files are uploaded when creating orders (requirement files) and submitting deliveries (delivery files).

## Storage Buckets Created

### 1. **order-files** (Private)
- **Purpose**: Store order requirement files and delivery files
- **Max Size**: 50MB per file
- **Allowed Types**: Images (JPEG, PNG, GIF, WebP), PDFs, Office docs (Word, Excel), ZIP files, Text files
- **Access**: Users can only access files for orders they're part of (as client or freelancer)
- **Path Structure**: `userId/orderId/filename` or `userId/temp/filename` (before order created)

### 2. **chat-attachments** (Private)
- **Purpose**: Store chat message attachments (future implementation)
- **Max Size**: 50MB per file
- **Allowed Types**: Images (JPEG, PNG, GIF, WebP), PDFs, Text files
- **Access**: Users can only access files in chat rooms they participate in
- **Path Structure**: `userId/roomId/filename`

### 3. **profile-avatars** (Public)
- **Purpose**: Store user profile avatars
- **Max Size**: 5MB per file
- **Allowed Types**: Images (JPEG, PNG, WebP)
- **Access**: Public read, only owner can upload/update/delete
- **Path Structure**: `userId/avatar.ext`

## Setup Instructions

### Step 1: Run the Storage Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/003_storage_buckets.sql`
4. Copy and paste the entire SQL script into the SQL Editor
5. Click **Run** to execute the migration

This will:
- Create the three storage buckets
- Set up Row Level Security (RLS) policies
- Configure file size limits and MIME type restrictions

### Step 2: Verify Storage Buckets

1. In your Supabase dashboard, navigate to **Storage**
2. You should see three buckets:
   - `order-files` (private)
   - `chat-attachments` (private)
   - `profile-avatars` (public)

### Step 3: Test File Upload

1. Log in to your INNFILL app as a client
2. Navigate to a service and click "Order Now"
3. Fill in requirements
4. Click "Attach Files" and select a file
5. Submit the order
6. Check Supabase Storage → `order-files` bucket to see the uploaded file

## How It Works

### Order Requirement Files
When a client creates an order:
1. Files are uploaded to `order-files` bucket
2. Path: `{userId}/temp/{filename}` (temporary location)
3. File URLs are stored in `orders.requirement_files` array
4. Files are validated for size and type before upload

### Delivery Files
When a freelancer submits delivery:
1. Files are uploaded to `order-files` bucket
2. Path: `{userId}/{orderId}/{filename}`
3. File URLs are stored in `orders.delivery_files` array
4. Client can download these files from order details page

### File Access Control
- **Security**: RLS policies ensure users can only access files for orders they're part of
- **Authentication**: All uploads require authentication
- **Validation**: Files are validated before upload (size, type)
- **Unique Names**: Files are automatically renamed with timestamps to prevent conflicts

## Viewing Uploaded Files

### Option 1: In the App (Recommended)
1. Navigate to order details page: `/orders/{orderId}`
2. Scroll to "Requirements" section to see requirement files
3. Scroll to "Delivery" section to see delivery files
4. Click on any file to download it

### Option 2: Supabase Dashboard
1. Open Supabase dashboard
2. Navigate to **Storage**
3. Select the `order-files` bucket
4. Browse folders by user ID and order ID
5. Click any file to view or download

### Option 3: Direct URL Access
- Files have public URLs (though protected by RLS)
- URL format: `https://{project}.supabase.co/storage/v1/object/public/order-files/{path}`
- URLs are automatically generated and stored in the database

## File Upload Utilities

All file upload functions are in `lib/utils/upload-utils.ts`:

### Available Functions

```typescript
// Upload single order file
uploadOrderFile(file: File, userId: string, orderId?: string): Promise<UploadResult>

// Upload multiple order files
uploadOrderFiles(files: File[], userId: string, orderId?: string): Promise<{ urls: string[], errors: string[] }>

// Upload profile avatar
uploadAvatar(file: File, userId: string): Promise<UploadResult>

// Upload chat attachment (future)
uploadChatAttachment(file: File, userId: string, roomId: string): Promise<UploadResult>

// Delete a file
deleteFile(bucket: string, filePath: string): Promise<{ success: boolean, error?: string }>

// Validate file before upload
validateFile(file: File, maxSize: number, allowedTypes: string[]): { valid: boolean, error?: string }
```

## Troubleshooting

### Issue: "File upload failed"
**Solution**: Check that you've run the storage migration and buckets exist in Supabase

### Issue: "File type not allowed"
**Solution**: Check `ALLOWED_MIME_TYPES` in `upload-utils.ts`. Only specific file types are allowed for security

### Issue: "File too large"
**Solution**: Check `MAX_FILE_SIZE` in `upload-utils.ts`. Default is 50MB for order files, 5MB for avatars

### Issue: "Permission denied"
**Solution**: Ensure user is authenticated and has access to the order (as client or freelancer)

### Issue: Can't see uploaded files
**Possible Causes**:
1. Storage migration not run → Run `003_storage_buckets.sql`
2. Files uploaded before migration → Re-upload files after running migration
3. RLS policies blocking access → Check that user is part of the order

## Storage Best Practices

1. **Always validate files** before upload (size, type)
2. **Handle upload errors** gracefully with user-friendly messages
3. **Delete old files** when replacing (e.g., profile avatars)
4. **Use unique filenames** to prevent conflicts (automatically done)
5. **Store URLs in database** for easy retrieval
6. **Set cache headers** appropriately (automatically set to 1 hour)

## Future Enhancements

- [ ] Image optimization/resizing before upload
- [ ] Virus scanning for uploaded files
- [ ] Bulk file operations
- [ ] File preview in modals (without download)
- [ ] Progress indicators for large file uploads
- [ ] Drag-and-drop file upload
- [ ] File compression for large files

## Security Features

✅ **Row Level Security (RLS)** - Users can only access files they own or are authorized to view
✅ **Authentication Required** - All uploads require valid authentication
✅ **File Type Validation** - Only whitelisted MIME types are allowed
✅ **File Size Limits** - Prevents abuse with reasonable limits
✅ **Unique File Names** - Prevents conflicts and improves organization
✅ **Private Buckets** - Order files and chat attachments are private by default

## API Reference

See `lib/utils/upload-utils.ts` for detailed implementation and JSDoc comments.

---

**Note**: After running the storage migration, test the upload functionality by creating a new order with file attachments. Check the Supabase Storage dashboard to verify files are being stored correctly.
