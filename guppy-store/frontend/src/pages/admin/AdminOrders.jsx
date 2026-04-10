import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  placed:     'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};
const ORDER_STATUSES = ['placed','processing','shipped','delivered','cancelled'];

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetch = () => {
    const q = filter ? `?status=${filter}` : '';
    api.get(`/admin/orders${q}`).then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); fetch(); }, [filter]);

  const updateStatus = async (id, orderStatus) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { orderStatus });
      toast.success('Status updated');
      fetch();
    } catch { toast.error('Update failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ocean">Orders</h1>
        <select className="input w-40 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse text-primary-500">Loading…</div>
      ) : orders.length === 0 ? (
        <p className="text-slate-400 text-center py-16">No orders found</p>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o._id} className="card overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                onClick={() => setExpanded(expanded === o._id ? null : o._id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-slate-400 truncate">{o._id}</p>
                    <p className="font-medium text-ocean text-sm mt-0.5">{o.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{o.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-bold text-sm">₹{o.total?.toLocaleString('en-IN')}</span>
                  <span className={`badge ${STATUS_COLOR[o.orderStatus]}`}>{o.orderStatus}</span>
                  <select
                    className="input w-36 text-xs py-1.5"
                    value={o.orderStatus}
                    onChange={e => { e.stopPropagation(); updateStatus(o._id, e.target.value); }}
                    onClick={e => e.stopPropagation()}
                  >
                    {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>

              {expanded === o._id && (
                <div className="border-t border-slate-100 p-4 bg-slate-50 text-sm space-y-3">
                  {/* Items */}
                  <div className="space-y-2">
                    {o.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-slate-600">
                        <span>{item.name} × {item.qty}</span>
                        <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  <hr className="border-slate-200" />
                  {/* Shipping */}
                  <div>
                    <p className="font-medium text-ocean mb-1">Ship to:</p>
                    <p className="text-slate-600">
                      {o.shippingAddress?.fullName} · {o.shippingAddress?.phone}<br />
                      {o.shippingAddress?.street}, {o.shippingAddress?.city}, {o.shippingAddress?.state} — {o.shippingAddress?.pincode}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment</span>
                    <span className="capitalize font-medium">{o.paymentMethod} · <span className={o.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}>{o.paymentStatus}</span></span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
