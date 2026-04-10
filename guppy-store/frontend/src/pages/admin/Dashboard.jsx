import { useEffect, useState } from 'react';
import { Users, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';

const Stat = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-2xl font-bold text-ocean">{value}</p>
    </div>
  </div>
);

const STATUS_COLORS = {
  placed:     '#60a5fa',
  processing: '#fbbf24',
  shipped:    '#a78bfa',
  delivered:  '#34d399',
  cancelled:  '#f87171',
};

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse text-primary-500">Loading stats…</div>;
  if (!stats)  return null;

  const weekData = stats.weeklyRevenue.map(d => ({
    date:    d._id.slice(5),
    revenue: d.revenue,
    orders:  d.count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ocean">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Users}       label="Total Customers" value={stats.totalUsers}    color="bg-blue-500" />
        <Stat icon={Package}     label="Products"         value={stats.totalProducts} color="bg-violet-500" />
        <Stat icon={ShoppingCart}label="Total Orders"     value={stats.totalOrders}   color="bg-amber-500" />
        <Stat icon={TrendingUp}  label="Revenue (paid)"   value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`} color="bg-emerald-500" />
      </div>

      {/* Revenue chart */}
      <div className="card p-5">
        <h2 className="font-semibold text-ocean mb-4">Revenue — Last 7 Days</h2>
        {weekData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 text-sm text-center py-8">No sales data yet</p>
        )}
      </div>

      {/* Orders by status */}
      <div className="card p-5">
        <h2 className="font-semibold text-ocean mb-4">Orders by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.ordersByStatus.map(s => (
            <div key={s._id} className="text-center p-3 rounded-xl" style={{ background: `${STATUS_COLORS[s._id]}20` }}>
              <p className="text-2xl font-bold" style={{ color: STATUS_COLORS[s._id] }}>{s.count}</p>
              <p className="text-xs text-slate-500 capitalize mt-0.5">{s._id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
