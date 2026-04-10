import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart,
  Users, Image, Tag, LogOut, Fish, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin',            label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products',   label: 'Products',  icon: Package },
  { to: '/admin/orders',     label: 'Orders',    icon: ShoppingCart },
  { to: '/admin/users',      label: 'Users',     icon: Users },
  { to: '/admin/banners',    label: 'Banners',    icon: Image },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = () => (
    <aside className="w-56 flex-shrink-0 bg-ocean min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Fish className="text-primary-400" size={20} />
          <span className="font-bold text-white">GuppyStore</span>
        </div>
        <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout}
        className="m-3 flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">
        <LogOut size={16} /> Logout
      </button>
    </aside>
  );

  return (
    <div className="admin-layout flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-shrink-0"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="p-1">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-ocean">Admin Panel</span>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
