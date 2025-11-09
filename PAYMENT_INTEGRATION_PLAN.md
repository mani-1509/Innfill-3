# INNFILL Payment Integration - Implementation Plan

**Start Date:** November 9, 2025  
**Status:** In Progress  
**Gateway:** Razorpay Route  
**Mode:** Test Mode

---

## 💰 Payment Model (Finalized)

### Commission Structure
- **Platform Commission:** 14% total
  - Platform keeps: 12%
  - Razorpay fee: 2%
- **GST:** 18% on commission
- **Payment Method:** Charge AFTER freelancer accepts

### Example Breakdown (₹10,000 order)

| Item | Amount | Notes |
|------|--------|-------|
| Service Price | ₹10,000 | Base amount |
| Platform Commission (14%) | ₹1,400 | 12% ours + 2% Razorpay |
| GST on Commission (18%) | ₹252 | Tax on ₹1,400 |
| **Client Pays** | **₹10,252** | Total charged |
| Razorpay Gateway Fee (2% + GST) | ₹236 | Deducted from our 2% |
| **Platform Net Revenue** | **₹1,416** | ₹1,652 - ₹236 |
| **Freelancer Receives** | **₹10,000** | Full service amount |

---

## 🔄 Payment Flow

### 1. Order Creation
- Client browses service, clicks "Order Now"
- Modal shows price breakdown:
  - Service: ₹X
  - Platform fee (14%): ₹X
  - GST (18%): ₹X
  - **Total: ₹X**
- Note: "Payment will be charged after freelancer accepts"
- Order created with status: `pending_acceptance`

### 2. Freelancer Accepts
- Freelancer clicks "Accept Order" within 48 hours
- System checks if freelancer has bank details in profile
- If NO: Show "Add bank details first" → redirect to profile/finance
- If YES:
  - Order status → `pending_payment`
  - Create Razorpay order
  - Notify client: "Freelancer accepted! Complete payment to proceed"

### 3. Payment Collection (48-hour window)
- Client receives notification
- Client clicks "Pay Now" on order page
- Razorpay checkout modal opens with:
  - Order summary
  - Amount breakdown
  - Payment methods (UPI, Cards, Net Banking, Wallets)
- Client completes payment
- On Success:
  - Order status → `accepted` → `in_progress`
  - Payment record created
  - Both parties notified
  - Chat room opens
- On Failure:
  - Show retry option
  - Allow 48 hours for payment

### 4. 48-Hour Payment Timer
- Timer starts when freelancer accepts
- If client doesn't pay within 48 hours:
  - Order status → `cancelled`
  - Reason: "Payment not completed within 48 hours"
  - Freelancer slot freed up
  - Both parties notified

### 5. Order Completion & Payout
- Freelancer delivers work
- Client approves order
- Order status → `completed`
- Trigger payment split:
  - Platform keeps: ₹1,416 (commission + GST - gateway fee)
  - Transfer to freelancer: ₹10,000
- Settlement: T+2 automatic to freelancer bank
- Update earnings in profiles table

### 6. Cancellation & Refunds
**If client cancels AFTER payment:**
- Refund calculation:
  - Original amount: ₹10,252
  - Minus Razorpay fee: ₹236 (non-refundable)
  - Minus GST: ₹252 (non-refundable)
  - **Client gets: ₹9,764**
- Process refund via Razorpay
- Order status → `cancelled`
- Freelancer gets nothing

**If freelancer declines BEFORE payment:**
- No payment made, no refund needed
- Order status → `declined`
- Client notified

---

## 🗄️ Database Changes

### New Migration: `007_payment_system.sql`

