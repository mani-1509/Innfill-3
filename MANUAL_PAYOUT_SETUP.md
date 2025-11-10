# ✅ Manual Payout Setup Checklist

## 🎯 Quick Setup (5 Minutes)

### Step 1: Run Database Migration
```bash
# Go to Supabase Dashboard → SQL Editor
# Run the migration file: supabase/migrations/003_add_manual_payout_columns.sql
```

OR if you have Supabase CLI:
```bash
supabase db push
```

### Step 2: Verify Environment Variables
Check your `.env.local` file has:
```bash
RAZORPAY_MANUAL_PAYOUT=true
```

### Step 3: Test the System
1. Create a test order
2. Complete the order
3. Go to `/admin/payouts`
4. You should see pending payout with bank details

---

## 📊 Database Columns Added

The migration adds these columns to `payments` table:

| Column | Type | Purpose |
|--------|------|---------|
| `transfer_pending_manual` | BOOLEAN | Marks payment waiting for manual transfer |
| `manual_transfer_confirmed` | BOOLEAN | Marks manual transfer as confirmed by admin |
| `manual_transfer_id` | TEXT | Stores transaction ID/UTR from bank transfer |
| `manual_transfer_date` | TIMESTAMPTZ | Timestamp when transfer was confirmed |

---

## 🔧 Updated Files

### 1. **lib/actions/payments.ts**
   - ✅ `transferToFreelancer()` - Detects manual mode
   - ✅ `confirmManualTransfer()` - Marks transfer complete
   - Status: Ready to use

### 2. **app/admin/payouts/page.tsx**
   - ✅ Beautiful UI for viewing pending payouts
   - ✅ Copy bank details with one click
   - ✅ Mark as transferred with transaction ID
   - Status: Ready to use

### 3. **.env.local**
   - ✅ `RAZORPAY_MANUAL_PAYOUT=true`
   - Status: Already configured

### 4. **supabase/migrations/003_add_manual_payout_columns.sql**
   - ✅ Adds required database columns
   - Status: Needs to be run

---

## 🚀 How to Use

### For You (Admin):

1. **When order completes:**
   - System automatically marks for manual payout
   - Go to `/admin/payouts`

2. **View pending payouts:**
   - See all orders waiting for payment
   - Copy bank details (account number, IFSC, etc.)

3. **Transfer money:**
   - Use your bank app/UPI
   - Transfer the exact amount shown
   - Note the transaction ID

4. **Confirm transfer:**
   - Enter transaction ID (optional)
   - Click "Mark as Transferred"
   - ✅ Done! Freelancer balance updated

### For Freelancers:

- They just need to add their bank details in profile
- Once you transfer and confirm, their balance updates automatically
- They can withdraw to their account anytime

---

## 💰 Money Flow Example

```
Client Order: ₹5,000 service
  ↓
Client Pays: ₹5,126 (with GST)
  ↓
Goes to YOUR Razorpay account ✅
  ↓
Order completed
  ↓
System shows: Transfer ₹4,300 to freelancer
  ↓
YOU transfer via bank/UPI 💸
  ↓
YOU mark as "Transferred" ✅
  ↓
Freelancer available_balance: +₹4,300
  ↓
Platform keeps: ₹826 commission
```

---

## 🎨 Admin UI Features

- **Dark Theme**: Beautiful gradient cards
- **Copy to Clipboard**: One-click copy bank details
- **Payment Breakdown**: Clear commission calculation
- **Transaction Tracking**: Save transaction IDs
- **Real-time Updates**: Auto-refresh on confirm

---

## 🔄 Upgrade Path (Future)

When you get business registration:

1. Complete Razorpay Payouts KYC
2. Update `.env.local`:
   ```bash
   RAZORPAY_MANUAL_PAYOUT=false
   RAZORPAY_ACCOUNT_NUMBER=your_account_number
   ```
3. Done! Automatic payouts enabled! 🎉

No code changes needed - just flip the environment variable!

---

## ✅ Testing Checklist

- [ ] Database migration run successfully
- [ ] Can access `/admin/payouts` page
- [ ] Create test order
- [ ] Complete test order
- [ ] See order in pending payouts
- [ ] Bank details visible and copyable
- [ ] Can enter transaction ID
- [ ] Can mark as transferred
- [ ] Freelancer balance updates correctly
- [ ] Order disappears from pending list

---

## 📞 Support

If something doesn't work:

1. Check database migration ran successfully
2. Verify `RAZORPAY_MANUAL_PAYOUT=true` in `.env.local`
3. Check browser console for errors
4. Check Supabase logs for database errors

---

**Status:** ✅ READY TO USE  
**Current Mode:** Manual Payout  
**Admin URL:** `/admin/payouts`

Start processing payouts now! 🚀
