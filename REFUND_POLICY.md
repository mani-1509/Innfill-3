# 💰 Refund Policy - INNFILL Platform

**Last Updated:** November 11, 2025

---

## 📋 Refund Calculation Formula

When a client cancels a paid order, the refund is calculated as follows:

```
Refund Amount = Service Price - 4% Processing Fee
```

**Non-Refundable:**
- GST (18% on 14% platform commission)
- 4% Processing Fee

---

## 💡 Example Breakdown

### For a ₹10,000 Service:

**Client Payment:**
```
Service Price:              ₹10,000.00
Platform Commission (14%):  ₹ 1,400.00 (deducted from freelancer)
GST on Commission (18%):    ₹   252.00 (charged to client)
────────────────────────────────────────
Total Paid to Razorpay:     ₹10,252.00
```

**Refund Breakdown:**
```
Service Price:              ₹10,000.00
Less: Processing Fee (4%):  ₹   400.00 ❌
Less: GST:                  ₹   252.00 ❌ (non-refundable)
────────────────────────────────────────
Refund Amount:              ₹ 9,600.00 ✅
```

**Client Net Loss:** ₹652.00 (4% fee + GST)

---

## 📊 Refund Examples

| Service Price | Total Paid | Processing Fee (4%) | GST | **Refund** | Client Loses |
|--------------|------------|---------------------|-----|------------|--------------|
| ₹1,000 | ₹1,025.20 | ₹40 | ₹25.20 | **₹960** | ₹65.20 |
| ₹5,000 | ₹5,126.00 | ₹200 | ₹126.00 | **₹4,800** | ₹326.00 |
| ₹10,000 | ₹10,252.00 | ₹400 | ₹252.00 | **₹9,600** | ₹652.00 |
| ₹25,000 | ₹25,630.00 | ₹1,000 | ₹630.00 | **₹24,000** | ₹1,630.00 |
| ₹50,000 | ₹51,260.00 | ₹2,000 | ₹1,260.00 | **₹48,000** | ₹3,260.00 |

---

## 🎯 Refund Scenarios

### 1️⃣ **Client Cancels Before Payment**
- **Refund:** Not applicable (no payment made)
- **Charges:** None
- **Status:** Order cancelled, no fees

### 2️⃣ **Client Cancels After Payment (Before Work Starts)**
- **Refund:** Service Price - 4% fee = ₹9,600 (for ₹10,000 service)
- **Non-refundable:** GST (₹252) + Processing Fee (₹400)
- **Processing Time:** 5-7 business days

### 3️⃣ **Client Cancels After Work Starts**
- **Refund:** Service Price - 4% fee = ₹9,600
- **Non-refundable:** GST + Processing Fee
- **Note:** Same refund regardless of work progress

### 4️⃣ **Freelancer Declines Before Accepting**
- **Refund:** **Full refund** = ₹10,252 (including GST, no processing fee)
- **Charges:** None
- **Reason:** Freelancer never accepted, so no service commitment

---

## 🔄 Refund Processing

### Timeline:
1. **Cancellation Requested** → Order status: `cancelled`
2. **Refund Initiated** → Razorpay processes refund
3. **Razorpay Processing** → 5-7 business days
4. **Amount Credited** → Back to original payment method

### What Gets Refunded:
✅ Service Price minus 4% processing fee  
❌ GST amount (non-refundable)  
❌ 4% processing fee (non-refundable)

---

## 📝 Refund Policy Rationale

### Why 4% Processing Fee?
- **Payment gateway costs** - Razorpay charges ~2% + GST
- **Administrative costs** - Order processing, support
- **Fraud prevention** - Discourages order abuse
- **Industry standard** - Common practice for marketplace platforms

### Why GST is Non-Refundable?
- **Tax compliance** - GST already paid to government
- **Legal requirement** - Cannot reclaim GST on cancelled orders
- **Platform policy** - Standard for Indian marketplace platforms

---

## 💬 Communication to Users

### In Cancel Modal:
```
Refund Information:
Service Price:              ₹10,000.00
Less: Processing Fee (4%):  -₹400.00
Less: GST (non-refundable): -₹252.00
───────────────────────────────────
Refund Amount:              ₹9,600.00
```

### After Cancellation:
```
Order Cancelled
Refund: ₹9,600.00 
(4% processing fee + GST non-refundable)
```

---

## 🔧 Technical Implementation

### Code Location:
- **Calculation:** `lib/actions/payments.ts` → `processRefund()`
- **Display:** `app/(app)/orders/[id]/page.tsx`

### Formula in Code:
```typescript
const servicePrice = payment.amount
const processingFee = servicePrice * 0.04
const refundAmount = servicePrice - processingFee

// Send to Razorpay
razorpay.payments.refund(payment.razorpay_payment_id, {
  amount: Math.round(refundAmount * 100) // Convert to paise
})
```

---

## 📞 Customer Support

### Common Questions:

**Q: Why don't I get the full amount back?**  
A: GST and processing fees are non-refundable as per platform policy.

**Q: How long does the refund take?**  
A: 5-7 business days for the amount to appear in your account.

**Q: Can I dispute the processing fee?**  
A: The 4% processing fee is standard and covers gateway costs and administration.

**Q: What if the freelancer hasn't started work?**  
A: The refund amount is the same regardless of work progress.

---

## ✅ Summary

| Item | Amount | Refunded? |
|------|--------|-----------|
| Service Price | ₹10,000 | Partially (96%) |
| Processing Fee (4%) | ₹400 | ❌ No |
| GST | ₹252 | ❌ No |
| **Total Refund** | **₹9,600** | ✅ Yes |

**Effective Refund Rate:** 93.6% of total payment  
**Platform Revenue:** 4% processing fee + GST

---

**This policy ensures fair treatment for both clients and platform while covering operational costs.**

**Last Verified:** November 11, 2025  
**Contact:** support@innfill.com
