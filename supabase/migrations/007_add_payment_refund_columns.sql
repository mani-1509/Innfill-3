-- Migration: Add missing payment and refund tracking columns
-- Date: November 11, 2025
-- Description: Adds columns for Razorpay payment IDs, refund tracking, and transfer status

-- Add Razorpay payment ID (for linking to Razorpay payment)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Add Razorpay order ID (for linking to Razorpay order)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Add refund status tracking
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS refund_status TEXT CHECK (refund_status IN ('pending', 'processed', 'failed', NULL));

-- Add refund amount
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2);

-- Add Razorpay refund ID
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS razorpay_refund_id TEXT;

-- Add transfer status (for freelancer payouts)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS transferred_to_freelancer BOOLEAN DEFAULT false;

-- Add Razorpay transfer ID
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS razorpay_transfer_id TEXT;

-- Add updated_at timestamp
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add total amount (client pays)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);

-- Add GST amount
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_refund_status ON payments(refund_status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Add comment to table
COMMENT ON TABLE payments IS 'Payment transactions with Razorpay integration, refund tracking, and transfer status';
