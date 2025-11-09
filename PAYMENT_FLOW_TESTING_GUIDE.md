# Payment Flow Testing Guide

Complete end-to-end testing guide for the INNFILL payment system with Razorpay integration.

## 🎯 Testing Objectives

Test the complete order lifecycle from creation to completion, including:
- Order creation and acceptance
- Payment processing with Razorpay test cards
- Balance updates for freelancers
- Order status transitions
- Payment records and transaction history

---

## 📋 Prerequisites

### ✅ Before You Start:
- [ ] Dev server running (`npm run dev`)
- [ ] Two test accounts ready:
  - **Client account** (to place orders)
  - **Freelancer account** (to accept orders and receive payments)
- [ ] At least one active service created by the freelancer
- [ ] Razorpay test keys configured in `.env.local`

### 🔑 Razorpay Test Cards
Have these ready for testing:

| Scenario | Card Number | CVV | Expiry | Result |
|----------|-------------|-----|--------|--------|
| **Success** | 4111 1111 1111 1111 | 123 | 12/25 | Payment succeeds |
| **Failure** | 4000 0000 0000 0002 | 123 | 12/25 | Payment fails |
| **3D Secure** | 5104 0600 0000 0008 | 123 | 12/25 | Requires OTP (123456) |

---

## 🧪 Test Case 1: Successful Payment Flow

### Step 1: Create Order (as Client)
1. **Login** as client account
2. **Navigate** to a freelancer's service page
3. **Select a plan tier** (Basic/Standard/Premium)
4. **Click "Order Now"**
5. **Fill in requirements:**
   - Add project description
   - Upload any required files (optional)
   - Add reference links (optional)
6. **Review payment breakdown:**
   - ✅ Service Price: ₹X,XXX
   - ✅ Platform Commission (14%): ₹XXX
   - ✅ GST on Commission (18%): ₹XX
   - ✅ Total Amount: ₹X,XXX
7. **Click "Place Order"**

**Expected Results:**
- ✅ Order created with status `pending_acceptance`
- ✅ Order appears in both client and freelancer dashboards
- ✅ Client sees "Waiting for acceptance" message
- ✅ Freelancer receives notification

### Step 2: Accept Order (as Freelancer)
1. **Switch to freelancer account**
2. **Go to Orders** → **Pending Acceptance** tab
3. **Click on the order** to view details
4. **Click "Accept Order"**

**Expected Results:**
- ✅ Order status changes to `pending_payment`
- ✅ Payment deadline set (48 hours from now)
- ✅ Payment banner appears for client
- ✅ Freelancer sees "Awaiting payment" status

### Step 3: View Payment Details (as Client)
1. **Switch to client account**
2. **Go to Orders** → Order should now show "Pending Payment"
3. **Click on the order**
4. **Verify payment banner shows:**
   - ⏰ Payment deadline countdown
   - 💰 Amount to pay
   - ⚠️ Urgency warnings (if < 24 hours)

**Expected Results:**
- ✅ Payment status banner visible at top
- ✅ "Pay Now" button prominently displayed
- ✅ Payment breakdown section shows:
   - Service Price
   - Platform Commission (14%)
   - GST (18% on commission)
   - Total Amount
- ✅ Freelancer earnings shown

### Step 4: Make Payment (as Client)
1. **Click "Pay Now"** button
2. **Payment modal opens** with:
   - Order summary
   - Payment breakdown
   - Total amount
   - "How it works" section
3. **Click "Proceed to Payment"**
4. **Razorpay checkout opens**
5. **Enter test card details:**
   - Card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: `12/25`
   - Name: Any name
6. **Click "Pay"**

**Expected Results:**
- ✅ Razorpay creates real order (check console for order ID)
- ✅ Checkout modal opens without errors
- ✅ Payment processes successfully
- ✅ Success message displayed
- ✅ Modal closes automatically

### Step 5: Verify Payment Processing
**Check these immediately after payment:**

