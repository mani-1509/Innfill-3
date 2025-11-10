# 💰 Manual Payout System - For Non-Business Accounts

**Status:** ✅ READY TO USE  
**Use Case:** You don't have Razorpay business account yet

---

## 🎯 How It Works Now

### **Phase 1: Client Pays (Automatic)**
```
Client pays ₹5,126
  ↓
Money lands in YOUR Razorpay account ✅
  ↓
Freelancer pending_balance: +₹4,300
```

### **Phase 2: Order Completes (Semi-Automatic)**
```
Order marked as "completed"
  ↓
System shows: "Transfer marked for manual payout"
  ↓
You get freelancer's bank details:
  - Account Holder: John Doe
  - Account Number: 1234567890
  - IFSC: SBIN0001234
  - Amount: ₹4,300
```

### **Phase 3: You Transfer Manually**
```
Use YOUR bank app:
  - NEFT/IMPS/RTGS
  - UPI
  - PhonePe/GPay
  ↓
Transfer ₹4,300 to freelancer
  ↓
Mark as "Transferred" in admin panel
  ↓
✅ Done! Freelancer balance updated
```

---

## 🚀 Setup (2 Minutes)

### **Already Done:**
✅ Updated `.env.local`:
```bash
RAZORPAY_MANUAL_PAYOUT=true
```

✅ Updated code to support manual payouts

### **You Need to Do:**
Nothing! Just use the system as normal.

---

## 📋 Step-by-Step: Manual Payout Process

### **1. When Order Completes:**

System will return:
```json
{
  "success": true,
  "manual": true,
  "message": "Transfer marked for manual payout",
  "freelancerDetails": {
    "name": "John Doe",
    "accountNumber": "1234567890",
    "ifsc": "SBIN0001234",
    "amount": 4300
  }
}
```

### **2. Transfer Money (Your Bank App):**

**Option A: NEFT/IMPS/RTGS**
1. Open your bank app/net banking
2. Add beneficiary:
   - Name: [from freelancerDetails]
   - Account: [from freelancerDetails]
   - IFSC: [from freelancerDetails]
3. Transfer amount
4. Note the transaction ID/UTR

**Option B: UPI**
1. Open PhonePe/GPay/Paytm
2. Go to "Bank Transfer"
3. Enter account & IFSC
4. Send ₹4,300
5. Note the UPI transaction ID

### **3. Mark as Transferred (Code):**

```typescript
import { confirmManualTransfer } from '@/lib/actions/payments'

// After you've transferred manually
const result = await confirmManualTransfer(
  orderId, 
  'UPI123456789' // Your transaction ID (optional)
)

if (result.success) {
  console.log('✅ Transfer confirmed!')
  // Freelancer balance updated automatically
}
```

---

## 🎨 Simple Admin UI (Copy-Paste)

