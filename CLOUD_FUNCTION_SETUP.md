# MaishaPay Cloud Function Setup

This guide explains how to set up a Cloud Function to securely handle MaishaPay webhooks.

## Why Cloud Functions?

Payment verification **must** happen server-side to prevent fraud:
- Client-side verification can be bypassed
- Webhook signatures require secret keys (never expose in frontend)
- Payment status should only be set by trusted server code

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project with Blaze plan (Cloud Functions require paid plan)
- MaishaPay API credentials

## Setup Instructions

### 1. Initialize Firebase Functions

```bash
# In your project root
firebase init functions

# Select:
# - Use existing project (select your Firebase project)
# - Language: JavaScript or TypeScript
# - ESLint: Yes (recommended)
# - Install dependencies: Yes
```

This creates a `functions/` directory.

### 2. Install Dependencies

```bash
cd functions
npm install crypto
```

### 3. Create Webhook Function

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const crypto = require('crypto')

admin.initializeApp()

/**
 * Verify MaishaPay webhook signature
 * @param {Object} payload - Webhook payload
 * @param {string} signature - Signature from webhook headers
 * @param {string} secret - MaishaPay secret key
 * @returns {boolean}
 */
function verifySignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
  
  return hash === signature
}

/**
 * MaishaPay Webhook Handler
 * Receives payment notifications and updates Firestore
 */
exports.maishapayWebhook = functions.https.onRequest(async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  try {
    const payload = req.body
    const signature = req.headers['x-maishapay-signature']

    // Get secret from environment
    const secret = functions.config().maishapay.secret

    // Verify signature
    if (!verifySignature(payload, signature, secret)) {
      console.error('Invalid webhook signature')
      return res.status(401).send('Unauthorized')
    }

    // Extract payment data
    const {
      reference,
      status,
      amount,
      currency,
      customer_email,
      transaction_id,
    } = payload

    // Find payment by reference
    const paymentsRef = admin.firestore().collection('payments')
    const snapshot = await paymentsRef
      .where('reference', '==', reference)
      .limit(1)
      .get()

    if (snapshot.empty) {
      console.error('Payment not found:', reference)
      return res.status(404).send('Payment not found')
    }

    const paymentDoc = snapshot.docs[0]
    const paymentData = paymentDoc.data()

    // Verify amount matches
    if (parseFloat(amount) !== paymentData.amount) {
      console.error('Amount mismatch:', {
        expected: paymentData.amount,
        received: amount,
      })
      return res.status(400).send('Amount mismatch')
    }

    // Update payment status
    const updateData = {
      status: status === 'success' ? 'completed' : 'failed',
      verified: status === 'success',
      transactionId: transaction_id,
      webhookReceivedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    await paymentDoc.ref.update(updateData)

    console.log('Payment updated:', reference, status)

    // If payment successful, create purchase records
    if (status === 'success') {
      const batch = admin.firestore().batch()
      
      for (const item of paymentData.items) {
        const purchaseId = `${paymentData.userId}_${item.bookId}`
        const purchaseRef = admin.firestore()
          .collection('purchases')
          .doc(purchaseId)
        
        // Get book details
        const bookDoc = await admin.firestore()
          .collection('books')
          .doc(item.bookId)
          .get()
        
        if (bookDoc.exists) {
          const bookData = bookDoc.data()
          
          batch.set(purchaseRef, {
            userId: paymentData.userId,
            bookId: item.bookId,
            title: item.title,
            storagePath: bookData.storagePath,
            paymentRef: reference,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        }
      }

      // Deduct credits
      const userRef = admin.firestore()
        .collection('users')
        .doc(paymentData.userId)
      
      batch.update(userRef, {
        credits: admin.firestore.FieldValue.increment(-paymentData.amount),
      })

      await batch.commit()
      console.log('Purchase records created for:', reference)
    }

    res.status(200).send('OK')
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).send('Internal Server Error')
  }
})

/**
 * Optional: Payment status check endpoint
 * Client can poll this to check payment status
 */
exports.checkPaymentStatus = functions.https.onCall(async (data, context) => {
  // Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated'
    )
  }

  const { reference } = data

  if (!reference) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Reference required'
    )
  }

  try {
    const snapshot = await admin.firestore()
      .collection('payments')
      .where('reference', '==', reference)
      .where('userId', '==', context.auth.uid)
      .limit(1)
      .get()

    if (snapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'Payment not found')
    }

    const payment = snapshot.docs[0].data()

    return {
      status: payment.status,
      verified: payment.verified,
      amount: payment.amount,
      createdAt: payment.createdAt,
    }
  } catch (error) {
    console.error('Status check error:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})
```

### 4. Configure Environment Variables

Store your MaishaPay secret securely:

```bash
firebase functions:config:set maishapay.secret="your_maishapay_secret_key"
```

For local testing, create `functions/.runtimeconfig.json`:

```json
{
  "maishapay": {
    "secret": "your_maishapay_secret_key"
  }
}
```

**⚠️ Add to .gitignore:**
```
functions/.runtimeconfig.json
```

### 5. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:maishapayWebhook
```

After deployment, you'll get a URL like:
```
https://us-central1-your-project.cloudfunctions.net/maishapayWebhook
```

### 6. Configure MaishaPay Webhook

1. Login to MaishaPay dashboard
2. Go to Settings → Webhooks
3. Add webhook URL: `https://your-region-your-project.cloudfunctions.net/maishapayWebhook`
4. Select events: `payment.success`, `payment.failed`
5. Save

### 7. Update Frontend Code

Modify `src/services/maishapay.js` to enable production mode:

```javascript
// Uncomment production API call
const response = await fetch(`${MAISHAPAY_CONFIG.baseUrl}/v1/checkout`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MAISHAPAY_CONFIG.apiKey}`,
  },
  body: JSON.stringify(checkoutData),
})