#### In Client Dashboard:
- ✅ Order status changes to `accepted`
- ✅ Payment banner disappears
- ✅ "Payment Completed" badge shows
- ✅ Order timeline shows payment event

#### In Freelancer Dashboard:
- ✅ Order status shows `accepted`
- ✅ Order can be moved to `in_progress`
- ✅ Payment amount visible in order details

#### In Database (Check Supabase):
1. **Orders table:**
   - `status = 'accepted'`
   - `razorpay_order_id` filled
   - `total_amount` set correctly
   - `platform_commission` calculated
   - `gst_amount` calculated

2. **Payments table:**
   - New payment record created
   - `status = 'completed'`
   - `razorpay_payment_id` filled
   - `amount` matches total
   - `platform_fee` matches commission
   - `freelancer_amount` calculated correctly
   - `payment_captured_at` timestamp set

3. **Profiles table (Freelancer):**
   - `pending_balance` increased by freelancer amount
   - `total_earnings` updated

### Step 6: Complete Order Workflow (as Freelancer)
1. **Mark order as "In Progress"**
2. **Work on the project** (simulated)
3. **Submit delivery:**
   - Add delivery message
   - Upload delivery files
   - Click "Submit Delivery"

**Expected Results:**
- ✅ Order status changes to `delivered`
- ✅ Client receives notification
- ✅ Client can review delivery

### Step 7: Complete Order (as Client)
1. **View delivered order**
2. **Review the delivery**
3. **Click "Mark as Complete"**

**Expected Results:**
- ✅ Order status changes to `completed`
- ✅ Freelancer's `pending_balance` moves to `available_balance`
- ✅ Order completion timestamp recorded
- ✅ Both parties can leave reviews

### Step 8: Verify Final Balances
#### Check Freelancer Profile → Finance Section:
- ✅ Available Balance increased
- ✅ Transaction appears in history
- ✅ Settlement eligible (if >= ₹1000)

---

## 🧪 Test Case 2: Payment Failure Handling

### Test with Failed Card
1. **Create and accept an order** (Steps 1-2 from Test Case 1)
2. **Click "Pay Now"**
3. **Use failure test card:** `4000 0000 0000 0002`
4. **Attempt payment**

**Expected Results:**
- ✅ Payment fails with error message
- ✅ Order status remains `pending_payment`
- ✅ Client can retry payment
- ✅ Failed payment logged in database (optional)
- ✅ No balance changes

---

## 🧪 Test Case 3: Payment Deadline Expiration

### Test Deadline Enforcement
1. **Create and accept an order**
2. **Wait for payment deadline** (or manually update in database for testing)
3. **Try to make payment after deadline**

**Expected Results:**
- ✅ Payment button shows expired state
- ✅ Order should auto-cancel (if implemented)
- ✅ Freelancer notified of expiration
- ✅ Warning messages displayed

**Manual Database Test:**
```sql
-- Set payment deadline to past
UPDATE orders 
SET payment_deadline = NOW() - INTERVAL '1 hour'
WHERE id = 'your_order_id';
```

---

## 🧪 Test Case 4: Order Cancellation with Refund

### Test Refund Flow
1. **Complete payment** (Test Case 1, Steps 1-4)
2. **Before delivery, cancel order:**
   - As client: Click "Cancel Order"
   - Provide cancellation reason
   - Confirm cancellation

**Expected Results:**
- ✅ Order status changes to `cancelled`
- ✅ Refund initiated (if implemented)
- ✅ Freelancer's pending balance decreases
- ✅ Refund record created
- ✅ Both parties notified

---

## 🧪 Test Case 5: 3D Secure Payment

### Test Authentication Flow
1. **Create and accept an order**
2. **Click "Pay Now"**
3. **Use 3D Secure card:** `5104 0600 0000 0008`
4. **Enter OTP:** `123456` when prompted
5. **Complete payment**

**Expected Results:**
- ✅ 3D Secure authentication popup appears
- ✅ OTP validation works
- ✅ Payment completes after authentication
- ✅ All verification steps pass

