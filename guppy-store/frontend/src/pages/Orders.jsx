import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Package } from 'lucide-react';

const STATUS_COLOR = {
  placed:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  shipped:    'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled:  'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-blush border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-white/20" />
          <p className="text-white/40 mt-3">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o._id} className="bg-ink-light border border-ink-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-white/30 font-mono">{o._id}</p>
                  <p className="text-xs text-white/30 mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_COLOR[o.orderStatus] || 'bg-white/10 text-white/50 border-white/10'}`}>
                  {o.orderStatus}
                </span>
              </div>

              <div className="space-y-2">
                {o.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-ink-lighter overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img src="/fish.svg" alt={`${item.name} placeholder`} className="w-6 h-6 opacity-25" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="text-white/80 font-medium line-clamp-1">{item.name}</p>
                      <p className="text-white/30 text-xs">× {item.qty} · ₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-border">
                <span className="text-sm text-white/40">Total</span>
                <span className="font-bold text-white">₹{o.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
