-- Add columns for chat room closure scheduling
ALTER TABLE chat_rooms 
ADD COLUMN IF NOT EXISTS scheduled_close_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- Add index for scheduled closures
CREATE INDEX IF NOT EXISTS idx_chat_rooms_scheduled_close 
ON chat_rooms(scheduled_close_at) 
WHERE is_active = true AND scheduled_close_at IS NOT NULL;
