# Razorpay Webhook Setup Guide

This guide will help you configure Razorpay webhooks to receive real-time payment notifications.

## 📋 Prerequisites

- Razorpay account with test/live API keys
- Your application must be deployed and accessible via HTTPS
- Webhook endpoint: `/api/webhooks/razorpay`

## 🔧 Step 1: Generate Webhook Secret

When you configure webhooks in Razorpay dashboard, they will provide you with a webhook secret. You'll need to add this to your environment variables.

## 🌐 Step 2: Configure Webhook in Razorpay Dashboard

### For Test Mode:
1. Go to [Razorpay Dashboard - Test Mode](https://dashboard.razorpay.com/app/webhooks)
2. Click **"+ Add New Webhook"**
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/webhooks/razorpay
   ```
   
   For development (using ngrok or similar):
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/razorpay
   ```

4. **Select Events to Track:**
   - ✅ `payment.authorized` - Payment authorized by bank
   - ✅ `payment.captured` - Payment successfully captured
   - ✅ `payment.failed` - Payment failed
   - ✅ `refund.processed` - Refund successful
   - ✅ `refund.failed` - Refund failed
   - ✅ `transfer.processed` - Transfer to freelancer successful (if using Route/Transfers)
   - ✅ `transfer.failed` - Transfer failed

5. **Alert Email:** Enter your email for webhook failure notifications

6. Click **"Create Webhook"**

7. **Copy the Webhook Secret** - You'll see it after creation

### For Live Mode:
Repeat the same steps in Live Mode after testing is complete.

## 🔐 Step 3: Update Environment Variables

Add the webhook secret to your `.env.local` file:

```bash
# Replace 'your_actual_webhook_secret' with the secret from Razorpay dashboard
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🧪 Step 4: Test Webhook (Local Development)

If you're testing locally, you need to expose your localhost to the internet:

### Option 1: Using ngrok
```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the ngrok URL in Razorpay webhook configuration
# Example: https://abc123.ngrok.io/api/webhooks/razorpay
```

### Option 2: Using Cloudflare Tunnel
```bash
# Install Cloudflare Tunnel
npm install -g cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:3000
```

## ✅ Step 5: Verify Webhook Setup

### Test the endpoint directly:
```bash
curl http://localhost:3000/api/webhooks/razorpay
```

Expected response:
```json
{
  "status": "active",
  "message": "Razorpay webhook endpoint is ready"
}
```

### Test with Razorpay Dashboard:
1. Go to **Webhooks** in Razorpay Dashboard
2. Click on your webhook
3. Click **"Send Test Webhook"**
4. Select an event (e.g., `payment.captured`)
5. Click **"Send"**
6. Check your server logs to confirm receipt

## 📊 Step 6: Monitor Webhooks

### In Razorpay Dashboard:
- View webhook delivery status
- Check failed deliveries
- Retry failed webhooks
- View webhook payload and response

### In Your Application:
Check server logs for webhook events:
```bash
# Look for these log messages:
"Received Razorpay webhook: payment.captured"
"Payment captured successfully for order: xxx"
```

## 🔍 Webhook Events Handled

| Event | Description | Action Taken |
|-------|-------------|--------------|
| `payment.authorized` | Payment authorized by bank | Log authorization |
| `payment.captured` | Payment successfully captured | Create payment record, update order status to 'accepted', update freelancer balance |
| `payment.failed` | Payment failed | Create failed payment record |
| `transfer.processed` | Transfer to freelancer successful | Update payment record with transfer ID |
| `transfer.failed` | Transfer to freelancer failed | Log failure for manual processing |
| `refund.processed` | Refund successful | Update payment with refund details |
| `refund.failed` | Refund failed | Log failure for manual processing |

## 🛡️ Security Features

✅ **Signature Verification** - All webhooks are verified using HMAC SHA256
✅ **Timing Safe Comparison** - Prevents timing attacks
✅ **Error Handling** - Graceful error handling with logging
✅ **Idempotency** - Duplicate events are handled safely

## 🚨 Troubleshooting

### Webhook Not Receiving Events

1. **Check URL accessibility:**
   ```bash
   curl https://your-domain.com/api/webhooks/razorpay
   ```

2. **Check webhook secret:**
   - Ensure `RAZORPAY_WEBHOOK_SECRET` is set correctly
   - No extra spaces or quotes

3. **Check Razorpay Dashboard:**
   - Look for failed webhook deliveries
   - Check the error messages

4. **Check server logs:**
   - Look for "Invalid webhook signature" errors
   - Check for any server errors

### Signature Verification Failing

1. **Verify webhook secret:**
   ```bash
   echo $RAZORPAY_WEBHOOK_SECRET
   ```

2. **Check environment variable loading:**
   - Restart your Next.js server after updating .env.local
   - Verify the variable is accessible

3. **Raw body requirement:**
   - Webhook signature verification requires the raw request body
   - Next.js handles this automatically for API routes

## 📝 Testing Checklist

- [ ] Webhook endpoint is accessible via HTTPS
- [ ] Webhook secret is configured in environment
- [ ] Test webhook from Razorpay dashboard works
- [ ] Payment captured event updates order status
- [ ] Payment failed event is logged
- [ ] Refund event updates payment record
- [ ] Server logs show webhook events

## 🚀 Production Deployment

Before going live:

1. **Switch to Live Mode:**
   - Update API keys to live keys (`rzp_live_xxxxx`)
   - Configure webhook in Live Mode dashboard
   - Update `RAZORPAY_WEBHOOK_SECRET` with live secret

2. **Monitor Webhooks:**
   - Set up alerts for webhook failures
   - Monitor webhook delivery success rate
   - Review failed webhooks regularly

3. **Backup Plan:**
   - Implement webhook retry logic
   - Have manual reconciliation process
   - Set up monitoring and alerts

## 🔗 Useful Links

- [Razorpay Webhooks Documentation](https://razorpay.com/docs/webhooks/)
- [Razorpay Dashboard - Webhooks](https://dashboard.razorpay.com/app/webhooks)
- [Webhook Signature Verification](https://razorpay.com/docs/webhooks/validate-test/)

## 📞 Support

If you encounter issues:
1. Check Razorpay Dashboard for webhook delivery logs
2. Review server logs for errors
3. Contact Razorpay Support if needed
4. Check the webhook endpoint implementation in `app/api/webhooks/razorpay/route.ts`
