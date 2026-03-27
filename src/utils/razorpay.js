// frontend/src/utils/razorpay.js
import api from './api';

export function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function startPayment({ plan, user, onSuccess, onError }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) return onError?.('Could not load payment SDK');

  // 1. Create order on backend
  const { data } = await api.post('/payments/create-order', { plan });

  // 2. Open Razorpay modal
  const options = {
    key:         data.keyId,
    amount:      data.amount,
    currency:    data.currency,
    order_id:    data.orderId,
    name:        'CodeQuest',
    description: `${plan} Plan`,
    image:       '/logo.png',
    prefill: {
      name:  user.displayName || user.username,
      email: user.email,
    },
    theme: { color: '#FF6B35' },
    handler: async function (response) {
      // 3. Verify on backend
      try {
        const verify = await api.post('/payments/verify', {
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature:  response.razorpay_signature,
        });
        onSuccess?.(verify.data);
      } catch (err) {
        onError?.(err.response?.data?.error || 'Payment verification failed');
      }
    },
    modal: {
      ondismiss: () => onError?.('Payment cancelled'),
    }
  };

  new window.Razorpay(options).open();
}
