# Order System Quick Test Guide

## 🧪 Manual Testing Steps

### Prerequisites:
- ✅ Two accounts: one client, one freelancer
- ✅ At least one service published by the freelancer
- ✅ Both accounts logged in (use different browsers or incognito)

---

## Test Case 1: Happy Path (Order → Deliver → Complete)

### As Client:
1. **Create Order**
   - Navigate to `/services/[service-id]`
   - Select a plan tier (Standard/Pro/Premium)
   - Click "Continue"
   - Enter requirements in textarea
   - (Optional) Upload files or add external links
   - Click "Place Order"
   - Should redirect to `/orders/[order-id]`
   - ✅ Verify: Status shows "Pending Acceptance"
   - ✅ Verify: Acceptance deadline shows time remaining

2. **Check Orders List**
   - Navigate to `/orders`
   - ✅ Verify: Order appears in "Active" tab
   - ✅ Verify: Order card shows correct details

### As Freelancer:
3. **Accept Order**
   - Navigate to `/orders`
   - Click on the new order
   - Click "Accept Order"
   - ✅ Verify: Status changes to "Accepted"
   - ✅ Verify: Timeline shows progress

4. **Start Working**
   - Click "Start Working" button
   - ✅ Verify: Status changes to "In Progress"
   - ✅ Verify: Timeline updates

5. **Submit Delivery**
   - Click "Submit Delivery"
   - (Optional) Upload files or add links in modal
   - Click "Submit Delivery"
   - ✅ Verify: Status changes to "Delivered"
   - ✅ Verify: Delivery section appears with files/links

### As Client:
6. **Complete Order**
   - Navigate to the order detail page
   - ✅ Verify: Can see delivery files/links
   - Click "Approve & Complete"
   - Confirm in prompt
   - ✅ Verify: Status changes to "Completed"
   - ✅ Verify: Order moves to "Completed" tab

---

## Test Case 2: Revision Flow

### Follow Test Case 1 steps 1-5, then:

### As Client:
6. **Request Revision**
   - Click "Request Revision" button
   - Enter revision details in modal
   - Click "Request Revision"
   - ✅ Verify: Status changes to "Revision Requested"
   - ✅ Verify: Revisions used counter increments

### As Freelancer:
7. **Deliver Again**
   - Click "Submit Delivery"
   - Upload new files/links
   - Submit
   - ✅ Verify: Status returns to "Delivered"

### As Client:
8. **Complete After Revision**
   - Approve order
   - ✅ Verify: Order completes successfully
   - ✅ Verify: Can't request more revisions if limit reached

---

## Test Case 3: Freelancer Declines Order

### As Client:
1. Create order (steps from Test Case 1)

### As Freelancer:
2. **Decline Order**
   - Navigate to order detail page
   - Click "Decline Order"
   - Confirm in prompt
   - ✅ Verify: Status changes to "Cancelled"
   - ✅ Verify: Order moves to "Cancelled" tab

---

## Test Case 4: Client Cancels Order

### Scenario A: Cancel Before Freelancer Accepts
1. Client creates order
2. **Before freelancer accepts:**
   - Client clicks "Cancel Order"
   - Enters cancellation reason
   - Confirms
   - ✅ Verify: Status changes to "Cancelled"
   - ✅ Verify: Full refund message shown

### Scenario B: Cancel After Freelancer Accepts
1. Client creates order
2. Freelancer accepts order
3. **Client cancels:**
   - Client clicks "Cancel Order"
   - ✅ Verify: Refund amount shows (price - 15% platform fee)
   - Confirms cancellation
   - ✅ Verify: Status changes to "Cancelled"

---

## Test Case 5: File Upload & External Links

### As Client (Creating Order):
1. **Test File Upload**
   - Click "Upload files" button
   - Select multiple files (< 5MB each)
   - ✅ Verify: Files appear in preview
   - ✅ Verify: Can remove individual files
   - Try uploading file > 5MB
   - ✅ Verify: Error message shown

2. **Test External Links**
   - Add Google Drive link
   - Click "Add another link"
   - Add Dropbox link
   - ✅ Verify: Can add multiple links
   - ✅ Verify: Can remove links
   - Try invalid URL
   - ✅ Verify: Validation error shown

### As Freelancer (Delivering):
3. **Test Delivery Files**
   - Same tests as above for delivery modal
   - ✅ Verify: Client can download files
   - ✅ Verify: External links are clickable

---

## Test Case 6: Search & Filters

### Orders List Page:
1. **Test Search**
   - Create multiple orders
   - Search by service title
   - ✅ Verify: Correct orders shown
   - Search by order ID
   - ✅ Verify: Specific order found
   - Search by username
   - ✅ Verify: Orders with that user shown

2. **Test Tabs**
   - Click "All Orders" tab
   - ✅ Verify: All orders shown
   - Click "Active" tab
   - ✅ Verify: Only active orders shown
   - Click "Completed" tab
   - ✅ Verify: Only completed orders shown
   - Click "Cancelled" tab
   - ✅ Verify: Only cancelled orders shown

---

## Test Case 7: Auto-Cancel (48hr Expired)

