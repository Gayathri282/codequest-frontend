import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(() => {});
  }, [id]);

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      {/* Success icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
        style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }} // Subtle gold background and border
      >
        <CheckCircle2 size={40} style={{ color: '#D4AF37' }} /> {/* Gold checkmark */}
      </div>

      <h1 className="text-2xl font-bold text-white mt-5">Order Placed!</h1>
      <p className="text-white/40 mt-2 text-sm">Thank you for your order. Your guppies are on their way!</p>

      {order && (
        <div
          className="rounded-2xl p-5 mt-6 text-left space-y-3 text-sm" // Order details container
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }} // Dark gray background, subtle white border
        >
          <div className="flex justify-between">
            <span className="text-white/40">Order ID</span>
            <span className="font-mono text-xs text-white/30">{order._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Total</span>
            <span className="font-semibold text-white">₹{order.total?.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Payment</span>
            <span className="text-white capitalize">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Status</span>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize"
              style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }} // Subtle gold background, gold text, gold border
            >
              {order.orderStatus}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6 justify-center">
        <Link
          to="/my-orders"
          className="font-bold px-6 py-2.5 rounded-full text-xs transition-all uppercase tracking-widest" // My Orders button
          style={{ border: '2px solid rgba(212,175,55,0.4)', color: '#D4AF37' }} // Gold border, gold text
        >
          My Orders
        </Link>
        <Link to="/" // Continue Shopping button
          className="text-xs flex items-center gap-2 rounded-full transition-all active:scale-[0.98] shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #D4AF37, #AA8B2E)',
            color: '#000',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '10px 24px',
            boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
          }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