Create this file: `app/admin/payouts/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { confirmManualTransfer } from '@/lib/actions/payments'

export default function ManualPayoutsPage() {
  const [pending, setPending] = useState([])

  useEffect(() => {
    loadPending()
  }, [])

  async function loadPending() {
    const supabase = createClient()
    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        order:orders(*),
        freelancer:orders(freelancer:profiles!orders_freelancer_id_fkey(*))
      `)
      .eq('transfer_pending_manual', true)
      .eq('transferred_to_freelancer', false)
    
    setPending(data || [])
  }

  async function markTransferred(orderId: string, transactionId: string) {
    const result = await confirmManualTransfer(orderId, transactionId)
    if (result.success) {
      alert('✅ Transfer confirmed!')
      loadPending()
    } else {
      alert('❌ ' + result.error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pending Manual Payouts</h1>
      
      {pending.length === 0 ? (
        <p className="text-gray-400">No pending payouts</p>
      ) : (
        <div className="space-y-4">
          {pending.map((payment) => {
            const freelancer = payment.freelancer?.[0]?.freelancer
            const order = payment.order?.[0]
            
            return (
              <div key={payment.id} className="bg-white/5 p-6 rounded-lg border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-white">Order #{order?.id?.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-400">Amount: ₹{payment.amount}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                    Pending Manual Transfer
                  </span>
                </div>

                <div className="bg-black/30 p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Transfer to:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {freelancer?.bank_account_holder_name}</p>
                    <p><strong>Account:</strong> {freelancer?.bank_account_number}</p>
                    <p><strong>IFSC:</strong> {freelancer?.bank_ifsc}</p>
                    <p><strong>Amount:</strong> ₹{(payment.amount * 0.86).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Transaction ID/UTR (optional)"
                    id={`txn-${payment.id}`}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-4 py-2"
                  />
                  <button
                    onClick={() => {
                      const txnId = document.getElementById(`txn-${payment.id}`).value
                      markTransferred(order.id, txnId)
                    }}
                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Mark as Transferred
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

---

## 📊 Database Changes Needed

Add these columns to `payments` table:

```sql
ALTER TABLE payments 
ADD COLUMN transfer_pending_manual BOOLEAN DEFAULT FALSE,
ADD COLUMN manual_transfer_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN manual_transfer_id TEXT;
```

Or run in Supabase Dashboard → SQL Editor.

---

## 🎯 Complete Workflow Example

### **Scenario: Client pays for ₹5,000 service**

```
DAY 1:
------
10:00 AM - Client creates order
10:05 AM - Client pays ₹5,126
           ↓
           YOUR Razorpay balance: +₹5,126 ✅
           Freelancer pending: +₹4,300

DAY 3:
------
2:00 PM - Freelancer delivers work
2:30 PM - Client marks "Completed"
          ↓
          System logs: "Transfer marked for manual payout"
          You see freelancer bank details

2:35 PM - YOU open PhonePe
2:36 PM - YOU transfer ₹4,300 to freelancer
          Transaction ID: UPI123456789

2:40 PM - YOU go to /admin/payouts
2:41 PM - YOU click "Mark as Transferred"
          Enter: UPI123456789
          ↓
          ✅ Payment record updated
          ✅ Freelancer available_balance: +₹4,300
          ✅ Account marked verified

LATER:
------
T+2 Days - Razorpay settles ₹5,126 to YOUR bank
           You keep ₹826 as commission 💰
```

---

## ✅ Advantages of Manual Payout

1. **No Business Registration Needed** ✅
2. **No Razorpay Payouts KYC** ✅
3. **Use Any Payment Method** (UPI/NEFT/IMPS)
4. **Lower Fees** (your bank's transfer fee only)
5. **Full Control** over when to pay
6. **Works Immediately** (no waiting for approval)

---

## ❌ Disadvantages

1. **Manual Work** (you need to transfer each time)
2. **Slower** (not instant like API)
3. **More Tracking** (need to record transaction IDs)
4. **Can't Scale** (100 payouts = 100 manual transfers!)

---

## 🚀 When to Upgrade to Automatic

Once you have:
- ✅ Registered business (GST/Company)
- ✅ Razorpay business account
- ✅ Regular payouts (>10 per month)

Then:
1. Complete Razorpay Payouts KYC
2. Update `.env.local`: `RAZORPAY_MANUAL_PAYOUT=false`
3. Add `RAZORPAY_ACCOUNT_NUMBER`
4. Done! Automatic payouts enabled! 🎉

---

## 🎯 Summary

**Current Setup:**
- ✅ Client payments work (automatic)
- ✅ Order management works
- ⚠️ Payouts are MANUAL (you transfer via your bank)
- ✅ System tracks everything

**Your Action Required:**
1. Client completes order
2. You see bank details
3. **You transfer money** via your bank app
4. You mark as "Transferred" in admin panel
5. Done! ✅

---

## 💡 Pro Tips

1. **Keep Transaction Records:**
   - Screenshot each transfer
   - Note the UTR/Transaction ID
   - Store in spreadsheet

2. **Set a Schedule:**
   - Transfer all pending payouts every Friday
   - Or daily if you have many orders

3. **Use UPI for Speed:**
   - Instant transfer
   - No bank charges usually
   - Easy transaction ID

4. **Upgrade When Ready:**
   - Start with manual (simple)
   - Get business registration when growing
   - Switch to automatic later

---

**Status:** ✅ READY TO USE  
**Perfect For:** Startups, MVPs, Non-registered businesses  
**Cost:** Just your bank's transfer fee (usually ₹0-5)

Start accepting payments NOW without business registration! 🚀
