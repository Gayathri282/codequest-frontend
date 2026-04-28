// frontend/src/utils/payment.js
// Handles opening the Razorpay checkout modal

import { api } from './api.js'

export async function subscribeToPlan(plan, user) {
  // 1. Create order on our backend
  const { orderId, amount, currency, keyId } = await api.post('/payments/create-order', { plan })

  // 2. Open Razorpay modal
  return new Promise((resolve, reject) => {
    const options = {
      key:      keyId,
      amount,
      currency,
      name:     'CodeQuest 🚀',
      description: `${plan} Plan Subscription`,
      order_id: orderId,
      prefill: {
        name:  user.displayName || user.username,
        email: user.email,
      },
      theme: { color: '#FF6B35' },
      handler: async (response) => {
        try {
          // 3. Verify on our backend
          const result = await api.post('/payments/verify', {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          })
          resolve(result)
        } catch (err) {
          reject(err)
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      }
    }

    // Razorpay script must be loaded — see index.html or load dynamically
    if (!window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => new window.Razorpay(options).open()
      document.body.appendChild(script)
    } else {
      new window.Razorpay(options).open()
    }
  })
}