// Comment out development simulation
// return simulatedCheckoutUrl
```

### 8. Update PaymentCallback.jsx (Optional)

If you want to poll payment status from the callback page:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions'

const functions = getFunctions()
const checkStatus = httpsCallable(functions, 'checkPaymentStatus')

// In your component
const pollPaymentStatus = async () => {
  try {
    const result = await checkStatus({ reference })
    if (result.data.verified) {
      // Payment confirmed, proceed
    }
  } catch (error) {
    console.error('Status check failed:', error)
  }
}
```

## Testing Webhooks

### Local Testing

1. Install ngrok: `npm install -g ngrok`
2. Start local functions: `firebase emulators:start --only functions`
3. Expose with ngrok: `ngrok http 5001`
4. Use ngrok URL in MaishaPay webhook settings

### Production Testing

1. Deploy functions
2. Configure webhook in MaishaPay
3. Make test payment
4. Check Firebase Console → Functions → Logs
5. Verify Firestore updates

## Security Considerations

✅ **DO:**
- Verify webhook signatures
- Validate payment amounts
- Use server-side validation only
- Log all webhook attempts
- Handle idempotency (same webhook might arrive multiple times)

❌ **DON'T:**
- Trust client-side payment status
- Expose secret keys in frontend
- Skip signature verification
- Process unverified webhooks

## Troubleshooting

### Webhook not receiving requests
- Check MaishaPay webhook logs
- Verify function URL is public (no auth required)
- Check CORS if calling from client

### Signature verification fails
- Ensure secret matches MaishaPay settings
- Check webhook payload format
- Verify header name (`x-maishapay-signature`)

### Functions not deploying
- Ensure Firebase project on Blaze plan
- Check `package.json` in functions folder
- Run `firebase login` to re-authenticate

### Payment updated but purchases not created
- Check Firestore logs
- Verify batch operations
- Ensure book documents exist

## Monitoring

View function logs:
```bash
firebase functions:log
```

Or in Firebase Console → Functions → Logs

Monitor performance:
- Execution count
- Memory usage
- Error rate
- Average duration

## Cost Optimization

Cloud Functions pricing:
- Free tier: 2M invocations/month
- After: $0.40 per million invocations

Tips to reduce costs:
- Set timeouts (default 60s is often too high)
- Optimize database queries
- Use batch operations
- Cache frequently accessed data

## Advanced: Retry Logic

Handle webhook retries:

```javascript
// Check if payment already processed
if (paymentData.verified && status === 'success') {
  console.log('Payment already processed:', reference)
  return res.status(200).send('Already processed')
}
```

## Resources

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [MaishaPay API Docs](https://maishapay.online/docs)
- [Webhook Security Best Practices](https://webhooks.fyi/)

---

**Next Steps:**
1. Deploy your function
2. Configure webhook in MaishaPay
3. Test with real payment
4. Monitor logs for any issues
