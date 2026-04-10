import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(212,175,55,0.1)' }}> {/* Dark gray background, subtle gold border */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8B2E)' }} // Gold gradient for logo background
              >
                <img src="/fish.svg" alt="GuppyStore" className="w-4.5 h-4.5" />
              </div>
              <span className="font-bold text-white text-base"> {/* White text */}
                Royal<span style={{ color: '#D4AF37' }}>Guppy</span> {/* Gold text */}
              </span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-[200px]">
              Premium guppy fish delivered live to your door — straight from breeders.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Shop</p>
            <ul className="space-y-3">
              {['Fancy Guppies', 'Cobra Guppies', 'Halfmoon', 'Endlers', 'Accessories'].map(name => (
                <li key={name}>
                  <Link to="/products" className="text-white/40 text-sm hover:text-[#D4AF37] transition-colors"> {/* Gold hover */}
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Info</p>
            <ul className="space-y-3">
              {[
                ['Live Arrival Guarantee', '/'],
                ['Shipping Policy', '/'],
                ['FAQ', '/'],
                ['Contact Us', '/'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-white/40 text-sm hover:text-[#D4AF37] transition-colors"> {/* Gold hover */}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Promise</p>
            <ul className="space-y-3">
              {[
                { icon: '🐠', text: 'Live Arrival' },
                { icon: '🚚', text: 'Fast Delivery' },
                { icon: '🏆', text: 'Premium Breeds' },
                { icon: '💬', text: '24/7 Support' },
              ].map(item => (
                <li key={item.text} className="flex items-center gap-2 text-white/40 text-sm">
                  <span>{item.icon}</span> {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-white/20 text-xs">© 2026 GuppyStore. All rights reserved.</p>
          <p className="text-white/15 text-xs">Premium guppy fish delivered live.</p>
        </div>
      </div>
    </footer>
  );
}
