-- Migration: Payment System Integration
-- Description: Add payment-related columns for Razorpay integration
-- Date: November 9, 2025

-- =====================================================
-- 1. ADD PAYMENT FIELDS TO PROFILES TABLE
-- =====================================================

-- Add bank account and KYC fields for freelancers
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS razorpay_account_id TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_ifsc TEXT,
ADD COLUMN IF NOT EXISTS bank_account_holder_name TEXT,
ADD COLUMN IF NOT EXISTS pan_number TEXT,
ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_balance DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(10,2) DEFAULT 0.00;

-- Add comment for documentation
COMMENT ON COLUMN profiles.razorpay_account_id IS 'Razorpay linked account ID for freelancers';
COMMENT ON COLUMN profiles.available_balance IS 'Balance available for withdrawal (freelancers only)';
COMMENT ON COLUMN profiles.pending_balance IS 'Balance in active orders not yet completed (freelancers only)';

-- =====================================================
-- 2. ADD PAYMENT FIELDS TO ORDERS TABLE
-- =====================================================

-- Add payment tracking fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS platform_commission DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2);

-- Add comments
COMMENT ON COLUMN orders.payment_deadline IS '48-hour deadline for client to complete payment after freelancer accepts';
COMMENT ON COLUMN orders.razorpay_order_id IS 'Razorpay order ID for payment tracking';
COMMENT ON COLUMN orders.total_amount IS 'Total amount client needs to pay (service + commission + GST)';
COMMENT ON COLUMN orders.platform_commission IS 'Platform commission amount (14% of service price)';
COMMENT ON COLUMN orders.gst_amount IS 'GST amount on commission (18% of commission)';

-- =====================================================
-- 3. UPDATE ORDER STATUS ENUM
-- =====================================================

-- Drop existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint with pending_payment status
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN (
    'pending_acceptance',
    'pending_payment',
    'accepted',
    'in_progress',
    'delivered',
    'revision_requested',
    'completed',
    'cancelled',
    'declined'
  ));

-- Add comment
COMMENT ON COLUMN orders.status IS 'Order status including pending_payment for awaiting client payment';

-- =====================================================
-- 4. ENHANCE PAYMENTS TABLE
-- =====================================================

-- Add Razorpay tracking fields
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_transfer_id TEXT,
ADD COLUMN IF NOT EXISTS gateway_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_captured_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_id TEXT,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN payments.razorpay_payment_id IS 'Razorpay payment ID from checkout';
COMMENT ON COLUMN payments.razorpay_transfer_id IS 'Razorpay transfer ID for freelancer payout';
COMMENT ON COLUMN payments.gateway_fee IS 'Razorpay gateway fee (2% + GST)';
COMMENT ON COLUMN payments.refund_id IS 'Razorpay refund ID if payment refunded';

-- =====================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for looking up freelancer by Razorpay account
CREATE INDEX IF NOT EXISTS idx_profiles_razorpay_account 
ON profiles(razorpay_account_id) 
WHERE razorpay_account_id IS NOT NULL;

-- Index for payment deadline checks (for cron job)
CREATE INDEX IF NOT EXISTS idx_orders_payment_deadline 
ON orders(payment_deadline) 
WHERE payment_deadline IS NOT NULL AND status = 'pending_payment';

-- Index for Razorpay order lookup
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id 
ON orders(razorpay_order_id) 
WHERE razorpay_order_id IS NOT NULL;

-- Index for payment lookup by Razorpay payment ID
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id 
ON payments(razorpay_payment_id) 
WHERE razorpay_payment_id IS NOT NULL;

-- =====================================================
-- 6. CREATE FUNCTION TO AUTO-CANCEL UNPAID ORDERS
-- =====================================================

CREATE OR REPLACE FUNCTION auto_cancel_unpaid_orders()
RETURNS void AS $$
BEGIN
  -- Cancel orders where payment deadline has passed
  UPDATE orders
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE 
    status = 'pending_payment'
    AND payment_deadline < NOW();
    
  -- Log the action (optional, add logging table if needed)
  RAISE NOTICE 'Auto-cancelled % unpaid orders', 
    (SELECT COUNT(*) FROM orders WHERE status = 'cancelled' AND payment_deadline < NOW());
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION auto_cancel_unpaid_orders IS 'Automatically cancels orders where client did not pay within 48 hours';

