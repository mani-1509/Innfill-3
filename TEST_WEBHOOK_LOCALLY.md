# Test Razorpay Webhook Locally

This script helps you test the Razorpay webhook endpoint locally.

## Prerequisites
- Server running on http://localhost:3000
- RAZORPAY_WEBHOOK_SECRET set in .env.local

## Test Steps

### 1. Test Endpoint Availability
```bash
curl http://localhost:3000/api/webhooks/razorpay
```

Expected Response:
```json
{
  "status": "active",
  "message": "Razorpay webhook endpoint is ready"
}
```

### 2. Generate Test Webhook Signature

To test signature verification, you need to generate a valid signature. Here's how:

```javascript
// test-webhook-signature.js
const crypto = require('crypto');

const webhookSecret = 'your_webhook_secret_here'; // Replace with your actual secret
const payload = JSON.stringify({
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: 'pay_test_12345',
        order_id: 'order_test_12345',
        amount: 51260,
        created_at: Math.floor(Date.now() / 1000)
      }
    }
  }
});

const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

console.log('Payload:', payload);
console.log('Signature:', signature);
```

### 3. Send Test Webhook

```bash
# Save this as test-webhook.sh
#!/bin/bash

WEBHOOK_URL="http://localhost:3000/api/webhooks/razorpay"
WEBHOOK_SECRET="your_webhook_secret_here"

# Test payload
PAYLOAD='{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_test_12345",
        "order_id": "order_test_12345",
        "amount": 51260,
        "created_at": 1234567890
      }
    }
  }
}'

# Generate signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

# Send request
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### 4. Test Using Node.js Script

Create `test-webhook.js`:

```javascript
const crypto = require('crypto');

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret_here';
const webhookUrl = 'http://localhost:3000/api/webhooks/razorpay';

// Test payload
const payload = {
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: 'pay_test_' + Date.now(),
        order_id: 'order_test_12345',
        amount: 51260,
        created_at: Math.floor(Date.now() / 1000)
      }
    }
  }
};

const payloadString = JSON.stringify(payload);

// Generate signature
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payloadString)
  .digest('hex');

// Send webhook
fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-razorpay-signature': signature
  },
  body: payloadString
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Webhook sent successfully');
    console.log('Response:', data);
  })
  .catch(error => {
    console.error('❌ Error sending webhook:', error);
  });
```

Run it:
```bash
node test-webhook.js
```

## Test Different Events

### Payment Captured
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_test_12345",
        "order_id": "order_test_12345",
        "amount": 51260,
        "created_at": 1234567890
      }
    }
  }
}
```

### Payment Failed
```json
{
  "event": "payment.failed",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_test_12345",
        "order_id": "order_test_12345",
        "amount": 51260,
        "error_code": "BAD_REQUEST_ERROR",
        "error_description": "Payment failed"
      }
    }
  }
}
```

### Refund Processed
```json
{
  "event": "refund.processed",
  "payload": {
    "refund": {
      "entity": {
        "id": "rfnd_test_12345",
        "payment_id": "pay_test_12345",
        "amount": 51260,
        "created_at": 1234567890
      }
    }
  }
}
```

## Expected Server Logs

When webhook is received successfully:
```
Received Razorpay webhook: payment.captured
Payment captured: pay_test_12345
Payment captured successfully for order: xxx
```

## Troubleshooting

### "Invalid signature" Error
- Check if RAZORPAY_WEBHOOK_SECRET matches
- Ensure raw body is being used for signature verification
- Restart Next.js server after updating .env.local

### "Order not found" Error
- Create an order first with status 'pending_payment'
- Use the actual razorpay_order_id from database
- Check order ID in webhook payload matches database

### Webhook Not Processed
- Check server logs for errors
- Verify webhook endpoint is accessible
- Ensure Content-Type header is 'application/json'

## Quick Test Script (PowerShell)

```powershell
# Save as test-webhook.ps1
$webhookUrl = "http://localhost:3000/api/webhooks/razorpay"
$webhookSecret = "your_webhook_secret_here"

$payload = @{
    event = "payment.captured"
    payload = @{
        payment = @{
            entity = @{
                id = "pay_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
                order_id = "order_test_12345"
                amount = 51260
                created_at = [int][double]::Parse((Get-Date -UFormat %s))
            }
        }
    }
} | ConvertTo-Json -Depth 10

$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.key = [Text.Encoding]::UTF8.GetBytes($webhookSecret)
$signature = [BitConverter]::ToString($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($payload))).Replace('-','').ToLower()

$headers = @{
    "Content-Type" = "application/json"
    "x-razorpay-signature" = $signature
}

Invoke-RestMethod -Uri $webhookUrl -Method Post -Headers $headers -Body $payload
```

Run it:
```powershell
.\test-webhook.ps1
```
