-- Migration: Add file links support to orders
-- Support both file uploads (5MB limit) and external links (Google Drive, Dropbox, etc.)

-- Add requirement_links array for external file links
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS requirement_links TEXT[] DEFAULT '{}';

-- Add delivery_links array for external delivery file links
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_links TEXT[] DEFAULT '{}';

-- Add comments
COMMENT ON COLUMN orders.requirement_files IS 'Uploaded requirement files (max 5MB each) - array of storage URLs';
COMMENT ON COLUMN orders.requirement_links IS 'External links to requirement files (Google Drive, Dropbox, etc.)';
COMMENT ON COLUMN orders.delivery_files IS 'Uploaded delivery files (max 5MB each) - array of storage URLs';
COMMENT ON COLUMN orders.delivery_links IS 'External links to delivery files (Google Drive, Dropbox, etc.)';
