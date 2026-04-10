import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowUpRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductCard({ product, wide = false }) {
  const { addToCart } = useCart();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [liked, setLiked] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user)             { navigate('/login'); return; }
    if (product.stock < 1) { toast.error('Out of stock'); return; }
    addToCart(product);
    toast.success('Added to cart!');
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(l => !l);
  };

  const img        = product.images?.[0];
  const outOfStock = product.stock < 1;
  const w          = wide ? '240px' : '185px';
  const h          = wide ? '300px' : '240px';

  return (
    <Link
      to={`/product/${product._id}`}
      className="group relative flex-shrink-0 overflow-hidden cursor-pointer block"
      style={{
        width: w,
        height: h,
        borderRadius: '20px',
        transition: 'transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.5), 0 0 24px rgba(233,30,140,0.25)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Background image */}
      {img ? (
        <img
          src={img}
          alt={`${product.name} — ${product.breed} guppy fish for sale`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transition: 'transform 0.5s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: '#111111' }}> {/* Dark gray fallback background */}
          <img
            src="/fish.svg"
            alt={`Add a product photo for ${product.name} via admin panel`}
            className="w-16 h-16 opacity-15"
          />
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 60%)' }} /> {/* Dark overlay */}

      {/* Out of stock overlay */}
      {outOfStock && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(5,5,5,0.7)' }}> {/* Dark gray overlay */}
          <span className="text-white/50 text-xs font-bold px-3 py-1 rounded-full" // White/gray text
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}> {/* Subtle white border */}
            Sold Out
          </span>
        </div>
      )}

      {/* Price badge — top left */}
      <div className="absolute top-3 left-3">
        <span className="text-white font-bold text-sm px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(212,175,55,0.9)', color: '#000', backdropFilter: 'blur(8px)', fontSize: '0.75rem' }}> {/* Gold background, black text */}
          ₹{Number(product.price).toLocaleString('en-IN')}
        </span>
      </div>

      {/* Heart / wishlist — top right */}
      <button
        onClick={handleLike}
        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{
          background: liked ? '#D4AF37' : 'rgba(255,255,255,0.05)', // Gold if liked, subtle gray otherwise
          backdropFilter: 'blur(8px)', // Glassmorphism effect
          border: '1px solid rgba(212,175,55,0.2)', // Gold border
        }}
      >
        <Heart size={14} className={liked ? 'fill-black text-black' : 'text-white/40'} /> {/* Black fill if liked, white/gray otherwise */}
      </button>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-1 mb-0.5">
          {product.name}
        </h3>
        <p className="text-white/45 text-xs line-clamp-1 mb-3">
          {product.breed || 'Guppy Fish'}
        </p>
        {/* Add to cart strip */}
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="w-full flex items-center justify-between rounded-xl px-3 py-2 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }} // Subtle gold background and border
        >
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">Reserve</span>
          <ArrowUpRight size={14} className="text-[#D4AF37]/50" />
        </button>
      </div>
    </Link>
  );
}
