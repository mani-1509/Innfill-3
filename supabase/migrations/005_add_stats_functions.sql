-- Migration: Add functions for updating user stats

-- Function to increment freelancer stats when order is completed
CREATE OR REPLACE FUNCTION increment_freelancer_stats(
  freelancer_id UUID,
  earnings DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    total_earnings = total_earnings + earnings,
    total_orders = total_orders + 1,
    updated_at = NOW()
  WHERE id = freelancer_id AND role = 'freelancer';
END;
$$;

-- Function to increment client stats when order is completed
CREATE OR REPLACE FUNCTION increment_client_stats(
  client_id UUID,
  spent DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    total_spent = total_spent + spent,
    total_orders = total_orders + 1,
    updated_at = NOW()
  WHERE id = client_id AND role = 'client';
END;
$$;

-- Add comments
COMMENT ON FUNCTION increment_freelancer_stats IS 'Increment freelancer total_earnings and total_orders when order completes';
COMMENT ON FUNCTION increment_client_stats IS 'Increment client total_spent and total_orders when order completes';
