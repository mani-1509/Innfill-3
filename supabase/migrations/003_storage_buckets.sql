-- Storage Buckets for INNFILL
-- Run this migration in your Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('order-files', 'order-files', false, 52428800, ARRAY[
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
    'text/plain'
  ]),
  ('chat-attachments', 'chat-attachments', false, 52428800, ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ]),
  ('profile-avatars', 'profile-avatars', true, 5242880, ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for order-files bucket
CREATE POLICY "Users can upload their own order files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'order-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view order files they have access to"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-files' AND
  (
    -- User uploaded the file
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- User is part of an order that has this file
    EXISTS (
      SELECT 1 FROM orders
      WHERE (
        (client_id = auth.uid() OR freelancer_id = auth.uid()) AND
        (
          (storage.foldername(name))[2] = id::text OR
          id::text = ANY(requirement_files) OR
          id::text = ANY(delivery_files)
        )
      )
    )
  )
);

CREATE POLICY "Users can delete their own order files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'order-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for chat-attachments bucket
CREATE POLICY "Users can upload chat attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view chat attachments in their rooms"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments' AND
  EXISTS (
    SELECT 1 FROM chat_rooms cr
    JOIN messages m ON m.room_id = cr.id
    WHERE (
      (cr.participant_1_id = auth.uid() OR cr.participant_2_id = auth.uid()) AND
      (storage.foldername(name))[2] = cr.id::text
    )
  )
);

-- Storage policies for profile-avatars bucket (public)
CREATE POLICY "Anyone can view profile avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
