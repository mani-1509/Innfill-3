# 🚀 Quick Manual Payout Setup (5 Minutes)

## ✅ What's Already Done:
- ✅ Manual payout system code (`lib/actions/payments.ts`)
- ✅ Admin UI page (`/admin/payouts`)
- ✅ Environment configured (`RAZORPAY_MANUAL_PAYOUT=true`)
- ✅ Database migration SQL file ready

---

## 🔧 What You Need to Do:

### Step 1: Run Database Migration (2 minutes)

**Option A: Supabase Dashboard (Easiest)**
1. Go to https://supabase.com/dashboard
2. Select your project: **nopfpkdmaeqfybhyoyxj**
3. Click **SQL Editor** in the left sidebar
4. Click **+ New Query**
5. Copy-paste this SQL:

```sql
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
```

6. Click **Run** (▶️ button)
7. ✅ Done!

**Option B: Use SQL from file**
The SQL is already in: `supabase/migrations/003_add_manual_payout_columns.sql`

---

### Step 2: Access Admin Payouts Page (1 minute)

**Local Development:**
```
http://localhost:3000/admin/payouts
```

**Production:**
```
https://innfill-3.vercel.app/admin/payouts
```

---

### Step 3: Test the Flow (2 minutes)

1. **Create a test order** (₹100)
2. **Complete the order** (mark as delivered)
3. **Go to** `/admin/payouts`
4. You should see:
   - Freelancer's bank details
   - Amount to transfer
   - "Mark as Transferred" button

5. **Transfer manually** using your bank app:
   - Copy freelancer's account number
   - Copy IFSC code
   - Transfer ₹86 (freelancer's share after 14% commission)

6. **Mark as transferred:**
   - Enter transaction ID (optional)
   - Click "Mark as Transferred"
   - ✅ Freelancer balance updated automatically!

---

## 🎯 How It Works:

```
CLIENT PAYS ₹100
    ↓
Payment processed, money in YOUR Razorpay account
    ↓
Order marked as "Delivered"
    ↓
System calculates: Freelancer gets ₹86 (after 14% commission)
    ↓
Payment appears in /admin/payouts with status "Pending Manual Transfer"
    ↓
YOU use your bank app to transfer ₹86 to freelancer
    ↓
YOU mark it as transferred in admin panel
    ↓
✅ Freelancer's "Available Balance" updated
✅ Freelancer can see payment in their dashboard
✅ Order marked as "Paid to Freelancer"
```

---

## 🔐 Security Features:

- ✅ **Automatic account verification**: On first successful transfer, freelancer's bank account is marked as "verified"
- ✅ **Balance tracking**: System tracks both "pending" and "available" balances
- ✅ **Transaction records**: Optional transaction ID tracking for audit trail
- ✅ **No duplicate transfers**: Once marked as transferred, can't be processed again

---

## 💡 Pro Tips:

1. **Keep records**: Always enter the transaction ID/UTR when marking as transferred
2. **Verify first**: Check the bank details carefully before transferring
3. **Small amounts first**: Test with ₹10-50 orders before processing large amounts
4. **Instant transfers**: Use UPI/IMPS for instant transfers instead of NEFT
5. **Screenshot everything**: Keep screenshots of successful transfers

---

## 🆘 Troubleshooting:

**Problem: "Can't see any pending payouts"**
- ✅ Did you run the database migration?
- ✅ Is the order marked as "Delivered"?
- ✅ Check `.env.local` has `RAZORPAY_MANUAL_PAYOUT=true`

**Problem: "Freelancer didn't receive balance"**
- ✅ Check if you clicked "Mark as Transferred"
- ✅ Refresh the freelancer's dashboard page
- ✅ Check Supabase database: `payments` table → `transferred_to_freelancer` should be `true`

**Problem: "Wrong amount calculated"**
- ✅ The system automatically calculates 86% for freelancer (after 14% commission)
- ✅ Client sees total with GST markup
- ✅ You keep the 14% commission

---

## 📊 Commission Breakdown:

| Scenario | Service Cost | Client Pays | Freelancer Gets | You Keep |
|----------|-------------|-------------|-----------------|----------|
| Example 1 | ₹1000 | ₹1025.20 | ₹860.00 | ₹165.20 |
| Example 2 | ₹5000 | ₹5126.00 | ₹4300.00 | ₹826.00 |
| Example 3 | ₹500 | ₹512.60 | ₹430.00 | ₹82.60 |

**Formula:**
- Client pays: `service + (service × 0.14 × 1.18)`
- Freelancer gets: `service × 0.86`
- You keep: `service × 0.14 × 1.18`

---

## ✅ Final Checklist:

- [ ] Database migration run successfully
- [ ] Can access `/admin/payouts` page
- [ ] Test order created and completed
- [ ] Pending payout appears in admin panel
- [ ] Bank details visible and copyable
- [ ] Manual transfer completed in bank app
- [ ] Marked as transferred in admin panel
- [ ] Freelancer balance updated correctly

---

## 🎉 You're Ready!

Once you complete Step 1 (database migration), you can immediately start processing manual payouts!

**Questions?** Check:
- Full guide: `MANUAL_PAYOUT_GUIDE.md`
- Setup details: `MANUAL_PAYOUT_SETUP.md`
- Production ready: `PRODUCTION_READY.md`