---

## 📊 Testing Checklist

### Payment Calculations ✓
- [ ] Service price displayed correctly
- [ ] Platform commission = 14% of service price
- [ ] GST = 18% of platform commission
- [ ] Total = service price + GST
- [ ] Freelancer amount = service price - commission
- [ ] Gateway fee calculated (if applicable)

### Order Status Transitions ✓
- [ ] `pending_acceptance` → Freelancer accepts
- [ ] `pending_payment` → Client pays
- [ ] `accepted` → Freelancer starts work
- [ ] `in_progress` → Work in progress
- [ ] `delivered` → Delivery submitted
- [ ] `completed` → Client accepts delivery

### Payment Processing ✓
- [ ] Razorpay order created successfully
- [ ] Payment signature verified
- [ ] Payment record created in database
- [ ] Order status updated correctly
- [ ] Balances updated accurately

### UI/UX Elements ✓
- [ ] Payment banner shows countdown
- [ ] Pay Now button prominent and working
- [ ] Payment modal displays correctly
- [ ] Razorpay checkout opens properly
- [ ] Success/failure messages clear
- [ ] Loading states during processing

### Edge Cases ✓
- [ ] Duplicate payment prevention
- [ ] Invalid order ID handling
- [ ] Network failure recovery
- [ ] Session expiration handling
- [ ] Browser refresh during payment

---

## 🐛 Common Issues & Solutions

### Issue: "Order not found"
**Solution:** Ensure order exists and has correct status

### Issue: "Invalid signature"
**Solution:** Check webhook secret matches in `.env.local`

### Issue: "Payment deadline expired"
**Solution:** Order must be paid within 48 hours of acceptance

### Issue: Razorpay checkout not opening
**Solution:** 
- Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- Verify Razorpay script loaded
- Check browser console for errors

### Issue: Payment successful but order status not updating
**Solution:**
- Check `verifyPayment` function logs
- Verify payment record created in database
- Check for errors in server logs

---

## 📈 Performance Metrics

Track these during testing:

| Metric | Target | Actual |
|--------|--------|--------|
| Order creation time | < 1s | ___ |
| Payment checkout load | < 2s | ___ |
| Payment verification | < 3s | ___ |
| Status update time | < 1s | ___ |
| Balance update time | < 1s | ___ |

---

## 🔍 Database Verification Queries

### Check Order Status
```sql
SELECT 
  id,
  status,
  payment_deadline,
  razorpay_order_id,
  total_amount,
  platform_commission,
  gst_amount
FROM orders 
WHERE id = 'your_order_id';
```

### Check Payment Record
```sql
SELECT 
  id,
  order_id,
  amount,
  platform_fee,
  freelancer_amount,
  status,
  razorpay_payment_id,
  payment_captured_at
FROM payments 
WHERE order_id = 'your_order_id';
```

### Check Freelancer Balance
```sql
SELECT 
  username,
  available_balance,
  pending_balance,
  total_earnings
FROM profiles 
WHERE id = 'freelancer_id';
```

---

## ✅ Test Completion Criteria

### All tests pass when:
- ✅ Order can be created and accepted
- ✅ Payment processes successfully with test cards
- ✅ Order status transitions correctly
- ✅ Balances update accurately
- ✅ Payment records created properly
- ✅ Failed payments handled gracefully
- ✅ UI shows correct information at all stages
- ✅ No console errors or warnings
- ✅ Database records consistent

---

## 🚀 Next Steps After Testing

1. **Fix any bugs found** during testing
2. **Test edge cases** (Test Case #16 in todo list)
3. **Deploy to staging** for further testing
4. **Configure production Razorpay keys**
5. **Set up monitoring and alerts**
6. **Go live!** 🎉

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Review server logs (terminal output)
3. Verify Supabase database records
4. Check Razorpay dashboard for payment logs
5. Review this guide's troubleshooting section
