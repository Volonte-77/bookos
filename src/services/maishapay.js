import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { firestore } from '../lib/firebase.js'

/**
 * MaishaPay Payment Service
 * Handles payment initialization and processing with MaishaPay API
 */

const MAISHAPAY_CONFIG = {
  apiKey: import.meta.env.VITE_MAISHAPAY_API_KEY,
  secretKey: import.meta.env.VITE_MAISHAPAY_SECRET_KEY,
  baseUrl: import.meta.env.VITE_MAISHAPAY_BASE_URL || 'https://api.maishapay.online',
  appUrl: import.meta.env.VITE_APP_URL || window.location.origin,
}

/**
 * Initialize a payment with MaishaPay
 * @param {Object} params - Payment parameters
 * @param {string} params.userId - User ID from Firebase Auth
 * @param {number} params.amount - Payment amount in EUR
 * @param {string} params.currency - Currency code (default: EUR)
 * @param {string} params.userEmail - User email
 * @param {string} params.userName - User name
 * @param {Array} params.items - Cart items
 * @returns {Promise<Object>} Payment initialization result
 */
export async function initializePayment({
  userId,
  amount,
  currency = 'EUR',
  userEmail,
  userName,
  items = [],
}) {
  try {
    // Generate unique payment reference
    const reference = `PAY_${Date.now()}_${userId.slice(0, 8)}`

    // Create payment record in Firestore BEFORE redirecting
    const paymentData = {
      userId,
      userEmail,
      userName: userName || userEmail,
      amount,
      currency,
      reference,
      status: 'pending',
      verified: false,
      method: 'maishapay',
      items: items.map((item) => ({
        bookId: item.id,
        title: item.title,
        price: item.price,
      })),
      createdAt: serverTimestamp(),
    }

    const paymentRef = await addDoc(
      collection(firestore, 'payments'),
      paymentData,
    )

    // Prepare MaishaPay checkout URL
    const callbackUrl = `${MAISHAPAY_CONFIG.appUrl}/paiement/callback`
    const cancelUrl = `${MAISHAPAY_CONFIG.appUrl}/panier`

    // In production, you would call MaishaPay API here
    // For now, we'll prepare the data structure for hosted checkout
    const checkoutData = {
      api_key: MAISHAPAY_CONFIG.apiKey,
      amount: amount.toFixed(2),
      currency,
      reference,
      description: `Achat de ${items.length} livre(s)`,
      customer_email: userEmail,
      customer_name: userName || userEmail,
      callback_url: `${callbackUrl}?reference=${reference}`,
      cancel_url: cancelUrl,
      items: items.map((item) => ({
        name: item.title,
        quantity: 1,
        price: item.price.toFixed(2),
      })),
    }

    // PRODUCTION IMPLEMENTATION:
    // Uncomment this when you have real MaishaPay credentials
    /*
    const response = await fetch(`${MAISHAPAY_CONFIG.baseUrl}/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAISHAPAY_CONFIG.apiKey}`,
      },
      body: JSON.stringify(checkoutData),
    })

    if (!response.ok) {
      throw new Error('MaishaPay initialization failed')
    }

    const result = await response.json()
    return {
      success: true,
      paymentId: paymentRef.id,
      reference,
      checkoutUrl: result.checkout_url,
    }
    */

    // DEVELOPMENT MODE: Return simulated checkout URL
    // This allows testing the flow without real MaishaPay credentials
    console.log('Payment initialized (DEV MODE):', {
      reference,
      amount,
      items: items.length,
    })

    // Simulate MaishaPay hosted checkout page
    const simulatedCheckoutUrl = `${MAISHAPAY_CONFIG.appUrl}/paiement/simulateur?reference=${reference}&amount=${amount}&email=${encodeURIComponent(userEmail)}`

    return {
      success: true,
      paymentId: paymentRef.id,
      reference,
      checkoutUrl: simulatedCheckoutUrl,
      checkoutData, // Include for development testing
    }
  } catch (error) {
    console.error('Payment initialization error:', error)
    throw new Error('Échec de l\'initialisation du paiement: ' + error.message)
  }
}

/**
 * Verify payment signature (should be called server-side via Cloud Function)
 * @param {Object} params - Verification parameters
 * @returns {Promise<boolean>} Verification result
 */
export async function verifyPaymentSignature(params) {
  // In production, this should be a Cloud Function
  // that validates the webhook signature from MaishaPay
  
  // PRODUCTION IMPLEMENTATION:
  // const signature = generateSignature(params, MAISHAPAY_CONFIG.secretKey)
  // return signature === params.signature
  
  // For development, we'll return true (simulation mode)
  console.warn('Payment verification skipped (DEV MODE)')
  return true
}

/**
 * Get payment status
 * @param {string} reference - Payment reference
 * @returns {Promise<Object>} Payment status
 */
export async function getPaymentStatus(reference) {
  try {
    // PRODUCTION: Call MaishaPay API
    /*
    const response = await fetch(
      `${MAISHAPAY_CONFIG.baseUrl}/v1/payments/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${MAISHAPAY_CONFIG.apiKey}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch payment status')
    }

    return await response.json()
    */

    // DEVELOPMENT: Return simulated status
    return {
      reference,
      status: 'pending',
      message: 'Payment status check (DEV MODE)',
    }
  } catch (error) {
    console.error('Payment status check error:', error)
    throw error
  }
}
