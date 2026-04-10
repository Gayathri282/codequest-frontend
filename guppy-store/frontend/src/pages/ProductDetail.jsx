import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Heart, Package } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ── Glass spec card ─────────────────────────────────────────── */
function SpecCard({ label, value }) {
  return (
    <div
      className="rounded-2xl px-5 py-3 flex-1 min-w-[100px]"
      style={{
        background: 'rgba(255,255,255,0.03)', // Subtle white background
        border: '1px solid rgba(212,175,55,0.2)', // Gold border
        backdropFilter: 'blur(16px)',
      }}
    >
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {label}
      </p>
      <p style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.1rem', marginTop: '3px' }}> {/* Gold text */}
        {value}
      </p>
    </div>
  );
}

export default function ProductDetail() {
  const { id }        = useParams();
  const { user }      = useAuth();
  const { addToCart } = useCart();
  const navigate      = useNavigate();

  const [product, setProduct] = useState(null);
  const [imgIdx,  setImgIdx]  = useState(0);
  const [qty,     setQty]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [liked,   setLiked]   = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    addToCart(product, qty);
    toast.success('Added to cart!');
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }} // Gold spinner
        />
      </div>
    );
  }
  if (!product) return null;

  const imgs = product.images || [];
  const img  = imgs[imgIdx];

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#050505' }}>

      {/* ── Full-screen background image ── */}
      {img ? (
        <img
          src={img}
          alt={`${product.name} — ${product.breed} guppy fish`}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: '#050505' }} // Black fallback background
        >
          <img
            src="/fish.svg"
            alt={`No photo for ${product.name} — add one via admin panel`}
            className="w-40 h-40 opacity-5"
          />
        </div>
      )}

      {/* ── Gradient overlays ── */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.7) 50%, transparent 100%)' }} // Dark gradient from left
      />
      <div
        className="absolute top-0 left-0 right-0 h-40"
        style={{ background: 'linear-gradient(to bottom, rgba(5,5,5,0.8) 0%, transparent 100%)' }} // Dark gradient from top
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-52"
        style={{ background: 'linear-gradient(to top, rgba(5,5,5,1) 0%, transparent 100%)' }} // Dark gradient from bottom
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-md">

        {/* Back button */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }} // Subtle gray background, white border
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <span className="text-white/60 text-sm font-medium">Details</span>
          <div className="w-10" />
        </div>

        {/* Breed label + name */}
        <div className="px-5 mt-6 mb-6">
          <p
            className="font-bold uppercase tracking-[0.4em] mb-2 text-[#D4AF37]"
            style={{ fontSize: '0.65rem' }} // Gold text
          >
            {product.breed}
          </p>
          <h1
            className="text-white font-bold leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', lineHeight: 1.1 }}
          >
            {product.name}
          </h1>
        </div>

        {/* Spec cards row */}
        <div className="flex gap-3 px-5 mb-6">
          <SpecCard label="Price" value={`₹${Number(product.price).toLocaleString('en-IN')}`} />
          <SpecCard label="Size"  value={product.size || '—'} />
          <SpecCard label="Age"   value={product.age  || '—'} />
        </div>

        {/* Description */}
        <div className="px-5 mb-5">
          <h3 className="text-white font-semibold text-sm mb-2">About this fish</h3>
          <p className="text-white/45 text-sm leading-relaxed">
            {product.description || // White/gray text
              `Sourced from championship bloodlines, this ${product.name} represents the pinnacle of aquatic elegance. Known for its distinct ${product.color || 'vibrant pattern'} and robust vitality.`
            }
          </p>
        </div>

        {/* Color + stock badges */}
        <div className="flex flex-wrap gap-2 px-5 mb-5">
          {product.color && (
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }} // Subtle gold background, gold text, gold border
            >
              {product.color}
            </span>
          )}
          {product.stock < 1 ? (
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.1)' }} // Subtle gray background, white/gray text, white border
            >
              Out of stock
            </span>
          ) : product.stock <= 5 ? (
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
              style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }} // Subtle gold background, gold text, gold border
            >
              <Package size={10} /> Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Thumbnail strip */}
        {imgs.length > 1 && (
          <div className="flex gap-2 px-5 mb-4 overflow-x-auto scrollbar-hide">
            {imgs.map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden transition-all"
                style={{ border: `2px solid ${i === imgIdx ? '#D4AF37' : 'rgba(255,255,255,0.1)'}` }} // Gold border for active thumbnail, white/gray for inactive
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="flex-1" />
      </div>

      {/* ── Heart button ── */}
      <button
        onClick={() => setLiked(l => !l)}
        className="absolute z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90"
        style={{
          right: '20px',
          top: '45%',
          background: liked ? '#D4AF37' : 'rgba(212,175,55,0.1)', // Gold if liked, subtle gold otherwise
          border: '1px solid rgba(212,175,55,0.3)', // Gold border
          backdropFilter: 'blur(8px)',
          boxShadow: liked ? '0 0 20px rgba(212,175,55,0.5)' : 'none', // Gold shadow if liked
        }}
      >
        <Heart size={20} className={liked ? 'fill-black text-black' : 'text-[#D4AF37]'} /> {/* Black fill if liked, gold otherwise */}
      </button>

      {/* ── Fixed bottom CTA ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-8 pt-4"
        style={{ background: 'linear-gradient(to top, #050505 80%, transparent 100%)' }}
      >
        {product.stock > 0 ? (
          <>
            {/* Qty selector */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-white/40 text-sm">Quantity</span>
              <div
                className="flex items-center gap-3 rounded-full px-4 py-1.5" // Quantity selector
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} // Subtle gray background and border
              >
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="text-white/60 hover:text-white w-7 h-7 flex items-center justify-center text-lg transition"
                >−</button>
                <span className="text-white font-bold w-5 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="text-white/60 hover:text-white w-7 h-7 flex items-center justify-center text-lg transition"
                >+</button>
              </div>
            </div>

            {/* Buy now button */}
            <button
              onClick={handleAdd}
              className="w-full flex items-center justify-between rounded-full transition-all active:scale-[0.98] shadow-2xl"
              style={{
                background: '#D4AF37', // Gold button background
                padding: '10px 10px 10px 14px',
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,0,0,0.8)' }} // Dark background for icon
              >
                <ShoppingCart size={17} className="text-[#D4AF37]" /> {/* Gold icon */}
              </div>
              <span className="text-black font-bold text-sm flex-1 text-center tracking-[0.2em] uppercase">
                Reserve Now
              </span>
              <span className="text-black/30 font-bold tracking-widest pr-2">&rsaquo;&rsaquo;</span>
            </button>
          </>
        ) : (
          <div
            className="w-full flex items-center justify-center py-4 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-white/35 font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>
    </div>
  );
}
