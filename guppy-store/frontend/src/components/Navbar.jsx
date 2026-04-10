import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, ShoppingCart, Package, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { itemCount }             = useCart();
  const navigate                  = useNavigate();
  const [dropOpen, setDropOpen]   = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(5,5,5,0.9)',
        backdropFilter: 'blur(20px)',
WebkitBackdropFilter: 'blur(20px) /* For Safari */',
        borderBottom: '1px solid rgba(212,175,55,0.15)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            // style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8B2E)', boxShadow: '0 0 16px rgba(212,175,55,0.3)' }} // Gold gradient for logo background
          >
            <img src="/fish.svg" alt="GuppyStore" className="w-12 h-12" />
          </div>
          <span className="font-bold text-xl text-white tracking-tighter italic">
            Royal<span className="text-[#D4AF37] not-italic ml-0.5">Guppy</span>
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {loading ? (
            <div className="w-20 h-8" />
          ) : user ? (
            <>
              <Link
                to="/my-orders"
                title="My Orders"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }} // Subtle gray background
              >
                <Package size={17} className="text-white/60" />
              </Link>

              <Link
                to="/cart"
                title="Cart"
                className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }} // Subtle gray background
              >
                <ShoppingCart size={17} className="text-white/60" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1"
                    style={{ background: '#D4AF37', boxShadow: '0 0 8px rgba(212,175,55,0.5)' }} // Gold badge
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* User dropdown */}
              <div className="relative ml-1">
                <button
                  onClick={() => setDropOpen(o => !o)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name}
                      className="w-9 h-9 rounded-full object-cover"
                      style={{ border: '2px solid rgba(212,175,55,0.4)' }} /> // Gold border for avatar
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8B2E)', boxShadow: '0 0 12px rgba(212,175,55,0.3)' }} // Gold gradient for fallback avatar
                    >
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <ChevronDown size={14} className="text-white/40 hidden sm:block" />
                </button>

                {dropOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl py-1.5 z-50 text-sm" // Dropdown menu container
                      style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.2)' }} // Dark gray background, gold border
                    >
                      <Link to="/my-orders" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-white/70 hover:text-white transition-colors"
                      >
                        My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-white/70 hover:text-white transition-colors">
                          <LayoutDashboard size={14} style={{ color: '#D4AF37' }} /> Admin Panel {/* Gold icon */}
                        </Link>
                      )}
                      <div className="my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-white/50 hover:text-white transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="text-xs font-semibold text-white/60 hover:text-white px-4 py-2 transition-colors">
                Sign In {/* White text */}
              </Link>
              <Link to="/register"
                className="px-5 py-2 rounded-full text-xs font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #AA8B2E)',
                  boxShadow: '0 0 18px rgba(212,175,55,0.35)',
                }}
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
