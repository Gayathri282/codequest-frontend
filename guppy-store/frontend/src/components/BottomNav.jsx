import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
  const location  = useLocation();
  const { itemCount } = useCart();

  if (location.pathname.startsWith('/admin')) return null;

  const items = [
    { to: '/',                  icon: Home,         label: 'Home' },
    { to: '/breed/fancy-guppy', icon: Search,       label: 'Search' },
    { to: '/cart',              icon: ShoppingCart, label: 'Cart',  badge: itemCount },
    { to: '/my-orders',         icon: Heart,        label: 'Saved'  },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ background: '#0A0A0A', borderTop: '1px solid rgba(212,175,55,0.15)' }}> {/* Dark gray background, subtle gold border */}
      <div className="flex items-center justify-around px-2 py-3">
        {items.map(({ to, icon: Icon, label, badge }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-1 relative px-4">
              <div className="relative">
                <Icon
                  size={22}
                  className={active ? 'text-[#D4AF37]' : 'text-white/35'} // Gold for active, white/gray for inactive
                  fill={active && label === 'Home' ? 'currentColor' : 'none'}
                />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[9px] font-bold min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-0.5"> {/* Gold badge, black text */}
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-[#D4AF37]' : 'text-white/30'}`}>{label}</span> {/* Gold for active, white/gray for inactive */}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