### Setup:
1. Client creates order
2. **Manually update database:**
   ```sql
   UPDATE orders 
   SET accept_deadline = NOW() - INTERVAL '1 hour' 
   WHERE id = 'order-id-here';
   ```

3. **Run auto-cancel function:**
   ```sql
   SELECT auto_cancel_expired_orders();
   ```

4. **Verify:**
   - ✅ Order status changed to "cancelled"
   - ✅ Order appears in "Cancelled" tab
   - ✅ Refund processed (check in future payment integration)

---

## Test Case 8: Revision Limit

### Setup:
1. Create order with 2 revisions allowed
2. Client requests revision (revisions_used = 1)
3. Freelancer delivers
4. Client requests revision again (revisions_used = 2)
5. Freelancer delivers
6. **Verify:**
   - ✅ "Request Revision" button is disabled/hidden
   - ✅ Only "Approve & Complete" button shown
   - ✅ Client must complete or cancel order

---

## Test Case 9: Price Breakdown

### As Client (Order Creation):
1. Select different plan tiers
2. **Verify for each plan:**
   - ✅ Service price shows correctly
   - ✅ Platform fee = 15% of service price
   - ✅ Total = service price + platform fee
   - ✅ Calculation is accurate

---

## Test Case 10: Status Timeline

### Order Detail Page:
1. **At each status, verify timeline:**
   - pending_acceptance: First step highlighted
   - accepted: First two steps highlighted
   - in_progress: First three steps highlighted
   - delivered: First four steps highlighted
   - completed: All five steps highlighted

2. **Verify animations:**
   - ✅ Progress bar fills correctly
   - ✅ Current step has ring animation
   - ✅ Completed steps are green
   - ✅ Pending steps are gray

---

## 🐛 Common Issues to Check

### UI/UX:
- [ ] All buttons have loading states
- [ ] Error messages display clearly
- [ ] Modals close properly
- [ ] Forms validate before submission
- [ ] Empty states show when no data
- [ ] Loading skeletons appear during fetch
- [ ] Responsive on mobile devices

### Data:
- [ ] Order IDs are unique
- [ ] Timestamps are correct
- [ ] User roles are validated
- [ ] Status transitions follow rules
- [ ] Files/links save correctly
- [ ] Revision counter increments
- [ ] Platform fee calculates correctly

### Permissions:
- [ ] Clients can't accept orders
- [ ] Freelancers can't request revisions
- [ ] Users can only access their own orders
- [ ] Can't perform actions on wrong status
- [ ] Unauthorized access shows error

---

## 📊 Database Checks

### After Testing, Verify:

1. **Orders Table:**
   ```sql
   SELECT id, status, revisions_used, created_at, accept_deadline 
   FROM orders 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

2. **Stats Updated:**
   ```sql
   -- Check freelancer stats
   SELECT id, username, total_earnings, total_orders 
   FROM profiles 
   WHERE role = 'freelancer';
   
   -- Check client stats
   SELECT id, username, total_spent, total_orders 
   FROM profiles 
   WHERE role = 'client';
   ```

3. **Auto-Cancel Function:**
   ```sql
   -- Check for expired orders
   SELECT id, status, accept_deadline 
   FROM orders 
   WHERE status = 'pending_acceptance' 
   AND accept_deadline < NOW();
   
   -- Run auto-cancel
   SELECT auto_cancel_expired_orders();
   
   -- Verify cancelled
   SELECT COUNT(*) FROM orders WHERE status = 'cancelled';
   ```

---

## ✅ Success Criteria

An order system test is successful if:
- [x] Order can be created without errors
- [x] Freelancer can accept/decline orders
- [x] Status transitions work correctly
- [x] Files and links save and display properly
- [x] Revisions system works within limits
- [x] Cancellations process refunds correctly
- [x] Stats update on completion
- [x] UI is responsive and user-friendly
- [x] No TypeScript errors in console
- [x] No runtime errors in browser console

---

## 🔥 Edge Cases to Test

1. **Multiple Orders:**
   - Create 10+ orders
   - Verify list pagination/performance
   - Search still works

2. **Large Files:**
   - Try uploading 4.9MB file (should work)
   - Try uploading 5.1MB file (should fail)
   - Verify error message

3. **Special Characters:**
   - Requirements with emojis 🎉
   - Links with query parameters
   - File names with spaces

4. **Network Issues:**
   - Slow connection (throttle in DevTools)
   - Offline mode
   - Verify loading states work

5. **Browser Compatibility:**
   - Test in Chrome, Firefox, Safari, Edge
   - Test on mobile browsers
   - Verify animations work

---

## 📝 Test Report Template

```
Date: [DATE]
Tester: [NAME]
Environment: [Production/Staging/Local]

Test Case 1: Happy Path
✅ PASS / ❌ FAIL
Notes: [Any issues found]

Test Case 2: Revision Flow
✅ PASS / ❌ FAIL
Notes: [Any issues found]

[... continue for all test cases ...]

Overall Status: [PASS/FAIL]
Bugs Found: [COUNT]
Critical Issues: [LIST]
```

---

**Remember:** Test thoroughly before deploying to production! 🚀
