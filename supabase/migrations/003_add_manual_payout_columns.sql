-- Add manual payout tracking columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS transfer_pending_manual BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manual_transfer_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manual_transfer_id TEXT,
ADD COLUMN IF NOT EXISTS manual_transfer_date TIMESTAMPTZ;

-- Add index for querying pending manual transfers
CREATE INDEX IF NOT EXISTS idx_payments_pending_manual 
ON payments(transfer_pending_manual, transferred_to_freelancer) 
WHERE transfer_pending_manual = true AND transferred_to_freelancer = false;

-- Add comment for documentation
COMMENT ON COLUMN payments.transfer_pending_manual IS 'True when payment is waiting for manual bank transfer';
COMMENT ON COLUMN payments.manual_transfer_confirmed IS 'True when admin has confirmed manual transfer completion';
COMMENT ON COLUMN payments.manual_transfer_id IS 'Transaction ID/UTR from manual bank transfer';
COMMENT ON COLUMN payments.manual_transfer_date IS 'Timestamp when manual transfer was confirmed';
