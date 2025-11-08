-- Migration: Role-based profile fields
-- Add client-specific and freelancer-specific fields
-- Add client rating and total spent tracking

-- Add client_rating field (for rating clients by freelancers)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS client_rating DECIMAL(3, 2) DEFAULT 0.00;

-- Add total_spent field (track client spending)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10, 2) DEFAULT 0.00;

-- Add check constraints
ALTER TABLE profiles
ADD CONSTRAINT client_rating_range CHECK (client_rating >= 0 AND client_rating <= 5);

ALTER TABLE profiles
ADD CONSTRAINT total_spent_positive CHECK (total_spent >= 0);

-- Add comments
COMMENT ON COLUMN profiles.client_rating IS 'Rating given to clients by freelancers (0-5 stars)';
COMMENT ON COLUMN profiles.total_spent IS 'Total amount spent by clients on the platform';

-- Note: No need to make fields nullable - they already are in the original schema
-- Skills, portfolio_url, company_name are already nullable and can be used based on role
