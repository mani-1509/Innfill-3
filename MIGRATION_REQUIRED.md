# 🔧 Critical Database Migration Required

## ⚠️ Issue Found: Missing Payment Columns

**Error:** `Could not find the 'razorpay_refund_id' column of 'payments' in the schema cache`

**Cause:** The `payments` table is missing several columns needed for payment tracking and refunds.

---

## 🚀 Quick Fix (5 minutes)

### Step 1: Run the Migration SQL

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy and paste the entire contents of this file:
   ```
   supabase/migrations/007_add_payment_refund_columns.sql
   ```
5. Click **"Run"** or press `Ctrl+Enter`

### Step 2: Verify Migration

Run this query to verify the columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;
```

You should see these new columns:
- ✅ `razorpay_payment_id` (TEXT)
- ✅ `razorpay_order_id` (TEXT)
- ✅ `refund_status` (TEXT)
- ✅ `refund_amount` (DECIMAL)
- ✅ `razorpay_refund_id` (TEXT)
- ✅ `transferred_to_freelancer` (BOOLEAN)
- ✅ `razorpay_transfer_id` (TEXT)
- ✅ `updated_at` (TIMESTAMPTZ)
- ✅ `total_amount` (DECIMAL)
- ✅ `gst_amount` (DECIMAL)

---

## 🐛 Bugs Fixed

### 1. Missing Database Columns ✅
**Problem:** Payment table missing Razorpay integration columns  
**Fix:** Migration adds all required columns  
**Impact:** Refunds and payouts will now work correctly

### 2. Duplicate Refund Attempts ✅
**Problem:** `cancelOrder()` function called `processRefund()` twice  
**Fix:** Removed duplicate call on line 725  
**Impact:** No more "total refund amount is greater" errors

### 3. Improved Refund Safety ✅
**Problem:** No check for duplicate refund attempts  
**Fix:** Added comprehensive validation:
- Check if already refunded
- Check payment status
- Check if Razorpay payment ID exists
- Return success if already refunded (idempotent)

---

## 📋 Complete Migration SQL

Here's what the migration does:

```sql
-- Add Razorpay payment tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Add refund tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_status TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_refund_id TEXT;

-- Add payout tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transferred_to_freelancer BOOLEAN DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_transfer_id TEXT;

-- Add metadata
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE payments ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_refund_status ON payments(refund_status);
```

---

## ✅ After Migration

Once you run the migration:

1. **Refunds will work** - No more column errors
2. **No duplicate refunds** - Fixed in code
3. **Better tracking** - All Razorpay IDs stored
4. **Payout support** - Transfer status tracked

---

## 🧪 Test After Migration

Run a test order cancellation:

1. Create a test order
2. Accept it (as freelancer)
3. Make payment (as client)
4. Cancel order (as client)
5. Check logs - should see:
   ```
   🔄 Initiating refund...
   ✅ Refund initiated: rfnd_xxxxxxxx
   ```
   **No errors!**

---

## 🔍 Verify Existing Data

Check if you have any existing payments that need updating:

```sql
-- Check existing payments
SELECT id, order_id, status, amount, created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;

-- Check for any payments that might need refund data added
SELECT p.*, o.status as order_status
FROM payments p
JOIN orders o ON o.id = p.order_id
WHERE o.status = 'cancelled'
  AND p.refund_status IS NULL;
```

If you find any cancelled orders with payments but no refund data, you may need to manually update them or process refunds.

---

## 🚨 IMPORTANT

**Run this migration BEFORE deploying the new code!**

The code changes expect these columns to exist. If you deploy without running the migration, refunds will fail.

---

## 📞 Need Help?

If you encounter any issues:

1. Check Supabase SQL Editor for error messages
2. Verify you have proper permissions (should be project owner)
3. Check if columns already exist: `\d payments` (in SQL editor)
4. Contact support if migration fails

---

## ✅ Success Checklist

- [ ] Ran migration SQL in Supabase
- [ ] Verified new columns exist
- [ ] Tested order cancellation
- [ ] Refund processed successfully
- [ ] No duplicate refund errors
- [ ] Code deployed with fixes

---

**Migration Created:** November 11, 2025  
**Priority:** HIGH - Required for production  
**Estimated Time:** 5 minutes  
**Risk:** LOW - Only adds columns (no data modification)
