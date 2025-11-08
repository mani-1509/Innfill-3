-- Migration: Add auto-cancel function for expired orders
-- Orders pending acceptance for more than 48 hours will be automatically cancelled

-- Function to auto-cancel orders past accept_deadline
CREATE OR REPLACE FUNCTION auto_cancel_expired_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE 
    status = 'pending_acceptance'
    AND accept_deadline < NOW();
    
  -- TODO: Process refunds for cancelled orders
  -- TODO: Send notifications to clients about cancelled orders
END;
$$;

-- Add comment
COMMENT ON FUNCTION auto_cancel_expired_orders IS 'Automatically cancel orders that have not been accepted within 48 hours';

-- Note: This function should be called by a cron job
-- In Supabase, you can set up pg_cron or use Supabase Edge Functions with cron triggers
-- For now, this will need to be called manually or via external cron service