**Add to `profiles` table:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpay_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account_holder_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS available_balance DECIMAL(10,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(10,2) DEFAULT 0;
```

**Add to `orders` table:**
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS platform_commission DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2);
```

**Update `payments` table:**
```sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_transfer_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_fee DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_captured_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
```

**Update order status enum:**
```sql
-- Add new status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN (
    'pending_acceptance',
    'pending_payment',  -- NEW
    'accepted',
    'in_progress',
    'delivered',
    'revision_requested',
    'completed',
    'cancelled',
    'declined'
  ));
```

---

## 🔧 Server Actions to Build

### File: `lib/actions/payments.ts`

**1. Bank Account Management:**
- `addBankDetails(accountNumber, ifsc, holderName, panNumber)`
- `updateBankDetails(data)`
- `verifyBankDetails()` - Using Razorpay verification
- `getBankDetails(userId)`

**2. Payment Order Creation:**
- `createPaymentOrder(orderId)` - Called when freelancer accepts
- `calculateOrderAmounts(servicePrice)` - Returns breakdown
- `verifyPaymentSignature(orderId, paymentId, signature)`
- `capturePayment(paymentId, amount)`

**3. Payment Completion:**
- `handlePaymentSuccess(orderId, paymentId, signature)`
- `handlePaymentFailure(orderId, errorCode, errorMessage)`
- `transferToFreelancer(orderId)` - Called on order completion
- `updateFreelancerBalance(freelancerId, amount)`

**4. Refunds:**
- `processRefund(orderId, reason)` - Calculate and initiate refund
- `handleRefundSuccess(orderId, refundId)`

**5. Earnings:**
- `getEarningsSummary(freelancerId)` - Available, pending, total
- `getTransactionHistory(userId, filters)`
- `getEarningsChart(freelancerId, period)` - For charts

---

## 🎨 Frontend Components to Build

### 1. Bank Details Form (`components/forms/bank-details-form.tsx`)
**Location:** Profile → Finance Section
- Bank account number input
- IFSC code input (with bank name auto-fetch)
- Account holder name input
- PAN number input (with format validation)
- Terms checkbox
- Submit button
- Verification status indicator

### 2. Payment Checkout Modal (`components/modals/payment-checkout-modal.tsx`)
**Triggered:** When client clicks "Pay Now" after acceptance
- Order summary
- Amount breakdown table
- Razorpay checkout integration
- Loading states
- Success/failure screens
- Retry option on failure

### 3. Payment Status Banner (`components/orders/payment-status-banner.tsx`)
**Location:** Order detail page
- Shows "Waiting for payment" when status = pending_payment
- Countdown timer (48 hours remaining)
- "Pay Now" button for client
- "Payment pending" indicator for freelancer

### 4. Earnings Dashboard Page (`app/(app)/earnings/page.tsx`)
**Route:** `/earnings` (Freelancers only)
- **Summary Cards:**
  - Available Balance (can withdraw)
  - Pending Balance (in active orders)
  - Total Earnings (lifetime)
  - This Month Earnings
- **Earnings Chart:**
  - Monthly earnings bar chart
  - Filter: Last 7 days, 30 days, 6 months, 1 year
- **Transaction History Table:**
  - Date, Order ID, Client, Amount, Status
  - Filter by status (completed, pending, refunded)
  - Search by order ID
  - Pagination
- **Quick Actions:**
  - View all orders button
  - Export to CSV (future)

### 5. Finance Settings Page (`app/(app)/profile/[username]/finance/page.tsx`)
**Location:** Profile → Finance Tab
- Bank details form (if not added)
- Current bank details display (if added)
- Edit bank details button
- KYC verification status
- Linked account status with Razorpay
- Security information

---

## 🔗 API Routes to Build

### Webhooks: `app/api/webhooks/razorpay/route.ts`
- Handle `payment.authorized` event
- Handle `payment.captured` event
- Handle `payment.failed` event
- Handle `transfer.processed` event
- Handle `transfer.failed` event
- Handle `refund.processed` event
- Signature verification
- Update database automatically

### Test Endpoint: `app/api/payments/test/route.ts`
- Test Razorpay connection
- Test webhook delivery
- Test signature verification
- Returns connection status

---

## 📝 Updates to Existing Code

### 1. Order Creation (`lib/actions/orders.ts` → `createOrder`)
**Add:**
- Calculate total_amount, platform_commission, gst_amount
- Store in order record
- Show breakdown in success message

### 2. Accept Order (`lib/actions/orders.ts` → `acceptOrder`)
**Modify:**
- Check if freelancer has bank details
- If NO: Return error "Please add bank details first"
- If YES:
  - Update status to `pending_payment`
  - Create Razorpay order
  - Set payment_deadline (48 hours from now)
  - Return razorpay_order_id for frontend

### 3. Complete Order (`lib/actions/orders.ts` → `completeOrder`)
**Add:**
- Trigger payment transfer to freelancer
- Update freelancer available_balance
- Create payment record with transfer details
- Log transaction

### 4. Cancel Order (`lib/actions/orders.ts` → `cancelOrder`)
**Add:**
- Check if payment was made
- If YES: Calculate refund amount and process
- If NO: Just cancel
- Update order status

### 5. Order Detail Page (`app/(app)/orders/[id]/page.tsx`)
**Add:**
- Payment status banner
- "Pay Now" button when status = pending_payment
- Payment countdown timer
- Transaction details section
- Refund information (if applicable)

### 6. Service Detail Page (`app/(app)/services/[id]/page.tsx`)
**Update order modal:**
- Add GST calculation in breakdown
- Show final total amount
- Add note: "Payment charged after freelancer accepts (within 48 hours)"

---

## 🔐 Environment Variables

### Already in `.env.local`:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

### Need to Add:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
NEXT_PUBLIC_PLATFORM_COMMISSION_PERCENT=14
NEXT_PUBLIC_GST_PERCENT=18
```

---

## ✅ Implementation Checklist

### Phase 1: Database & Backend (Day 1-2)
- [ ] Create migration 007_payment_system.sql
- [ ] Apply migration to database
- [ ] Create lib/actions/payments.ts file
- [ ] Implement bank details functions
- [ ] Implement payment order creation
- [ ] Implement payment verification
- [ ] Test all server actions

### Phase 2: Payment Integration (Day 3-4)
- [ ] Update acceptOrder() to create Razorpay order
- [ ] Update completeOrder() to transfer payment
- [ ] Update cancelOrder() to handle refunds
- [ ] Create webhook handler
- [ ] Test webhook with Razorpay dashboard
- [ ] Implement 48-hour auto-cancel cron

### Phase 3: Frontend - Bank Details (Day 4-5)
- [ ] Create bank-details-form.tsx component
- [ ] Add Finance tab to profile page
- [ ] Implement IFSC auto-fetch
- [ ] Add PAN validation
- [ ] Test form submission
- [ ] Show verification status

### Phase 4: Frontend - Payment Flow (Day 5-6)
- [ ] Create payment-checkout-modal.tsx
- [ ] Integrate Razorpay checkout script
- [ ] Add payment status banner to order page
- [ ] Add "Pay Now" button for clients
- [ ] Implement countdown timer
- [ ] Test complete payment flow

### Phase 5: Earnings Dashboard (Day 7-8)
- [ ] Create /earnings page route
- [ ] Build summary cards component
- [ ] Create earnings chart
- [ ] Build transaction history table
- [ ] Add filters and search
- [ ] Test with sample data

### Phase 6: Testing (Day 9-10)
- [ ] Test complete order flow with test payment
- [ ] Test freelancer acceptance without bank details
- [ ] Test payment timeout (48 hours)
- [ ] Test order completion with transfer
- [ ] Test cancellation with refund
- [ ] Test webhook handling
- [ ] Test earnings calculations
- [ ] Fix any bugs found

### Phase 7: Documentation (Day 10)
- [ ] Document payment flow for users
- [ ] Create admin guide for handling payment issues
- [ ] Document Razorpay setup steps
- [ ] Add troubleshooting guide
- [ ] Update INNFILL_IMPLEMENTATION_STATUS.md

---

## 🧪 Testing Strategy

### Test Cards (Razorpay Test Mode)
- Success: 4111 1111 1111 1111
- Failure: 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI
- Success: success@razorpay
- Failure: failure@razorpay

### Test Scenarios
1. **Happy Path:**
   - Client orders → Freelancer accepts → Client pays → Work delivered → Client approves → Payment transferred

2. **Payment Timeout:**
   - Client orders → Freelancer accepts → Client doesn't pay → 48 hours → Auto-cancel

3. **Payment Failure:**
   - Client orders → Freelancer accepts → Client tries to pay → Payment fails → Retry successful

4. **Cancellation After Payment:**
   - Client orders → Freelancer accepts → Client pays → Client cancels → Refund processed

5. **No Bank Details:**
   - Client orders → Freelancer tries to accept → Blocked → Add bank details → Accept successful

---

## 📊 Success Metrics

**After Implementation:**
- [ ] 95%+ payment success rate
- [ ] < 2% cancellation rate after payment
- [ ] Average payment time: < 24 hours after acceptance
- [ ] Zero payment disputes
- [ ] Freelancers paid within T+2 consistently

---

## 🚨 Known Limitations

1. **No Instant Withdrawal:** Only T+2 automatic settlement
2. **No International Payments:** India-only (Razorpay limitation)
3. **No Subscription/Recurring:** One-time payments only
4. **Manual Dispute Resolution:** No automated system yet
5. **No Payment Plans:** Full payment upfront only

---

## 🔮 Future Enhancements

1. **Instant Withdrawals:** Add option for freelancers (0.5% fee)
2. **International Payments:** Integrate PayPal/Stripe for global clients
3. **Escrow Visibility:** Show clients when payment held vs released
4. **Payment Analytics:** Revenue charts, success rates, trends
5. **Automated Dispute Resolution:** AI-powered resolution suggestions
6. **Payment Reminders:** SMS/Email reminders for pending payments
7. **Bulk Payouts:** Admin bulk payout feature
8. **Payment Links:** Alternative to checkout for specific use cases

---

**Implementation Start:** November 9, 2025  
**Expected Completion:** November 19, 2025 (10 days)  
**Status Updates:** Daily progress tracking

