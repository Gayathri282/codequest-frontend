import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart }  from '../context/CartContext';
import { useAuth }  from '../context/AuthContext';
import api  from '../utils/api';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, Truck, ShieldCheck } from 'lucide-react';

const STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) { resolve(true); return; }
    const s = document.createElement('script');
    s.id  = 'razorpay-sdk';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone:    user?.phone || '',
    street: '', city: '', state: '', pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const shipping = total < 500 ? 60 : 0;
  const grandTotal = total + shipping;

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleRazorpay = async (dbOrderId) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error('Payment gateway unavailable. Try again.'); return false; }

    const { data } = await api.post('/payment/create-order', {
      amount: grandTotal,
      orderId: dbOrderId,
    });

    return new Promise((resolve) => {
      const options = {
        key:          import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:       data.amount,
        currency:     data.currency,
        name:         'GuppyStore',
        description:  'Premium Guppy Fish Order',
        order_id:     data.rzpOrderId,
        prefill: {
          name:  user?.name,
          email: user?.email,
          contact: form.phone,
        },
        theme: { color: '#D4AF37' }, // Gold theme for Razorpay
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId: dbOrderId,
            });
            resolve(true);
          } catch {
            toast.error('Payment verification failed');
            resolve(false);
          }
        },
        modal: {
          ondismiss: () => resolve(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { toast.error('Payment failed'); resolve(false); });
      rzp.open();
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    try {
      // Step 1: create the order in DB
      const { data } = await api.post('/orders', {
        items: cart.map(i => ({ product: i._id || i.product, qty: i.qty })),
        shippingAddress: form,
        paymentMethod,
      });

      const dbOrderId = data._id || data.id;

      if (paymentMethod === 'online') {
        // Step 2: open Razorpay
        const paid = await handleRazorpay(dbOrderId);
        if (!paid) {
          // Order exists but unpaid — still redirect so user can see it
          toast('Order saved. Complete payment from My Orders.', { icon: 'ℹ️' });
          clearCart();
          navigate(`/order-success/${dbOrderId}`);
          return;
        }
        toast.success('Payment successful!');
      } else {
        toast.success('Order placed!');
      }

      clearCart();
      navigate(`/order-success/${dbOrderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}> {/* Black background */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Checkout</h1>

        <form onSubmit={submit} className="grid md:grid-cols-5 gap-6">
          {/* Left — shipping + payment */}
          <div className="md:col-span-3 space-y-5">

            {/* Shipping */}
            <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.1)' }}> {/* Dark gray background, subtle gold border */}
              <h2 className="font-semibold text-white flex items-center gap-2 mb-5">
                <MapPin size={17} className="text-[#E91E8C]" /> Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-white/50 mb-1.5 block">Full Name</label>
                  <input className="input" required value={form.fullName} onChange={set('fullName')} placeholder="As on address" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-white/50 mb-1.5 block">Phone</label>
                  <input className="input" required value={form.phone} onChange={set('phone')}
                    placeholder="10-digit mobile" pattern="\d{10}" title="10-digit phone" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-white/50 mb-1.5 block">Street / House No.</label>
                  <input className="input" required value={form.street} onChange={set('street')} placeholder="House no, street, locality" />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 mb-1.5 block">City</label>
                  <input className="input" required value={form.city} onChange={set('city')} placeholder="City" />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 mb-1.5 block">Pincode</label>
                  <input className="input" required value={form.pincode} onChange={set('pincode')} placeholder="6-digit" pattern="\d{6}" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-white/50 mb-1.5 block">State</label>
                  <select className="input" required value={form.state} onChange={set('state')}>
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.1)' }}> {/* Dark gray background, subtle gold border */}
              <h2 className="font-semibold text-white flex items-center gap-2 mb-5">
                <CreditCard size={17} className="text-[#E91E8C]" /> Payment Method
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10' : 'border-white/10 hover:border-[#D4AF37]/30'}`}> {/* Gold border/bg for active, white/gray for inactive */}
                  <input type="radio" name="payment" value="cod"
                    checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} // Gold accent
                    className="accent-[#D4AF37]" />
                  <div>
                    <p className="font-medium text-sm text-white">Cash on Delivery</p>
                    <p className="text-xs text-white/40 mt-0.5">Pay when your order arrives</p>
                  </div>
                  <Truck size={20} className="ml-auto text-white/30" />
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10' : 'border-white/10 hover:border-[#D4AF37]/30'}`}> {/* Gold border/bg for active, white/gray for inactive */}
                  <input type="radio" name="payment" value="online"
                    checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} // Gold accent
                    className="accent-[#D4AF37]" />
                  <div>
                    <p className="font-medium text-sm text-white">Online Payment</p>
                    <p className="text-xs text-white/40 mt-0.5">UPI, Cards, Net Banking via Razorpay</p>
                  </div>
                  <ShieldCheck size={20} className="ml-auto text-[#E91E8C]" />
                </label>
              </div>
            </div>
          </div>

          {/* Right — order summary */}
          <div className="md:col-span-2">
            <div className="rounded-2xl p-6 sticky top-24" style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.1)' }}> {/* Dark gray background, subtle gold border */}
              <h2 className="font-semibold text-white mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {cart.map(i => (
                  <div key={i._id || i.product} className="flex items-center gap-3">

                    {i.image && (
                      <img src={i.image} alt={i.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-[#1A1A1A]" />
                    )}
                    <div className="flex-1 min-w-0">


                      <p className="text-xs font-medium text-white/80 line-clamp-1">{i.name}</p>
                      <p className="text-xs text-white/30">Qty: {i.qty}</p>
                    </div>
                    <span className="text-xs font-semibold text-white flex-shrink-0">₹{(i.price * i.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <hr className="border-ink-border mb-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/40">
                  <span>Subtotal</span>
                  <span className="text-white">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>Shipping</span>
                  {shipping
                    ? <span className="text-white">₹{shipping}</span>
                    : <span className="text-[#D4AF37] font-medium">Free</span> 
                  }
                </div>
                <hr className="border-ink-border" />
                <div className="flex justify-between font-bold text-white text-base">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 justify-center disabled:opacity-60 flex items-center gap-2 rounded-full transition-all active:scale-[0.98] shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #AA8B2E)',
                  color: '#000',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '12px 24px',
                  boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
                }}
              >
                {loading ? 'Processing…' : paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}
              </button>

              {paymentMethod === 'online' && (
                <p className="text-center text-xs text-white/30 mt-3 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-[#D4AF37]" /> Secured by Razorpay {/* Gold icon */}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