-- =====================================================
-- 7. CREATE FUNCTION TO UPDATE FREELANCER BALANCE
-- =====================================================

CREATE OR REPLACE FUNCTION update_freelancer_balance(
  p_freelancer_id UUID,
  p_amount DECIMAL(10,2),
  p_balance_type TEXT -- 'available' or 'pending'
)
RETURNS void AS $$
BEGIN
  IF p_balance_type = 'available' THEN
    UPDATE profiles
    SET available_balance = available_balance + p_amount,
        updated_at = NOW()
    WHERE id = p_freelancer_id;
  ELSIF p_balance_type = 'pending' THEN
    UPDATE profiles
    SET pending_balance = pending_balance + p_amount,
        updated_at = NOW()
    WHERE id = p_freelancer_id;
  ELSE
    RAISE EXCEPTION 'Invalid balance_type: %. Must be available or pending', p_balance_type;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION update_freelancer_balance IS 'Update freelancer available or pending balance';

-- =====================================================
-- 8. CREATE FUNCTION TO MOVE PENDING TO AVAILABLE
-- =====================================================

CREATE OR REPLACE FUNCTION release_pending_balance(
  p_freelancer_id UUID,
  p_amount DECIMAL(10,2)
)
RETURNS void AS $$
BEGIN
  -- Move amount from pending to available
  UPDATE profiles
  SET 
    pending_balance = pending_balance - p_amount,
    available_balance = available_balance + p_amount,
    updated_at = NOW()
  WHERE id = p_freelancer_id;
  
  -- Ensure balances don't go negative
  IF (SELECT pending_balance FROM profiles WHERE id = p_freelancer_id) < 0 THEN
    RAISE EXCEPTION 'Pending balance cannot be negative for freelancer %', p_freelancer_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION release_pending_balance IS 'Move amount from pending to available balance on order completion';

-- =====================================================
-- 9. ADD RLS POLICIES FOR NEW COLUMNS
-- =====================================================

-- Users can view their own bank details
-- (RLS already enabled on profiles table)

-- Create policy for viewing own financial data
DROP POLICY IF EXISTS "Users can view own financial data" ON profiles;
CREATE POLICY "Users can view own financial data"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy for updating own financial data
DROP POLICY IF EXISTS "Users can update own financial data" ON profiles;
CREATE POLICY "Users can update own financial data"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all financial data
DROP POLICY IF EXISTS "Admins can view all financial data" ON profiles;
CREATE POLICY "Admins can view all financial data"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 10. MIGRATION VERIFICATION
-- =====================================================

-- Verify all columns were added
DO $$
DECLARE
  v_column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_column_count
  FROM information_schema.columns
  WHERE table_name = 'profiles'
  AND column_name IN (
    'razorpay_account_id',
    'bank_account_number',
    'bank_ifsc',
    'bank_account_holder_name',
    'pan_number',
    'kyc_verified',
    'available_balance',
    'pending_balance'
  );
  
  IF v_column_count = 8 THEN
    RAISE NOTICE 'Payment migration completed successfully! All profile columns added.';
  ELSE
    RAISE EXCEPTION 'Payment migration failed! Expected 8 profile columns, found %', v_column_count;
  END IF;
  
  SELECT COUNT(*) INTO v_column_count
  FROM information_schema.columns
  WHERE table_name = 'orders'
  AND column_name IN (
    'payment_deadline',
    'razorpay_order_id',
    'total_amount',
    'platform_commission',
    'gst_amount'
  );
  
  IF v_column_count = 5 THEN
    RAISE NOTICE 'Payment migration completed successfully! All order columns added.';
  ELSE
    RAISE EXCEPTION 'Payment migration failed! Expected 5 order columns, found %', v_column_count;
  END IF;
END $$;
